import { Archive, MailOpen } from "lucide-react";
import { AdminHeading, Panel } from "@/components/admin/ui";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { listMessages } from "@/server/services/message";
import { deleteMessageAction, setMessageStatusAction } from "@/server/actions/admin";
import { MESSAGE_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export default async function MessagesPage() {
  const messages = await listMessages();

  return (
    <>
      <AdminHeading
        title="Messages"
        description="General enquiries sent through the site that are not booking requests."
      />

      {messages.length === 0 ? (
        <EmptyState
          title="No messages"
          description="General enquiries will appear here. Booking requests go to the Bookings page instead."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((message) => (
            <li key={message.id}>
              <Panel>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="type-body-sm font-semibold">
                        {message.subject || "No subject"}
                      </p>
                      <p className="type-caption text-[var(--text-secondary)]">
                        {message.name} ·{" "}
                        <a
                          href={`mailto:${message.email}`}
                          className="break-all text-[var(--color-ink)] underline-offset-4 hover:underline"
                        >
                          {message.email}
                        </a>{" "}
                        · {formatDateTime(message.createdAt)}
                      </p>
                    </div>

                    <Badge tone={message.status === "UNREAD" ? "warning" : "muted"}>
                      {MESSAGE_STATUS_LABELS[message.status]}
                    </Badge>
                  </div>

                  <p className="measure whitespace-pre-wrap type-body-sm text-[var(--text-secondary)]">
                    {message.body}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 border-t border-[var(--color-line-subtle)] pt-3">
                    {message.status !== "READ" && (
                      <form action={setMessageStatusAction}>
                        <input type="hidden" name="id" value={message.id} />
                        <input type="hidden" name="status" value="READ" />
                        <button
                          type="submit"
                          className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-[4px] px-3 type-caption font-semibold text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
                        >
                          <MailOpen aria-hidden="true" className="size-4" />
                          Mark as read
                        </button>
                      </form>
                    )}

                    {message.status !== "ARCHIVED" && (
                      <form action={setMessageStatusAction}>
                        <input type="hidden" name="id" value={message.id} />
                        <input type="hidden" name="status" value="ARCHIVED" />
                        <button
                          type="submit"
                          className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-[4px] px-3 type-caption font-semibold text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
                        >
                          <Archive aria-hidden="true" className="size-4" />
                          Archive
                        </button>
                      </form>
                    )}

                    <form action={deleteMessageAction} className="ml-auto">
                      <input type="hidden" name="id" value={message.id} />
                      <ConfirmSubmit
                        message={`Delete the message from ${message.name}? This cannot be undone.`}
                      />
                    </form>
                  </div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
