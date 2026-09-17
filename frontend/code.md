Add a room_saved event to talentbridge.cv
Fire this every time a creator saves or publishes their room — not just once — so the data always reflects current composition and we get adoption trends over time (same pattern as your existing public_room_viewed/contact_clicked calls).


posthog.capture('room_saved', {
  room_id,                 // same room_id already sent on public_room_viewed — required for correlation
  room_owner_id,           // same value already sent — the creator's user ID
  is_published,            // boolean — draft save vs. live publish
  blocks_used,             // array of block type keys currently in the room, e.g.:
                            // ['video_intro', 'skill_tags', 'metric_tile', 'call_to_action']
  template_id,             // the template used as the starting point, if any — null if built from scratch
  theme,                   // the room's current theme identifier, e.g. 'midnight', 'sunset', 'dark', 'light'
});

Notes for whoever implements this:

blocks_used: send your own internal block-type keys/enum values — whatever your room builder already uses to identify a block type. They don't need to match our display names exactly; we'll map them on our side. Just keep them stable and consistent call to call (don't rename a key later without telling us).
template_id: send your internal template identifier. If a creator can start from a template and then customize freely, still send the original template_id every save — that's what lets us measure template adoption, not just first use.
theme: send whatever your actual theme system uses (you mentioned ~13 themes exist — send the real identifiers, not just dark/light).
Where this likely goes: wherever the room builder's save/publish handler already lives, probably right next to (or reusing) whatever already fires public_room_viewed's room_id/room_owner_id pair, since it needs the same values.
Don't remove blocks_used/template_id/theme from future events once shipped — if the shape changes later, tell us so we can update the mapping on our end too.
Once this ships, I'll see room_saved and its properties show up automatically in our Schema Health check (Settings → Integrations & API → PostHog), and I can wire the Feature & Template Adoption page and Room Theme Preference card to real numbers immediately.


------
------
// posthogRoomTracking.js
//
// Call trackRoomSaved(...) once, right after a room save/publish request succeeds.
// This is the ONLY function that should call posthog.capture for this event —
// don't inline capture() calls elsewhere for room saves.

/**
 * @param {Object} params
 * @param {string|number} params.roomId - same room ID already sent as room_id on public_room_viewed
 * @param {string|number} params.ownerId - same value already sent as room_owner_id
 * @param {boolean} params.isPublished - true if this save made the room live, false if it's a draft save
 * @param {string[]} params.blocksUsed - block type keys currently in the room, using ONLY the values from BLOCK_TYPES below
 * @param {string|null} params.templateId - template key from TEMPLATE_TYPES below, or null if built from scratch
 * @param {string} params.theme - your internal theme identifier, sent as-is (see note below)
 */
function trackRoomSaved({ roomId, ownerId, isPublished, blocksUsed, templateId, theme }) {
  posthog.capture('room_saved', {
    room_id: String(roomId),
    room_owner_id: String(ownerId),
    is_published: Boolean(isPublished),
    blocks_used: blocksUsed,
    template_id: templateId,
    theme: theme,
  });
}

// Exact block type keys to use in blocksUsed — copy these strings exactly, no variants:
const BLOCK_TYPES = [
  'Video intro', 'Skill tags', 'Metric tile', 'Paragraph', 'Work gallery',
  'Profile', 'Availability', 'Credentials', 'Case studies', 'Call to action',
  'Reference', 'Heading', 'Pipeline/CI-CD', 'Skill bars', 'Document carousel',
  'Before/after', 'Flow diagram', 'Pull quote', 'Coverage matrix',
  'Pricing tiers', 'Statement callout', 'Clause brief', 'Retro columns',
];

// Exact template keys to use in templateId — copy these strings exactly, no variants:
const TEMPLATE_TYPES = [
  'Software Eng / Architect', 'Designer', 'IAM Specialist', 'Cybersecurity',
  'Project Manager', 'Data Consultant', 'Student -> BA / PM',
  'Finance / Accountant', 'Legal & Compliance',
];

module.exports = { trackRoomSaved, BLOCK_TYPES, TEMPLATE_TYPES };
Call it like this, right after your existing save/publish success handler:


const { trackRoomSaved } = require('./posthogRoomTracking');

// ...inside your save/publish success callback, after the room record is confirmed saved:
trackRoomSaved({
  roomId: room.id,
  ownerId: currentUser.id,
  isPublished: room.status === 'published',
  blocksUsed: room.blocks.map(b => b.type), // must already produce values matching BLOCK_TYPES above
  templateId: room.templateId ?? null,
  theme: room.theme,
});