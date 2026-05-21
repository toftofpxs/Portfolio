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
    label: "Google News - Tesla et robotaxi",
    url: "https://news.google.com/rss/search?q=Tesla+FSD+robotaxi+autonomous+driving+when:7d&hl=fr&gl=FR&ceid=FR:fr"
  },
  {
    label: "Google News - Voiture autonome et IA",
    url: "https://news.google.com/rss/search?q=voiture+autonome+IA+ADAS+reglementation+when:7d&hl=fr&gl=FR&ceid=FR:fr"
  },
  {
    label: "Google News - FIA, F1 et IA",
    url: "https://news.google.com/rss/search?q=FIA+Formula+1+AI+stewards+regulation+when:7d&hl=fr&gl=FR&ceid=FR:fr"
  },
  {
    label: "Google News - Regles FIA et donnees",
    url: "https://news.google.com/rss/search?q=FIA+track+limits+telemetry+decision+data+when:7d&hl=fr&gl=FR&ceid=FR:fr"
  },
  {
    label: "Google News - Course automobile",
    url: "https://news.google.com/rss/search?q=Formula+1+WEC+Le+Mans+WRC+course+automobile+when:7d&hl=fr&gl=FR&ceid=FR:fr"
  },
  {
    label: "Google News - Renault aide a la conduite",
    url: "https://news.google.com/rss/search?q=Renault+ADAS+aide+a+la+conduite+assistance+when:30d&hl=fr&gl=FR&ceid=FR:fr"
  }
];

const rssAutomotiveKeywords = [
  "tesla",
  "vehicule",
  "vehicle",
  "automotive",
  "automobile",
  "robotaxi",
  "autopilot",
  "full self-driving",
  "adas",
  "voiture autonome",
  "autonomous",
  "self-driving",
  "fia",
  "formula 1",
  "f1",
  "motorsport",
  "course automobile",
  "grand prix",
  "track limit",
  "telemetry"
];

const rssAiAndRegulationKeywords = [
  "ai",
  "ia",
  "intelligence artificielle",
  "machine learning",
  "deep learning",
  "neural",
  "computer vision",
  "vision",
  "autonomous",
  "self-driving",
  "autopilot",
  "full self-driving",
  "adas",
  "steward",
  "regulation",
  "reglement",
  "reglementation",
  "steward",
  "penalite",
  "decision",
  "telemetry",
  "data"
];

const rssMotorsportRaceKeywords = [
  "formula 1",
  "f1",
  "formula e",
  "fia",
  "motorsport",
  "course automobile",
  "grand prix",
  "qualifying",
  "pole position",
  "pit stop",
  "stint",
  "wec",
  "le mans",
  "wrc",
  "rallye",
  "indycar",
  "dtm"
];

const rssFinanceNoiseKeywords = [
  "action",
  "bourse",
  "nasdaq",
  "nyse",
  "wall street",
  "cours",
  "invest",
  "trading",
  "invezz",
  "earnings",
  "market cap"
];

const rssRenaultKeywords = ["renault", "renault group", "ampere", "mobilize"];

const rssDrivingAssistKeywords = [
  "adas",
  "aide a la conduite",
  "assistance a la conduite",
  "driver assistance",
  "lane keeping",
  "adaptive cruise",
  "automated driving",
  "autonomous",
  "self-driving",
  "autopilot",
  "camera",
  "radar",
  "lidar",
  "vision"
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

function setupImageLightbox() {
  const currentPath = normalizePath(window.location.pathname);
  const isProjectDetailPage = body?.dataset.page === "realisations" && /\/realisations\/[^/]+$/.test(currentPath);

  if (!isProjectDetailPage) {
    return;
  }

  const images = [...document.querySelectorAll("main img")];

  if (!images.length) {
    return;
  }

  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <button class="image-lightbox-close" type="button" aria-label="Fermer l'image">Fermer</button>
    <img class="image-lightbox-content" alt="">
  `;

  const lightboxImage = lightbox.querySelector(".image-lightbox-content");
  const closeButton = lightbox.querySelector(".image-lightbox-close");

  if (!lightboxImage || !closeButton) {
    return;
  }

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("lightbox-open");
  };

  const openLightbox = (image) => {
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Image agrandie";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("lightbox-open");
  };

  images.forEach((image) => {
    image.classList.add("lightbox-trigger");
    image.setAttribute("role", "button");
    image.setAttribute("tabindex", "0");
    image.setAttribute("aria-label", `${image.alt || "Image"} - Cliquer pour agrandir`);

    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  document.body.append(lightbox);
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

function isAutomotiveRssItem(item) {
  const haystack = [
    stripHtml(item.title),
    stripHtml(item.description || item.content || "")
  ]
    .join(" ")
    .toLowerCase();

  const matchesAutomotive = rssAutomotiveKeywords.some((keyword) => haystack.includes(keyword));
  const matchesAiOrRegulation = rssAiAndRegulationKeywords.some((keyword) => haystack.includes(keyword));
  const matchesMotorsportRace = rssMotorsportRaceKeywords.some((keyword) => haystack.includes(keyword));
  const looksLikeFinanceNoise = rssFinanceNoiseKeywords.some((keyword) => haystack.includes(keyword));

  return matchesAutomotive && (matchesAiOrRegulation || matchesMotorsportRace) && !looksLikeFinanceNoise;
}

function isRenaultDrivingAssistItem(item) {
  const haystack = [item.title, item.description]
    .join(" ")
    .toLowerCase();

  const matchesRenault = rssRenaultKeywords.some((keyword) => haystack.includes(keyword));
  const matchesDrivingAssist = rssDrivingAssistKeywords.some((keyword) => haystack.includes(keyword));

  return matchesRenault && matchesDrivingAssist;
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

  return payload.items
    .filter((item) => item?.link && isAutomotiveRssItem(item))
    .slice(0, 4)
    .map((item) => ({
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
    const sortedArticles = settledResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value)
      .filter((item) => item.link)
      .sort((left, right) => right.publishedAt - left.publishedAt);

    const uniqueArticles = [];
    const seenLinks = new Set();

    sortedArticles.forEach((item) => {
      if (!seenLinks.has(item.link)) {
        seenLinks.add(item.link);
        uniqueArticles.push(item);
      }
    });

    const renaultArticle = uniqueArticles.find((item) => isRenaultDrivingAssistItem(item));
    const articles = renaultArticle
      ? [renaultArticle, ...uniqueArticles.filter((item) => item.link !== renaultArticle.link)].slice(0, 3)
      : uniqueArticles.slice(0, 3);

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
setupImageLightbox();
setupRssFeed();