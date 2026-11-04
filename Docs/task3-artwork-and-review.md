# Task 3: current artwork and guide review

Local-only change, based on 0943d30 and 317ba25. No deployment or push.

## Artwork selection

Source root: `../appstore_materials/LensPin_商店素材_统一交付_2026-10-23/02_最新导出/`.
The untracked repository `appstore_materials` is a symlink to that external materials workspace; it is not included in this commit.

| Use | Chosen final export | Evidence |
| --- | --- | --- |
| iPhone and iPad | `完整素材_2026-10-24_v5` | `说明.md` and `从这里开始.md` identify v5 as the latest full four-language set; v4 is the previous set. |
| Home hero | `搜索结果_四语_2026-10-26_v6` | Latest final search artwork; `交付说明.md` records the four-language delivery. Use the full 5244×2950 original as the resize source. |
| Mac | `Mac_2.1_四语_2026-10-29_v2` | Its README documents the final four-language set. All 24 language PNGs have identical SHA-256 hashes to the duplicate `v2 2` folder. All six Chinese PNGs match the accepted Chinese v7 set. The copied `说明.md` still describes v4 acceptance work and is superseded by README and actual final images. Acceptance v5–v7 are not selected as separate deliverables. |
| Social preview | `标题品牌图_2026-10-26_v3` | Latest brand/title image. `生成说明.md` describes the final centered icon/name with Earth background. |

These notes establish export provenance, not current App Store publication status. English pages use en-US artwork; Chinese pages use zh-Hans artwork. The brand card has the shared LensPin name without locale-specific promotional text.

## Image mapping

All product images below use `lenspin-store-…-en/zh.avif` with a WebP fallback; the old standalone PNG/AVIF pairs are removed only after reference checks.

| Old image / placement | New source / asset stem |
| --- | --- |
| Home hero (previous interactive illustration) | Search v6 `search-principle-{locale}-5244x2950.png` → `lenspin-store-search-principle-{en,zh}`. The interactive example is retained immediately below the hero. |
| `lenspin-location-source-selection` | iPhone v5 `05-prepare-references.png` → `lenspin-store-iphone-05-prepare-references-{en,zh}` |
| `lenspin-batch-review-suggestions` | iPhone v5 `06-review-suggestions.png` → `lenspin-store-iphone-06-review-suggestions-{en,zh}` |
| `lenspin-completion-report` | iPhone v5 `09-apple-photos.png` → `lenspin-store-iphone-09-apple-photos-{en,zh}`. Copy now emphasizes checking saved photos in Apple Photos; this is not presented as a new completion-report screenshot. |
| `lenspin-saved-location-details` | iPhone v5 `09-apple-photos.png` (saved LensPin album) |
| `lenspin-location-matching-explained` | iPhone v5 `02-suggestion-evidence.png` → `lenspin-store-iphone-02-suggestion-evidence-{en,zh}` |
| `lenspin-gpx-iphone-location-suggestion` | iPhone v5 `02-suggestion-evidence.png` |
| `lenspin-iphone-photo-location-suggestion` | iPhone v5 `02-suggestion-evidence.png` |
| New iPad artwork on both how-it-works pages | iPad v5 `01-how-it-works.png` → `lenspin-store-ipad-01-how-it-works-{en,zh}` |
| New Mac artwork on both homes and English GPX/Mac guide | Mac v2 `03-review-evidence.png` → `lenspin-store-mac-03-review-evidence-{en,zh}` |
| New Mac artwork on English add-location/Mac guide | Mac v2 `01-add-locations.png` → `lenspin-store-mac-01-add-locations-en` |
| `lenspin-social.png` | Brand v3 `lenspin-brand-header-3840x1646.png`, resized and padded to 1200×630 without cropping the brand or Earth |

Apple Photos tutorial screenshots and the existing app icon are retained. No matching store tutorial replaces their instructional role. Full artwork compositions, including native map attribution, are retained.

The manifest `artwork-task3.json` records exact source files, SHA-256 hashes and output dimensions. Reproduce with `python3 scripts/create-store-artwork.py`; use `--source` if the materials root is elsewhere. `create-social-image.py` uses the same approved source. Phone artwork uses a 1600px long edge (736px wide); landscape artwork is 1600px wide. AVIF assets are approximately 39–69 KiB and WebP fallbacks 60–96 KiB. Social PNG is approximately 647 KiB. Intrinsic dimensions and localized descriptive alt text match each asset. Home hero and other hero product images use eager loading and high fetch priority.

## Review fixes

- `/zh/camera-photos-not-on-apple-photos-map/` now follows the English map diagnosis topic: Info → missing location → wrong pin → correct Info/incomplete map → batch matching → separate library/export verification.
- Original permission/time-zone/camera-clock content is preserved at `/zh/photo-location-wrong-or-missing/`. Existing Chinese links follow the moved topic; home and guide directory also link to the new map counterpart.
- The standalone Chinese page has a Chinese self alternate only. It has no English translation or x-default link. Build generation no longer assumes every page has an English counterpart; sitemap and language picker include only real translations.
- Removed both unverified Adjust Info claims and retained only the iOS-version placement caveat.
- Guide directories use the full content width. English: three cards then two equal-width cards; Chinese: two by two. Single column at 390px.
- Product copy consistently names LensPin Unlimited. Free download, first 100 successful location additions free, optional one-time US $3.99 / CN ¥12; no subscription or free-Unlimited claim added.
- English home now has WebPage and BreadcrumbList JSON-LD, with regression checks for both homepages.

## Verification

- `npm run build`, `npm run check`, `npm run verify:seo`, `npm run verify:guides`.
- 42 HTML files; 41 sitemap pages/campaigns; JSON-LD parsed, internal paths/fragments/srcset resolved; 22 store-image instances checked for intrinsic dimensions and locale. No unused new store assets.
- Playwright with local Chrome, served from `http://127.0.0.1:4188`. At 390×1000 and 1440×1000: `/en/`, `/zh/`, `/en/guides/`, `/zh/guides/`, `/en/add-location-to-photos-mac/`, `/zh/camera-photos-not-on-apple-photos-map/`, plus the moved Chinese guide. Full-page and viewport screenshots saved. Images load through natural scrolling, including the horizontal product tour; loading attributes are not changed for verification. No failed images, wrong dimensions, horizontal page overflow, missing fragments or browser/network errors. Hero images load eagerly with high priority.
- Screenshot folder: `/tmp/codex_seo/shots3/`. Filenames: route segments joined with hyphens, followed by `-390.png` or `-1440.png`; viewport variants add `-viewport`. `verification.json` records measured results. Verification script and temporary Playwright dependency are outside the repository in `/tmp/codex_seo/browser3/`.
- Visual review covered both home heroes, full pages, both directories, the Mac screenshot and the Chinese map guide. An initial mobile card spanning defect was fixed before the final screenshots.

## Open issues / scope

No known task-blocking issues. This is local browser and source validation; no production preview, deployment, push, current App Store publication check or external crawler re-indexing was performed. The pre-existing deletion of `.openai/hosting.json` and untracked materials symlink remain untouched and uncommitted.

## Task 4 follow-up

The retained Apple Photos tutorial image, coastal photo, and hand-drawn favicon are now replaced. See [Task 4 notes](task4-artwork-and-review.md) and the exhaustive [image audit](task4-image-audit.json). Task 3 records above describe its historical scope.
