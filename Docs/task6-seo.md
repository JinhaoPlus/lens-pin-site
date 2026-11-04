# Task 6 — SEO expert review, items 15–23

Date: 2026-11-04. Base: `68ca80e`. Local work and commit only: no push, no deployment. The owner identifies production as `7e160bf`; production state was deliberately not queried or changed.

## Decisions and implementation

| Item | Result |
|---|---|
| 15 | EN home title is 60 characters, description 152. ZH title 39, description 73. Home copy naturally uses “LensPin: Photo Geotagger”, “add GPS to photos”, “geotag DSLR photos”, DSLR and mirrorless. Camera brands remain descriptive examples. The proposed longer title/description were shortened rather than copied verbatim. |
| 16 | Both SoftwareApplication entities describe all four sources: iPhone photos, another GPS camera’s photos, timed GPX and Apple Watch/Fitness workouts read directly from Apple Health without export. Localized plain-language featureList and two actual store-artwork screenshot URLs per entity. No aggregateRating. Offer.price remains 0 for free download; no paid price amount. |
| 17 | Removed all 20 demo/callout H2 labels, including “先审核，再保存”, “Completed”, clock-offset/demo titles, quick-answer text and the 404 callout. Semantic section headings and descriptive card subheadings remain. `verify:structure` enforces one H1 per page and no headings inside demo/callout containers. Existing styling is copied to `.ui-h2` classes; computed font, line-height, color, weight, spacing and display match the original at 1440 and 390 pixels. |
| 18 | Five EN guides now answer distinct questions; see the intent map. Titles, H1s, descriptions, introductions, Article descriptions/headlines and relevant internal link labels updated. Repeated manual/clock/batch instructions replaced with links to the primary guide. URLs, self-canonicals, indexing and sitemap entries retained. |
| 19a | Small Worker handles only `/`, `/en`, `/zh` before assets. Root selects the highest-quality supported language (zh variants or en variants), respects q ordering and q=0, defaults to EN without a supported header, and preserves the query string. Root uses temporary 302, `Vary: Accept-Language`, `Cache-Control: private, no-store` to avoid permanently caching the visitor’s inferred language. Both homes have a visible one-click alternate-language button. |
| 19b | `/en` and `/zh` return explicit 301 to their trailing-slash forms, independent of language preference. Other URLs keep Cloudflare static-asset routing and existing legacy 301 rules. |
| 20 | All 19 ZH descriptions are ≤80 characters; all 22 EN descriptions are ≤160. The 404 description also passes the EN limit. A new SEO assertion prevents regressions. |
| 21 | Localized 1200×630 product cards made from approved EN/ZH Mac store artwork, showing camera photos and the suggested position on the map. EN 83,261 bytes; ZH 72,133 bytes. JPEG replaces the unused 662,336-byte brand/globe PNG. `og:image`, `twitter:image`, MIME type and alt descriptions updated on every page. |
| 22 | App icon: 84,165 → 10,159 bytes (128×128 palette PNG, 128 colors), suitable for the 27px brand mark and 92px callout display. No unused larger icon retained. All 41 sitemap URLs now have `lastmod` 2026-11-04; all pages changed through shared metadata/header updates on that date. |
| 23 | Gaia GPS two unique URLs and COROS one unique URL return Cloudflare verification HTML with 403: retained. WorkOutDoors HTTPS fails TLS repeatedly through the requested proxy; the same official UserGuide over HTTP returns 200 with actual guide and GPX content. All three occurrences now use the working official HTTP address. See exact results below. |

Title/description character targets are editorial constraints, not a guarantee of search snippets or rankings. Google can rewrite snippets. Search indexing and rank changes cannot be verified before deployment/crawling.

