"use client";

import { useState } from "react";
import type { Tag } from "@/entities/tag";
import type { ProfileUser } from "@/entities/user";
import { InterestsModal } from "./interests-modal";
import { ProfileActivity } from "./profile-activity";
import { ProfileOverview } from "./profile-overview";

export function ProfileDashboard({
  user,
  tags,
}: {
  user: ProfileUser;
  tags: Tag[];
}) {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const savedTags = (user.preferences as { tags?: unknown })?.tags;
  const initialTags = Array.isArray(savedTags)
    ? savedTags.filter(
        (tag): tag is string =>
          typeof tag === "string" && tags.some((item) => item.name === tag),
      )
    : [];
  const [selectedTags, setSelectedTags] = useState(initialTags);

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hồ sơ của tôi
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Quản lý tài khoản và tùy chọn của bạn
          </p>
        </div>

        <div className="space-y-6">
          <ProfileOverview
            user={user}
            selectedTags={selectedTags}
            onOpenPreferences={() => setPreferencesOpen(true)}
          />
          <ProfileActivity />
        </div>
      </div>

      {preferencesOpen && (
        <InterestsModal
          onClose={() => setPreferencesOpen(false)}
          onSaved={(names) => {
            setSelectedTags(names);
            setPreferencesOpen(false);
          }}
          tags={tags}
          selectedTags={selectedTags}
        />
      )}
    </main>
  );
}
