import type { ApprovalStatus, BusinessType } from "@/generated/prisma/client";
import Link from "next/link";
import { getServiceMeta, getStatusMeta } from "../../utils";

type Profile = {
  code: string;
  businessName: string;
  businessType: BusinessType;
  logo: string;
  logoAlt: string;
  taxCode: string;
  submittedAt: string;
  updatedLabel: string;
  status: ApprovalStatus;
  rejectionReason?: string;
};

const baliExplorerImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC20YTWUMhivL0mOdAZfvMp-6L3_ujqUcDTzjC57u7gIzEQFsnZEJnJfmUE06yEoTLoLwyuAilEo5r-QDL2uH7_X0zwIRxdhC8Ngi_ZoyCxWemtPDguumW03QeWvoR0uepp4l0Spyp5KfL1GJ2Lnk6mTasDuWb4DvTMyv0LPrbepWUDgMUvV83vHmuVr-RU0PhWWAkf4DEac9u7w8B7Aj48-E1NKKfQkstyScqt6HGTlHDj0iw7zCPB";
const ubudGreenImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAqY8f5B8PTSoVW3yrm3tJnu7dYDAsQKZqH0LXHNEwSvZlUIu_Qv5TxtmpVhogem78fJczmSoNcIgxtsjS8ih-3y1VoG69Jjd2fA87x5ejNc-40iPtBTUIO6JtTpc5od4PxYOiRlfWE2l1gBoQRxQXqce7Y_nFOenZqbZ7fOI70Po9M9ZfKefXDR-HF_vCVt5G3kqGhN4xyzGiUIVMaJckWGdVJs1P5Rmj-Pds1Ot-p2nhEV8UGoDag";
const sunsetBitesImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCgqpYDmta73V91u8ydnhv7q7Tu2L7vsIOxweedT2lWY8dxzrDrtd2hPaq7TkEadfsBq31dJbjqs0obUiksmqUtMmsg64mW4dX94cmbcwQrGNiR4UYTqnBSO846Ij_k08XwyuHth83CWIXtbgLCffekbtLMUC-3EEL9EYzw8b2dtSdN20f6NtCGwywJd5PmCgOb69mVg1tfiEErbG67xcWiyWJgyBDDkNtbZLeuIf6e7KjkLFdIUw7-";

const profiles: Profile[] = [
  {
    code: "#HS-2025-001",
    businessName: "Bali Explorer Co.",
    businessType: "tour",
    logo: baliExplorerImage,
    logoAlt: "Bali Explorer Co. logo emblem",
    taxCode: "0123456789",
    submittedAt: "15/09/2025",
    updatedLabel: "Cập nhật 2 giờ trước",
    status: "approved",
  },
  {
    code: "#HS-2025-002",
    businessName: "Ubud Green Hotel",
    businessType: "hotel",
    logo: ubudGreenImage,
    logoAlt: "Ubud Green Hotel resort logo",
    taxCode: "9876543210",
    submittedAt: "18/09/2025",
    updatedLabel: "Cập nhật 1 ngày trước",
    status: "pending",
  },
  {
    code: "#HS-2025-003",
    businessName: "Sunset Bites",
    businessType: "restaurant",
    logo: sunsetBitesImage,
    logoAlt: "Sunset Bites dining logo emblem",
    taxCode: "1122334455",
    submittedAt: "12/09/2025",
    updatedLabel: "Cập nhật 4 ngày trước",
    status: "rejected",
    rejectionReason: "MST hoặc giấy phép chưa hợp lệ. Vui lòng cập nhật.",
  },
];