Cloudflare configuration follows its [Static Assets binding documentation](https://developers.cloudflare.com/workers/static-assets/binding/): selective `run_worker_first` patterns and an `ASSETS` binding let the Worker handle entry redirects while all other content remains static. Only these three entry routes incur Worker execution; actual account plan/traffic cost was not estimated. Headers for the root redirect are set directly in the Worker, consistent with the [headers documentation](https://developers.cloudflare.com/workers/static-assets/headers/).

## Intent map

“Primary” means the page that owns the detailed instructions for a topic. It does not consolidate rel=canonical or remove sibling URLs.

| Existing URL under `/en/` | Distinct question / primary intent | Detailed material retained | Replaced with links |
|---|---|---|---|
| `add-location-to-camera-photos-apple-photos/` | Which method fits my imported camera photos? | Decision by available clues; known-place iPhone steps; four reference choices | Mac copy/assign steps → Mac guide; clock-offset details → GPX guide; reference matching steps → reference-photo guide |
| `add-location-to-photos-mac/` | How do I manually assign/copy a location and find untagged photos on Mac? | Info window, Copy/Assign Location, Smart Album, verification | Timed-track matching → GPX Mac; detailed photo matching → reference-photo guide |
| `geotag-photos-gpx-mac/` | Does my timed GPX track match my camera clock on Mac? | GPX recording/coverage, UTC/time-zone checks, clock offsets, reviewing the batch | General Mac library/Smart Album/manual instructions → Mac guide |
| `camera-photos-no-location/` | Was GPS absent in the original or lost in transfer? | Original/import comparison, model-specific diagnostic checks and next-trip test | Location recovery process → method guide; manual Mac edits → Mac guide; correct GPS but missing map item → map guide |
| `camera-photos-not-on-apple-photos-map/` | Info is correct: why does the photo still seem absent from the map? | Map grouping/zoom, library selection, duplicates, same-photo/device comparisons and sync | Missing GPS → source diagnosis/method guide; saved wrong pin → platform tools; unsaved suggestion → clock checks; batch process → method guide |

Adjacent existing pages keep their specific intent: `/add-location-to-photos-iphone/` is iPhone manual adjustment, `/geotag-dslr-photos-with-iphone-photos/` is matching without a GPX track, and `/gpx-photo-geotagging-iphone/` is GPX matching on iPhone/iPad. No synthetic ZH translation URLs added. Existing reciprocal language alternates retained.

English guide lengths after trimming: method selection 545 words; Mac 651; GPX Mac 785; missing original GPS 641; map display 545. The previous blanket 600-word floor was lowered to 400 for focused EN guides so it does not force repeated filler. Link, schema, heading, language-alternate and upper-length checks remain. Pricing checks apply wherever pricing is mentioned; source-diagnosis copy links to the primary workflow instead of repeating the purchase paragraph.

## Verification

- `npm run build`, `npm run build:production`, `npm run check`: passed. These are local build/check commands, not deployment commands.
- `npm run verify:seo`: passed, all 42 HTML files, 41 unique campaigns, 18 FAQ answers, 2 application entities, 41 sitemap alternate sets; all JSON-LD blocks parse. Added source/feature/screenshot, description-length, icon/card size and lastmod assertions.
- `npm run verify:guides`: passed, 9 guides; internal targets and fragments, real language counterparts, Article parity, current product boundaries.
- `npm run verify:copy`: passed, 42 HTML files; existing forbidden price/name/limited-time checks unchanged.
- `npm run verify:structure`: passed, 42 one-H1 outlines with no demo/callout headings.
- `npm run verify:artwork`: passed, 205 image references, 39 unique referenced images, 39 reproducible provenance outputs, 1,295 internal links; zero missing or unused images. Updated source SHA manifests and shared deterministic renderer for the new cards/icon.
- `npm run verify:redirects` against `npx wrangler dev --ip 127.0.0.1 --port 4196 --local`: passed. Nine HTTP cases below plus q weighting, q=0, invalid q, tie order, unsupported-language fallback, query retention and static delegation.
- Text-asset scan under `dist` for currency-prefixed numbers, amount+currency, prior competitor names and limited-time-free wording: zero matches. Free download, first 100 photos/videos located free, optional one-time purchase, no subscription and App Store regional-price wording remain. No paid monetary amounts introduced. Other route-recording vendors are source providers, not competing photo-geotagging products.
- Playwright headless Chrome: homes and Mac guide rendered at 1440×1000, viewport and full-page captures; two 1200×630 OG captures. Zero JS/HTTP errors, horizontal overflow or broken images. All converted labels compared against a local `git archive 68ca80e dist` baseline at 1440px and 390px: zero computed-style differences across font size, font weight, line height, color, margins, letter spacing and display.
- Mobile 390px browser clicks: EN → ZH and ZH → EN language buttons visible, correct destinations and zero horizontal overflow.
- `git diff --check`: passed. Pre-existing `.openai/hosting.json` deletion and untracked `appstore_materials` symlink excluded from commit.

Machine-readable evidence: [task6-seo-data.json](task6-seo-data.json). Browser evidence outside repository: `/Users/doupi/WorkYard/tmp_shots/shots6/browser-results.json`.

## Every page: exact title and description lengths

Counts use decoded Unicode characters, including spaces and punctuation; HTML entities such as `&amp;` count as their rendered character. The utility 404 is listed but not indexed/in the sitemap.

| URL | Title | Title chars | Description | Description chars |
|---|---|---:|---|---:|
| `/404.html` | Page Not Found \| LensPin | 24 | The LensPin page you requested could not be found. | 50 |
| `/en/add-location-to-camera-photos-apple-photos/` | How to Add GPS to Camera Photos in Apple Photos | 47 | Choose a known place, geotagged reference photos, a timed GPX track or an Apple Health workout route to locate imported camera photos. | 134 |
| `/en/add-location-to-photos-iphone/` | How to Add Location to Photos on iPhone \| LensPin | 49 | Add or change a photo location in Apple Photos, set one place for a batch, or match camera photos to different points along a trip. | 131 |
| `/en/add-location-to-photos-mac/` | Add Locations in Photos on Mac: Info & Smart Albums | 51 | Use the Mac Photos Info window to assign or copy a place. Find untagged photos with a Smart Album, then choose a separate workflow for timed trips. | 147 |
| `/en/camera-photos-no-location/` | Why Do Camera Photos Have No GPS? Check the Original | 52 | Compare the camera original with the Apple Photos copy to learn whether GPS was never recorded or lost during transfer. Check your model before the next trip. | 158 |
| `/en/camera-photos-not-on-apple-photos-map/` | Photo Has a Location but Is Missing from the Photos Map? | 56 | Photo Info shows the right location but the Apple Photos map looks incomplete? Check map grouping, library selection, duplicate copies and device sync. | 151 |
| `/en/export-gpx-from-garmin-coros-suunto/` | Export GPX from Garmin, COROS, Suunto & Apple Watch \| LensPin | 61 | Export timed GPX activities from Garmin, COROS or Suunto. For Apple Watch workouts, use Apple Health routes directly in LensPin without exporting. | 146 |
| `/en/geotag-dslr-photos-with-iphone-photos/` | Use iPhone Photos to Geotag DSLR Photos \| LensPin | 49 | No GPX track? Use geotagged iPhone photos taken around the same time as location clues for imported DSLR and mirrorless photos. | 127 |
| `/en/geotag-photos-gpx-mac/` | Geotag Photos with GPX on Mac: Track and Clock Checks | 53 | Match camera photos to a timed GPX track on Mac. Verify route coverage, UTC and camera clock offsets, then review each suggested location before saving. | 152 |
| `/en/gpx-photo-geotagging-iphone/` | Geotag Photos with a GPX Track on iPhone or iPad \| LensPin | 58 | Import a timestamped GPX track, correct the camera clock, review every suggested point, and geotag camera photos already in Apple Photos. | 137 |
| `/en/guides/` | Photo Location Guides for iPhone and Mac \| LensPin | 50 | Practical guides to adding photo locations, checking missing camera GPS, matching GPX tracks and fixing Apple Photos map problems. | 130 |
| `/en/how-it-works/` | How to add location to DSLR photos in Apple Photos \| LensPin | 60 | Add location to DSLR photos using iPhone or GPS camera photos, GPX, or Apple Watch workout routes. Check times, review suggestions and save to Apple Photos. | 156 |
| `/en/how-to-get-gpx-file/` | How to Get a GPX File for Photo Geotagging \| LensPin | 52 | Find a timed GPX track from a phone app or GPS watch. Apple Watch workouts can supply routes directly through Apple Health, with no export. | 139 |
| `/en/import-camera-photos-to-iphone/` | How to Transfer Digital Camera Photos to iPhone \| LensPin | 57 | Import digital camera or SD card photos to iPhone with Apple Photos, check whether GPS came with them, and add missing locations afterward. | 139 |
| `/en/` | LensPin: Add GPS to DSLR & Mirrorless Photos on iPhone & Mac | 60 | Add GPS to Sony, Fujifilm, Canon and other camera photos in Apple Photos using iPhone photos, GPX or Apple Watch workouts. First 100 photos/videos free. | 152 |
| `/en/privacy/` | Privacy \| LensPin | 17 | How LensPin handles photos, GPX tracks, optional workout routes, Apple Photos access, time-zone lookup, optional app usage statistics, and website data. | 152 |
| `/en/record-gpx-on-iphone-apple-watch/` | Record a GPX Track on iPhone or Apple Watch \| LensPin | 53 | Record a timed GPX track with a phone or watch app. Already have an Apple Watch workout? LensPin can read its route from Apple Health without export. | 149 |
| `/en/support/gpx-requirements/` | GPX File Requirements & Troubleshooting \| LensPin Support | 57 | Prepare a GPX 1.1 track for LensPin: timestamped trkpt entries, valid coordinates, segment boundaries, point gaps, and common import errors. | 140 |
| `/en/support/icloud-photos/` | LensPin with iCloud Photos \| Downloads & Background Work | 56 | Understand how LensPin handles iCloud-only originals, downloads, progress, storage, and background limits on iOS 17 through iOS 26 and later. | 141 |
| `/en/support/` | LensPin Support \| Photos, GPX, iCloud and Saving Locations | 58 | Find LensPin help for GPX files, iCloud Photos, saving locations to Apple Photos, supported formats, camera clock offset, and review results. | 141 |
| `/en/support/location-writeback/` | Apple Photos Location vs EXIF GPS \| LensPin Support | 51 | See how LensPin updates Apple Photos library locations without modifying the original file or its EXIF GPS, and how to verify each result. | 138 |
| `/en/supported-formats/` | Photos, Videos, JPG Export & Limits \| LensPin | 45 | Check LensPin support for JPEG, HEIC, DNG and RAW photos, timestamped GPX 1.1 tracks, system requirements, iCloud assets, video, and Photos saving locations. | 157 |
| `/en/user-feedback/` | LensPin User Feedback and Practical Limits | 42 | Read public LensPin user reports about camera-photo geotagging, matching controls, iCloud download speed, and JPG export, with links and clear limitations. | 155 |
| `/zh/add-location-to-photos-iphone/` | 照片添加位置信息：iPhone 手动调整与相机照片批量补定位 \| LensPin | 40 | 先用 iPhone 照片自带的“调整位置”添加已知地点，再用同期定位照片或 GPX 为相机照片批量补位置，检查时区、相机时钟和保存结果。 | 68 |
| `/zh/camera-photos-not-on-apple-photos-map/` | 相机照片不在 Apple Photos 地图上？先检查位置与视图｜LensPin | 40 | 相机照片已导入却不在地图上？先看信息里的地点，分清没有 GPS、图钉错误和地图视图问题，再检查副本、同步与保存结果。 | 58 |
| `/zh/export-gpx-from-garmin-coros-suunto/` | 如何从 Garmin、COROS、Suunto 导出 GPX \| LensPin | 40 | 从 GPS 手表的已记录活动导出带时间的 GPX，并转到 iPhone。避免导出只有形状、没有时间的规划路线。 | 55 |
| `/zh/geotag-dslr-photos-with-iphone-photos/` | 没录 GPX，如何用 iPhone 照片给相机照片补位置 \| LensPin | 38 | 用同次旅行带位置的 iPhone 照片，按拍摄时间为 Apple Photos 中的相机照片批量生成位置建议，无需预先录制 GPX。 | 66 |
| `/zh/gpx-photo-geotagging-iphone/` | 如何在 iPhone 上用 GPX 给相机照片批量补位置 \| LensPin | 38 | 导入带时间戳的 GPX 轨迹，校准相机时钟，在 iPhone 或 iPad 上审核并保存 Apple Photos 中相机照片的位置。 | 67 |
| `/zh/guides/` | 照片添加位置与地图排查教程 \| LensPin | 23 | 手动添加位置信息、相机照片导入、批量补定位和地图问题排查。 | 29 |
| `/zh/how-it-works/` | 如何给 Apple Photos 中的单反、微单照片补定位 \| LensPin | 39 | 参考 iPhone 或 GPS 相机照片、GPX、Apple Watch 训练路线，为单反微单照片补定位。检查时间、审核后保存到照片图库。 | 69 |
| `/zh/how-to-get-gpx-file/` | 如何获取可用于照片定位的 GPX 文件 \| LensPin | 29 | 查找手机或 GPS 手表记录的带时间 GPX。Apple Watch 体能训练路线可由 LensPin 从 Apple 健康直接读取，无需导出。 | 72 |
| `/zh/import-camera-photos-to-iphone/` | 相机照片导入 iPhone 没有位置：原因、导入与补定位 \| LensPin | 38 | 读卡器、线缆或厂商 App 导入成功却没有定位？先检查原文件的 GPS，再用已知地点、同期 iPhone 照片或 GPX 为相机照片补位置。 | 70 |
| `/zh/` | LensPin：单反、微单照片补 GPS 定位，支持 iPhone 和 Mac | 39 | 为照片图库中的单反、微单照片补定位。参考 iPhone 或 GPS 相机照片、GPX、Apple Watch 训练路线，前100张照片或视频免费。 | 73 |
| `/zh/photo-location-wrong-or-missing/` | 照片定位不准或不见了：权限、时区和相机时钟怎么排查 \| LensPin | 35 | 先分清照片没有位置、位置错误还是地图没显示，再检查定位权限、传输副本、时区与相机时钟，选择合适的修正方法。 | 53 |
| `/zh/privacy/` | LensPin 隐私政策 \| LensPin | 22 | 了解 LensPin 如何处理照片、GPX、可选训练路线、iCloud 下载、Apple 时区查询、可关闭的使用统计及网站数据。 | 64 |
| `/zh/record-gpx-on-iphone-apple-watch/` | 如何用 iPhone 或 Apple Watch 录制 GPX 轨迹 \| LensPin | 44 | 了解 Strava、OsmAnd、Gaia GPS、Guru Maps 和 WorkOutDoors 的轨迹录制与 GPX 导出方法。 | 67 |
| `/zh/support/gpx-requirements/` | LensPin 的 GPX 文件要求与导入排查 \| LensPin | 33 | GPX 1.1 需要带有效坐标和时间的轨迹点。了解无时间、分段、点间隔与格式错误的排查方法。 | 46 |
| `/zh/support/icloud-photos/` | LensPin 扫描 iCloud 照片为什么需要下载 \| LensPin | 37 | 了解 iCloud 原件下载、扫描等待时间、本地存储与 iOS 后台规则。先用一次旅行检查，再扩大照片批量。 | 54 |
| `/zh/support/` | LensPin 使用帮助与常见问题 \| LensPin | 27 | 查找 LensPin 的 GPX 要求、iCloud 下载、图库保存、JPG 导出、支持格式与联系方式。 | 52 |
| `/zh/support/location-writeback/` | 照片图库位置与 JPG GPS 导出有什么区别 \| LensPin | 33 | LensPin 保存更新 Apple Photos 图库位置，原件不变。需要带 GPS 的照片文件时，另行导出 JPG 并开启包含位置。 | 68 |
| `/zh/supported-formats/` | LensPin 支持的格式、视频和导出限制 \| LensPin | 31 | 了解 JPEG、HEIC、RAW、视频与 GPX 的支持条件，以及 Apple Photos 图库位置和带 GPS 的 JPG 副本导出边界。 | 71 |
| `/zh/user-feedback/` | LensPin 真实用户反馈与使用限制 \| LensPin | 29 | 阅读有原始链接的 Reddit 用户反馈：约 2,000 张照片的使用报告、匹配控制、iCloud 下载成本和 JPG 导出限制。 | 65 |

## H1/H2 outlines: homes and five guides

### `/en/add-location-to-camera-photos-apple-photos/`

H1: Choose How to Add GPS to Camera Photos in Apple Photos

- H2: Start with one photo, not the whole trip
- H2: Add a known place with the built-in tools
- H2: Copy a location when the photos share one spot
- H2: Check time zones and the camera clock
- H2: Batch-fill a trip using same-trip iPhone photos
- H2: Check the saved result and any exported copy
- H2: Related guides
- H2: Get LensPin

### `/en/add-location-to-photos-mac/`

H1: Add Locations in Photos on Mac with Info and Smart Albums

- H2: Add a location with the Photos Info window
- H2: Find missing GPS with a Smart Album
- H2: Choose a method for each group
- H2: Check capture times before matching a trip
- H2: Use LensPin for Mac as the batch option
- H2: Decide whether you also need a GPS-bearing file
- H2: Related guides
- H2: Get LensPin

### `/en/camera-photos-no-location/`

H1: Why Do Camera Photos Have No GPS Location?

- H2: Check the original and the imported photo
- H2: Why a phone GPS link may not have helped
- H2: Sony photos with no location
- H2: Fujifilm photos with no location
- H2: Canon photos with no location
- H2: DJI Osmo photos with no location
- H2: Ricoh photos with no location
- H2: Add locations afterwards, starting with known places
- H2: Related guides
- H2: Get LensPin

### `/en/camera-photos-not-on-apple-photos-map/`

H1: Why Is a Located Photo Missing from the Apple Photos Map?

- H2: First check whether the photo has a location
- H2: If the photo has no location
- H2: If the pin is in the wrong place
- H2: If Info is correct but the map still looks incomplete
- H2: Batch-fill missing locations after diagnosis
- H2: Verify the library and export as separate results
- H2: Related guides
- H2: Get LensPin

### `/en/geotag-photos-gpx-mac/`

H1: How to Geotag Photos with a Timed GPX Track on Mac

- H2: Check that you have the right kind of GPX
- H2: Understand what matching by time can establish
- H2: Resolve the camera clock offset first
- H2: Prepare the photos in Apple Photos on Mac
- H2: Review a GPX batch with LensPin for Mac
- H2: Check exports separately from the library
- H2: Related guides
- H2: Get LensPin

### `/en/`

H1: LensPin: Add GPS to DSLR & mirrorless photos on iPhone, iPad & Mac.

- H2: See which photos are a sure match — on Mac too.
- H2: Geotag DSLR photos with the clues you already have.
- H2: Revisit the trip, then share a copy with GPS.
- H2: From a LensPin user
- H2: Free to start. No subscription.
- H2: LensPin FAQ
- H2: Photo location guides

### `/zh/`

H1: LensPin：单反、微单 照片补定位，支持 iPhone、iPad 和 Mac。

- H2: 在原生 Mac App 上，看清哪些照片匹配更可靠。
- H2: 用你已有的线索，找回拍摄地点。
- H2: 重温旅程，也能导出带 GPS 的照片副本。
- H2: 用户原话
- H2: 免费开始，无订阅。
- H2: 常见问题
- H2: 照片添加地理位置教程

## Local redirect readback

| Request | Accept-Language | Status | Location | Vary | Followed status |
|---|---|---:|---|---|---:|
| `/` | `(absent)` | 302 | `/en/` | Accept-Language | 200 |
| `/en` | `(absent)` | 301 | `/en/` | — | 200 |
| `/zh` | `(absent)` | 301 | `/zh/` | — | 200 |
| `/` | `zh-CN,zh;q=0.9,en;q=0.8` | 302 | `/zh/` | Accept-Language | 200 |
| `/en` | `zh-CN,zh;q=0.9,en;q=0.8` | 301 | `/en/` | — | 200 |
| `/zh` | `zh-CN,zh;q=0.9,en;q=0.8` | 301 | `/zh/` | — | 200 |
| `/` | `en-US,en;q=0.9,zh;q=0.8` | 302 | `/en/` | Accept-Language | 200 |
| `/en` | `en-US,en;q=0.9,zh;q=0.8` | 301 | `/en/` | — | 200 |
| `/zh` | `en-US,en;q=0.9,zh;q=0.8` | 301 | `/zh/` | — | 200 |

Root responses additionally have `Cache-Control: private, no-store`. `/en` and `/zh` preserve their explicit locale even when the header prefers the other language. Query string test `/?ref=language-test` with `zh` → `/zh/?ref=language-test` passed.

## External-link readback

All checks use curl GET, `-L --max-time 20`, a Chrome browser UA, and `export https_proxy=http://127.0.0.1:7890` (the environment also supplies HTTP_PROXY for the HTTP fallback). Normal browser UA used: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36`. Checks were repeated; failures are not represented as confirmed 404s.

| Official URL | Result | Action |
|---|---|---|
| https://help.gaiagps.com/hc/en-us/articles/9067661557399-How-to-Use-Gaia-GPS | 403 | Keep: Cloudflare “Just a moment…” HTML challenge, not evidence of a missing article. |
| https://help.gaiagps.com/hc/en-us/articles/115003639728-Export-Data-as-GPX-or-KML-from-the-iOS-app | 403 | Keep: Cloudflare “Just a moment…” HTML challenge, not evidence of a missing article. |
| https://support.coros.com/hc/en-us/articles/15284799576980-Activities-Page-Activity-Summary | 403 | Keep: Cloudflare “Just a moment…” HTML challenge, not evidence of a missing article. |
| https://www.workoutdoors.net/UserGuide.html | 000 / TLS handshake error | Replace all 3 occurrences with the same official UserGuide over working HTTP. HTTPS failed on initial request, 2 retries, apex-host variant, TLS 1.2 attempt and final recheck. |
| http://www.workoutdoors.net/UserGuide.html | 200 | Use this working official guide URL; body contains WorkOutDoors and GPX export discussion. |

The proxy/curl evidence establishes local reachability, not universal browser reachability. Gaia/COROS article contents were not newly certified past the challenge. No 404 was observed. WorkOutDoors is a public read-only help link; the official HTTP guide was read and contains relevant GPX discussion. LensPin’s Apple Watch workflow itself still uses Apple Health directly with no export.

## Screenshots and generated assets

All page captures have 1440px viewport width and 1000px viewport height. Full captures include the entire document. OG captures use 1200×630. Visually inspected the homes, full guide and both localized cards.

- `/Users/doupi/WorkYard/tmp_shots/shots6/en-1440-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots6/en-1440-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots6/en-add-location-to-photos-mac-1440-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots6/en-add-location-to-photos-mac-1440-viewport.png`
- `/Users/doupi/WorkYard/tmp_shots/shots6/og-en-1200x630.png`
- `/Users/doupi/WorkYard/tmp_shots/shots6/og-zh-1200x630.png`
- `/Users/doupi/WorkYard/tmp_shots/shots6/zh-1440-full.png`
- `/Users/doupi/WorkYard/tmp_shots/shots6/zh-1440-viewport.png`

Product assets committed to the repository:

- `dist/assets/lenspin-social-en.jpg` — 83,261 bytes, 1200×630.
- `dist/assets/lenspin-social-zh.jpg` — 72,133 bytes, 1200×630.

## Remaining work / boundaries

No requested local implementation or verification remains. No push or deployment was performed. Production redirects, production image delivery, search indexing, rich-result appearance and ranking changes remain unverified until an explicitly authorized deployment and crawl. External Gaia/COROS content is behind bot verification; WorkOutDoors HTTPS failed in this proxy environment, so the verified official HTTP fallback is used. Screenshots remain outside the repository as requested.
