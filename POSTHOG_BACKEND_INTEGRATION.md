# PostHog Backend Integration Guide for Showcase Rooms

This guide explains how to integrate Showcase Room composition and adoption telemetry (`room_saved`) into the existing **Laravel PHP backend** (`talent-bridge-backend`) so that the TalentBridge Admin Portal can track:
* **23 Modular Blocks Adoption %**
* **9 Industry Templates Adoption %**
* **13 Curated Room Themes Split**
* **Average Customization Depth**

---

## 1. Architecture Context

* **Existing Stack**: Laravel (PHP), MySQL, Redis Queue, `posthog/posthog-php: ^3.0`.
* **Existing Services**: 
  - `App\Services\PostHogService` (singleton configured with `config('services.posthog.key')`)
  - `App\Jobs\CaptureAnalyticsEvent` (queued job forwarding async events to PostHog)
* **Target Event**: `room_saved`
* **Consumer**: The TalentBridge Admin Analytics Gateway (`TbridgeAdmin`), which queries PostHog via HogQL and aggregates room composition.

---

## 2. Step 1: Add `trackRoomSaved` to `App\Services\PostHogService.php`

Open `app/Services/PostHogService.php` and add the following method:

```php
/**
 * Track room composition, block adoption, template and theme preference.
 *
 * @param array{
 *   roomId: int|string,
 *   userId: int|string,
 *   isPublished: bool,
 *   blocksUsed: string[],
 *   templateId?: string|null,
 *   theme?: string|null,
 *   colorMode?: string|null
 * } $data
 */
public function trackRoomSaved(array $data): void
{
    $distinctId = (string) ($data['userId'] ?? 'anonymous');

    $this->capture($distinctId, 'room_saved', [
        'room_id'       => (string) $data['roomId'],
        'room_owner_id' => (string) $data['userId'],
        'is_published'  => (bool) ($data['isPublished'] ?? false),
        
        // 1. Array of block names currently present in the room
        'blocks_used'   => array_values($data['blocksUsed'] ?? []),
        
        // 2. Starting template name (or null if built from blank)
        'template_id'   => $data['templateId'] ?? null,
        
        // 3. Theme identifier (one of the 13 curated themes)
        'theme'         => $data['theme'] ?? 'Default',
        
        // Optional display mode
        'color_mode'    => $data['colorMode'] ?? null,
    ]);
}
```

---

## 3. Step 2: Helper to Extract Room Composition (`blocks_used` & `theme`)

Create a helper method (e.g. in `ShowcaseRoom` model or a dedicated service) to assemble the current payload whenever a room is saved:

```php
namespace App\Services;

use App\Models\ShowcaseRoom;
use App\Models\ShowcaseAsset;
use App\Models\UserSetting;

class RoomTelemetryHelper
{
    /**
     * Map internal asset types / features to the standardized 23-block catalog.
     */
    public static function getBlocksUsedForRoom(ShowcaseRoom $room): array
    {
        $blocks = [];

        // 1. Check core room attributes
        if (!empty($room->intro_video)) {
            $blocks[] = 'Video intro';
        }
        if (!empty($room->skill)) {
            $blocks[] = 'Skill tags';
        }
        if (!empty($room->room_desc)) {
            $blocks[] = 'Paragraph';
        }

        // 2. Query attached assets for this room
        $assetTypes = ShowcaseAsset::where('showcase_room_id', $room->id)
            ->pluck('type')
            ->unique()
            ->toArray();

        foreach ($assetTypes as $type) {
            $mapped = match (strtolower($type)) {
                'video'       => 'Video intro',
                'image'       => 'Work gallery',
                'file'        => 'Document carousel',
                'link'        => 'Call to action',
                'text'        => 'Paragraph',
                'testimonial' => 'Reference',
                default       => null,
            };

            if ($mapped && !in_array($mapped, $blocks, true)) {
                $blocks[] = $mapped;
            }
        }

        // Always includes Profile block if published
        if (!in_array('Profile', $blocks, true)) {
            $blocks[] = 'Profile';
        }

        return $blocks;
    }

    /**
     * Resolve the room's current theme name from UserSetting or Room.
     */
    public static function getThemeForUser(int $userId): string
    {
        $setting = UserSetting::where('user_id', $userId)->first();
        
        // If theme is stored as an ID (1-13) or string key, map to readable name:
        $themeMap = [
            1 => 'Midnight',
            2 => 'Emerald',
            3 => 'Sunset',
            4 => 'Ocean',
            5 => 'Slate',
            6 => 'Nordic',
            7 => 'Cyberpunk',
            8 => 'Minimalist',
            9 => 'Monochrome',
            10 => 'Amethyst',
            11 => 'Rose Gold',
            12 => 'Corporate',
            13 => 'Sandstone',
        ];

        $rawTheme = $setting->theme ?? null;

        if (is_numeric($rawTheme) && isset($themeMap[(int)$rawTheme])) {
            return $themeMap[(int)$rawTheme];
        }

        return !empty($rawTheme) ? (string)$rawTheme : 'Default';
    }
}
```

