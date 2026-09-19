(() => {
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
      if (summary) summary.setAttribute('aria-label', menu.open ? 'Close navigation' : 'Open navigation');
    };
    menu.querySelectorAll('a').forEach((link) => {
      if (!link.hasAttribute('aria-label')) link.setAttribute('aria-label', link.textContent.trim());
      link.addEventListener('click', () => menu.removeAttribute('open'));
    });
    menu.addEventListener('toggle', syncLabel);
    syncLabel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.querySelectorAll('.mobile-nav[open]').forEach((menu) => menu.removeAttribute('open'));
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
    gpx: {
      title: 'GPX track',
      copy: 'The camera photo falls between two nearby points on a continuous track.'
    },
    photos: {
      title: 'Nearby iPhone photos',
      copy: 'Two geotagged iPhone photos taken around the same time point to the same area.'
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
      evidenceStage.setAttribute('aria-label', source === 'gpx'
        ? 'A camera photo at 10:07 matched between GPX points recorded at 10:02 and 10:12'
        : 'A camera photo at 10:07 supported by geotagged iPhone photos recorded at 10:02 and 10:12');
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
      label: 'Best built-in option',
      title: 'Use Apple Photos — no extra app needed',
      copy: 'Open the photo, swipe up or tap Info, then choose Add a location… for a photo without a place—or Adjust to change one.'
    },
    batch: {
      label: 'Best built-in option',
      title: 'Use multi-select to set one known place',
      copy: 'Select the photos in Apple Photos and adjust their location together. Every selected photo receives the same place.'
    },
    trip: {
      label: 'When a timeline helps',
      title: 'Match each photo to a different point on the trip',
      copy: 'LensPin uses capture time plus a GPX track or nearby iPhone photos, then lets you review every suggestion.'
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
    camera: { title: 'Camera connection', copy: 'Connect a supported camera or adapter, open Photos, choose Import, then select the photos you want.' },
    card: { title: 'SD card reader', copy: 'Insert the card into a compatible reader, connect it to the iPhone or iPad, and import from the Photos app.' },
    photos: { title: 'Already in Apple Photos', copy: 'Open a camera photo, swipe up or tap Info, and check whether a map or location name appears.' }
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
      value.textContent = `${sign}${Math.abs(minutes)} min`;
      const total = 10 * 60 + 7 + minutes;
      const hours = Math.floor((total + 24 * 60) % (24 * 60) / 60);
      const mins = (total + 24 * 60) % 60;
      capture.textContent = `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
      marker.style.setProperty('--marker-left', `${18 + ((minutes + 30) / 60) * 64}%`);
      const abs = Math.abs(minutes);
      const level = abs <= 8 ? 'high' : abs <= 20 ? 'review' : 'none';
      status.dataset.level = level;
      statusText.textContent = level === 'high' ? 'High confidence — track points are close in time.' : level === 'review' ? 'Review — the adjusted time is farther from nearby evidence.' : 'No suggestion — the nearest evidence is beyond this example’s limit.';
    };
    slider.addEventListener('input', render);
    slider.addEventListener('change', () => track('demo_complete', { demo: 'clock_offset', offset_minutes: Number(slider.value) }));
    render();
  });

  const scenarioContent = {
    agree: { level: 'high', text: 'High confidence — both nearby iPhone photos point to the same small area.' },
    moving: { level: 'review', text: 'Review — the two photos show movement, so LensPin favors the closer time instead of drawing a straight line.' },
    conflict: { level: 'none', text: 'No safe default — the evidence is too far apart or conflicts, so nothing is selected automatically.' }
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
        ? 'Two nearby iPhone photo locations agree around the camera photo time'
        : value === 'moving'
          ? 'The iPhone photo locations show movement, so the closer time is favored'
          : 'The iPhone photo evidence is too far apart or too late for a safe default');
      result.dataset.level = scenarioContent[value].level;
      result.textContent = scenarioContent[value].text;
      track('demo_complete', { demo: 'photo_evidence', scenario: value });
    }));
  });
})();
