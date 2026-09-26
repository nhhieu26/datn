"use client";

import type { ApprovalStatus } from "@/generated/prisma/client";
import { useMemo, useState } from "react";
import { ApprovalProfilePreview } from "./approval-profile-preview";
import { ApprovalProfilesTable } from "./approval-profiles-table";
import type { StatusFilter, TypeFilter } from "./approval-shared";
import { ApprovalSummaryCards } from "./approval-summary-cards";
import type { ApprovalProfile } from "../types";

export function ProfileApprovalDashboard({
  initialProfiles,
}: {
  initialProfiles: ApprovalProfile[];
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedId, setSelectedId] = useState(initialProfiles[0]?.id ?? "");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const counts = useMemo(
    () => ({
      all: profiles.length,
      pending: profiles.filter(
        (profile) => profile.approvalStatus === "pending",
      ).length,
      approved: profiles.filter(
        (profile) => profile.approvalStatus === "approved",
      ).length,
      rejected: profiles.filter(
        (profile) => profile.approvalStatus === "rejected",
      ).length,
    }),
    [profiles],
  );

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return profiles.filter((profile) => {
      const matchesStatus =
        statusFilter === "all" || profile.approvalStatus === statusFilter;
      const matchesType =
        typeFilter === "all" || profile.businessType === typeFilter;
      const haystack = [
        profile.businessName,
        profile.taxCode,
        profile.user.fullname,
        profile.user.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi");
      return (
        matchesStatus && matchesType && (!query || haystack.includes(query))
      );
    });
  }, [profiles, search, statusFilter, typeFilter]);

  const selectedProfile =
    profiles.find((profile) => profile.id === selectedId) ??
    filteredProfiles[0] ??
    profiles[0];

  const pendingIds = filteredProfiles
    .filter((profile) => profile.approvalStatus === "pending")
    .map((profile) => profile.id);
  const allPendingChecked =
    pendingIds.length > 0 && pendingIds.every((id) => checkedIds.has(id));

  const updateStatus = (
    ids: string[],
    status: ApprovalStatus,
    rejectionReason: string | null = null,
  ) => {
    setProfiles((current) =>
      current.map((profile) =>
        ids.includes(profile.id)
          ? {
              ...profile,
              approvalStatus: status,
              rejectionReason,
              updatedAt: new Date().toISOString(),
            }
          : profile,
      ),
    );
    setCheckedIds(new Set());
    setMessage(
      status === "approved"
        ? `Đã duyệt ${ids.length} hồ sơ trên giao diện mẫu.`
        : "Đã cập nhật trạng thái từ chối trên giao diện mẫu.",
    );
  };

  const handleReject = () => {
    if (!selectedProfile) return;
    if (!note.trim()) {
      setMessage("Vui lòng nhập lý do trước khi từ chối hồ sơ.");
      return;
    }
    updateStatus([selectedProfile.id], "rejected", note.trim());
  };

  const toggleChecked = (id: string) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectProfile = (profile: ApprovalProfile) => {
    setSelectedId(profile.id);
    setNote(profile.rejectionReason ?? "");
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("pending");
    setTypeFilter("all");
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        {message ? (
          <div className="fixed top-20 right-5 z-50 flex max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-xl">
            <span className="material-symbols-outlined text-[18px] text-brand-500">
              info
            </span>
            <span>{message}</span>
            <button
              className="ml-2 text-slate-400 hover:text-slate-700"
              onClick={() => setMessage("")}
              type="button"
              aria-label="Đóng thông báo"
            >
              <span className="material-symbols-outlined text-[16px]">
                close
              </span>
            </button>
          </div>
        ) : null}

        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Duyệt hồ sơ đối tác
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">
              Xác minh thông tin doanh nghiệp, mã số thuế và giấy phép trước khi
              cấp quyền đăng tải dịch vụ trên Roamly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={checkedIds.size === 0}
              onClick={() => updateStatus([...checkedIds], "approved")}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                verified
              </span>
              Duyệt đã chọn ({checkedIds.size})
            </button>
          </div>
        </section>

        <ApprovalSummaryCards counts={counts} />

        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
          <ApprovalProfilesTable
            profiles={filteredProfiles}
            total={counts.all}
            selectedId={selectedProfile?.id ?? ""}
            checkedIds={checkedIds}
            allPendingChecked={allPendingChecked}
            onToggleAllPending={() =>
              setCheckedIds(allPendingChecked ? new Set() : new Set(pendingIds))
            }
            onToggleChecked={toggleChecked}
            onSelectProfile={handleSelectProfile}
            onViewProfile={setSelectedId}
            counts={counts}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onResetFilters={resetFilters}
          />

          {selectedProfile ? (
            <ApprovalProfilePreview
              profile={selectedProfile}
              note={note}
              onNoteChange={setNote}
              onApprove={() => updateStatus([selectedProfile.id], "approved")}
              onReject={handleReject}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
