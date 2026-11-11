"use client";

import type { Province, Tag } from "@/generated/prisma/client";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  ImagePlus,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
} from "@/entities/article/schema";
import type { ArticleCategory, ArticleStatus } from "@/entities/article/type";
import {
  createArticleAction,
  updateArticleAction,
  type ArticleActionState,
} from "../actions";
import {
  cardClass,
  chipClass,
  inputClass,
  labelClass,
  layerButtonClass,
  primaryButtonClass,
  selectClass,
  textareaClass,
} from "./styles";
import { RichTextEditor } from "./rich-text-editor";

export type ArticleFormValues = {
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  status: ArticleStatus;
  provinceId: string;
  tagIds: string[];
  coverUrl: string | null;
};

const EMPTY: ArticleFormValues = {
  title: "",
  excerpt: "",
  content: "",
  category: "guide",
  status: "draft",
  provinceId: "",
  tagIds: [],
  coverUrl: null,
};

const MAX_EXCERPT = 400;
const INITIAL_STATE: ArticleActionState = { status: "idle" };
const requiredMark = <span className="text-red-500">*</span>;

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={cardClass}>
      <div className="border-b border-card-divider px-4 py-3 md:px-5">
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-5 p-4 md:p-5">{children}</div>
    </div>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-2 text-xs text-red-600">{messages.join(", ")}</p>;
}