---

## 4. Step 3: Dispatch via Existing `CaptureAnalyticsEvent` Job

Whenever a room is created, updated, or published in `ShowcaseRoomController`:

```php
use App\Jobs\CaptureAnalyticsEvent;
use App\Services\RoomTelemetryHelper;

// Inside ShowcaseRoomController::store or update:
$blocksUsed = RoomTelemetryHelper::getBlocksUsedForRoom($room);
$themeName  = RoomTelemetryHelper::getThemeForUser($room->user_id);

CaptureAnalyticsEvent::dispatch('trackRoomSaved', [
    'roomId'      => $room->id,
    'userId'      => $room->user_id,
    'isPublished' => (bool) ($room->is_primary || $room->status === 'published'),
    'blocksUsed'  => $blocksUsed,
    'templateId'  => $room->template_name ?? null, // e.g. 'Software Eng / Architect'
    'theme'       => $themeName,                   // e.g. 'Midnight'
]);
```

> [!TIP]
> Because `CaptureAnalyticsEvent` implements `ShouldQueue`, dispatching this event is **completely non-blocking** and runs in your Redis queue without slowing down the HTTP response.

---

## 5. Standardized Catalog Reference

To ensure your data maps cleanly to the Admin Portal dashboard, use these exact strings:

### The 23 Content Blocks
| Category | Recognized Block Name Strings |
| :--- | :--- |
| **Tell your story** | `Video intro`, `Skill tags`, `Paragraph`, `Profile`, `Heading`, `Pull quote` |
| **Show proof** | `Metric tile`, `Pipeline/CI-CD`, `Skill bars`, `Before/after`, `Coverage matrix`, `Statement callout` |
| **Show work** | `Work gallery`, `Case studies`, `Document carousel`, `Flow diagram`, `Clause brief`, `Retro columns` |
| **Make contact** | `Availability`, `Call to action` |
| **Get vouched for**| `Credentials`, `Reference`, `Pricing tiers` |

### The 9 Industry Templates
* `Software Eng / Architect`
* `Designer`
* `IAM Specialist`
* `Cybersecurity`
* `Project Manager`
* `Data Consultant`
* `Student -> BA / PM`
* `Finance / Accountant`
* `Legal & Compliance`

### The 13 Curated Themes
Send the human-readable theme name as a string (e.g. `'Midnight'`, `'Emerald'`, `'Sunset'`, etc.). The Admin Portal automatically groups and sorts whatever theme names are provided.

---

## 6. Verification Checklist

1. **Trigger a save** in local or staging environment.
2. Verify Redis queue worker processes the job: `php artisan queue:work`.
3. Check PostHog dashboard (`Live Events`):
   - Event: `room_saved`
   - Properties: `room_id`, `room_owner_id`, `blocks_used`, `template_id`, `theme`.
4. Open the TalentBridge Admin Portal (`/dashboard/features`):
   - The banner will switch to live tracking.
   - The Block Adoption table and Showcase Theme Split chart will populate immediately.
