const rssSources = [
  {
    name: "Le Blog du Modérateur",
    url: "https://www.blogdumoderateur.com/feed/",
    topic: "Web et outils numeriques"
  },
  {
    name: "Developpez.com",
    url: "https://www.developpez.com/index/rss",
    topic: "Developpement logiciel"
  },
  {
    name: "The GitHub Blog",
    url: "https://github.blog/feed/",
    topic: "Ecosysteme developpeur"
  }
];

const fallbackArticles = [
  {
    title: "React 19 : quels impacts pour les projets frontend ?",
    source: "Le Blog du Moderateur",
    topic: "Frontend",
    date: "2026-02-10",
    link: "https://www.blogdumoderateur.com/",
    description: "Veille sur les evolutions React utiles pour la maintenabilite, la performance et les bonnes pratiques d'interface."
  },
  {
    title: "Securiser une API REST Node.js : les points a verifier",
    source: "Developpez.com",
    topic: "Backend",
    date: "2026-01-24",
    link: "https://www.developpez.com/",
    description: "Rappel des bonnes pratiques autour des tokens, de la validation d'entree, des roles et des reponses d'erreur."
  },
  {
    title: "Pourquoi la veille Git et GitHub reste importante en BTS SIO",
    source: "The GitHub Blog",
    topic: "Outils",
    date: "2025-12-14",
    link: "https://github.blog/",
    description: "Suivi des usages de versionnement, des workflows collaboratifs et des habitudes attendues en environnement professionnel."
  },
  {
    title: "PostgreSQL et MySQL : quels criteres pour un projet d'application ?",
    source: "Le Blog du Moderateur",
    topic: "Base de donnees",
    date: "2025-11-02",
    link: "https://www.blogdumoderateur.com/",
    description: "Comparatif utile pour justifier un choix de SGBD dans un dossier technique ou une presentation de projet."
  }
];

const menuToggle = document.querySelector(".menu-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = [...document.querySelectorAll(".nav-panel a")];
const sections = [...document.querySelectorAll("main section[id]")];
const revealElements = [...document.querySelectorAll(".reveal")];
const sourceList = document.getElementById("rss-sources");
const feedContainer = document.getElementById("rss-feed");
const statusNode = document.getElementById("rss-status");

function toggleMenu(forceOpen) {
  if (!menuToggle || !navPanel) {
    return;
  }

  const nextState = typeof forceOpen === "boolean"
    ? forceOpen
    : menuToggle.getAttribute("aria-expanded") !== "true";

  menuToggle.setAttribute("aria-expanded", String(nextState));
  navPanel.classList.toggle("is-open", nextState);
  document.body.classList.toggle("menu-open", nextState);
}

if (menuToggle && navPanel) {
  menuToggle.addEventListener("click", () => toggleMenu());

  navLinks.forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      toggleMenu(false);
    }
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.18,
  rootMargin: "0px 0px -5% 0px"
});

revealElements.forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const activeId = entry.target.getAttribute("id");
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
    });
  });
}, {
  threshold: 0.45,
  rootMargin: "-10% 0px -35% 0px"
});

sections.forEach((section) => sectionObserver.observe(section));

function formatDate(dateString) {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date a verifier";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsedDate);
}

function sanitizeText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || fallback;
}

function renderSources() {
  if (!sourceList) {
    return;
  }

  sourceList.innerHTML = rssSources
    .map((source) => `<li><strong>${source.name}</strong> • ${source.topic}</li>`)
    .join("");
}

function renderArticles(articles, modeLabel) {
  if (!feedContainer || !statusNode) {
    return;
  }

  feedContainer.innerHTML = articles.map((article) => {
    const title = sanitizeText(article.title, "Article de veille");
    const description = sanitizeText(article.description || article.contentSnippet, "Resume indisponible.");
    const source = sanitizeText(article.source, article.author || "Source externe");
    const topic = sanitizeText(article.topic, "Veille");
    const link = article.link || "#";
    const date = formatDate(article.date || article.pubDate || article.publishedAt || new Date().toISOString());

    return `
      <article class="article-card">
        <div class="article-meta">
          <span>${source}</span>
          <span>${topic}</span>
          <span>${date}</span>
        </div>
        <h4>${title}</h4>
        <p>${description}</p>
        <a class="article-link" href="${link}" target="_blank" rel="noreferrer">Lire l'article</a>
      </article>
    `;
  }).join("");

  statusNode.textContent = modeLabel;
}

async function loadRssFeed() {
  if (!feedContainer || !statusNode) {
    return;
  }

  renderArticles(fallbackArticles, "Articles par defaut affiches");

  try {
    const responses = await Promise.all(
      rssSources.map(async (source) => {
        const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Flux indisponible pour ${source.name}`);
        }

        const payload = await response.json();
        const items = Array.isArray(payload.items) ? payload.items.slice(0, 3) : [];

        return items.map((item) => ({
          title: item.title,
          description: item.description,
          link: item.link,
          date: item.pubDate,
          source: source.name,
          topic: source.topic
        }));
      })
    );

    const mergedArticles = responses
      .flat()
      .sort((left, right) => new Date(right.date) - new Date(left.date))
      .slice(0, 6);

    if (mergedArticles.length > 0) {
      renderArticles(mergedArticles, "Flux RSS mis a jour");
    }
  } catch (error) {
    console.error(error);
    statusNode.textContent = "Flux RSS indisponible, articles de secours affiches";
  }
}

renderSources();
loadRssFeed();
