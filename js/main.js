/* ==========================================================================
   DailyTools Hub — main.js
   Shared behavior for every page: theme toggle, mobile nav, global search,
   recently-used tools, toasts, and homepage section rendering.
   ========================================================================== */

/* ---------- Theme ---------- */
(function initTheme() {
  const saved = localStorage.getItem("dth-theme");
  const theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("dth-theme", next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.textContent = isDark ? "☀️" : "🌙";
}

/* ---------- Mobile nav ---------- */
function toggleMobileNav() {
  const nav = document.getElementById("mobile-nav");
  if (nav) nav.classList.toggle("open");
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(message) {
  let toast = document.getElementById("global-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "global-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function copyText(text, label) {
  navigator.clipboard
    .writeText(text)
    .then(() => showToast((label || "Copied") + " to clipboard"))
    .catch(() => showToast("Couldn't copy — please copy manually"));
}

/* ---------- Recently used ---------- */
const RECENT_KEY = "dth-recent-tools";

function recordRecentTool(toolId) {
  let recent = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  recent = recent.filter((id) => id !== toolId);
  recent.unshift(toolId);
  recent = recent.slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

function getRecentTools() {
  const ids = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  return ids.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);
}

/* If this page is a tool page, record it (tool pages set window.DTH_TOOL_ID) */
document.addEventListener("DOMContentLoaded", () => {
  if (window.DTH_TOOL_ID) recordRecentTool(window.DTH_TOOL_ID);
});

/* ---------- Card / chip builders ---------- */
/* Emoji-based icons: no external icon library dependency, so they always
   render even if a CDN is slow, blocked, or offline. */
function iconSpan(emoji, extraClass) {
  return `<span class="${extraClass} emoji-icon" aria-hidden="true">${emoji}</span>`;
}

function buildToolCard(tool) {
  return `
    <a class="tool-card" href="${toolUrl(tool)}">
      ${iconSpan(tool.emoji, "tool-icon")}
      <h3>${tool.name}</h3>
      <p class="desc">${tool.desc}</p>
      <span class="tool-open">Open Tool <span aria-hidden="true">→</span></span>
    </a>`;
}

function buildQuickChip(tool) {
  return `
    <a class="quick-chip" href="${toolUrl(tool)}">
      ${iconSpan(tool.emoji, "chip-icon")}
      ${tool.name}
    </a>`;
}

function buildCategoryCard(cat) {
  const count = TOOLS.filter((t) => t.category === cat.name).length;
  return `
    <a class="category-card" href="all-tools.html?category=${encodeURIComponent(cat.name)}">
      ${iconSpan(cat.emoji, "tool-icon")}
      <div>
        <h3>${cat.name}</h3>
        <p class="desc">${cat.desc}</p>
        <span class="count">${count} tool${count === 1 ? "" : "s"}</span>
      </div>
    </a>`;
}

/* ---------- Homepage rendering ---------- */
function renderHomepage() {
  const quickEl = document.getElementById("quick-tools-grid");
  if (quickEl) {
    quickEl.innerHTML = TOOLS.filter((t) => t.quick).map(buildQuickChip).join("");
  }

  const popularEl = document.getElementById("popular-tools-grid");
  if (popularEl) {
    popularEl.innerHTML = TOOLS.filter((t) => t.popular).map(buildToolCard).join("");
  }

  const catEl = document.getElementById("categories-grid");
  if (catEl) {
    catEl.innerHTML = CATEGORIES.map(buildCategoryCard).join("");
  }

  const todayEl = document.getElementById("today-tools-grid");
  if (todayEl) {
    const today = [
      "age-calculator",
      "emi-calculator",
      "percentage-calculator",
      "date-calculator",
      "image-compressor",
    ];
    todayEl.innerHTML = today
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter(Boolean)
      .map(buildToolCard)
      .join("");
  }

  const recentSection = document.getElementById("recent-tools-section");
  const recentEl = document.getElementById("recent-tools-grid");
  if (recentEl && recentSection) {
    const recent = getRecentTools();
    if (recent.length === 0) {
      recentSection.style.display = "none";
    } else {
      recentSection.style.display = "";
      recentEl.innerHTML = recent.map(buildToolCard).join("");
    }
  }

}

/* ---------- Related tools (used on tool pages) ---------- */
function renderRelatedTools(ids) {
  const el = document.getElementById("related-tools-grid");
  if (!el) return;
  const tools = ids.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);
  el.innerHTML = tools
    .map(
      (t) => `
      <a class="related-card" href="${toolUrl(t)}">
        ${iconSpan(t.emoji, "tool-icon")}
        ${t.name}
      </a>`
    )
    .join("");
}

/* ---------- Global search ---------- */
function initSearch() {
  const input = document.getElementById("global-search");
  const resultsBox = document.getElementById("search-results");
  if (!input || !resultsBox) return;

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TOOLS.filter((t) => {
      const haystack = [t.name, t.category, ...t.keywords].join(" ").toLowerCase();
      return haystack.includes(q);
    }).slice(0, 8);
  }

  function render(query) {
    const q = query.trim();
    if (!q) {
      resultsBox.classList.remove("open");
      resultsBox.innerHTML = "";
      return;
    }
    const matches = search(q);
    if (matches.length === 0) {
      resultsBox.innerHTML = `<div class="search-empty">No tools found for "${escapeHtml(q)}". Try a different word.</div>`;
    } else {
      resultsBox.innerHTML = matches
        .map(
          (t) => `
          <a class="search-result-item" href="${toolUrl(t)}">
            ${iconSpan(t.emoji, "search-result-icon")}
            <span class="search-result-text">
              <span class="name">${t.name}</span><br/>
              <span class="cat">${t.category}</span>
            </span>
          </a>`
        )
        .join("");
    }
    resultsBox.classList.add("open");
  }

  input.addEventListener("input", () => render(input.value));
  input.addEventListener("focus", () => { if (input.value.trim()) render(input.value); });
  document.addEventListener("click", (e) => {
    if (!resultsBox.contains(e.target) && e.target !== input) {
      resultsBox.classList.remove("open");
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- FAQ accordion ---------- */
function initFaqAccordion() {
  document.querySelectorAll(".faq-item .faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      q.closest(".faq-item").classList.toggle("open");
    });
  });
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateThemeIcon();
  initSearch();
  initFaqAccordion();
  renderHomepage();

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  const hamburger = document.getElementById("hamburger-btn");
  if (hamburger) hamburger.addEventListener("click", toggleMobileNav);
});
