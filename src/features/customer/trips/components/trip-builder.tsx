"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CarFrontIcon,
  GripVerticalIcon,
  LoaderCircleIcon,
  LockIcon,
  PlusIcon,
  RefreshCwIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  addTripDayAction,
  getTripAction,
  moveTripStopAction,
  recomputeTripRoutesAction,
  removeTripDayAction,
  removeTripStopAction,
  renameTripAction,
  reorderTripStopsAction,
} from "../actions";
import type { ActionState } from "@/shared/lib/action-state";
import {
  MAX_TRIP_DAYS,
  type TripDayView,
  type TripStopView,
  type TripView,
} from "../lib/types";
import { TripChat } from "./trip-chat";
import {
  KIND_LABEL,
  dayColor,
  daySequence,
  formatDistance,
  formatDuration,
  type SequenceItem,
} from "./trip-format";
import { TripMap, type TripMapRoute, type TripMapStop } from "./trip-map";

const KIND_DOT: Record<TripStopView["kind"], string> = {
  hotel: "bg-[#017b6e]",
  restaurant: "bg-[#f06449]",
  destination: "bg-[#0d9488]",
};

const HIGHLIGHT_MS = 1600;

// Điểm dừng đang kéo; `sortable` do @dnd-kit/sortable tự thêm (index trong danh sách sắp xếp được của ngày)
type DragData = { day: number; stop: TripStopView; sortable?: { index: number } };
// Vùng thả: cả ngày (thả vào cuối ngày) hoặc một điểm dừng (thả vào vị trí của điểm đó)
type DropData = { day: number; stop?: TripStopView; sortable?: { index: number } };

const DAY_PREFIX = "day-";
const isDayDroppable = (id: string | number) => String(id).startsWith(DAY_PREFIX);

// Chuột/cảm ứng: ưu tiên điểm dừng dưới con trỏ, không có thì lấy ngày chứa con trỏ; bàn phím: gần nhất
const collisionDetection: CollisionDetection = (args) => {
  if (!args.pointerCoordinates) return closestCenter(args);
  const hits = pointerWithin(args);
  const rows = hits.filter((c) => !isDayDroppable(c.id));
  return rows.length ? rows : hits;
};

// Thông báo cho trình đọc màn hình khi kéo thả (mặc định của dnd-kit là tiếng Anh)
const stopName = (data: unknown) => (data as DragData | undefined)?.stop.name ?? "điểm dừng";
const describeTarget = (data: unknown) => {
  const target = data as DropData | undefined;
  if (!target) return "";
  return target.sortable
    ? `vị trí ${target.sortable.index + 1} của Ngày ${target.day}`
    : `cuối Ngày ${target.day}`;
};
const ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `Đang kéo ${stopName(active.data.current)}.`,
  onDragOver: ({ active, over }) =>
    over ? `${stopName(active.data.current)} đang ở ${describeTarget(over.data.current)}.` : undefined,
  onDragEnd: ({ active, over }) =>
    over
      ? `Đã thả ${stopName(active.data.current)} vào ${describeTarget(over.data.current)}.`
      : `Đã hủy kéo ${stopName(active.data.current)}.`,
  onDragCancel: ({ active }) => `Đã hủy kéo ${stopName(active.data.current)}.`,
};
const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "Nhấn phím cách hoặc Enter để nhấc điểm dừng, dùng phím mũi tên để đổi thứ tự hoặc chuyển sang ngày khác, nhấn lại phím cách hoặc Enter để thả, Esc để hủy.",
};

/**
 * Hiển thị ngay thứ tự mới sau khi kéo thả (trước khi máy chủ tính xong đường đi):
 * chèn điểm dừng vào `index` của ngày đích (không tính khách sạn gốc), xóa đường đi cũ của các ngày bị ảnh hưởng.
 */
function moveLocally(view: TripView, stop: TripStopView, toDay: number, index: number): TripView {
  return {
    ...view,
    days: view.days.map((d) => {
      if (d.day !== stop.day && d.day !== toDay) return d;
      const pinned = d.baseHotel?.day === d.day && d.baseHotel.id !== stop.id ? d.baseHotel : null;
      const rest = d.stops.filter((s) => s.id !== stop.id && s.id !== pinned?.id);
      if (d.day === toDay) rest.splice(Math.min(index, rest.length), 0, { ...stop, day: toDay });
      const stops = [...(pinned ? [pinned] : []), ...rest].map((s, position) => ({ ...s, position }));
      return { ...d, stops, route: null };
    }),
  };
}

