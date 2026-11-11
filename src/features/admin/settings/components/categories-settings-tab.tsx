"use client";

import { useMemo, useState, useTransition } from "react";
import type { ProvinceType } from "@/generated/prisma/client";
import { slugify } from "@/lib/utils";
import {
  createProvinceAction,
  createTagAction,
  deleteProvinceAction,
  deleteTagAction,
  updateProvinceAction,
  updateTagAction,
} from "../actions";
import type { AdminProvinceItem, AdminTagItem, UsageCounts } from "../types";
import {
  dangerButtonClass,
  FieldError,
  getActionErrorMessage,
  inputClass,
  layerButtonClass,
  primaryButtonClass,
  SettingsModal,
  labelClass,
  selectClass,
  smallDangerButtonClass,
  smallLayerButtonClass,
} from "./settings-shared";

type CategorySection = "tags" | "provinces";
type ProvinceTypeFilter = "all" | ProvinceType;

function UsageBadges({ counts }: { counts: UsageCounts }) {
  if (counts.total === 0) {
    return (
      <span className="text-xs text-muted-foreground-1">Chưa sử dụng</span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {counts.tours > 0 && (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {counts.tours} Tour
        </span>
      )}
      {counts.hotels > 0 && (
        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {counts.hotels} Khách sạn
        </span>
      )}
      {counts.restaurants > 0 && (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
          {counts.restaurants} Nhà hàng
        </span>
      )}
      {counts.destinations > 0 && (
        <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
          {counts.destinations} Địa điểm
        </span>
      )}
    </div>
  );
}

export function CategoriesSettingsTab({
  tags,
  provinces,
  onTagsChange,
  onProvincesChange,
  onNotify,
}: {
  tags: AdminTagItem[];
  provinces: AdminProvinceItem[];
  onTagsChange: (next: AdminTagItem[]) => void;
  onProvincesChange: (next: AdminProvinceItem[]) => void;
  onNotify: (message: string, variant?: "success" | "error") => void;
}) {
  const [section, setSection] = useState<CategorySection>("tags");
  const [search, setSearch] = useState("");
  const [provinceTypeFilter, setProvinceTypeFilter] =
    useState<ProvinceTypeFilter>("all");
  const [isPending, startTransition] = useTransition();

  // State cho Modal Tag
  const [tagModal, setTagModal] = useState<{
    mode: "create" | "edit";
    item?: AdminTagItem;
  } | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [tagErrors, setTagErrors] = useState<Record<string, string[]>>({});
  const [deletingTag, setDeletingTag] = useState<AdminTagItem | null>(null);

  // State cho Modal Province
  const [provinceModal, setProvinceModal] = useState<{
    mode: "create" | "edit";
    item?: AdminProvinceItem;
  } | null>(null);
  const [provName, setProvName] = useState("");
  const [provFullName, setProvFullName] = useState("");
  const [provSlug, setProvSlug] = useState("");
  const [provType, setProvType] = useState<ProvinceType>("province");
  const [provImageUrl, setProvImageUrl] = useState("");
  const [provErrors, setProvErrors] = useState<Record<string, string[]>>({});
  const [deletingProvince, setDeletingProvince] =
    useState<AdminProvinceItem | null>(null);

  const filteredTags = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("vi");
    if (!q) return tags;
    return tags.filter(
      (t) =>
        t.name.toLocaleLowerCase("vi").includes(q) ||
        t.slug.toLocaleLowerCase("vi").includes(q),
    );
  }, [tags, search]);

  const filteredProvinces = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("vi");
    return provinces.filter((p) => {
      const matchesType =
        provinceTypeFilter === "all" || p.type === provinceTypeFilter;
      const matchesQuery =
        !q ||
        p.name.toLocaleLowerCase("vi").includes(q) ||
        p.fullName.toLocaleLowerCase("vi").includes(q) ||
        p.slug.toLocaleLowerCase("vi").includes(q);
      return matchesType && matchesQuery;
    });
  }, [provinces, search, provinceTypeFilter]);

  const openCreateTag = () => {
    setTagName("");
    setTagSlug("");
    setTagErrors({});
    setTagModal({ mode: "create" });
  };

  const openEditTag = (item: AdminTagItem) => {
    setTagName(item.name);
    setTagSlug(item.slug);
    setTagErrors({});
    setTagModal({ mode: "edit", item });
  };

  const handleSaveTag = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tagModal) return;
    setTagErrors({});
    startTransition(async () => {
      const payload = {
        name: tagName,
        slug: tagSlug || slugify(tagName),
      };
      const result =
        tagModal.mode === "create"
          ? await createTagAction(payload)
          : await updateTagAction(tagModal.item!.id, payload);

      if (result.status === "error" || !result.data) {
        setTagErrors(result.fieldErrors ?? {});
        onNotify(getActionErrorMessage(result), "error");
        return;
      }

      if (tagModal.mode === "create") {
        onTagsChange(
          [...tags, result.data].sort((a, b) =>
            a.name.localeCompare(b.name, "vi"),
          ),
        );
        onNotify(`Đã thêm thẻ "${result.data.name}".`);
      } else {
        onTagsChange(
          tags
            .map((t) => (t.id === result.data!.id ? result.data! : t))
            .sort((a, b) => a.name.localeCompare(b.name, "vi")),
        );
        onNotify(`Đã cập nhật thẻ "${result.data.name}".`);
      }
      setTagModal(null);
    });
  };

  const handleConfirmDeleteTag = () => {
    if (!deletingTag) return;
    startTransition(async () => {
      const target = deletingTag;
      const result = await deleteTagAction(target.id);
      if (result.status === "error") {
        onNotify(getActionErrorMessage(result), "error");
        return;
      }
      onTagsChange(tags.filter((t) => t.id !== target.id));
      setDeletingTag(null);
      onNotify(`Đã xóa thẻ "${target.name}".`);
    });
  };

  const openCreateProvince = () => {
    setProvName("");
    setProvFullName("");
    setProvSlug("");
    setProvType("province");
    setProvImageUrl("");
    setProvErrors({});
    setProvinceModal({ mode: "create" });
  };

  const openEditProvince = (item: AdminProvinceItem) => {
    setProvName(item.name);
    setProvFullName(item.fullName);
    setProvSlug(item.slug);
    setProvType(item.type);
    setProvImageUrl(item.imageUrl ?? "");
    setProvErrors({});
    setProvinceModal({ mode: "edit", item });
  };

  const handleSaveProvince = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!provinceModal) return;
    setProvErrors({});
    startTransition(async () => {
      const payload = {
        name: provName,
        fullName: provFullName,
        slug: provSlug || slugify(provName),
        type: provType,
        imageUrl: provImageUrl,
      };
      const result =
        provinceModal.mode === "create"
          ? await createProvinceAction(payload)
          : await updateProvinceAction(provinceModal.item!.id, payload);

      if (result.status === "error" || !result.data) {
        setProvErrors(result.fieldErrors ?? {});
        onNotify(getActionErrorMessage(result), "error");
        return;
      }

      if (provinceModal.mode === "create") {
        onProvincesChange(
          [...provinces, result.data].sort((a, b) =>
            a.name.localeCompare(b.name, "vi"),
          ),
        );
        onNotify(`Đã thêm "${result.data.fullName}".`);
      } else {
        onProvincesChange(
          provinces
            .map((p) => (p.id === result.data!.id ? result.data! : p))
            .sort((a, b) => a.name.localeCompare(b.name, "vi")),
        );
        onNotify(`Đã cập nhật "${result.data.fullName}".`);
      }
      setProvinceModal(null);
    });
  };

  const handleConfirmDeleteProvince = () => {
    if (!deletingProvince) return;
    startTransition(async () => {
      const target = deletingProvince;
      const result = await deleteProvinceAction(target.id);
      if (result.status === "error") {
        onNotify(getActionErrorMessage(result), "error");
        setDeletingProvince(null);
        return;
      }
      onProvincesChange(provinces.filter((p) => p.id !== target.id));
      setDeletingProvince(null);
      onNotify(`Đã xóa "${target.fullName}".`);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
        {/* Header & Sub-tab */}
        <div className="flex flex-col gap-3 border-b border-card-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div
            className="inline-flex gap-x-1 self-start rounded-xl bg-surface p-1"
            role="tablist"
          >
            <button
              type="button"
              onClick={() => {
                setSection("tags");
                setSearch("");
              }}
              role="tab"
              aria-selected={section === "tags"}
              className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap focus:outline-hidden ${
                section === "tags"
                  ? "bg-layer text-foreground shadow-2xs"
                  : "text-muted-foreground-1 hover:text-foreground focus:text-foreground"
              }`}
            >
              Thẻ phân loại ({tags.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSection("provinces");
                setSearch("");
              }}
              role="tab"
              aria-selected={section === "provinces"}
              className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap focus:outline-hidden ${
                section === "provinces"
                  ? "bg-layer text-foreground shadow-2xs"
                  : "text-muted-foreground-1 hover:text-foreground focus:text-foreground"
              }`}
            >
              Tỉnh / Thành phố ({provinces.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-60 flex-1 sm:flex-initial">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  section === "tags"
                    ? "Tìm theo tên thẻ hoặc slug..."
                    : "Tìm tỉnh/thành phố..."
                }
                className={`${inputClass} ps-9`}
              />
              <svg
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            {section === "provinces" && (
              <select
                value={provinceTypeFilter}
                onChange={(e) =>
                  setProvinceTypeFilter(e.target.value as ProvinceTypeFilter)
                }
                aria-label="Lọc loại đơn vị hành chính"
                className={`${selectClass} sm:w-auto pe-9`}
              >
                <option value="all">Tất cả loại</option>
                <option value="city">Thành phố trực thuộc TW</option>
                <option value="province">Tỉnh</option>
              </select>
            )}

            <button
              type="button"
              onClick={section === "tags" ? openCreateTag : openCreateProvince}
              className={primaryButtonClass}
            >
              <svg
                className="size-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              {section === "tags" ? "Thêm thẻ mới" : "Thêm tỉnh/thành"}
            </button>
          </div>
        </div>

        {/* Table Content */}
        {section === "tags" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-table-line">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Tên thẻ
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Đang gắn với dịch vụ / địa điểm
                  </th>
                  <th className="px-6 py-3 text-end text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-line">
                {filteredTags.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-muted-foreground-1"
                    >
                      Không tìm thấy thẻ phân loại phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-layer-hover">
                      <td className="px-6 py-3.5 text-sm font-semibold text-foreground whitespace-nowrap">
                        #{tag.name}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground-1 whitespace-nowrap">
                        {tag.slug}
                      </td>
                      <td className="px-6 py-3.5">
                        <UsageBadges counts={tag.counts} />
                      </td>
                      <td className="px-6 py-3.5 text-end whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditTag(tag)}
                            className={smallLayerButtonClass}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTag(tag)}
                            className={smallDangerButtonClass}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-table-line">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Tỉnh / Thành phố
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Phân loại
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Dữ liệu liên kết
                  </th>
                  <th className="px-6 py-3 text-end text-xs font-medium tracking-wide text-muted-foreground-1 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-line">
                {filteredProvinces.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-muted-foreground-1"
                    >
                      Không tìm thấy tỉnh/thành phố phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredProvinces.map((prov) => (
                    <tr key={prov.id} className="hover:bg-layer-hover">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {prov.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={prov.imageUrl}
                              alt={prov.name}
                              className="size-10 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-semibold text-muted-foreground-1">
                              {prov.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {prov.name}
                            </div>
                            <div className="text-xs text-muted-foreground-1">
                              {prov.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            prov.type === "city"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {prov.type === "city" ? "Thành phố" : "Tỉnh"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground-1 whitespace-nowrap">
                        {prov.slug}
                      </td>
                      <td className="px-6 py-3.5">
                        <UsageBadges counts={prov.counts} />
                      </td>
                      <td className="px-6 py-3.5 text-end whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProvince(prov)}
                            className={smallLayerButtonClass}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            disabled={prov.counts.total > 0}
                            title={
                              prov.counts.total > 0
                                ? "Không thể xóa tỉnh/thành đang có dịch vụ hoặc địa điểm"
                                : "Xóa tỉnh/thành phố"
                            }
                            onClick={() => setDeletingProvince(prov)}
                            className={smallDangerButtonClass}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal thêm / sửa Tag */}
      {tagModal && (
        <SettingsModal
          maxWidth="max-w-md"
          title={
            <>
              {tagModal.mode === "create"
                ? "Thêm thẻ phân loại mới"
                : `Chỉnh sửa thẻ "${tagModal.item?.name}"`}
            </>
          }
        >
          <div className="p-4">
            <form onSubmit={handleSaveTag} className="space-y-4">
              <div>
                <label className={labelClass}>Tên hiển thị</label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={(e) => {
                    setTagName(e.target.value);
                    if (tagModal.mode === "create") {
                      setTagSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="Ví dụ: Nghỉ dưỡng biển"
                  disabled={isPending}
                  className={`${inputClass}`}
                />
                <FieldError errors={tagErrors.name} />
              </div>

              <div>
                <label className={labelClass}>Đường dẫn tĩnh (Slug)</label>
                <input
                  type="text"
                  value={tagSlug}
                  onChange={(e) => setTagSlug(slugify(e.target.value))}
                  placeholder="nghi-duong-bien"
                  disabled={isPending}
                  className={`${inputClass} font-mono`}
                />
                <FieldError errors={tagErrors.slug} />
              </div>

              <div className="flex items-center justify-end gap-x-2 border-t border-overlay-line pt-4">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setTagModal(null)}
                  className={layerButtonClass}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={primaryButtonClass}
                >
                  {isPending ? "Đang lưu..." : "Lưu thẻ"}
                </button>
              </div>
            </form>
          </div>
        </SettingsModal>
      )}

      {/* Modal xác nhận xóa Tag */}
      {deletingTag && (
        <SettingsModal
          maxWidth="max-w-md"
          title={<>Xác nhận xóa thẻ &ldquo;{deletingTag.name}&rdquo;?</>}
        >
          <div className="p-4">
            <p className="text-sm text-muted-foreground-1">
              {deletingTag.counts.total > 0
                ? `Thẻ này đang được gắn với ${deletingTag.counts.total} dịch vụ/địa điểm. Khi xóa, liên kết thẻ trên các dịch vụ đó sẽ được gỡ bỏ.`
                : "Thẻ này hiện chưa được gắn với dịch vụ hay địa điểm nào."}
            </p>
            <div className="mt-4 flex items-center justify-end gap-x-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeletingTag(null)}
                className={layerButtonClass}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDeleteTag}
                className={dangerButtonClass}
              >
                {isPending ? "Đang xóa..." : "Xóa thẻ"}
              </button>
            </div>
          </div>
        </SettingsModal>
      )}

      {/* Modal thêm / sửa Province */}
      {provinceModal && (
        <SettingsModal
          maxWidth="max-w-lg"
          title={
            <>
              {provinceModal.mode === "create"
                ? "Thêm Tỉnh / Thành phố mới"
                : `Chỉnh sửa "${provinceModal.item?.fullName}"`}
            </>
          }
        >
          <div className="p-4">
            <form onSubmit={handleSaveProvince} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Tên ngắn gọn</label>
                  <input
                    type="text"
                    required
                    value={provName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProvName(val);
                      if (provinceModal.mode === "create") {
                        setProvSlug(slugify(val));
                        setProvFullName(
                          provType === "city"
                            ? `Thành phố ${val}`
                            : `Tỉnh ${val}`,
                        );
                      }
                    }}
                    placeholder="Ví dụ: Đà Nẵng"
                    disabled={isPending}
                    className={`${inputClass}`}
                  />
                  <FieldError errors={provErrors.name} />
                </div>

                <div>
                  <label className={labelClass}>Loại đơn vị hành chính</label>
                  <select
                    value={provType}
                    onChange={(e) => {
                      const nextType = e.target.value as ProvinceType;
                      setProvType(nextType);
                      if (provinceModal.mode === "create" && provName) {
                        setProvFullName(
                          nextType === "city"
                            ? `Thành phố ${provName}`
                            : `Tỉnh ${provName}`,
                        );
                      }
                    }}
                    disabled={isPending}
                    className={`${inputClass}`}
                  >
                    <option value="province">Tỉnh</option>
                    <option value="city">Thành phố</option>
                  </select>
                  <FieldError errors={provErrors.type} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Tên hành chính đầy đủ</label>
                  <input
                    type="text"
                    required
                    value={provFullName}
                    onChange={(e) => setProvFullName(e.target.value)}
                    placeholder="Thành phố Đà Nẵng"
                    disabled={isPending}
                    className={`${inputClass}`}
                  />
                  <FieldError errors={provErrors.fullName} />
                </div>

                <div>
                  <label className={labelClass}>Slug</label>
                  <input
                    type="text"
                    value={provSlug}
                    onChange={(e) => setProvSlug(slugify(e.target.value))}
                    placeholder="da-nang"
                    disabled={isPending}
                    className={`${inputClass} font-mono`}
                  />
                  <FieldError errors={provErrors.slug} />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  URL ảnh đại diện (tùy chọn)
                </label>
                <input
                  type="url"
                  value={provImageUrl}
                  onChange={(e) => setProvImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  disabled={isPending}
                  className={`${inputClass}`}
                />
                <FieldError errors={provErrors.imageUrl} />
              </div>

              <div className="flex items-center justify-end gap-x-2 border-t border-overlay-line pt-4">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setProvinceModal(null)}
                  className={layerButtonClass}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={primaryButtonClass}
                >
                  {isPending ? "Đang lưu..." : "Lưu tỉnh/thành"}
                </button>
              </div>
            </form>
          </div>
        </SettingsModal>
      )}

      {/* Modal xác nhận xóa Province */}
      {deletingProvince && (
        <SettingsModal
          maxWidth="max-w-md"
          title={<>Xác nhận xóa &ldquo;{deletingProvince.fullName}&rdquo;?</>}
        >
          <div className="p-4">
            <p className="text-sm text-muted-foreground-1">
              Tỉnh/thành phố này chưa có dịch vụ hoặc địa điểm liên kết và có
              thể xóa an toàn khỏi hệ thống.
            </p>
            <div className="mt-4 flex items-center justify-end gap-x-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeletingProvince(null)}
                className={layerButtonClass}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDeleteProvince}
                className={dangerButtonClass}
              >
                {isPending ? "Đang xóa..." : "Xóa tỉnh/thành"}
              </button>
            </div>
          </div>
        </SettingsModal>
      )}
    </div>
  );
}
