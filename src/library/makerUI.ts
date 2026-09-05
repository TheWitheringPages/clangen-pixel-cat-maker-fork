/**
 * Cat Maker shell: tabs, exclusive preview chrome, mobile guided/full modes.
 */

const TAB_ORDER = ["body", "face", "markings", "additional", "studio"] as const;
export type MakerTabId = (typeof TAB_ORDER)[number];

const TAB_LABELS: Record<MakerTabId, string> = {
  body: "Body",
  face: "Face",
  markings: "Markings",
  additional: "Additional",
  studio: "Studio",
};

const MOBILE_UI_KEY = "pcm-mobile-ui";
export const MAKER_DRAFT_KEY = "pcm-mobile-draft";
const MOBILE_MQ = "(max-width: 760px)";

function isMobile(): boolean {
  return window.matchMedia(MOBILE_MQ).matches;
}

export function initMakerShell() {
  const tabs = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".maker-tab"),
  );
  const panels = Array.from(
    document.querySelectorAll<HTMLElement>(".tab-panel"),
  );
  const chromeTabs = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".chrome-tab"),
  );
  const chromePanels = Array.from(
    document.querySelectorAll<HTMLElement>(".chrome-panel"),
  );
  const guidedBack = document.querySelector<HTMLButtonElement>(".guided-back");
  const guidedNext = document.querySelector<HTMLButtonElement>(".guided-next");
  const guidedLabel = document.querySelector<HTMLElement>(".guided-step-label");
  const modeToggles = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".mobile-mode-toggle"),
  );

  let activeTab: MakerTabId = "body";
  let guidedIndex = 0;
  let mobileMode: "guided" | "full" =
    (localStorage.getItem(MOBILE_UI_KEY) as "guided" | "full") || "guided";

  function showTab(id: MakerTabId) {
    activeTab = id;
    for (const tab of tabs) {
      const on = tab.dataset.tab === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    }
    for (const panel of panels) {
      const on = panel.dataset.tab === id;
      panel.hidden = !on;
      panel.classList.toggle("is-guided-step", on);
    }
    if (guidedLabel) {
      guidedLabel.textContent = TAB_LABELS[id];
    }
  }

  function showChrome(id: string) {
    for (const tab of chromeTabs) {
      const on = tab.dataset.chrome === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    }
    for (const panel of chromePanels) {
      const on = panel.dataset.chromePanel === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    }
  }

  function showGuidedStep(index: number) {
    guidedIndex = index;
    showTab(TAB_ORDER[index]);
    if (guidedBack && guidedNext) {
      guidedBack.disabled = index <= 0;
      guidedNext.disabled = index >= TAB_ORDER.length - 1;
    }
  }

  function syncMobileChrome() {
    const mobile = isMobile();
    document.body.classList.toggle(
      "is-guided",
      mobile && mobileMode === "guided",
    );
    for (const btn of modeToggles) {
      btn.classList.toggle("is-active", btn.dataset.mode === mobileMode);
    }
    if (mobile && mobileMode === "guided") {
      guidedIndex = Math.max(0, TAB_ORDER.indexOf(activeTab));
      showGuidedStep(guidedIndex);
    } else {
      showTab(activeTab);
    }
  }

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab as MakerTabId;
      if (!TAB_ORDER.includes(id)) {
        return;
      }
      if (isMobile() && mobileMode === "guided") {
        guidedIndex = TAB_ORDER.indexOf(id);
      }
      showTab(id);
      syncMobileChrome();
    });
  }

  for (const tab of chromeTabs) {
    tab.addEventListener("click", () => {
      const id = tab.dataset.chrome;
      if (id) {
        showChrome(id);
      }
    });
  }

  for (const btn of modeToggles) {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode as "guided" | "full";
      if (mode !== "guided" && mode !== "full") {
        return;
      }
      mobileMode = mode;
      localStorage.setItem(MOBILE_UI_KEY, mode);
      syncMobileChrome();
    });
  }

  guidedBack?.addEventListener("click", () => {
    if (guidedIndex > 0) {
      showGuidedStep(guidedIndex - 1);
    }
  });

  guidedNext?.addEventListener("click", () => {
    if (guidedIndex < TAB_ORDER.length - 1) {
      showGuidedStep(guidedIndex + 1);
    }
  });

  window.matchMedia(MOBILE_MQ).addEventListener("change", syncMobileChrome);

  showChrome("view");
  showTab("body");
  syncMobileChrome();
}

export function writeMakerDraft(params: string) {
  localStorage.setItem(MAKER_DRAFT_KEY, params);
}

export function readMakerDraft(): string | null {
  try {
    const draft = localStorage.getItem(MAKER_DRAFT_KEY);
    return draft && draft.startsWith("?") ? draft : null;
  } catch {
    return null;
  }
}
