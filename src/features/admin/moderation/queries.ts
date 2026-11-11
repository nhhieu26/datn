import { articleRepo } from "@/entities/article";
import { reviewRepo } from "@/entities/review";
import { prisma } from "@/lib/prisma";
import { SERVICE_PATH } from "@/features/customer/reviews/paths";
import {
  MODERATION_PAGE_SIZE,
  toModerationFilter,
  type ModerationQuery,
} from "./search-params";
import type { ModerationRow, ModerationSummary } from "./types";

const KIND_LABEL = { tour: "Tour", hotel: "Khách sạn", restaurant: "Nhà hàng" } as const;
const SUMMARY_DAYS = 30;

export async function loadModerationPage(
  query: ModerationQuery,
): Promise<{ rows: ModerationRow[]; total: number }> {
  const filter = toModerationFilter(query);
  const page = {
    skip: (query.page - 1) * MODERATION_PAGE_SIZE,
    take: MODERATION_PAGE_SIZE,
  };

  if (query.tab === "reviews") {
    const { items, total } = await reviewRepo.findPageForModeration(filter, page);
    return {
      total,
      rows: items.map((r) => ({
        id: r.id,
        target: "review",
        content: r.content,
        authorName: r.customerName,
        authorEmail: r.customerEmail,
        subject: r.serviceName,
        subjectLabel: KIND_LABEL[r.kind],
        subjectHref: r.serviceSlug ? `${SERVICE_PATH[r.kind]}/${r.serviceSlug}` : null,
        rating: r.rating,
        bookingCode: r.bookingCode,
        status: r.status,
        source: r.moderationSource,
        reason: r.moderationReason,
        categories: r.moderationCategories,
        createdAt: r.createdAt.toISOString(),
        moderatedAt: r.moderatedAt?.toISOString() ?? null,
      })),
    };
  }

  const { items, total } = await articleRepo.findCommentPageForModeration(filter, page);
  return {
    total,
    rows: items.map((c) => ({
      id: c.id,
      target: "article_comment",
      content: c.content,
      authorName: c.user.fullname,
      authorEmail: c.user.email,
      subject: c.article.title,
      subjectLabel: "Bài viết",
      subjectHref: `/articles/${c.article.slug}`,
      rating: null,
      bookingCode: null,
      status: c.status,
      source: c.moderationSource,
      reason: c.moderationReason,
      categories: c.moderationCategories,
      createdAt: c.createdAt.toISOString(),
      moderatedAt: c.moderatedAt?.toISOString() ?? null,
    })),
  };
}

export async function loadModerationSummary(): Promise<ModerationSummary> {
  const since = new Date(Date.now() - SUMMARY_DAYS * 24 * 60 * 60 * 1000);
  const [reviewCounts, commentCounts, verdicts, fallback, latency] = await Promise.all([
    reviewRepo.countByStatus(),
    articleRepo.countCommentsByStatus(),
    prisma.moderationLog.groupBy({
      by: ["stage", "verdict"],
      where: { createdAt: { gte: since }, stage: { in: ["keyword", "ai"] } },
      _count: { _all: true },
    }),
    // AI lỗi/timeout: log AI có verdict pending nhưng không có confidence
    prisma.moderationLog.count({
      where: { createdAt: { gte: since }, stage: "ai", verdict: "pending", confidence: null },
    }),
    prisma.moderationLog.aggregate({
      where: { createdAt: { gte: since }, stage: "ai", confidence: { not: null } },
      _avg: { latencyMs: true },
    }),
  ]);

  const count = (stage: "keyword" | "ai", verdict: string) =>
    verdicts.find((v) => v.stage === stage && v.verdict === verdict)?._count._all ?? 0;

  return {
    pendingReviews: reviewCounts.pending,
    pendingComments: commentCounts.pending,
    keywordBlocked: count("keyword", "block"),
    aiApproved: count("ai", "approve"),
    aiPending: count("ai", "pending") - fallback,
    aiRejected: count("ai", "reject"),
    aiFallback: fallback,
    aiAvgLatencyMs:
      latency._avg.latencyMs != null ? Math.round(latency._avg.latencyMs) : null,
  };
}
