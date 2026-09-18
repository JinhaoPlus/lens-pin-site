# LensPin 网站素材采集清单

更新日期：2026-09-18

这 10 个位置是当前网站刻意保留的真实素材位，包括 8 张 App 截图和 2 个教学素材。每个占位都带有 `data-asset-slot`，正式构建会在任何占位仍存在时失败。替换素材时，应把整个 `<figure data-asset-placeholder ...>` 换成正式的 `<figure>` 或 `<picture>`，并写准确的英文 `alt` 文本。

## 必须准备

| 优先级 | Slot ID | 页面与位置 | 需要采集的画面 | 状态要求 | 比例与最低规格 |
|---|---|---|---|---|---|
| P0 | `home-source-selection-screen` | 首页，产品三步流程第 1 张 | LensPin 的照片范围与证据来源选择 | 同时看得到直接选择照片/日期范围，以及 iPhone photos、GPX 两种来源；不要使用空白欢迎页 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `home-match-list-screen` | 首页，产品三步流程第 2 张 | 批量匹配结果列表 | 同一屏至少出现 High confidence、Review、No suggestion 中的两类，并看得到默认勾选状态 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `home-completion-screen` | 首页，产品三步流程第 3 张 | 完成报告 | 使用合理的 Added、Skipped、Failed 数量；出现进入 LensPin album 的下一步，不要全为零 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `home-review-screen` | 首页，“See why a place was suggested” | LensPin 的地点建议审查页：地图、照片、证据来源、置信状态同时可见 | 使用一条可信的 GPX 匹配；建议显示 High confidence，但不要把分数写成概率 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `workflow-select-screen` | How it works 首屏右侧 | 进入工作流后的第一个有效界面，例如选择日期/照片或开始扫描 | 画面里要能看懂“从 Apple Photos 中选择相机照片”，不要用空白欢迎页 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `album-verification-screen` | How it works，“After you confirm” | LensPin 相册中的成功结果详情 | 使用已经写回的位置；需要看到绿色位置状态、地图和坐标，且和前面同一张样例照片对应 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `gpx-review-screen` | GPX 页面底部转化区 | GPX 匹配审查页：路线、前后 track points、时间差、建议位置 | 使用连续且时间密集的 track segment；显示相机时钟已校准后的结果 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P0 | `iphone-photo-evidence-screen` | 无 GPX 页面底部 | 附近 iPhone 照片作为证据的审查页 | 同时出现前后两个 anchor、各自时间差、建议点和解释；地点应彼此接近 | 9:19 竖屏；1290 × 2796 px 或同等 @3x |
| P1 | `import-sd-reader-photo` | 相机照片导入页，四步说明旁 | 一张真实操作照片：iPhone、匹配接口的 SD 读卡器/存储卡，以及可辨认的 Photos Import 界面 | 连接关系必须真实；避免出现无关品牌包装、通知和个人图库 | 3:2 横图；至少 2400 × 1600 px |
| P1 | `apple-photos-adjust-location` | 添加照片地点页，Method 1 旁 | Apple Photos 的 Info 面板，能够看到 Adjust Location 操作 | 使用非敏感示例照片；地图上不能暴露住址或常用私人地点 | 9:19 竖屏；1290 × 2796 px 或同等分辨率 |

## 统一采集规范

- 建议用同一趟公开、可重复说明的样例旅程贯穿所有 LensPin 截图，让文件名、时间和地图互相对得上。
- 截图使用英文系统与英文 App 界面，保持网站语言一致。
- 隐藏真实姓名、Apple ID、通知、精确家庭位置、车牌和人脸；不要依赖后期模糊来遮住本可避免的信息。
- App 截图保留完整可用区域，不要先套手机外框、圆角或阴影。网站负责最终裁切与展示。
- 导出 PNG 或高质量 WebP；不要用聊天软件二次压缩。实拍图保留一份原始 JPEG/HEIC，再输出网站用 WebP。
- 同一组截图保持一致的文字大小、浅色/深色模式和设备尺寸。当前设计以浅色模式为准。

## 上线前验收

1. 将正式文件放入 `dist/assets/`，使用描述性文件名，例如 `lenspin-gpx-review.webp`。
2. 替换对应的整个占位 `<figure>`，补全 `width`、`height` 和准确的英文 `alt`。
3. 确认移动端没有关键信息被裁切，且文字不依赖图片才能被搜索引擎理解。
4. 运行 `npm run check`，再以真实 `SITE_ORIGIN` 与 `APP_STORE_URL` 运行 `npm run build:production`。
5. 生产构建通过意味着占位素材与 App Store 占位链接都已清理。
