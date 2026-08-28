import "server-only";
import { prisma } from "@/server/db";
import { toDateOnly } from "@/lib/utils";
import type { BookingListItemDTO } from "./types";

/**
 * Dashboard aggregation.
 *
 * Answers the five questions from the brief (§45) and nothing else. No vanity
 * charts: every figure here is either something the coach must act on or
 * something they would otherwise have to count by hand.
 */

export type DashboardData = {
  pendingCount: number;
  confirmedCount: number;
  upcomingCount: number;
  clientCount: number;
  unreadMessages: number;
  /** Confirmed + completed revenue for the current calendar month. */
  monthRevenue: { amount: number; currency: string } | null;
  recentInquiries: BookingListItemDTO[];
  upcomingSessions: {
    id: string;
    reference: string;
    clientName: string;
    offerTitle: string | null;
    when: string;
    participants: number;
  }[];
  packageCount: number;
};

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const today = toDateOnly(now);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [
    pendingCount,
    confirmedCount,
    upcomingCount,
    clientCount,
    unreadMessages,
    revenueAgg,
    recentRows,
    upcomingRows,
    packageCount,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({
      where: { status: "CONFIRMED", preferredDate: { gte: today } },
    }),
    prisma.client.count(),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.booking.aggregate({
      _sum: { priceQuoted: true },
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        preferredDate: { gte: monthStart },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        reference: true,
        status: true,
        requestedFormat: true,
        experienceLevel: true,
        preferredDate: true,
        preferredTime: true,
        participants: true,
        createdAt: true,
        bookingType: true,
        client: { select: { name: true, email: true } },
        coachingOffer: { select: { title: true } },
        package: { select: { title: true } },
      },
    }),
    prisma.booking.findMany({
      where: { status: "CONFIRMED", preferredDate: { gte: today } },
      orderBy: [{ scheduledAt: "asc" }, { preferredDate: "asc" }],
      take: 6,
      select: {
        id: true,
        reference: true,
        participants: true,
        preferredDate: true,
        scheduledAt: true,
        client: { select: { name: true } },
        coachingOffer: { select: { title: true } },
        package: { select: { title: true } },
      },
    }),
    prisma.package.count({ where: { active: true } }),
  ]);

  const revenueSum = revenueAgg._sum.priceQuoted;

  return {
    pendingCount,
    confirmedCount,
    upcomingCount,
    clientCount,
    unreadMessages,
    monthRevenue: revenueSum === null ? null : { amount: Number(revenueSum), currency: "MAD" },
    recentInquiries: recentRows.map((row) => ({
      id: row.id,
      reference: row.reference,
      status: row.status,
      clientName: row.client.name,
      clientEmail: row.client.email,
      offerTitle: row.coachingOffer?.title ?? null,
      bookingType: row.bookingType,
      packageTitle: row.package?.title ?? null,
      requestedFormat: row.requestedFormat,
      experienceLevel: row.experienceLevel,
      preferredDate: row.preferredDate.toISOString(),
      preferredTime: row.preferredTime,
      participants: row.participants,
      createdAt: row.createdAt.toISOString(),
    })),
    upcomingSessions: upcomingRows.map((row) => ({
      id: row.id,
      reference: row.reference,
      clientName: row.client.name,
      offerTitle: row.coachingOffer?.title ?? row.package?.title ?? null,
      when: (row.scheduledAt ?? row.preferredDate).toISOString(),
      participants: row.participants,
    })),
    packageCount,
  };
}
