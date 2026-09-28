# `room_saved` — PostHog event contract

One event is missing from PostHog. Until it's sent, the Admin Portal's Feature & Template
Adoption page (blocks, templates, themes) has nothing to show — it's not a bug on the admin
side, there's just no data yet.

**Where this goes**: wherever a room save/publish request already succeeds server-side. Below is
the exact shape needed — how you populate `blocks_used`/`template_id`/`theme` from your own data
model is up to you; this only specifies the contract the Admin Portal reads.

## Fire this event

```
posthog.capture(distinct_id: <the room owner's user id>, event: 'room_saved', properties: {
  room_id:       <same room_id already sent on public_room_viewed>,
  room_owner_id: <same value already sent — the creator's user id>,
  is_published:  <bool — draft save vs. live publish>,
  blocks_used:   [<block type keys currently in the room>],   // see catalog below
  template_id:   <starting template, or null if built from scratch>,  // see catalog below
  theme:         <the room's current theme identifier>,        // see catalog below
})
```

Fire it on every save, not just once — so adoption trends over time, not just a single snapshot.

## Property values must match this catalog exactly

Aggregation on our side keys off these exact strings. If your internal block/template/theme
identifiers differ, map them to these before sending — don't invent new names.

**`blocks_used`** — any of these 23 (send only the ones present in the room):
```
Video intro, Skill tags, Paragraph, Profile, Heading, Pull quote,
Metric tile, Pipeline/CI-CD, Skill bars, Before/after, Coverage matrix, Statement callout,
Work gallery, Case studies, Document carousel, Flow diagram, Clause brief, Retro columns,
Availability, Call to action,
Credentials, Reference, Pricing tiers
```

**`template_id`** — one of these 9, or `null`:
```
Software Eng / Architect, Designer, IAM Specialist, Cybersecurity, Project Manager,
Data Consultant, Student -> BA / PM, Finance / Accountant, Legal & Compliance
```

**`theme`** — the room's theme as a human-readable string (e.g. `"Midnight"`, `"Emerald"`,
`"Sunset"`). There are 13 curated themes on the product side — send whatever your theme system
actually uses; the Admin Portal groups by whatever string arrives, no fixed list required here.

## How to verify it worked

1. Trigger a room save.
2. PostHog → Activity → Live events → look for `room_saved` with the properties above.
3. Admin Portal → Feature Adoption — the "Not yet live" banner disappears and real numbers
   populate automatically (nothing further needed on the admin side, this is already built and
   waiting).
