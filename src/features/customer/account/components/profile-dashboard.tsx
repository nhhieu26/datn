"use client";

import { useState } from "react";
import { InterestsModal } from "./interests-modal";
import { ProfileActivity } from "./profile-activity";
import { ProfileOverview } from "./profile-overview";

type AccountUser = { name?: string | null; email?: string | null };

export function ProfileDashboard({ user }: { user: AccountUser }) {
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Hồ sơ của tôi
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Quản lý tài khoản và tùy chọn của bạn
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <svg
              className="h-3.5 w-3.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Chỉnh sửa hồ sơ
          </button>
        </div>

        <div className="space-y-6">
          <ProfileOverview
            user={user}
            onOpenPreferences={() => setPreferencesOpen(true)}
          />
          <ProfileActivity />
        </div>
      </div>

      <InterestsModal
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </main>
  );
}
