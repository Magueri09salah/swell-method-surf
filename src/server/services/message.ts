import "server-only";
import { prisma } from "@/server/db";
import type { ContactMessageData } from "@/lib/validation/booking";

export type MessageDTO = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
};

export async function createContactMessage(
  data: ContactMessageData,
  meta: { sourceIp?: string } = {},
): Promise<void> {
  await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      body: data.body,
      sourceIp: meta.sourceIp ?? null,
    },
  });
}

export async function listMessages(status?: MessageDTO["status"]): Promise<MessageDTO[]> {
  const rows = await prisma.contactMessage.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function setMessageStatus(
  id: string,
  status: MessageDTO["status"],
): Promise<void> {
  await prisma.contactMessage.update({ where: { id }, data: { status } });
}

export async function deleteMessage(id: string): Promise<void> {
  await prisma.contactMessage.delete({ where: { id } });
}
