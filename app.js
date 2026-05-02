const body = document.body;
const header = document.querySelector(".site-header");
const burger = document.querySelector(".nav-burger");
const navLinksPanel = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = [...document.querySelectorAll("main section[id]")];
const revealElements = [...document.querySelectorAll(".reveal")];
const heroName = document.querySelector(".hero-name");
const cursor = document.querySelector(".custom-cursor");

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

setupHeroTyping();
setupMenu();
setupScrollHeader();
setupReveal();
setupActiveNav();
setupCursor();
setupProjects();
