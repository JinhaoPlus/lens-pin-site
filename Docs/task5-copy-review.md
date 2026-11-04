# Task 5 — Copy review

Date: 2026-11-04. Base: `7e160bf` (owner identifies it as live). Local work only; no push or deployment.

The repository contains **42 HTML files total**: 41 localized pages (22 EN + 19 ZH) plus 404. All are included in build, SEO, image and copy checks. Existing translation availability is retained; English-only Mac guides are not given fictitious ZH hreflang counterparts.

The owner’s supplied facts and pricing decision override older website copy. “No numbers” beside the hero CTA is interpreted literally there; the 100-item allowance and per-item counting rule are explained in pricing/FAQ. Existing unrelated `.openai/hosting.json` deletion and untracked `appstore_materials` are excluded from the commit.

## Finding-by-finding implementation

| # | Finding | Status | How | Pages |
|---|---|---|---|---|
| 1 | Hero naming and SEO | Done | EN hero names DSLR/mirrorless; ZH names 单反／微单; Sony/Fujifilm/Canon in eyebrow. Updated home titles/descriptions and workflow title/H1. | /en/, /zh/, both /how-it-works/ |
| 2 | Four reference sources | Done | iPhone photos, another GPS camera’s geotagged photos, GPX and Apple Health workout routes. Four working demo tabs, including Apple Watch / Fitness. | Both homes and workflow pages; formats, source and GPX guides |
| 3 | Remove iPhone-only restriction | Done | Replaced restrictive claims with geotagged iPhone or GPS-camera references. Removed the term anchor, including its former CSS class, while preserving published route URLs. | Both /how-it-works/ and /geotag-dslr-photos-with-iphone-photos/ |
| 4 | Apple Watch first | Done | GPX introductions and Watch sections first explain direct, read-only HealthKit route access with no export. Strava/GPX remains an optional file path. LensPin does not record GPX. | Both GPX acquisition/recording/matching/export/support guides; /en/geotag-photos-gpx-mac/ |
| 5 | Pricing and accessibility | Done | Short no-number pricing line next to the hero CTA. Detailed allowance explains 100 photos/videos, one saved item = one use, skipped/failed excluded; optional LensPin Unlimited, one-time, no subscription, regional App Store price. No monetary amounts. Free-download Offer.price = 0 remains valid. | Both homes, all price-bearing guides, shared JSON-LD |
| 6 | Plain language | Done | Visible evidence → clues / 线索; source agreement → whether the sources agree; plain route-position explanation. GPX and geotagged explained on first prose use. Saving described as saving locations to Apple Photos. | All 41 localized pages; interactive JS; workflow |
| 7 | De-duplicate | Done | Library prerequisite in hero; review and existing-location safeguards appear once near the top. Removed repeated process/safety sections and bottom download pitch. FAQ retains necessary direct answers. | Both homes |
| 8 | Remove specified clutter | Done | Removed principle disclaimer caption, walkthrough corner label, self-intro/one-pin paragraph, score/probability paragraph, and obsolete formats-link trailing period (removed with old workflow copy). | Both homes and workflow pages |
| 9 | Exact tier names | Done | Read app MatchPreviewCategory and Localizable.xcstrings: High Confidence / Review / No Clear Suggestion; 高可信 / 需检查 / 无明确建议. Updated site/demo text consistently. | Homes, workflow, no-GPX/GPX examples and shared JS |
| 10 | FAQ parity | Done | Added uploads, cost and original-file questions to EN; matching ZH answers. Added GPX/import and Apple Vision availability answers. FAQ JSON-LD generated from visible answers. | Both homes |
| 11 | Navigation | Done | Desktop/mobile: How it works / Pricing / Guides / Support; 工作原理 / 价格 / 教程 / 帮助. Pricing links to localized home #pricing. | Shared header on every localized page |
| 12 | Direct contact | Done | Added linked r/LensPin community and App Store support-contact path, including support subpages. No email invented. | Both /support/, support subpages and /privacy/ |
| 13 | User words only | Done | Home contains one verified verbatim user quote with author and original-comment link. Caveats and performance/export context remain on /user-feedback/. Same English original retained on ZH to avoid presenting a translation as a verbatim quote. | Both homes and /user-feedback/ |
| 14 | Order and missing features | Done | Mac screenshot is the second section. Added automatic journey grouping by time/place, globe, time-zone display, clock-offset preview, optional GPS JPG export and video-export limit. Removed obsolete privacy version heading. Footer/platform FAQ covers Apple Vision and all markets including China. | Homes, workflow, privacy and shared footer |

## Source checks

Tier names were read directly, without changing the app repository:

- `lenspin-app/LensPin/Models/PhotoModels.swift`, `MatchPreviewCategory.title`.
- `lenspin-app/LensPin/Localizable.xcstrings`, keys `common.high_confidence`, `library.review`, `library.no_suggestion`.

