"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  approveProviderProfilesAction,
  rejectProviderProfileAction,
} from "../actions";
import { ApprovalIcon } from "./approval-icon";
import { ApprovalProfilesTable } from "./approval-profiles-table";
import { ApprovalRejectModal } from "./approval-reject-modal";
import {
  ApprovalToast,
  getActionError,
  primaryButtonClass,
  type StatusFilter,
  type TypeFilter,
} from "./approval-shared";
import { ApprovalSummaryCards } from "./approval-summary-cards";
import type {
  ApprovalMutationResult,
  ApprovalProfile,
  ApprovalProfilePatch,
} from "../types";
import type { ActionState } from "@/shared/lib/action-state";

export function ProfileApprovalDashboard({
  initialProfiles,
}: {
  initialProfiles: ApprovalProfile[];
}) {
  const router = useRouter();
  const [previousProfiles, setPreviousProfiles] = useState(initialProfiles);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [rejectingProfile, setRejectingProfile] =
    useState<ApprovalProfile | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();
  const isBusy = isPending || isRefreshing;

  // Refresh gửi props mới nhưng vẫn giữ state của Client Component.
  if (initialProfiles !== previousProfiles) {
    setPreviousProfiles(initialProfiles);
    setProfiles(initialProfiles);
  }

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

  const pendingIds = filteredProfiles
    .filter((profile) => profile.approvalStatus === "pending")
    .map((profile) => profile.id);
  const allPendingChecked =
    pendingIds.length > 0 && pendingIds.every((id) => checkedIds.has(id));

  const applyPatches = (patches: ApprovalProfilePatch[]) => {
    const patchesById = new Map(patches.map((patch) => [patch.id, patch]));
    setProfiles((current) =>
      current.map((profile) => ({
        ...profile,
        ...patchesById.get(profile.id),
      })),
    );
    setCheckedIds(new Set());
  };

  const runMutation = (
    mutation: () => Promise<ActionState<ApprovalMutationResult>>,
    getSuccessMessage: (result: ApprovalMutationResult) => string,
    onSuccess?: () => void,
  ) => {
    setMessage("");
    startTransition(async () => {
      const result = await mutation();
      if (result.status === "error" || !result.data) {
        setMessage(getActionError(result));
        return;
      }

      applyPatches(result.data.profiles);
      setMessage(getSuccessMessage(result.data));
      onSuccess?.();
    });
  };

  const handleApprove = (ids: string[]) => {
    if (ids.length === 0) return;
    runMutation(
      () => approveProviderProfilesAction(ids),
      ({ updatedCount }) =>
        updatedCount > 0
          ? `Đã duyệt ${updatedCount} hồ sơ.`
          : "Không còn hồ sơ chờ duyệt trong lựa chọn này.",
    );
  };

  const handleReject = (profile: ApprovalProfile, reason: string) => {
    if (profile.approvalStatus !== "pending") return;
    if (!reason.trim()) {
      setMessage("Vui lòng nhập lý do trước khi từ chối hồ sơ.");
      return;
    }
    runMutation(
      () => rejectProviderProfileAction(profile.id, reason),
      () => "Đã từ chối hồ sơ và lưu lý do phản hồi.",
      () => setRejectingProfile(null),
    );
  };

  const toggleChecked = (id: string) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("pending");
    setTypeFilter("all");
    setCheckedIds(new Set());
    startRefresh(() => router.refresh());
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {message ? (
          <ApprovalToast message={message} onClose={() => setMessage("")} />
        ) : null}

        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Duyệt hồ sơ đối tác
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
              Xác minh thông tin doanh nghiệp, mã số thuế và hồ sơ pháp lý trước
              khi cấp quyền đăng tải dịch vụ trên Roamly.
            </p>
          </div>
          <button
            className={`shrink-0 self-start md:self-auto ${primaryButtonClass}`}
            disabled={checkedIds.size === 0 || isBusy}
            onClick={() => handleApprove([...checkedIds])}
            type="button"
          >
            <ApprovalIcon name="shieldCheck" />
            Duyệt đã chọn ({checkedIds.size})
          </button>
        </div>

        <ApprovalSummaryCards counts={counts} />

        <ApprovalProfilesTable
          profiles={filteredProfiles}
          total={counts.all}
          checkedIds={checkedIds}
          isPending={isBusy}
          isRefreshing={isRefreshing}
          allPendingChecked={allPendingChecked}
          onToggleAllPending={() =>
            setCheckedIds(allPendingChecked ? new Set() : new Set(pendingIds))
          }
          onToggleChecked={toggleChecked}
          onApprove={(profile) => handleApprove([profile.id])}
          onReject={setRejectingProfile}
          counts={counts}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onResetFilters={resetFilters}
        />
      </div>

      {rejectingProfile ? (
        <ApprovalRejectModal
          isPending={isBusy}
          key={rejectingProfile.id}
          onClose={() => setRejectingProfile(null)}
          onConfirm={(reason) => handleReject(rejectingProfile, reason)}
          profile={rejectingProfile}
        />
      ) : null}
    </main>
  );
}
