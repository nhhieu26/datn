"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Quote,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { uploadArticleInlineImageAction } from "../actions";

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex size-8 items-center justify-center rounded-md text-sm focus:outline-hidden disabled:pointer-events-none disabled:opacity-40 ${
        active
          ? "bg-primary-100 text-primary-700"
          : "text-layer-foreground hover:bg-layer-hover"
      }`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  initialContent,
  onChange,
  invalid,
}: {
  initialContent: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      Placeholder.configure({
        placeholder: "Viết nội dung bài viết… (dùng thanh công cụ để thêm tiêu đề, danh sách, trích dẫn, ảnh)",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "article-content min-h-[360px] px-4 py-3 focus:outline-hidden",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            quote: editor.isActive("blockquote"),
            link: editor.isActive("link"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        : null,
  });

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập đường dẫn (để trống để gỡ link)", previous ?? "https://");
    if (url === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!url.trim()) chain.unsetLink().run();
    else chain.setLink({ href: url.trim() }).run();
  };

  const handleImage = async (file: File | undefined) => {
    if (!editor || !file) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("image", file);
    const result = await uploadArticleInlineImageAction(fd);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (result.status === "success" && result.data) {
      editor.chain().focus().setImage({ src: result.data.url, alt: file.name }).run();
    } else {
      setUploadError(
        result.fieldErrors?.image?.[0] ?? result.formError ?? "Không thể tải ảnh lên.",
      );
    }
  };

  const s = state ?? {
    bold: false, italic: false, underline: false, h2: false, h3: false,
    bullet: false, ordered: false, quote: false, link: false,
    canUndo: false, canRedo: false,
  };
  const run = (fn: () => void) => () => editor && fn();

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-layer ${
        invalid ? "border-red-500" : "border-layer-line"
      }`}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-layer-line bg-surface/60 p-1.5">
        <ToolbarButton active={s.h2} label="Tiêu đề lớn" onClick={run(() => editor!.chain().focus().toggleHeading({ level: 2 }).run())}>
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton active={s.h3} label="Tiêu đề nhỏ" onClick={run(() => editor!.chain().focus().toggleHeading({ level: 3 }).run())}>
          <Heading3 className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-layer-line" />
        <ToolbarButton active={s.bold} label="In đậm" onClick={run(() => editor!.chain().focus().toggleBold().run())}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton active={s.italic} label="In nghiêng" onClick={run(() => editor!.chain().focus().toggleItalic().run())}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton active={s.underline} label="Gạch chân" onClick={run(() => editor!.chain().focus().toggleUnderline().run())}>
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton active={s.link} label="Chèn liên kết" onClick={setLink}>
          <Link2 className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-layer-line" />
        <ToolbarButton active={s.bullet} label="Danh sách" onClick={run(() => editor!.chain().focus().toggleBulletList().run())}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton active={s.ordered} label="Danh sách đánh số" onClick={run(() => editor!.chain().focus().toggleOrderedList().run())}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton active={s.quote} label="Trích dẫn" onClick={run(() => editor!.chain().focus().toggleBlockquote().run())}>
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Đường kẻ ngang" onClick={run(() => editor!.chain().focus().setHorizontalRule().run())}>
          <Minus className="size-4" />
        </ToolbarButton>
        <ToolbarButton disabled={uploading} label="Chèn ảnh" onClick={() => fileInputRef.current?.click()}>
          {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-layer-line" />
        <ToolbarButton disabled={!s.canUndo} label="Hoàn tác" onClick={run(() => editor!.chain().focus().undo().run())}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton disabled={!s.canRedo} label="Làm lại" onClick={run(() => editor!.chain().focus().redo().run())}>
          <Redo2 className="size-4" />
        </ToolbarButton>
        <input
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(event) => handleImage(event.target.files?.[0])}
          ref={fileInputRef}
          type="file"
        />
      </div>
      {uploadError ? (
        <p className="border-b border-layer-line bg-red-50 px-4 py-2 text-xs text-red-700">
          {uploadError}
        </p>
      ) : null}
      <div className="max-h-[70vh] overflow-y-auto bg-white text-new-paragraph">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
