# Task 4: finish the localized store artwork replacement

Local-only work on top of `5d87504`. No deploy or push.
This supersedes Task 3's decision to retain the Apple Photos tutorial screenshot and existing favicon. Export provenance is the approved delivery set, not a claim about current App Store publication.

## Old → new mapping

| Old placement | New artwork / behavior |
| --- | --- |
| `apple-photos-add-location.png` and `.avif` on the English iPhone guide | iPhone v5 en-US `09-apple-photos.png`, AVIF + WebP. Caption now describes the saved LensPin album, rather than claiming to illustrate the manual Add a location control. The Chinese guide now has the corresponding zh-Hans artwork. |
| `coastal-journey.jpg` on the English home | iPad v5 en-US `10-journey-map.png`, complete composition and attribution retained; camera filename/missing-GPS overlay removed and caption updated to the journey map. |
| Coastal thumbnails in both home demos and the English nearby-photo guide | Textual GPS reference markers preserve the illustrative scenario controls. They no longer pretend that the same stock photo is two different geotagged references. Full localized iPad journey artwork is displayed nearby on the English pages, and in the trip-revisit section on the Chinese home. |
| Mac add-location guide's bottom-only screenshot | Existing Mac v2 en-US `01-add-locations.png` moved into the top hero, eager + high fetch priority, with responsive columns. |
| Missing Chinese Mac add-location image | Mac v2 zh-Hans `01-add-locations.png` → `lenspin-store-mac-01-add-locations-zh`, now on the Chinese how-it-works page. Other Chinese Mac images remain zh-Hans. There are no separate `/zh/` Mac guide counterparts in this checkout. |
| English GPX/Mac guide | Existing Mac v2 en-US `03-review-evidence.png` retained as the relevant current Mac artwork. |
| Hand-drawn `favicon.svg` and old icon output | Official `04_演示数据与来源/LensPin-AppIcon-1024.png` resized to 256×256, used for navigation, footer, favicon and existing app-icon placements. The supplied icon is the same visual design; no unsupported claim of a newer design. |
| Content/guide pages without product art | Localized iPad v5 `01-how-it-works`, iPhone v5 `02-suggestion-evidence` or `09-apple-photos`, according to topic. Directories keep cards first and show product artwork afterward. |

Additional generated assets and hashes are recorded in `artwork-task4.json`; `artwork-task3.json` remains the manifest for retained Task 3 artwork. `python3 scripts/create-store-artwork.py` now reproduces both sets, including the icon. Phone outputs are 736×1600; iPad outputs 1600×1200; Mac outputs 1600×1000. All product artwork uses AVIF with WebP fallback, dimensions and descriptive localized alt. Complete source compositions are preserved. First-viewport artwork was measured at 1440×1000 and 390×1000 and marked eager/high priority; later images remain lazy.

## Pages touched

All 42 HTML files receive the official icon and dimensions; the build updates their shared CSS cache key. Existing utility/privacy/404 pages do not receive promotional product sections. All other content pages now contain localized product artwork.

New product-image placements:

- `/en/add-location-to-camera-photos-apple-photos/`
- `/en/add-location-to-photos-iphone/`
- `/en/camera-photos-no-location/`
- `/en/camera-photos-not-on-apple-photos-map/`
- `/en/export-gpx-from-garmin-coros-suunto/`
- `/en/guides/`
- `/en/how-to-get-gpx-file/`
- `/en/import-camera-photos-to-iphone/`
- `/en/record-gpx-on-iphone-apple-watch/`
- `/en/support/gpx-requirements/`
- `/en/support/icloud-photos/`
- `/en/support/`
- `/en/support/location-writeback/`
- `/en/supported-formats/`
- `/en/user-feedback/`
- `/zh/add-location-to-photos-iphone/`
- `/zh/camera-photos-not-on-apple-photos-map/`
- `/zh/export-gpx-from-garmin-coros-suunto/`
- `/zh/guides/`
- `/zh/how-to-get-gpx-file/`
- `/zh/import-camera-photos-to-iphone/`
- `/zh/photo-location-wrong-or-missing/`
- `/zh/record-gpx-on-iphone-apple-watch/`
- `/zh/support/gpx-requirements/`
- `/zh/support/icloud-photos/`
- `/zh/support/`
- `/zh/support/location-writeback/`
- `/zh/supported-formats/`
- `/zh/user-feedback/`

Existing product pages changed: `/en/`, `/zh/`, `/en/add-location-to-photos-iphone/`, `/en/add-location-to-photos-mac/`, `/en/geotag-dslr-photos-with-iphone-photos/`, `/zh/how-it-works/`. Other existing image pages receive shared icon/CSS changes. The guide directory rule `.guide-directory .card-grid + h2` now gives the Chinese “更多操作方法” heading a measured 48px gap at 1440 (36px on narrow screens).

Removed unreferenced legacy files: `apple-photos-add-location.png`, `apple-photos-add-location.avif`, `coastal-journey.jpg`, `favicon.svg`.

## Verification

- `npm run build`, `npm run check`, `npm run verify:seo`, `npm run verify:guides`, `npm run verify:artwork` all pass. `git diff --check` passes.
- 42 HTML pages, 1,391 internal links/fragments checked; 217 `<img>/<source>` references, 39 unique referenced image files. No missing or unreferenced images.
- `task4-image-audit.json` lists **every** `<img>/<source>` src/srcset occurrence, its page, local existence and exact export source/hash (or official badge exception). The audit verifies source SHA-256 and reproduces all 38 generated image outputs byte-for-byte, including social artwork and the icon. It checks locale, dimensions, alt and loading attributes, and rejects nonapproved images.
- Pricing and product boundaries remain: free download; first 100 successful location additions free; optional one-time LensPin Unlimited US $3.99 / CN ¥12. No limited-time-free or competitor claims added. Existing article facts and JSON-LD checks pass.
- Local Playwright/Chrome screenshots: six requested pages at 1440×1000 plus both homes at 390×1000. Each has a full-page and viewport image (16 PNGs total). No failed images, incorrect product dimensions, missing fragment targets, horizontal page overflow, page errors or HTTP errors. First-hero product images load eagerly at high priority. Lazy images were loaded through scrolling without changing their loading attributes. Visual review covered all six full pages and both mobile home viewports.
- Local server: `http://127.0.0.1:4189`. Browser verification runner: `/tmp/codex_seo/browser3/verify4.mjs` (temporary Playwright dependency outside the repo).

Screenshot directory: `/Users/doupi/WorkYard/tmp_shots/shots4/`. Full-page files:

- `en-1440.png`
- `en-390.png`
- `en-add-location-to-photos-iphone-1440.png`
- `en-add-location-to-photos-mac-1440.png`
- `en-geotag-dslr-photos-with-iphone-photos-1440.png`
- `zh-1440.png`
- `zh-390.png`
- `zh-guides-1440.png`

Each has a `-viewport.png` companion. `verification.json` records measurements and the empty failure list.

## Open issues

No known task-blocking issue. Validation is local; no deployment, push, production verification or live App Store-publication check was performed. The pre-existing deletion of `.openai/hosting.json` and untracked `appstore_materials` symlink are intentionally excluded from the commit.
