const body = document.body;
const header = document.querySelector(".site-header");
const burger = document.querySelector(".nav-burger");
const navLinksPanel = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = [...document.querySelectorAll("main section[id]")];
const revealElements = [...document.querySelectorAll(".reveal")];
const heroName = document.querySelector(".hero-name");
const cursor = document.querySelector(".custom-cursor");
const rssList = document.querySelector("[data-rss-list]");
const rssStatus = document.querySelector("[data-rss-status]");
const rssRefreshButton = document.querySelector("[data-rss-refresh]");

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
  }
];

const rssProxyBase = "https://api.rss2json.com/v1/api.json?rss_url=";
const rssRefreshIntervalMs = 5 * 60 * 1000;
let rssRefreshTimerId;

function setupHeroTyping() {
  if (!heroName) {
    return;
  }

  const rawValue = heroName.dataset.stagger || "NASSIM|MEZOUGHI";
  const [firstNameRaw, lastNameRaw] = rawValue.split("|");
  const firstName = (firstNameRaw || "").trim();
  const lastName = (lastNameRaw || "").trim();
  const lines = [firstName, lastName].filter(Boolean);

  if (!lines.length) {
    return;
  }

  heroName.textContent = "";
  heroName.setAttribute("aria-label", lines.join(" "));

  const lineElements = lines.map((_, index) => {
    const line = document.createElement("span");
    line.className = "typed-line";

    if (index === lines.length - 1) {
      line.classList.add("last-name");
    }

    heroName.append(line);
    return line;
  });

  const typingCursor = document.createElement("span");
  typingCursor.className = "typing-cursor";
  typingCursor.setAttribute("aria-hidden", "true");
  lineElements[0].append(typingCursor);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    lineElements.forEach((line, index) => {
      line.textContent = lines[index];
    });
    const lastLineElement = lineElements[lineElements.length - 1];
    lastLineElement?.append(typingCursor);
    return;
  }

  const baseDelay = 70;
  const linePause = 200;

  const typeLine = (lineIndex, charIndex = 0) => {
    const currentLine = lines[lineIndex];
    const currentElement = lineElements[lineIndex];

    if (!currentLine || !currentElement) {
      return;
    }

    if (charIndex < currentLine.length) {
      currentElement.insertBefore(document.createTextNode(currentLine[charIndex]), typingCursor);
      setTimeout(() => typeLine(lineIndex, charIndex + 1), baseDelay);
      return;
    }

    const hasNextLine = lineIndex < lines.length - 1;

    if (hasNextLine) {
      lineElements[lineIndex + 1].append(typingCursor);
      setTimeout(() => typeLine(lineIndex + 1, 0), linePause);
    }
  };

  typeLine(0, 0);
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

function setupScrollHeader() {
  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupReveal() {
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
      threshold: 0.2,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealElements.forEach((node) => observer.observe(node));
}

function setupActiveNav() {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("active", active);
        });
      });
    },
    {
      threshold: 0.55,
      rootMargin: "-12% 0px -30% 0px"
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function setupCursor() {
  if (!cursor || window.matchMedia("(hover: none), (pointer: coarse)").matches) {
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let posX = mouseX;
  let posY = mouseY;

  const speed = 0.22;

  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    },
    { passive: true }
  );

  const loop = () => {
    posX += (mouseX - posX) * speed;
    posY += (mouseY - posY) * speed;
    cursor.style.transform = `translate(${posX}px, ${posY}px)`;
    requestAnimationFrame(loop);
  };

  loop();
}

function setupProjects() {
  const projectRows = [...document.querySelectorAll(".project-row")];
  
  projectRows.forEach((row) => {
    row.addEventListener("click", (event) => {
      // Si on clique sur un lien dans les détails, ne pas fermer
      if (event.target.tagName === "A") {
        return;
      }

      // Toggle l'état expanded du projet cliqué
      row.classList.toggle("expanded");
      
      // Sur très petits écrans, fermer les autres projets
      if (window.innerWidth < 480) {
        projectRows.forEach((otherRow) => {
          if (otherRow !== row) {
            otherRow.classList.remove("expanded");
          }
        });
      }
    });
  });
}

function setRssStatus(message, isError = false) {
  if (!rssStatus) {
    return;
  }

  rssStatus.textContent = message;
  rssStatus.style.color = isError ? "#b42318" : "";
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
        <article class="rss-item reveal is-visible">
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
    setRssStatus(`Dernière actualisation: ${formatRssDate(new Date().toISOString())}`);
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

setupHeroTyping();
setupMenu();
setupScrollHeader();
setupReveal();
setupActiveNav();
setupCursor();
setupProjects();
setupRssFeed();
