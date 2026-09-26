import Image from "next/image";
import type { ApprovalProfile } from "../types";
import { BusinessBadge } from "./approval-shared";
import { formatDate, formatEntityCode, formatTime } from "@/lib/utils";

function VerificationRow({
  icon,
  label,
  value,
  tone = "success",
}: {
  icon: string;
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  const success = tone === "success";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`material-symbols-outlined text-[18px] ${
            success ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {icon}
        </span>
        <span className="truncate text-xs font-semibold text-slate-700">
          {label}
        </span>
      </div>
      <span
        className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${
          success
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function ApprovalProfilePreview({
  profile,
  note,
  onNoteChange,
  onApprove,
  onReject,
}: {
  profile: ApprovalProfile;
  note: string;
  onNoteChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm 2xl:sticky 2xl:top-0">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            <h2 className="text-xs font-extrabold tracking-wide text-slate-800 uppercase">
              Chi tiết hồ sơ
            </h2>
          </div>
          <span className="rounded-md bg-sky-50 px-2 py-1 font-mono text-[10px] font-bold text-sky-700">
            {formatEntityCode("PR", profile.id)}
          </span>
        </div>
      </div>

      <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto p-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 p-5 text-white shadow-md shadow-brand-500/15">
          {profile.photoUrl ? (
            <Image
              src={profile.photoUrl}
              alt=""
              fill
              sizes="380px"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="relative">
            <BusinessBadge type={profile.businessType} />
            <h3 className="mt-3 text-lg font-extrabold leading-snug">
              {profile.businessName}
            </h3>
            <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-300">
              <span className="material-symbols-outlined mt-0.5 text-[14px]">
                location_on
              </span>
              {profile.address ?? "Chưa cập nhật địa chỉ"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-3">
          <p className="mb-2.5 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
            Đối chiếu pháp lý
          </p>
          <div className="space-y-2">
            <VerificationRow
              icon="check_circle"
              label="Mã số thuế"
              value={profile.taxCode ? "Đã cung cấp" : "Còn thiếu"}
              tone={profile.taxCode ? "success" : "warning"}
            />
            <VerificationRow
              icon={profile.licenseUrl ? "task_alt" : "help"}
              label="Giấy phép kinh doanh"
              value={profile.licenseUrl ? "Có tệp" : "Cần bổ sung"}
              tone={profile.licenseUrl ? "success" : "warning"}
            />
            <VerificationRow
              icon="language"
              label="Website chính thức"
              value={profile.website ? "Đã khai báo" : "Không có"}
              tone={profile.website ? "success" : "warning"}
            />
          </div>
        </div>

        <dl className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-[105px_1fr] gap-3">
            <dt className="text-slate-400">Người đại diện</dt>
            <dd className="text-right font-semibold text-slate-800">
              {profile.user.fullname}
            </dd>
          </div>
          <div className="grid grid-cols-[105px_1fr] gap-3">
            <dt className="text-slate-400">Email</dt>
            <dd className="truncate text-right font-semibold text-sky-700">
              {profile.user.email}
            </dd>
          </div>
          <div className="grid grid-cols-[105px_1fr] gap-3">
            <dt className="text-slate-400">Số điện thoại</dt>
            <dd className="text-right font-semibold text-slate-800">
              {profile.user.phone}
            </dd>
          </div>
          <div className="grid grid-cols-[105px_1fr] gap-3">
            <dt className="text-slate-400">Ngày gửi</dt>
            <dd className="text-right font-semibold text-slate-800">
              {formatTime(profile.createdAt)}, {formatDate(profile.createdAt)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
            Mô tả doanh nghiệp
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {profile.description ?? "Đối tác chưa cập nhật mô tả."}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[11px] font-bold transition ${
              profile.licenseUrl
                ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                : "pointer-events-none border-slate-100 text-slate-300"
            }`}
            href={profile.licenseUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
          >
            <span className="material-symbols-outlined text-[16px]">
              description
            </span>
            Xem giấy phép
          </a>
          <a
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[11px] font-bold transition ${
              profile.website
                ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                : "pointer-events-none border-slate-100 text-slate-300"
            }`}
            href={profile.website ?? "#"}
            target="_blank"
            rel="noreferrer"
          >
            <span className="material-symbols-outlined text-[16px]">
              open_in_new
            </span>
            Website
          </a>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <label className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
            Ghi chú phản hồi / Lý do từ chối
            <textarea
              className="mt-2 min-h-20 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-normal normal-case text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10"
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Nhập lý do để gửi lại cho đối tác..."
              value={note}
            />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={profile.approvalStatus === "rejected"}
              onClick={onReject}
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">
                close
              </span>
              Từ chối
            </button>
            <button
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={profile.approvalStatus === "approved"}
              onClick={onApprove}
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">
                check_circle
              </span>
              Duyệt hồ sơ
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