Home quote: “Got about 2K camera photos geotagged.” — evansHe. Verified against the [original Reddit comment](https://www.reddit.com/r/ApplePhotos/comments/1x95nzs/comment/phqodql/). The [second original comment](https://www.reddit.com/r/ApplePhotos/comments/1x95nzs/comment/phjrbs0/) was also checked; its context stays on the feedback page. Competing app names are not copied to the site. External recorder/export instructions retain their original source-check dates; they are secondary options, not newly certified instructions.

## Home structure and size

Counts use main-content text from BeautifulSoup `get_text(' ', strip=True)`, excluding header/footer, image pixels and JSON-LD. English words are whitespace tokens. Chinese whitespace tokens are supplied for reproducibility, but Han-character counts are more meaningful for Chinese. FAQ answers count even when collapsed.

| Measure | Before | After | Change |
|---|---:|---:|---:|
| EN main words | 1,066 | 617 | -42.1% |
| ZH main whitespace tokens | 226 | 193 | -14.6% |
| ZH main Han characters | 1,277 | 860 | -32.7% |
| EN sections | 11 | 8 | -3 |
| ZH sections | 10 | 8 | -2 |
| EN visible `evidence` occurrences, case-insensitive | 14 | 0 | -14 |
| EN raw HTML `evidence` substring count | 41 | 26 | -15 |

Remaining raw-HTML occurrences are stable DOM/CSS hooks and approved artwork filenames, not visitor-facing copy. These are intentionally retained to avoid breaking asset provenance and interactions.

### EN before

1. LensPin: Add location to camera photos on iPhone, iPad & Mac.
2. Why this suggested location?
3. The photo is already in Apple Photos. The trip is the missing piece.
4. From a camera-photo batch to locations you have checked.
5. See why a place was suggested before you save it.
6. Two evidence paths. One review flow.
7. LensPin FAQ
8. Put the whole trip back on the map.
9. Reports from people trying LensPin.
10. Review location evidence on Mac
11. Find the right fix for your photos.

### EN after

1. LensPin: Add missing GPS to DSLR & mirrorless photos on iPhone, iPad & Mac.
2. See which photos are a sure match — on Mac too.
3. Use the clues you already have.
4. Revisit the trip, then share a copy with GPS.
5. From a LensPin user
6. Free to start. No subscription.
7. LensPin FAQ
8. Photo location guides

### ZH before

1. LensPin：相机照片补定位，支持 iPhone、iPad、Mac。
2. 为什么建议这个位置？
3. 相机照片已经在 Apple Photos 里，只差旅行的位置
4. 从一批相机照片，到你检查过的位置。
5. 根据你手上的依据选择方法
6. 真实使用反馈，连同限制一起看
7. 开始前的常见问题
8. 让整次旅行回到照片地图上
9. 也可以在 Mac 上审核位置依据
10. 给照片添加位置，从这里开始。

### ZH after

1. LensPin：单反、微单照片补定位，支持 iPhone、iPad 和 Mac。
2. 在原生 Mac App 上，看清哪些照片匹配更可靠。
3. 用你已有的线索，找回拍摄地点。
4. 重温旅程，也能导出带 GPS 的照片副本。
5. 用户原话
6. 免费开始，无订阅。
7. 常见问题
8. 照片添加地理位置教程

## Verification

- `npm run build` and `npm run build:production`: passed; production build is a local validation command and does not deploy.
- `npm run check`: passed.
- `npm run verify:seo`: passed — 42 HTML files, 41 unique App Store campaigns, 18 FAQ answers, 2 application entities, 41 sitemap alternate sets; social metadata and CSP valid.
- `npm run verify:guides`: passed — 9 existing long-guide checks; updated stale fixed-price assertions to current allowance and App Store regional-price wording. Existing length, links, Article schema and reciprocal language checks retained.
- `npm run verify:artwork`: passed — 205 image references, 39 unique image files, 38 provenance outputs, 1,288 internal links, zero missing or unused images. Existing `Docs/task4-image-audit.json` regenerated by this verifier.
- Added `npm run verify:copy`: passed — all 42 files, current pricing, four-source tabs, exact tier names, direct contacts, navigation and forbidden legacy wording. It checks text assets as well as HTML for forbidden strings.
- `git diff --check`: passed.
- Grep of text assets under `dist`: zero matches for `$3.99`, `¥12`, `3.99`, `limited-time`, `限时免费`, `anchor`, `launch plan`, `1.3.2`, case-sensitive competitor names `GeoTag` and `HoudahGeo`. No `Import photos` item in desktop or mobile navigation. Case-insensitive `geotag` matches ordinary English verbs and existing SEO routes; these are not competitor references.
- Playwright (headless Chromium): 7 route/viewport renders, 14 PNGs, zero script/HTTP errors, zero horizontal overflow, zero broken images, exactly one H1 per page. Four source tabs, End-key selection and mobile pricing links passed. Screenshots visually inspected; full captures scroll through and decode images before capture.

## Screenshots

Directory: `/Users/doupi/WorkYard/tmp_shots/shots5/`. Viewport height: 1,000 px; device scale: 1.

- `/Users/doupi/WorkYard/tmp_shots/shots5/en-1440-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-1440-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-390-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-390-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/zh-1440-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/zh-1440-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/zh-390-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/zh-390-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-how-it-works-1440-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-how-it-works-1440-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-geotag-photos-gpx-mac-1440-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-geotag-photos-gpx-mac-1440-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-support-1440-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots5/en-support-1440-full.png`

Browser metrics and interaction results: `/Users/doupi/WorkYard/tmp_shots/shots5/browser-results.json`.

## Limits and remaining work

No requested implementation or verification is outstanding. This is local website validation, not app-device validation, live-site verification or deployment. App feature/platform facts use the owner’s authoritative statement; tier labels were additionally checked in current local app strings. Text embedded in the existing approved App Store artwork was not redrawn. The screenshot directory is outside the repository as requested.