function ServiceBadge({ type }: { type: BusinessType }) {
  const meta = getServiceMeta(type);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${meta.className}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
        {meta.icon}
      </span>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const meta = getStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs ${meta.className}`}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "15px",
          fontVariationSettings: meta.filled ? "'FILL' 1" : undefined,
        }}
      >
        {meta.icon}
      </span>
      {meta.label}
    </span>
  );
}

function IconAction({
  icon,
  title,
  danger,
}: {
  icon: string;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`rounded-lg p-2 text-slate-400 transition ${
        danger
          ? "hover:bg-rose-50 hover:text-rose-600"
          : "hover:bg-slate-100 hover:text-slate-700"
      }`}
      title={title}
      type="button"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {icon}
      </span>
    </button>
  );
}

function ProfileRow({ profile }: { profile: Profile }) {
  const isRejected = profile.status === "rejected";
  const cell = isRejected
    ? "px-6 pt-6 pb-5 align-top"
    : "px-6 py-5 align-middle";

  return (
    <tr
      className={`transition-colors hover:bg-slate-50/70 ${
        isRejected ? "bg-rose-50/20" : ""
      }`}
    >
      <td className={`${cell} whitespace-nowrap`}>
        <span className="inline-block rounded-lg border border-slate-200/80 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
          {profile.code}
        </span>
      </td>

      <td className={`min-w-[280px] ${cell}`}>
        <div
          className={`flex ${isRejected ? "items-start" : "items-center"} gap-3.5`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={profile.logoAlt}
            className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200/80"
            src={profile.logo}
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold whitespace-nowrap text-slate-900">
              {profile.businessName}
            </span>
            <div className="mt-1.5">
              <ServiceBadge type={profile.businessType} />
            </div>
          </div>
        </div>
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-800">
          <span>{profile.taxCode}</span>
          <button
            className="text-slate-400 transition hover:text-slate-700"
            title="Sao chép MST"
          >
            <span className="material-symbols-outlined text-[14px]">
              content_copy
            </span>
          </button>
        </div>
      </td>

      <td className={`${cell} whitespace-nowrap`}>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-800">
            {profile.submittedAt}
          </span>
          <span className="mt-0.5 text-xs text-slate-400">
            {profile.updatedLabel}
          </span>
        </div>
      </td>

      <td className={cell}>
        <div className="flex flex-col items-start gap-1.5">
          <StatusBadge status={profile.status} />
        </div>
      </td>

      <td className={`${cell} text-right whitespace-nowrap`}>
        <div className="inline-flex items-center justify-end gap-1.5">
          {isRejected ? (
            <Link
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-600 shadow-2xs transition hover:bg-brand-500 hover:text-white"
              href={`/provider/profiles/${profile.code}/edit`}
              title="Cập nhật và nộp lại hồ sơ"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                replay
              </span>
              <span>Cập nhật &amp; Gửi lại</span>
            </Link>
          ) : (
              <Link
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200/80 hover:text-slate-900"
                href={`/provider/profiles/${profile.code}/edit`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  edit
                </span>
                <span>Sửa</span>
              </Link>
          )}
          <IconAction icon="visibility" title="Xem chi tiết" />
          <IconAction danger icon="delete" title="Xóa hồ sơ" />
        </div>
      </td>
    </tr>
  );
}

function ProfilesToolbar() {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-b border-slate-200/80 p-4 md:flex-row">
      <div className="relative w-full md:w-96">
        <span className="material-symbols-outlined absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-slate-400">
          search
        </span>
        <input
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          placeholder="Tìm kiếm theo mã hồ sơ, tên đơn vị, MST..."
          type="text"
        />
      </div>
      <div className="flex w-full flex-wrap items-center justify-start gap-2.5 md:w-auto md:justify-end">
        <div className="relative">
          <select className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none">
            <option value="all">Tất cả dịch vụ</option>
            <option value="tour">Tour du lịch</option>
            <option value="hotel">Khách sạn &amp; Lưu trú</option>
            <option value="restaurant">Nhà hàng &amp; Ẩm thực</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-slate-400">
            expand_more
          </span>
        </div>
        <div className="relative">
          <select className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none">
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ thẩm định</option>
            <option value="rejected">Bị từ chối</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-slate-400">
            expand_more
          </span>
        </div>
        <button
          className="flex items-center justify-center self-stretch rounded-xl border border-slate-200 px-2.5 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800"
          title="Đặt lại bộ lọc"
          type="button"
        >
          <span className="material-symbols-outlined block text-[18px]">
            refresh
          </span>
        </button>
      </div>
    </div>
  );
}

export function ProfilesTable() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <ProfilesToolbar />
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <th className="px-6 py-4" scope="col">
                Mã hồ sơ
              </th>
              <th
                className="min-w-[280px] px-6 py-4 whitespace-nowrap"
                scope="col"
              >
                Doanh nghiệp &amp; Loại hình
              </th>
              <th className="px-6 py-4" scope="col">
                Mã số thuế (MST)&nbsp;
              </th>
              <th className="px-6 py-4" scope="col">
                Ngày nộp
              </th>
              <th className="px-6 py-4" scope="col">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right" scope="col">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {profiles.map((profile) => (
              <ProfileRow key={profile.code} profile={profile} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
