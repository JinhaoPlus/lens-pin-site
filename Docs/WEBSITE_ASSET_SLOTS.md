# LensPin 网站素材采集清单

更新日期：2026-09-19

网站原本规划了 10 个真实素材位，包括 8 张 App 截图和 2 个教学素材。2026-09-19 已从 `appstore_materials` 目录根部的 9 张手动截屏中选取 8 张原图，接入全部 App 素材位；`generated_en_6.9` 中的宣传版没有使用。页面优先加载由原图压缩出的 AVIF，并保留原尺寸 PNG 回退。现在只剩 2 个教学素材继续显示占位。正式构建会在任何 `data-asset-placeholder` 仍存在时失败，避免误把占位内容发布上线。

## 必须准备

| 优先级 | Slot ID | 页面与位置 | 需要采集的画面 | 当前状态 | 比例与最低规格 |
|---|---|---|---|---|---|
| P0 | `home-source-selection-screen` | 首页，产品三步流程第 1 张 | LensPin 的照片范围与证据来源选择 | 已就位：`lenspin-location-source-selection.*` | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `home-match-list-screen` | 首页，产品三步流程第 2 张 | 批量匹配结果列表 | 已就位：`lenspin-batch-review-suggestions.*` | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `home-completion-screen` | 首页，产品三步流程第 3 张 | 完成后的可核查结果 | 已就位：`lenspin-geotagged-photo-album.*`；当前用结果相册承接“完成后验证”，以后若补拍 Added / Skipped / Failed 完成报告可再升级 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `home-review-screen` | 首页，“See why a place was suggested” | LensPin 的地点建议原理与证据 | 已就位：`lenspin-location-matching-explained.*` | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `workflow-select-screen` | How it works 首屏右侧 | 进入工作流后的扫描状态 | 已就位：`lenspin-private-photo-library-scan.*` | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `album-verification-screen` | How it works，“After you confirm” | LensPin 相册中的成功结果详情 | 已就位：`lenspin-saved-location-details.*` | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `gpx-review-screen` | GPX 页面底部转化区 | GPX 与 iPhone 照片共同建议的位置 | 已就位：`lenspin-gpx-iphone-location-suggestion.*` | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `iphone-photo-evidence-screen` | 无 GPX 页面底部 | 仅基于附近 iPhone 照片的位置建议 | 已就位：`lenspin-iphone-photo-location-suggestion.*` | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P1 | `import-sd-reader-photo` | 相机照片导入页，四步说明旁 | 一张真实操作照片：iPhone、匹配接口的 SD 读卡器/存储卡，以及可辨认的 Photos Import 界面 | 待采集；页面仍显示明确占位 | 3:2 横图；至少 2400 × 1600 px |
| P1 | `apple-photos-adjust-location` | 添加照片地点页，Method 1 旁 | Apple Photos 的 Info 面板，能够看到 Adjust Location 操作 | 待采集；页面仍显示明确占位 | 9:19 竖屏；1290 × 2796 px 或同等分辨率 |

## 统一采集规范

- 建议用同一趟公开、可重复说明的样例旅程贯穿所有 LensPin 截图，让文件名、时间和地图互相对得上。
- 截图使用英文系统与英文 App 界面，保持网站语言一致。
- 隐藏真实姓名、Apple ID、通知、精确家庭位置、车牌和人脸；不要依赖后期模糊来遮住本可避免的信息。
- App 截图保留完整可用区域，不先套宣传文字、手机外框或阴影；当前网站直接展示手动截取的原始 App 画面。
- 导出 PNG 或高质量 WebP；不要用聊天软件二次压缩。实拍图保留一份原始 JPEG/HEIC，再输出网站用 WebP。
- 同一组截图保持一致的文字大小、浅色/深色模式和设备尺寸。当前设计以浅色模式为准。

## 上线前验收

1. 将正式文件放入 `dist/assets/`，使用描述性文件名，例如 `lenspin-gpx-review.webp`。
2. 替换对应的整个占位 `<figure>`，补全 `width`、`height` 和准确的英文 `alt`；优先提供 AVIF/WebP 与 PNG/JPEG 回退。
3. 确认移动端没有关键信息被裁切，且文字不依赖图片才能被搜索引擎理解。
4. 运行 `npm run check`，再以真实 `SITE_ORIGIN` 与 `APP_STORE_URL` 运行 `npm run build:production`。
5. 生产构建通过意味着占位素材与 App Store 占位链接都已清理。
