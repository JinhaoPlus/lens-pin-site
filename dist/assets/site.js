(() => {
  const isChinese = document.documentElement.lang.startsWith('zh');
  const translations = {
  "Close navigation": "关闭导航",
  "Open navigation": "打开导航",
  "GPX track": "GPX 轨迹",
  "Nearby iPhone photos": "附近的 iPhone 照片",
  "The camera photo falls between two nearby points on a continuous track.": "相机拍摄时间位于连续轨迹上的两个邻近记录点之间。",
  "Two geotagged iPhone photos taken around the same time point to the same area.": "前后时间接近的两张 iPhone 定位照片，指向同一个区域。",
  "A camera photo at 10:07 matched between GPX points recorded at 10:02 and 10:12": "10:07 的相机照片，匹配到 10:02 与 10:12 的 GPX 记录点之间",
  "A camera photo at 10:07 supported by geotagged iPhone photos recorded at 10:02 and 10:12": "10:07 的相机照片，以 10:02 与 10:12 的 iPhone 定位照片为参考",
  "Best built-in option": "适合的系统方法",
  "Use Apple Photos — no extra app needed": "使用 Apple Photos 即可",
  "Open the photo, swipe up or tap Info, then choose Add a location… for a photo without a place—or Adjust to change one.": "打开照片，向上轻扫或点信息按钮；没有位置时添加位置，已有位置时选择调整。",
  "Use multi-select to set one known place": "多选照片，统一设置已知地点",
  "Select the photos in Apple Photos and adjust their location together. Every selected photo receives the same place.": "在 Apple Photos 中多选照片，再统一调整位置。所选照片都会获得同一个地点。",
  "When a timeline helps": "需要时间线的场景",
  "Match each photo to a different point on the trip": "把每张照片匹配到行程中不同的位置",
  "LensPin matches capture time to iPhone or GPS camera photos, GPX, or Apple Health workout routes. Review each suggestion.": "LensPin 将拍摄时间与 iPhone 或 GPS 相机照片、GPX、健康训练路线匹配，再由你审核。",
  "Camera connection": "连接相机",
  "Connect a supported camera or adapter, open Photos, choose Import, then select the photos you want.": "连接兼容相机或转接器，打开“照片”并进入导入，选择需要的照片。",
  "SD card reader": "SD 卡读卡器",
  "Insert the card into a compatible reader, connect it to the iPhone or iPad, and import from the Photos app.": "把卡插入兼容读卡器，连接 iPhone 或 iPad，在“照片”中导入。",
  "Already in Apple Photos": "已经在 Apple Photos 中",
  "Open a camera photo, swipe up or tap Info, and check whether a map or location name appears.": "打开相机照片，向上轻扫或点信息按钮，检查是否有地图或地点名称。",
  "High Confidence — track points are close in time.": "高可信：轨迹点时间接近。",
  "Review — the adjusted time is farther from nearby clues.": "需检查：调整后的时间距离附近依据较远。",
  "No Clear Suggestion — the nearest clues is beyond this example’s limit.": "无明确建议：最近的依据超出了本示例的限制。",
  "High Confidence — both nearby iPhone photos point to the same small area.": "高可信：前后两张 iPhone 照片指向同一个小范围。",
  "Review — the two photos show movement, so LensPin favors the closer time instead of drawing a straight line.": "需检查：两张照片说明期间有移动，优先参考时间较近的一张，不在两点之间假定路线。",
  "No safe default — the clues is too far apart or conflicts, so nothing is selected automatically.": "不默认选中：依据相距过远或存在冲突。",
  "Two nearby iPhone photo locations agree around the camera photo time": "相机拍摄时刻前后的两张 iPhone 照片位置一致",
  "The iPhone photo locations show movement, so the closer time is favored": "iPhone 参考位置显示有移动，优先使用时间较近的依据",
  "The iPhone photo clues is too far apart or too late for a safe default": "iPhone 参考位置相距过远或时间太晚，不作为安全默认选项"
};
  const t = (value) => isChinese ? (translations[value] || value) : value;
  const track = (event, props = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...props });
    if (typeof window.plausible === 'function') window.plausible(event, { props });
  };

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll('.mobile-nav').forEach((menu) => {
    const summary = menu.querySelector('summary');
    const syncLabel = () => {
      if (summary) summary.setAttribute('aria-label', menu.open ? summary.dataset.closeLabel : summary.dataset.openLabel);
    };
    menu.querySelectorAll('a').forEach((link) => {
      if (!link.hasAttribute('aria-label')) link.setAttribute('aria-label', link.textContent.trim());
      link.addEventListener('click', () => menu.removeAttribute('open'));
    });
    menu.addEventListener('toggle', syncLabel);
    syncLabel();
  });

  const headerMenus = [...document.querySelectorAll('.language-picker, .mobile-nav')];
  headerMenus.forEach((menu) => {
    menu.addEventListener('toggle', () => {
      if (menu.open) headerMenus.filter((other) => other !== menu).forEach((other) => other.removeAttribute('open'));
    });
  });
  document.addEventListener('click', (event) => {
    headerMenus.filter((menu) => menu.open && !menu.contains(event.target)).forEach((menu) => menu.removeAttribute('open'));
  });
  document.addEventListener('focusin', (event) => {
    headerMenus.filter((menu) => menu.open && !menu.contains(event.target)).forEach((menu) => menu.removeAttribute('open'));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openMenu = headerMenus.find((menu) => menu.open);
    if (openMenu) {
      openMenu.removeAttribute('open');
      openMenu.querySelector('summary')?.focus();
    }
  });

  document.querySelectorAll('[data-demo-link]').forEach((link) => {
    link.addEventListener('click', () => track('demo_open', { page: location.pathname, destination: link.getAttribute('href') }));
  });

  document.querySelectorAll('[data-app-store-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const placement = link.closest('.site-header') ? 'header'
        : link.closest('.site-footer') ? 'footer'
          : link.closest('.hero') ? 'hero'
            : link.closest('.cta-band') ? 'cta_band'
              : 'content';
      track('app_store_click', { page: location.pathname, placement, destination: link.getAttribute('href') });
    });
  });

  const evidenceTabs = [...document.querySelectorAll('[data-evidence-tab]')];
  const evidenceStage = document.querySelector('[data-evidence-stage]');
  const evidenceTitle = document.querySelector('[data-evidence-title]');
  const evidenceCopy = document.querySelector('[data-evidence-copy]');
  const evidenceContent = {
    camera: {
      title: isChinese ? '其他 GPS 相机照片' : 'Photos from another GPS camera',
      copy: isChinese ? '同期另一台带 GPS 相机拍摄的定位照片，为相机照片提供位置参考。' : 'Geotagged photos from another GPS-equipped camera provide location clues from the same trip.'
    },
    workout: {
      title: isChinese ? 'Apple Watch／健身体能训练路线' : 'Apple Watch / Fitness workout route',
      copy: isChinese ? '通过 HealthKit 从 Apple 健康直接只读获取训练路线，无需导出。' : 'Read a recorded workout route directly from Apple Health through read-only HealthKit access. No export needed.'
    },
    gpx: {
      title: t("GPX track"),
      copy: t("The camera photo falls between two nearby points on a continuous track.")
    },
    photos: {
      title: t("Nearby iPhone photos"),
      copy: t("Two geotagged iPhone photos taken around the same time point to the same area.")
    }
  };
  if (evidenceTabs.length && evidenceStage) {
    const selectEvidence = (tab, focus = false) => {
      const source = tab.dataset.evidenceTab;
      evidenceTabs.forEach((item) => {
        const isSelected = item === tab;
        item.setAttribute('aria-selected', String(isSelected));
        item.tabIndex = isSelected ? 0 : -1;
      });
      evidenceStage.dataset.source = source;
      evidenceStage.setAttribute('aria-labelledby', tab.id);
      evidenceStage.setAttribute('aria-label', `${evidenceContent[source].title}: ${evidenceContent[source].copy}`);
      if (evidenceTitle) evidenceTitle.textContent = evidenceContent[source].title;
      if (evidenceCopy) evidenceCopy.textContent = evidenceContent[source].copy;
      if (focus) tab.focus();
      track('demo_start', { demo: 'evidence_source', source });
    };
    evidenceTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectEvidence(tab));
      tab.addEventListener('keydown', (event) => {
        let nextIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % evidenceTabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + evidenceTabs.length) % evidenceTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = evidenceTabs.length - 1;
        if (nextIndex === undefined) return;
        event.preventDefault();
        selectEvidence(evidenceTabs[nextIndex], true);
      });
    });
  }

  const taskContent = {
    single: {
      label: t("Best built-in option"),
      title: t("Use Apple Photos — no extra app needed"),
      copy: t("Open the photo, swipe up or tap Info, then choose Add a location… for a photo without a place—or Adjust to change one.")
    },
    batch: {
      label: t("Best built-in option"),
      title: t("Use multi-select to set one known place"),
      copy: t("Select the photos in Apple Photos and adjust their location together. Every selected photo receives the same place.")
    },
    trip: {
      label: t("When a timeline helps"),
      title: t("Match each photo to a different point on the trip"),
      copy: t("LensPin matches capture time to iPhone or GPS camera photos, GPX, or Apple Health workout routes. Review each suggestion.")
    }
  };
  document.querySelectorAll('[data-task-switcher]').forEach((widget) => {
    const options = [...widget.querySelectorAll('[data-task-option]')];
    const label = widget.querySelector('[data-task-label]');
    const title = widget.querySelector('[data-task-title]');
    const copy = widget.querySelector('[data-task-copy]');
    options.forEach((option) => option.addEventListener('click', () => {
      const value = option.dataset.taskOption;
      options.forEach((item) => item.setAttribute('aria-pressed', String(item === option)));
      label.textContent = taskContent[value].label;
      title.textContent = taskContent[value].title;
      copy.textContent = taskContent[value].copy;
      track('demo_start', { demo: 'task_router', choice: value });
    }));
  });

  const importContent = {
    camera: { title: t("Camera connection"), copy: t("Connect a supported camera or adapter, open Photos, choose Import, then select the photos you want.") },
    card: { title: t("SD card reader"), copy: t("Insert the card into a compatible reader, connect it to the iPhone or iPad, and import from the Photos app.") },
    photos: { title: t("Already in Apple Photos"), copy: t("Open a camera photo, swipe up or tap Info, and check whether a map or location name appears.") }
  };
  document.querySelectorAll('[data-import-widget]').forEach((widget) => {
    const options = [...widget.querySelectorAll('[data-import-option]')];
    const title = widget.querySelector('[data-import-title]');
    const copy = widget.querySelector('[data-import-copy]');
    options.forEach((option) => option.addEventListener('click', () => {
      const value = option.dataset.importOption;
      options.forEach((item) => item.setAttribute('aria-pressed', String(item === option)));
      title.textContent = importContent[value].title;
      copy.textContent = importContent[value].copy;
      track('demo_start', { demo: 'import_path', choice: value });
    }));
  });

  document.querySelectorAll('[data-clock-tool]').forEach((tool) => {
    const slider = tool.querySelector('[data-clock-slider]');
    const value = tool.querySelector('[data-clock-value]');
    const capture = tool.querySelector('[data-clock-capture]');
    const marker = tool.querySelector('[data-clock-marker]');
    const status = tool.querySelector('[data-clock-status]');
    const statusText = tool.querySelector('[data-clock-status-text]');
    if (!slider) return;
    const render = () => {
      const minutes = Number(slider.value);
      const sign = minutes > 0 ? '+' : minutes < 0 ? '−' : '';
      value.textContent = `${sign}${Math.abs(minutes)} ${isChinese ? "分钟" : "min"}`;
      const total = 10 * 60 + 7 + minutes;
      const hours = Math.floor((total + 24 * 60) % (24 * 60) / 60);
      const mins = (total + 24 * 60) % 60;
      capture.textContent = `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
      marker.style.setProperty('--marker-left', `${18 + ((minutes + 30) / 60) * 64}%`);
      const abs = Math.abs(minutes);
      const level = abs <= 8 ? 'high' : abs <= 20 ? 'review' : 'none';
      status.dataset.level = level;
      statusText.textContent = level === 'high' ? t("High Confidence — track points are close in time.") : level === 'review' ? t("Review — the adjusted time is farther from nearby clues.") : t("No Clear Suggestion — the nearest clues is beyond this example’s limit.");
    };
    slider.addEventListener('input', render);
    slider.addEventListener('change', () => track('demo_complete', { demo: 'clock_offset', offset_minutes: Number(slider.value) }));
    render();
  });

  const scenarioContent = {
    agree: { level: 'high', text: t("High Confidence — both nearby iPhone photos point to the same small area.") },
    moving: { level: 'review', text: t("Review — the two photos show movement, so LensPin favors the closer time instead of drawing a straight line.") },
    conflict: { level: 'none', text: t("No safe default — the clues is too far apart or conflicts, so nothing is selected automatically.") }
  };
  document.querySelectorAll('[data-photo-evidence]').forEach((widget) => {
    const buttons = [...widget.querySelectorAll('[data-scenario]')];
    const result = widget.querySelector('[data-scenario-result]');
    const map = widget.querySelector('[data-scenario-map]');
    buttons.forEach((button) => button.addEventListener('click', () => {
      const value = button.dataset.scenario;
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      widget.dataset.scenarioState = value;
      if (map) map.setAttribute('aria-label', value === 'agree'
        ? t("Two nearby iPhone photo locations agree around the camera photo time")
        : value === 'moving'
          ? t("The iPhone photo locations show movement, so the closer time is favored")
          : t("The iPhone photo clues is too far apart or too late for a safe default"));
      result.dataset.level = scenarioContent[value].level;
      result.textContent = scenarioContent[value].text;
      track('demo_complete', { demo: 'photo_evidence', scenario: value });
    }));
  });
})();
