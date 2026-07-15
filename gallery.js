(() => {
  const directory = window.UI_DIRECTORY;
  if (!directory) {
    document.body.innerHTML = "<p style='padding:2rem'>Gallery data is missing. Run <code>npm run build</code>.</p>";
    return;
  }

  const state = {
    category: "all",
    query: "",
    ascending: true,
    visible: 24,
  };

  const elements = {
    activeCategory: document.querySelector("#activeCategory"),
    categoryList: document.querySelector("#categoryList"),
    clearFilters: document.querySelector("#clearFilters"),
    demoModal: document.querySelector("#demoModal"),
    emptyState: document.querySelector("#emptyState"),
    grid: document.querySelector("#projectGrid"),
    loadMore: document.querySelector("#loadMore"),
    loadMoreWrap: document.querySelector("#loadMoreWrap"),
    modalCategory: document.querySelector("#modalCategory"),
    modalClose: document.querySelector("#modalClose"),
    modalDescription: document.querySelector("#modalDescription"),
    modalStack: document.querySelector("#modalStack"),
    modalTitle: document.querySelector("#modalTitle"),
    modalVideo: document.querySelector("#modalVideo"),
    openDesign: document.querySelector("#openDesign"),
    portfolioMenuButton: document.querySelector("#portfolioMenuButton"),
    portfolioNav: document.querySelector("#portfolioNav"),
    resultCount: document.querySelector("#resultCount"),
    search: document.querySelector("#searchInput"),
    sortButton: document.querySelector("#sortButton"),
    template: document.querySelector("#projectTemplate"),
  };

  const currentCategory = () =>
    directory.categories.find((category) => category.id === state.category);

  const filteredProjects = () => {
    const query = state.query.trim().toLowerCase();
    return directory.projects
      .filter((project) => state.category === "all" || project.category === state.category)
      .filter((project) => {
        if (!query) return true;
        return [project.title, project.description, project.stack, project.categoryLabel]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const result = a.title.localeCompare(b.title);
        return state.ascending ? result : -result;
      });
  };

  const openModal = (project) => {
    elements.modalCategory.textContent = project.categoryLabel;
    elements.modalTitle.textContent = project.title;
    elements.modalDescription.textContent = project.description;
    elements.modalStack.textContent = project.stack;
    elements.modalVideo.src = project.demo;
    elements.modalVideo.poster = project.poster;

    elements.openDesign.hidden = !project.directlyRunnable;
    if (project.directlyRunnable) {
      elements.openDesign.href = project.entrypoint;
    } else {
      elements.openDesign.removeAttribute("href");
    }

    elements.demoModal.showModal();
    elements.modalVideo.play().catch(() => {});
  };

  const closeModal = () => {
    elements.modalVideo.pause();
    elements.modalVideo.removeAttribute("src");
    elements.modalVideo.load();
    elements.demoModal.close();
  };

  const buildCard = (project, index) => {
    const fragment = elements.template.content.cloneNode(true);
    const card = fragment.querySelector(".project-card");
    const preview = fragment.querySelector(".preview-button");
    const video = fragment.querySelector(".card-video");
    const poster = fragment.querySelector(".card-poster");
    const title = fragment.querySelector(".card-title");

    card.dataset.project = project.id;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Watch ${project.title} demo`);
    poster.src = project.poster;
    poster.alt = `${project.title} interface preview`;
    poster.addEventListener("error", () => {
      poster.removeAttribute("src");
      poster.alt = "";
      preview.style.background = `linear-gradient(135deg, hsl(${(index * 47) % 360} 35% 18%), #111 70%)`;
    });

    title.textContent = project.title;
    fragment.querySelector(".card-description").textContent = project.description;
    fragment.querySelector(".category-chip").textContent = project.categoryLabel;
    fragment.querySelector(".stack").textContent = project.stack.split(",").slice(0, 2).join(",");

    const playPreview = () => {
      if (!video.src) {
        video.src = project.demo;
        video.poster = project.poster;
      }
      video.play().then(() => preview.classList.add("is-playing")).catch(() => {});
    };

    const stopPreview = () => {
      video.pause();
      preview.classList.remove("is-playing");
    };

    if (matchMedia("(hover: hover)").matches) {
      card.addEventListener("mouseenter", playPreview);
      card.addEventListener("mouseleave", stopPreview);
    }

    card.addEventListener("click", () => openModal(project));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(project);
      }
    });
    return fragment;
  };

  const render = () => {
    const projects = filteredProjects();
    const visibleProjects = projects.slice(0, state.visible);
    const category = currentCategory();

    elements.grid.replaceChildren();
    const cards = document.createDocumentFragment();
    visibleProjects.forEach((project, index) => cards.append(buildCard(project, index)));
    elements.grid.append(cards);

    elements.activeCategory.textContent = category?.label === "All" ? "All projects" : category?.label;
    elements.resultCount.textContent = `${projects.length} project${projects.length === 1 ? "" : "s"}`;
    elements.emptyState.hidden = projects.length !== 0;
    elements.loadMoreWrap.hidden = visibleProjects.length >= projects.length;

    document.querySelectorAll(".category-button").forEach((button) => {
      const active = button.dataset.category === state.category;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "true" : "false");
    });
  };

  const renderCategories = () => {
    const fragment = document.createDocumentFragment();
    directory.categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-button";
      button.type = "button";
      button.dataset.category = category.id;
      button.innerHTML = `<span>${category.label}</span><span>${category.count}</span>`;
      button.addEventListener("click", () => {
        state.category = category.id;
        state.visible = 24;
        render();
        if (innerWidth < 760) document.querySelector("#gallery").scrollIntoView();
      });
      fragment.append(button);
    });
    elements.categoryList.append(fragment);
  };

  renderCategories();
  render();

  const setMenuOpen = (open) => {
    elements.portfolioNav.classList.toggle("is-open", open);
    elements.portfolioMenuButton.classList.toggle("is-open", open);
    elements.portfolioMenuButton.classList.remove("is-hidden");
    elements.portfolioMenuButton.setAttribute("aria-expanded", String(open));
    elements.portfolioMenuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    elements.portfolioNav.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  elements.portfolioMenuButton.addEventListener("click", () => {
    setMenuOpen(!elements.portfolioNav.classList.contains("is-open"));
  });

  elements.portfolioNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  let lastScrollY = scrollY;
  addEventListener(
    "scroll",
    () => {
      const menuOpen = elements.portfolioNav.classList.contains("is-open");
      const scrollingDown = scrollY > lastScrollY && scrollY >= 10;
      elements.portfolioMenuButton.classList.toggle("is-hidden", !menuOpen && scrollingDown);
      lastScrollY = scrollY;
    },
    { passive: true },
  );

  elements.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    state.visible = 24;
    render();
  });

  elements.sortButton.addEventListener("click", () => {
    state.ascending = !state.ascending;
    elements.sortButton.querySelector("span").textContent = state.ascending ? "Sort: A–Z" : "Sort: Z–A";
    render();
  });

  elements.loadMore.addEventListener("click", () => {
    state.visible += 24;
    render();
  });

  elements.clearFilters.addEventListener("click", () => {
    state.category = "all";
    state.query = "";
    state.visible = 24;
    elements.search.value = "";
    render();
  });

  elements.modalClose.addEventListener("click", closeModal);
  elements.demoModal.addEventListener("click", (event) => {
    if (event.target === elements.demoModal) closeModal();
  });
  elements.demoModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.portfolioNav.classList.contains("is-open")) {
      setMenuOpen(false);
      return;
    }
    if (event.key === "/" && document.activeElement !== elements.search && !elements.demoModal.open) {
      event.preventDefault();
      elements.search.focus();
    }
  });
})();
