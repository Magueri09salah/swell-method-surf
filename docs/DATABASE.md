# Database — Swell Method Surf

PostgreSQL on Neon, accessed through Prisma 6. Schema: `prisma/schema.prisma`.

## 1. Connection

Neon gives two connection strings and **both are required**:

| Variable       | Neon string | Used by                          | Why                                                                 |
| -------------- | ----------- | -------------------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL` | Pooled      | The app at runtime               | Serverless functions open many short-lived connections; PgBouncer stops Postgres running out of slots. |
| `DIRECT_URL`   | Direct      | `prisma migrate` only            | Migrations need a session-mode connection; they fail through a transaction-mode pooler. |

The pooled URL must carry `?sslmode=require&pgbouncer=true`.

## 2. Conventions

- **IDs** — `cuid()`. Short, URL-safe and non-sequential, so a booking ID cannot be
  incremented to enumerate other people's bookings.
- **Timestamps** — every table has `createdAt` and `updatedAt`.
- **Money** — `Decimal(10,2)`. Never `Float`. Converted to `number` at the service
  boundary, never passed to the client as a `Decimal`.
- **Dates without time** — `@db.Date`, normalised to midnight UTC by `toDateOnly()`.
- **Enums** — anything with a closed set of values. The database stores stable
  `SCREAMING_CASE`; human labels live in `src/lib/constants.ts` and are never persisted.
- **Indexes** — on every column used to filter, sort or join.
- **Table names** — snake_case plural via `@@map`; models stay PascalCase singular.
- **Soft deletes** — used only where genuinely useful. Bookings are never deleted
  (cancellation is a status). Content rows are hard-deleted.

## 3. Entities

| Model              | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `User`             | Admin accounts. No public sign-up; provisioned by seed.        |
| `Client`           | Anyone who has enquired. Keyed on lowercased email.            |
| `CoachingOffer`    | A sellable session format.                                     |
| `Booking`          | A request, and its lifecycle.                                  |
| `BookingNote`      | Append-only internal notes, each with author and timestamp.    |
| `AvailabilityDay`  | The coach's intent for one calendar day.                       |
| `AvailabilitySlot` | A time window within a day.                                    |
| `Testimonial`      | A client review.                                               |
| `GalleryImage`     | A photograph.                                                  |
| `ContentSection`   | Typed key/value CMS payload.                                   |
| `SiteSetting`      | Flat key/value settings.                                       |
| `ContactMessage`   | A general enquiry that is not a booking.                       |

## 4. Relations

```
Client 1───n Booking n───1 CoachingOffer
                │
                └───n BookingNote n───1 User

AvailabilityDay 1───n AvailabilitySlot
```

Referential actions, and why:

| Relation                  | On delete   | Reasoning                                                            |
| ------------------------- | ----------- | -------------------------------------------------------------------- |
| `Booking.client`          | `Cascade`   | Deleting a client removes their bookings — a GDPR erasure path.       |
| `Booking.coachingOffer`   | `SetNull`   | Retiring an offer must not destroy the history of who booked it.      |
| `BookingNote.booking`     | `Cascade`   | Notes have no meaning without their booking.                          |
| `BookingNote.author`      | `SetNull`   | Removing a user preserves the note, losing only the attribution.      |
| `AvailabilitySlot.day`    | `Cascade`   | Slots have no meaning without their day.                              |

## 5. Design decisions worth explaining

**`Booking.reference`** — a short human-quotable code (`SMS-7K2QP4`) drawn from a
32-character alphabet that excludes `0/O` and `1/I`. It survives being read aloud on the
phone or retyped from WhatsApp, which a cuid does not. Creation retries on unique
violation.

**`Booking.priceQuoted`** — snapshotted at confirmation rather than joined from the
offer. Raising a price next season must not silently rewrite what a past client was told
they would pay.

**`Booking.requestedFormat` kept alongside `coachingOfferId`** — the coach may assign a
different offer than the visitor picked. Keeping both preserves what was actually asked
for, which matters when reviewing why a booking went the way it did.

**Missing `AvailabilityDay` row ≠ unavailable** — absence means "not yet decided". That
is a genuinely different state from `UNAVAILABLE`, and collapsing them would lose
information.

**`ContentSection.data` is `Json`** — validated by a Zod schema per key
(`src/lib/validation/content.ts`). Adding an editable field is a schema edit, not a
migration. See DECISIONS.md D-011.

**`GalleryImage.altText` is non-nullable** — enforced in the database *and* in Zod. Alt
text is not an optional nicety; making it nullable invites shipping inaccessible images.

**`GalleryImage.width/height`** — stored so `next/image` can reserve space and avoid
layout shift.

## 6. Commands

```bash
npm run db:generate   # regenerate the Prisma client after a schema edit
npm run db:push       # sync schema without a migration (development only)
npm run db:migrate    # create and apply a migration (development)
npm run db:deploy     # apply pending migrations (CI/production)
npm run db:seed       # seed — requires SEED_ADMIN_PASSWORD
npm run db:studio     # browse the data
```

## 7. Seeding

`prisma/seed.ts` is **idempotent** — safe to re-run; it upserts on natural keys and skips
collections that already have rows.

It refuses to run unless `SEED_ADMIN_PASSWORD` is set to at least 10 characters. No
password is ever committed.

Honesty rules enforced by the seed, not merely documented:

- Sample testimonials are written with `published: false`, so placeholder content
  **cannot reach the public site by accident**.
- No fabricated credentials, certifications, years of experience or surf statistics.
- Prices are plausible placeholders the coach is expected to edit.

## 8. Migration workflow

1. Edit `prisma/schema.prisma`.
2. `npm run db:migrate -- --name describes_the_change`.
3. Commit the generated folder in `prisma/migrations/`.
4. Deployment runs `npm run db:deploy` against `DIRECT_URL`.

Never edit an applied migration. Roll forward with a new one.
