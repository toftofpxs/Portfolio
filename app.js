const body = document.body;
const header = document.querySelector(".site-header");
const burger = document.querySelector(".nav-burger");
const navLinksPanel = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const revealElements = [...document.querySelectorAll(".reveal")];
const rssList = document.querySelector("[data-rss-list]");
const rssStatus = document.querySelector("[data-rss-status]");
const rssRefreshButton = document.querySelector("[data-rss-refresh]");
const yearTargets = [...document.querySelectorAll("[data-year]")];

const rssSources = [
  {
    label: "MIT Technology Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed"
  },
  {
    label: "NVIDIA Blog",
    url: "https://blogs.nvidia.com/feed"
  },
  {
    label: "InfoQ",
    url: "https://feed.infoq.com"
  },
  {
    label: "TypeScript Blog",
    url: "https://devblogs.microsoft.com/typescript/feed/"
  }
];

const rssProxyBase = "https://api.rss2json.com/v1/api.json?rss_url=";
const rssRefreshIntervalMs = 5 * 60 * 1000;
let rssRefreshTimerId;

function normalizePath(path) {
  const normalized = path.replace(/index\.html$/, "").replace(/\/+$/, "");
  return normalized || "/";
}

function setMenuState(open) {
  if (!burger || !navLinksPanel) {
    return;
  }

  burger.setAttribute("aria-expanded", String(open));
  body.classList.toggle("menu-open", open);
}

function setupMenu() {
  if (!burger) {
    return;
  }

  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    setMenuState(open);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) {
      setMenuState(false);
    }
  });
}

function setupHeader() {
  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupActiveNav() {
  const currentPath = normalizePath(window.location.pathname);
  const currentHash = window.location.hash;

  navLinks.forEach((link) => {
    const linkUrl = new URL(link.href, window.location.origin);
    const linkPath = normalizePath(linkUrl.pathname);
    const linkHash = linkUrl.hash;
    const isActive = linkPath === currentPath && (linkHash ? linkHash === currentHash : true);

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function setupReveal() {
  if (!revealElements.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupYear() {
  const currentYear = String(new Date().getFullYear());
  yearTargets.forEach((target) => {
    target.textContent = currentYear;
  });
}

function setRssStatus(message, isError = false) {
  if (!rssStatus) {
    return;
  }

  rssStatus.textContent = message;
  rssStatus.classList.toggle("is-error", isError);
}

function formatRssDate(value) {
  if (!value) {
    return "Date non disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date non disponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function stripHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = value || "";
  return template.content.textContent?.trim() || "";
}

function truncateText(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function renderRssItems(items) {
  if (!rssList) {
    return;
  }

  if (!items.length) {
    rssList.innerHTML = `
      <article class="rss-item">
        <p>Aucun article disponible pour le moment.</p>
      </article>
    `;
    return;
  }

  rssList.innerHTML = items
    .map(
      (item) => `
        <article class="rss-item">
          <a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a>
          <p>${item.description}</p>
          <div class="rss-item-footer">
            <span class="rss-source">${item.source}</span>
            <span class="rss-date">${item.date}</span>
          </div>
        </article>
      `
    )
    .join("");
}

async function fetchRssSource(source) {
  const response = await fetch(`${rssProxyBase}${encodeURIComponent(source.url)}`);

  if (!response.ok) {
    throw new Error(`Impossible de charger ${source.label}`);
  }

  const payload = await response.json();

  if (payload.status !== "ok" || !Array.isArray(payload.items)) {
    throw new Error(`Flux invalide pour ${source.label}`);
  }

  return payload.items.slice(0, 3).map((item) => ({
    title: stripHtml(item.title) || source.label,
    description: truncateText(stripHtml(item.description || item.content || ""), 180),
    link: item.link,
    date: formatRssDate(item.pubDate),
    source: source.label,
    publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : 0
  }));
}

async function refreshRssFeed() {
  if (!rssList) {
    return;
  }

  rssRefreshButton?.setAttribute("disabled", "true");
  setRssStatus("Mise à jour en cours...");

  try {
    const settledResults = await Promise.allSettled(rssSources.map((source) => fetchRssSource(source)));
    const articles = settledResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value)
      .filter((item) => item.link)
      .sort((left, right) => right.publishedAt - left.publishedAt)
      .slice(0, 6);

    if (!articles.length) {
      throw new Error("Aucun flux n'a pu être récupéré.");
    }

    renderRssItems(articles);
    setRssStatus(`Dernière actualisation : ${formatRssDate(new Date().toISOString())}`);
  } catch (error) {
    renderRssItems([]);
    setRssStatus("Flux temporairement indisponible.", true);
  } finally {
    rssRefreshButton?.removeAttribute("disabled");
  }
}

function setupRssFeed() {
  if (!rssList) {
    return;
  }

  rssRefreshButton?.addEventListener("click", () => {
    refreshRssFeed();
  });

  refreshRssFeed();
  rssRefreshTimerId = window.setInterval(refreshRssFeed, rssRefreshIntervalMs);

  window.addEventListener("beforeunload", () => {
    if (rssRefreshTimerId) {
      window.clearInterval(rssRefreshTimerId);
    }
  });
}

setupMenu();
setupHeader();
setupActiveNav();
setupReveal();
setupYear();
setupRssFeed();