export function ArticleForm({
  provinces,
  tags,
  mode = "create",
  articleId,
  slug,
  initialValues,
  justCreated,
}: {
  provinces: Province[];
  tags: Tag[];
  mode?: "create" | "edit";
  articleId?: string;
  slug?: string;
  initialValues?: ArticleFormValues;
  justCreated?: boolean;
}) {
  const [form, setForm] = useState<ArticleFormValues>(initialValues ?? EMPTY);
  const [newCover, setNewCover] = useState<{ file: File; url: string } | null>(
    null,
  );
  const [savedCoverUrl, setSavedCoverUrl] = useState<string | null>(
    initialValues?.coverUrl ?? null,
  );
  const [savedStatus, setSavedStatus] = useState<ArticleStatus | null>(
    initialValues?.status ?? null,
  );
  const [state, formAction, isPending] = useActionState(
    mode === "edit"
      ? updateArticleAction.bind(null, articleId!)
      : createArticleAction,
    INITIAL_STATE,
  );
  const [showSaved, setShowSaved] = useState(Boolean(justCreated));
  const coverPreview = newCover?.url ?? savedCoverUrl;

  // Đồng bộ khi server action trả kết quả mới (cập nhật state trong lúc render, không dùng effect)
  const [handledState, setHandledState] = useState(state);
  // Trường đã sửa sau lần gửi gần nhất: ẩn lỗi cũ của trường đó
  const [editedFields, setEditedFields] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  if (state !== handledState) {
    setHandledState(state);
    setEditedFields(new Set());
    if (state.status === "success") {
      setShowSaved(true);
      setSavedStatus(form.status);
      if (state.data) {
        setSavedCoverUrl(state.data.coverUrl);
        setNewCover(null);
      }
    }
  }

  useEffect(() => {
    if (!showSaved) return;
    const timer = setTimeout(() => setShowSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [showSaved]);

  // Thu hồi object URL của ảnh xem trước cũ
  useEffect(() => {
    if (!newCover) return;
    return () => URL.revokeObjectURL(newCover.url);
  }, [newCover]);

  const markEdited = (field: string) =>
    setEditedFields((prev) =>
      prev.has(field) ? prev : new Set(prev).add(field),
    );

  const pickCover = (file: File | undefined) => {
    setNewCover(file ? { file, url: URL.createObjectURL(file) } : null);
    markEdited("cover");
  };

  const update = <K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    markEdited(key);
  };

  const toggleTag = (id: string) =>
    update(
      "tagIds",
      form.tagIds.includes(id)
        ? form.tagIds.filter((t) => t !== id)
        : [...form.tagIds, id],
    );

  const submit = (status: ArticleStatus) => {
    update("status", status);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("excerpt", form.excerpt);
    fd.append("content", form.content);
    fd.append("category", form.category);
    fd.append("status", status);
    fd.append("provinceId", form.provinceId);
    fd.append("tagIds", JSON.stringify(form.tagIds));
    if (newCover) fd.append("cover", newCover.file);
    startTransition(() => formAction(fd));
  };

  const pendingErrors = Object.entries(
    state.status === "error" ? (state.fieldErrors ?? {}) : {},
  ).filter(([field]) => !editedFields.has(field));
  const errors = pendingErrors.length
    ? Object.fromEntries(pendingErrors)
    : undefined;

  return (
    <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "edit" ? "Chỉnh sửa bài viết" : "Viết bài mới"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            Bài viết giới thiệu điểm đến, cẩm nang và kinh nghiệm du lịch hiển
            thị tại trang Bài viết.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "edit" && savedStatus === "published" && slug ? (
            <Link
              className={layerButtonClass}
              href={`/articles/${slug}`}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-4" />
              Xem bài
            </Link>
          ) : null}
          <Link className={layerButtonClass} href="/admin/articles">
            <ChevronLeft className="size-4" />
            Danh sách bài viết
          </Link>
        </div>
      </div>

      {showSaved ? (
        <div
          className="flex items-center gap-x-3 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800"
          role="status"
        >
          <CheckCircle2 className="size-4" />
          Đã lưu bài viết.
        </div>
      ) : null}

      {state.status === "error" && (state.formError || errors) ? (
        <div
          className="flex gap-x-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="font-semibold">
            {state.formError ?? "Vui lòng kiểm tra lại các trường bên dưới."}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 sm:space-y-6">
          <Card title="Nội dung">
            <div>
              <label className={labelClass} htmlFor="title">
                Tiêu đề {requiredMark}
              </label>
              <input
                className={inputClass}
                id="title"
                maxLength={200}
                onChange={(e) => update("title", e.target.value)}
                placeholder="VD: 7 trải nghiệm không thể bỏ lỡ ở Đà Lạt"
                value={form.title}
              />
              <FieldError messages={errors?.title} />
            </div>
            <div>
              <label className={labelClass} htmlFor="excerpt">
                Tóm tắt {requiredMark}
              </label>
              <textarea
                className={textareaClass}
                id="excerpt"
                maxLength={MAX_EXCERPT}
                onChange={(e) => update("excerpt", e.target.value)}
                placeholder="1–2 câu giới thiệu, hiển thị ở danh sách bài viết và khi chia sẻ."
                rows={3}
                value={form.excerpt}
              />
              <div className="mt-1 flex justify-between">
                <FieldError messages={errors?.excerpt} />
                <span className="ms-auto text-xs text-muted-foreground-1">
                  {form.excerpt.length}/{MAX_EXCERPT}
                </span>
              </div>
            </div>
            <div>
              <span className={labelClass}>Nội dung bài viết {requiredMark}</span>
              <RichTextEditor
                initialContent={form.content}
                invalid={Boolean(errors?.content)}
                onChange={(html) => update("content", html)}
              />
              <FieldError messages={errors?.content} />
            </div>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card title="Xuất bản">
            <p className="text-sm text-muted-foreground-1">
              Trạng thái hiện tại:{" "}
              <span
                className={`font-medium ${
                  savedStatus === "published" ? "text-teal-700" : "text-yellow-700"
                }`}
              >
                {savedStatus === "published" ? "Đã xuất bản" : "Bản nháp"}
              </span>
            </p>
            <div className="grid gap-2">
              <button
                className={primaryButtonClass}
                disabled={isPending}
                onClick={() => submit("published")}
                type="button"
              >
                {isPending && form.status === "published"
                  ? "Đang lưu…"
                  : savedStatus === "published"
                    ? "Cập nhật bài viết"
                    : "Xuất bản"}
              </button>
              <button
                className={layerButtonClass}
                disabled={isPending}
                onClick={() => submit("draft")}
                type="button"
              >
                {isPending && form.status === "draft"
                  ? "Đang lưu…"
                  : savedStatus === "published"
                    ? "Chuyển về bản nháp"
                    : "Lưu nháp"}
              </button>
            </div>
          </Card>

          <Card title="Ảnh bìa">
            {coverPreview ? (
              <div className="relative overflow-hidden rounded-lg border border-layer-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Ảnh bìa"
                  className="aspect-[16/10] w-full object-cover"
                  src={coverPreview}
                />
                {newCover ? (
                  <button
                    aria-label="Bỏ ảnh mới chọn"
                    className="absolute end-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    onClick={() => setNewCover(null)}
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
            ) : null}
            <label
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm text-muted-foreground-1 hover:bg-layer-hover ${
                errors?.cover ? "border-red-400" : "border-layer-line"
              }`}
            >
              <ImagePlus className="size-6" />
              {coverPreview ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
              <span className="text-xs">PNG/JPG, tối đa 5MB</span>
              <input
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  pickCover(e.target.files?.[0]);
                  e.target.value = "";
                }}
                type="file"
              />
            </label>
            <FieldError messages={errors?.cover} />
          </Card>

          <Card title="Phân loại">
            <div>
              <label className={labelClass} htmlFor="category">
                Danh mục {requiredMark}
              </label>
              <select
                className={selectClass}
                id="category"
                onChange={(e) => update("category", e.target.value as ArticleCategory)}
                value={form.category}
              >
                {ARTICLE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {ARTICLE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <FieldError messages={errors?.category} />
            </div>
            <div>
              <label className={labelClass} htmlFor="provinceId">
                Tỉnh / Thành liên quan
              </label>
              <select
                className={selectClass}
                id="provinceId"
                onChange={(e) => update("provinceId", e.target.value)}
                value={form.provinceId}
              >
                <option value="">— Không chọn —</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName}
                  </option>
                ))}
              </select>
              <FieldError messages={errors?.provinceId} />
            </div>
            <div>
              <span className={labelClass}>Thẻ</span>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    className={chipClass(form.tagIds.includes(tag.id))}
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    type="button"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <FieldError messages={errors?.tagIds} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