export function TripBuilder({ initialView, canEdit }: { initialView: TripView; canEdit: boolean }) {
  const [view, setView] = useState(initialView);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [confirmRemoveDay, setConfirmRemoveDay] = useState<number | null>(null);
  // null: bản đồ hiển thị tất cả các ngày
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  // Ngày vừa nhận điểm dừng mới / vừa thả vào: cuộn tới và nháy nền ngắn
  const [highlight, setHighlight] = useState<{ day: number; key: number } | null>(null);
  const [dragging, setDragging] = useState<TripStopView | null>(null);
  const dayRefs = useRef(new Map<number, HTMLElement>());
  const dndId = useId();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const focused = focusedDay != null && focusedDay <= view.dayCount ? focusedDay : null;
  const sequences = useMemo(() => view.days.map((d) => daySequence(d)), [view.days]);
  const shownDays = useMemo(
    () => (focused ? view.days.filter((d) => d.day === focused) : view.days),
    [view.days, focused],
  );
  const mapStops = useMemo<TripMapStop[]>(() => {
    const seen = new Set<string>();
    return shownDays.flatMap((d) =>
      sequences[d.day - 1]
        .filter((item) => !seen.has(item.stop.id) && seen.add(item.stop.id))
        .map((item) => ({ ...item.stop, label: item.label })),
    );
  }, [shownDays, sequences]);
  const mapRoutes = useMemo<TripMapRoute[]>(
    () =>
      shownDays.flatMap((d) =>
        d.route && !d.route.error ? [{ day: d.day, color: dayColor(d.day), geometry: d.route.geometry }] : [],
      ),
    [shownDays],
  );
  const addedKeys = useMemo(
    () => new Set(view.days.flatMap((d) => d.stops.map((s) => `${s.source}:${s.refId}`))),
    [view],
  );
  const totalStops = view.days.reduce((n, d) => n + d.stops.length, 0);

  useEffect(() => {
    if (!highlight) return;
    // Trên điện thoại panel nằm dưới bản đồ, ô tìm kiếm ở cuối trang → không kéo trang đi chỗ khác
    if (window.matchMedia("(min-width: 1024px)").matches) {
      dayRefs.current.get(highlight.day)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    const timer = setTimeout(() => setHighlight(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlight]);

  const revealDay = (day: number) => setHighlight({ day, key: Date.now() });

  // Chạy một thao tác chỉnh sửa: cập nhật lộ trình mới hoặc báo lỗi.
  // `optimistic`: hiển thị trước kết quả dự kiến, lỗi thì khôi phục lại.
  async function run(
    action: () => Promise<ActionState<TripView>>,
    optimistic?: TripView,
  ): Promise<TripView | null> {
    const previous = view;
    setBusy(true);
    setMessage(null);
    setConfirmRemoveDay(null);
    if (optimistic) setView(optimistic);
    const result = await action();
    setBusy(false);
    if (result.status === "success" && result.data) {
      setView(result.data);
      return result.data;
    }
    if (optimistic) setView(previous);
    setMessage(result.formError ?? "Không thực hiện được. Vui lòng thử lại.");
    return null;
  }

  const refresh = useCallback(async () => {
    const result = await getTripAction(view.id);
    if (result.status === "success" && result.data) setView(result.data);
  }, [view.id]);

  async function addDay() {
    const next = await run(() => addTripDayAction(view.id));
    if (next) revealDay(next.dayCount);
  }

  async function removeDay(day: number) {
    if (confirmRemoveDay !== day) {
      setConfirmRemoveDay(day);
      return;
    }
    await run(() => removeTripDayAction(view.id, day));
  }

  function onDragStart(event: DragStartEvent) {
    setDragging((event.active.data.current as DragData | undefined)?.stop ?? null);
    setActiveStopId(null);
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setDragging(null);
    const source = active.data.current as DragData | undefined;
    const target = over?.data.current as DropData | undefined;
    if (!source || !target || !over) return;
    const { stop } = source;

    // Sắp lại thứ tự trong cùng ngày
    if (target.day === source.day) {
      const from = source.sortable?.index;
      const to = target.sortable?.index;
      if (from == null || to == null || from === to) return;
      const day = view.days.find((d) => d.day === source.day);
      if (!day) return;
      const ids = daySortableIds(day);
      ids.splice(to, 0, ...ids.splice(from, 1));
      await run(
        () => reorderTripStopsAction(view.id, source.day, ids),
        moveLocally(view, stop, source.day, to),
      );
      return;
    }

    // Chuyển sang ngày khác: thả lên một điểm dừng → trước/sau điểm đó (theo nửa trên/dưới), thả lên ngày → cuối ngày
    const targetDay = view.days.find((d) => d.day === target.day);
    if (!targetDay) return;
    let index = daySortableIds(targetDay).length;
    if (target.sortable) {
      const dragged = active.rect.current.translated;
      const below = dragged ? dragged.top + dragged.height / 2 > over.rect.top + over.rect.height / 2 : false;
      index = target.sortable.index + (below ? 1 : 0);
    }
    // Đổi khách sạn làm thay đổi điểm xuất phát các ngày sau → chờ máy chủ, không hiển thị trước
    const optimistic = stop.kind === "hotel" ? undefined : moveLocally(view, stop, target.day, index);
    if (await run(() => moveTripStopAction(view.id, stop.id, target.day, index), optimistic)) {
      revealDay(target.day);
    }
  }

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-5rem)] lg:flex-row">
      <section className="relative flex flex-col lg:min-w-0 lg:flex-1">
        <div className="relative isolate h-[55vh] lg:h-full">
          <TripMap activeStopId={activeStopId} onSelectStop={setActiveStopId} routes={mapRoutes} stops={mapStops} />
        </div>

        {/* Panel lộ trình: nổi trên bản đồ ở màn hình lớn, nằm dưới bản đồ trên điện thoại */}
        <div className="z-[500] flex flex-col bg-white lg:absolute lg:bottom-4 lg:left-4 lg:top-4 lg:w-[360px] lg:rounded-md lg:shadow-xl">
          <div className="space-y-2 border-b border-new-chip p-4">
            <TripTitle canEdit={canEdit} onRename={(t) => run(() => renameTripAction(view.id, t))} title={view.title} />
            {!canEdit && (
              <p className="flex items-center gap-1.5 text-xs text-new-paragraph">
                <LockIcon className="size-3.5" /> Chỉ chủ sở hữu được chỉnh sửa lộ trình này.
              </p>
            )}
            <div className="flex min-h-5 items-center gap-2 text-xs text-new-paragraph">
              {busy ? (
                <span className="flex items-center gap-1.5 text-new-teal-cta">
                  <LoaderCircleIcon className="size-3.5 animate-spin" /> Đang cập nhật lộ trình...
                </span>
              ) : (
                <span>
                  {view.dayCount} ngày · {totalStops} điểm dừng
                </span>
              )}
              {focused && (
                <button
                  className="ml-auto font-semibold text-new-teal-cta hover:underline"
                  onClick={() => setFocusedDay(null)}
                  type="button"
                >
                  Xem tất cả ngày trên bản đồ
                </button>
              )}
            </div>
          </div>

          {message && (
            <p className="mx-4 mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {message}
            </p>
          )}

          <div className={`min-h-0 flex-1 overflow-y-auto p-3 transition-opacity ${busy ? "opacity-60" : ""}`}>
            {view.dayCount === 1 && totalStops === 0 ? (
              <EmptyTrip canEdit={canEdit} />
            ) : (
              <DndContext
                accessibility={{ announcements: ANNOUNCEMENTS, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
                collisionDetection={collisionDetection}
                id={dndId}
                onDragCancel={() => setDragging(null)}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
                sensors={sensors}
              >
                <div className="space-y-2">
                  {view.days.map((d) => (
                    <DaySection
                      activeStopId={activeStopId}
                      busy={busy}
                      canEdit={canEdit}
                      confirmRemove={confirmRemoveDay === d.day}
                      day={d}
                      dayCount={view.dayCount}
                      focused={focused === d.day}
                      highlighted={highlight?.day === d.day}
                      key={d.day}
                      onHoverStop={setActiveStopId}
                      onRemoveDay={() => removeDay(d.day)}
                      onRemoveStop={(stopId) => run(() => removeTripStopAction(view.id, stopId))}
                      onRecomputeRoutes={() => run(() => recomputeTripRoutesAction(view.id))}
                      onToggleFocus={() => setFocusedDay((cur) => (cur === d.day ? null : d.day))}
                      sectionRef={(el) => {
                        if (el) dayRefs.current.set(d.day, el);
                        else dayRefs.current.delete(d.day);
                      }}
                      sequence={sequences[d.day - 1]}
                    />
                  ))}
                </div>
                <DragOverlay dropAnimation={null}>
                  {dragging && (
                    <div className="flex max-w-[300px] cursor-grabbing items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-new-title shadow-lg ring-1 ring-new-chip">
                      <GripVerticalIcon className="size-4 shrink-0 text-new-placeholder" />
                      <span className="truncate">{dragging.name}</span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}

            {canEdit && view.dayCount < MAX_TRIP_DAYS && (
              <button
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-new-input-border py-2 text-sm font-medium text-new-paragraph hover:border-new-teal-cta hover:text-new-teal-cta disabled:opacity-50"
                disabled={busy}
                onClick={addDay}
                type="button"
              >
                <PlusIcon className="size-4" /> Thêm ngày
              </button>
            )}
          </div>
        </div>
      </section>

      <aside className="flex h-[600px] flex-col border-t border-new-chip bg-white lg:h-full lg:w-[400px] lg:shrink-0 lg:border-l lg:border-t-0 xl:w-[440px]">
        <h2 className="flex items-center justify-center gap-1.5 border-b border-new-chip px-4 py-3 text-sm font-semibold text-new-teal-cta">
          <SparklesIcon className="size-4" /> Roamly AI
        </h2>
        <div className="min-h-0 flex-1">
          <TripChat addedKeys={addedKeys} dayCount={view.dayCount} onTripChanged={refresh} tripId={view.id} />
        </div>
      </aside>
    </div>
  );
}

function TripTitle({
  title,
  canEdit,
  onRename,
}: {
  title: string;
  canEdit: boolean;
  onRename: (title: string) => void;
}) {
  const [draft, setDraft] = useState(title);
  const [prevTitle, setPrevTitle] = useState(title);
  // Đồng bộ khi lộ trình được cập nhật từ nơi khác (vd: AI)
  if (prevTitle !== title) {
    setPrevTitle(title);
    setDraft(title);
  }
  if (!canEdit) return <h1 className="text-lg font-semibold text-new-title">{title}</h1>;
  return (
    <input
      aria-label="Tên lộ trình"
      className="-mx-1 w-full rounded px-1 text-lg font-semibold text-new-title hover:bg-new-section-bg focus:bg-white focus:outline-none focus:ring-1 focus:ring-new-teal"
      onBlur={() => {
        const next = draft.trim();
        if (next && next !== title) onRename(next);
        else setDraft(title);
      }}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      value={draft}
    />
  );
}

/** Một ngày trong danh sách lộ trình; là vùng thả khi kéo điểm dừng từ ngày khác. */
function DaySection({
  day,
  sequence,
  canEdit,
  busy,
  dayCount,
  focused,
  highlighted,
  confirmRemove,
  activeStopId,
  sectionRef,
  onToggleFocus,
  onRemoveDay,
  onRecomputeRoutes,
  onHoverStop,
  onRemoveStop,
}: {
  day: TripDayView;
  sequence: SequenceItem[];
  canEdit: boolean;
  busy: boolean;
  dayCount: number;
  focused: boolean;
  highlighted: boolean;
  confirmRemove: boolean;
  activeStopId: string | null;
  sectionRef: (el: HTMLElement | null) => void;
  onToggleFocus: () => void;
  onRemoveDay: () => void;
  onRecomputeRoutes: () => void;
  onHoverStop: (id: string | null) => void;
  onRemoveStop: (stopId: string) => void;
}) {
  const { setNodeRef, isOver, active, over } = useDroppable({
    id: `${DAY_PREFIX}${day.day}`,
    data: { day: day.day } satisfies DropData,
    disabled: !canEdit,
  });
  // Nổi bật khi đang kéo điểm dừng từ ngày khác vào ngày này (trên khung ngày hoặc trên một điểm dừng của ngày)
  const overDay = isOver || (over?.data.current as DropData | undefined)?.day === day.day;
  const dropTarget = overDay && active != null && (active.data.current as DragData | undefined)?.day !== day.day;
  const sortableIds = useMemo(() => daySortableIds(day), [day]);
  const { route } = day;
  const stopCount = day.stops.length;
  const color = dayColor(day.day);

  return (
    <section
      aria-label={`Ngày ${day.day}`}
      className={`scroll-my-3 rounded-md border transition-colors duration-300 ${
        dropTarget
          ? "border-new-teal-cta bg-new-section-bg"
          : highlighted
            ? "border-new-teal-cta/60 bg-teal-50"
            : focused
              ? "border-new-teal-cta/40"
              : "border-new-chip"
      }`}
      ref={(el) => {
        setNodeRef(el);
        sectionRef(el);
      }}
    >
      <div className="flex items-center gap-2 border-b border-new-chip px-3 py-2">
        <button
          aria-pressed={focused}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={onToggleFocus}
          title={focused ? "Xem tất cả ngày trên bản đồ" : "Chỉ xem ngày này trên bản đồ"}
          type="button"
        >
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="shrink-0 text-sm font-semibold text-new-title">Ngày {day.day}</span>
          <span className={`truncate text-xs ${route?.error ? "text-amber-700" : "text-new-paragraph"}`}>
            {route?.error ? (
              "Chưa tính được đường đi"
            ) : route && stopCount > 0 ? (
              <>
                <CarFrontIcon className="mr-1 inline size-3.5 align-[-2px] text-new-teal-cta" />
                {formatDuration(route.durationS)} · {formatDistance(route.distanceM)} · {stopCount} điểm
              </>
            ) : (
              `${stopCount} điểm dừng`
            )}
          </span>
        </button>
        {canEdit && route?.error && !busy && (
          <button
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-700 underline"
            onClick={onRecomputeRoutes}
            type="button"
          >
            <RefreshCwIcon className="size-3.5" /> Thử lại
          </button>
        )}
        {canEdit && dayCount > 1 && !busy && (
          <button
            aria-label={confirmRemove ? `Bấm lần nữa để xóa ngày ${day.day}` : `Xóa ngày ${day.day}`}
            className={`flex shrink-0 items-center gap-1 rounded text-xs ${
              confirmRemove ? "font-semibold text-red-600" : "text-new-placeholder hover:text-red-600"
            }`}
            onClick={onRemoveDay}
            type="button"
          >
            <Trash2Icon className="size-3.5" />
            {confirmRemove && "Xóa?"}
          </button>
        )}
      </div>

      <div className="px-2 py-1.5">
        {sequence.length === 0 ? (
          <p
            className={`my-1 rounded border border-dashed px-3 py-3 text-center text-xs ${
              dropTarget ? "border-new-teal-cta text-new-teal-cta" : "border-new-chip text-new-placeholder"
            }`}
          >
            {canEdit ? "Kéo điểm dừng vào đây" : "Chưa có điểm dừng"}
          </p>
        ) : (
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <ol>
              {sequence.map((item, i) => {
                // Mỗi điểm dừng chỉ kéo được ở đúng ngày của nó, tại lần xuất hiện đầu tiên
                const owned = item.role !== "end" && item.stop.day === day.day;
                const props = {
                  active: activeStopId === item.stop.id,
                  canRemove: canEdit && !busy && owned,
                  currentDay: day.day,
                  item,
                  onHover: onHoverStop,
                  onRemove: () => onRemoveStop(item.stop.id),
                };
                const key = `${item.stop.id}-${i}`;
                if (!canEdit || !owned) return <StopRow {...props} key={key} />;
                // Khách sạn xuất phát luôn đứng đầu ngày: chỉ kéo sang ngày khác, không đổi thứ tự trong ngày
                return item.role === "start" ? (
                  <DraggableStopRow {...props} disabled={busy} key={key} />
                ) : (
                  <SortableStopRow {...props} disabled={busy} key={key} />
                );
              })}
            </ol>
          </SortableContext>
        )}
      </div>
    </section>
  );
}

function EmptyTrip({ canEdit }: { canEdit: boolean }) {
  return (
    <div className="py-6 text-center text-sm text-new-paragraph">
      <p className="font-medium text-new-title">Lộ trình chưa có điểm dừng</p>
      {canEdit && (
        <p className="mt-1">
          <SparklesIcon className="mr-1 inline size-3.5 align-[-2px] text-new-teal-cta" />
          Nhắn Roamly AI để thêm khách sạn, quán ăn, điểm tham quan — AI sẽ tự sắp xếp lộ trình tối ưu. Bạn vẫn có thể
          kéo thả để đổi thứ tự hoặc chuyển ngày.
        </p>
      )}
    </div>
  );
}

type StopRowProps = {
  item: SequenceItem;
  active: boolean;
  canRemove: boolean;
  currentDay: number;
  onHover: (id: string | null) => void;
  onRemove: () => void;
};

/** Id các điểm dừng sắp xếp được trong ngày (không tính khách sạn xuất phát của chính ngày đó), theo thứ tự. */
function daySortableIds(day: TripDayView): string[] {
  const pinnedId = day.baseHotel?.day === day.day ? day.baseHotel.id : null;
  return day.stops
    .filter((s) => s.id !== pinnedId)
    .sort((a, b) => a.position - b.position)
    .map((s) => s.id);
}

function DragHandle({
  name,
  attributes,
  listeners,
  activatorRef,
}: {
  name: string;
  attributes: ReturnType<typeof useDraggable>["attributes"];
  listeners: ReturnType<typeof useDraggable>["listeners"];
  activatorRef: (el: HTMLElement | null) => void;
}) {
  return (
    <button
      {...attributes}
      {...listeners}
      aria-label={`Kéo ${name} để sắp xếp hoặc chuyển ngày`}
      className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-new-placeholder hover:bg-new-section-bg hover:text-new-title active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
      ref={activatorRef}
      type="button"
    >
      <GripVerticalIcon className="size-4" />
    </button>
  );
}

/** Điểm dừng sắp xếp được trong ngày và kéo được sang ngày khác. */
function SortableStopRow({ disabled, ...props }: StopRowProps & { disabled: boolean }) {
  const { stop } = props.item;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging, transform, transition } =
    useSortable({
      id: stop.id,
      data: { day: stop.day, stop } satisfies DragData,
      disabled,
    });
  return (
    <StopRow
      {...props}
      dragging={isDragging}
      handle={
        <DragHandle activatorRef={setActivatorNodeRef} attributes={attributes} listeners={listeners} name={stop.name} />
      }
      rowRef={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    />
  );
}

/** Khách sạn xuất phát: chỉ kéo được sang ngày khác. */
function DraggableStopRow({ disabled, ...props }: StopRowProps & { disabled: boolean }) {
  const { stop } = props.item;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: stop.id,
    data: { day: stop.day, stop } satisfies DragData,
    disabled,
  });
  return (
    <StopRow
      {...props}
      dragging={isDragging}
      handle={
        <DragHandle activatorRef={setActivatorNodeRef} attributes={attributes} listeners={listeners} name={stop.name} />
      }
      rowRef={setNodeRef}
    />
  );
}

function StopRow({
  item,
  active,
  canRemove,
  currentDay,
  onHover,
  onRemove,
  handle,
  dragging,
  rowRef,
  style,
}: StopRowProps & {
  handle?: ReactNode;
  dragging?: boolean;
  rowRef?: (el: HTMLElement | null) => void;
  style?: CSSProperties;
}) {
  const { stop, label, role, legBefore } = item;
  const external = stop.source === "external";
  const caption =
    role === "start"
      ? stop.day === currentDay
        ? "Xuất phát · Khách sạn"
        : `Xuất phát · nghỉ đêm từ ngày ${stop.day}`
      : role === "end"
        ? "Quay về khách sạn"
        : `${KIND_LABEL[stop.kind]}${external ? " · Ngoài Roamly" : ""}`;

  return (
    <li className={dragging ? "relative z-10 opacity-40" : undefined} ref={rowRef} style={style}>
      {legBefore && (
        <div className="ml-[13px] flex items-center gap-2 border-l-2 border-dashed border-new-chip py-1.5 pl-5 text-xs text-new-paragraph">
          <CarFrontIcon className="size-3.5" />
          {formatDuration(legBefore.durationS)} · {formatDistance(legBefore.distanceM)}
        </div>
      )}
      <div
        className={`group flex items-center gap-3 rounded px-1 py-1.5 transition-colors ${active ? "bg-new-section-bg" : ""}`}
        onMouseEnter={() => onHover(stop.id)}
        onMouseLeave={() => onHover(null)}
      >
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            external ? "border-2 border-dashed border-current bg-white" : `${KIND_DOT[stop.kind]} text-white`
          }`}
          style={external ? { color: stop.kind === "restaurant" ? "#f06449" : "#017b6e" } : undefined}
        >
          {label}
        </span>
        <div className="min-w-0 flex-1">
          <a
            className="block truncate text-sm font-medium text-new-title hover:text-new-teal-cta"
            href={stop.url}
            rel="noreferrer"
            target="_blank"
          >
            {stop.name}
          </a>
          <p className="truncate text-xs text-new-paragraph">{caption}</p>
        </div>
        {canRemove && (
          <button
            aria-label={`Xóa ${stop.name}`}
            className="flex size-7 shrink-0 items-center justify-center rounded text-new-placeholder opacity-100 hover:bg-red-50 hover:text-red-600 focus:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            onClick={onRemove}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        )}
        {handle}
      </div>
    </li>
  );
}
