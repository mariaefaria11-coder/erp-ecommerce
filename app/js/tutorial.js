(() => {
  const page = document.body.dataset.page || "dashboard";
  const stepsByPage = {
    dashboard: [
      { target: "#navMain", title: "Navegação principal", text: "Use este menu para acessar Dashboard, Produtos, Pedidos e Clientes." },
      { target: "#kpiSection", title: "Indicadores do negócio", text: "Aqui ficam faturamento, quantidade de pedidos, ticket médio e alertas de estoque." },
      { target: "#salesChartCard", title: "Gráficos de vendas", text: "Analise o faturamento diário e identifique mudanças no desempenho do e-commerce." },
      { target: "#onboardingCard", title: "Trilha de aprendizagem", text: "O checklist registra tarefas reais. Ao completar as etapas e o teste, o usuário recebe a confirmação de domínio básico." }
    ],
    produtos: [
      { target: "#productTools", title: "Pesquisa e filtros", text: "Encontre um produto pelo nome ou SKU e filtre pela situação do estoque." },
      { target: "#addProductButton", title: "Novo produto", text: "Cadastre um item informando nome, SKU, categoria, preço e estoque inicial." },
      { target: "#productTable", title: "Gerenciamento do catálogo", text: "Nesta tabela é possível editar, repor estoque e excluir produtos." }
    ],
    pedidos: [
      { target: "#orderFilters", title: "Localizar pedidos", text: "Pesquise pelo cliente ou número do pedido e combine a pesquisa com o filtro por status." },
      { target: "#statusLegend", title: "Cores operacionais", text: "Verde indica sucesso, amarelo pendência, vermelho cancelamento e azul processamento." },
      { target: "#orderTable", title: "Atualizar o andamento", text: "Use o seletor de status para registrar a etapa atual de cada pedido." }
    ],
    clientes: [
      { target: "#customerSummary", title: "Resumo da base", text: "Acompanhe clientes ativos, recompra, clientes VIP e novos cadastros." },
      { target: "#customerSearch", title: "Pesquisa rápida", text: "Localize clientes pelo nome ou endereço de e-mail." },
      { target: "#customerGrid", title: "Histórico do cliente", text: "Os cartões mostram segmento, quantidade de pedidos e total comprado." }
    ]
  };

  let steps = stepsByPage[page] || [];
  let index = 0;
  let active = false;
  let currentTarget = null;
  let tooltip;
  let ring;
  let masks = [];
  let welcome;
  let welcomeBackdrop;

  function createElements() {
    masks = Array.from({ length: 4 }, () => {
      const part = document.createElement("div");
      part.className = "tour-mask-part";
      document.body.appendChild(part);
      return part;
    });

    ring = document.createElement("div");
    ring.className = "tour-focus-ring";

    tooltip = document.createElement("section");
    tooltip.className = "tour-tooltip";
    tooltip.setAttribute("role", "dialog");
    tooltip.setAttribute("aria-live", "polite");
    tooltip.innerHTML = `
      <div class="tour-tooltip-body">
        <div class="tour-step-label"></div>
        <h3></h3>
        <p></p>
        <div class="tour-dots"></div>
      </div>
      <div class="tour-tooltip-footer">
        <button class="button button-ghost" data-tour-close>Encerrar</button>
        <div class="tour-tooltip-actions">
          <button class="button button-secondary" data-tour-prev>Voltar</button>
          <button class="button button-primary" data-tour-next>Próximo</button>
        </div>
      </div>`;

    document.body.append(ring, tooltip);

    tooltip.querySelector("[data-tour-close]").addEventListener("click", () => endTour(false));
    tooltip.querySelector("[data-tour-prev]").addEventListener("click", previous);
    tooltip.querySelector("[data-tour-next]").addEventListener("click", next);

    welcomeBackdrop = document.createElement("div");
    welcomeBackdrop.className = "modal-backdrop";

    welcome = document.createElement("section");
    welcome.className = "modal tour-welcome";
    welcome.setAttribute("role", "dialog");
    welcome.setAttribute("aria-modal", "true");
    welcome.innerHTML = `
      <div class="modal-body">
        <div class="tour-welcome-hero">
          <div class="tour-welcome-icon">✦</div>
          <h2>Bem-vindo ao ERP Commerce</h2>
          <p>Antes de começar, veja onde ficam os principais recursos. O tutorial destaca cada área sem esconder o conteúdo explicado.</p>
        </div>
        <div class="tour-summary">
          <div><strong>${steps.length}</strong><small>áreas desta página</small></div>
          <div><strong>✓</strong><small>progresso salvo</small></div>
          <div><strong>↻</strong><small>pode rever depois</small></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button button-secondary" data-welcome-later>Explorar sozinho</button>
        <button class="button button-primary" data-welcome-start>Começar tutorial</button>
      </div>`;

    document.body.append(welcomeBackdrop, welcome);

    welcome.querySelector("[data-welcome-start]").addEventListener("click", () => {
      closeWelcome();
      setTimeout(() => startTour(true), 180);
    });
    welcome.querySelector("[data-welcome-later]").addEventListener("click", () => {
      localStorage.setItem("erpTutorialWelcome_v2", "dismissed");
      closeWelcome();
      window.ERP?.toast("Tutorial disponível", "Você pode iniciá-lo novamente pelo botão Ajuda.", "processing");
    });

    window.addEventListener("resize", refreshPosition);
    window.addEventListener("scroll", refreshPosition, { passive: true });
    document.addEventListener("keydown", event => {
      if (!active) return;
      if (event.key === "Escape") endTour(false);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    });
  }

  function openWelcome(force = false) {
    if (!steps.length || page === "login") return;
    if (!force && page !== "dashboard") return;
    if (!force && localStorage.getItem("erpTutorialWelcome_v2")) return;

    welcomeBackdrop.classList.add("show");
    welcome.classList.add("show");
  }

  function closeWelcome() {
    welcomeBackdrop.classList.remove("show");
    welcome.classList.remove("show");
  }

  function startTour(force = false) {
    if (!steps.length) return;
    closeWelcome();
    active = true;
    index = 0;
    document.body.classList.add("tour-open");
    masks.forEach(mask => mask.classList.add("show"));
    ring.classList.add("show");
    tooltip.classList.add("show");
    requestAnimationFrame(() => tooltip.classList.add("visible"));
    showStep();
  }

  function showStep() {
    currentTarget = document.querySelector(steps[index].target);
    if (!currentTarget) {
      next();
      return;
    }

    currentTarget.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    tooltip.classList.remove("visible");

    setTimeout(() => {
      const step = steps[index];
      tooltip.querySelector(".tour-step-label").textContent = `Passo ${index + 1} de ${steps.length}`;
      tooltip.querySelector("h3").textContent = step.title;
      tooltip.querySelector("p").textContent = step.text;
      tooltip.querySelector("[data-tour-prev]").disabled = index === 0;
      tooltip.querySelector("[data-tour-next]").textContent = index === steps.length - 1 ? "Concluir" : "Próximo";
      tooltip.querySelector(".tour-dots").innerHTML = steps.map((_, i) => `<span class="tour-dot ${i === index ? "active" : ""}"></span>`).join("");
      refreshPosition();
      requestAnimationFrame(() => tooltip.classList.add("visible"));
    }, 300);
  }

  function targetRect() {
    const rect = currentTarget.getBoundingClientRect();
    const pad = 9;
    return {
      top: Math.max(7, rect.top - pad),
      left: Math.max(7, rect.left - pad),
      right: Math.min(innerWidth - 7, rect.right + pad),
      bottom: Math.min(innerHeight - 7, rect.bottom + pad),
      width: Math.min(innerWidth - 14, rect.width + pad * 2),
      height: Math.min(innerHeight - 14, rect.height + pad * 2)
    };
  }

  function updateMasks(rect) {
    const topMask = masks[0];
    const leftMask = masks[1];
    const rightMask = masks[2];
    const bottomMask = masks[3];

    Object.assign(topMask.style, { top: "0px", left: "0px", width: "100vw", height: `${rect.top}px` });
    Object.assign(leftMask.style, { top: `${rect.top}px`, left: "0px", width: `${rect.left}px`, height: `${rect.height}px` });
    Object.assign(rightMask.style, { top: `${rect.top}px`, left: `${rect.right}px`, width: `${Math.max(0, innerWidth - rect.right)}px`, height: `${rect.height}px` });
    Object.assign(bottomMask.style, { top: `${rect.bottom}px`, left: "0px", width: "100vw", height: `${Math.max(0, innerHeight - rect.bottom)}px` });

    Object.assign(ring.style, {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  }

  function placeTooltip(rect) {
    const margin = innerWidth <= 620 ? 12 : 18;
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;

    if (innerWidth <= 620) {
      const left = 12;
      const availableBelow = innerHeight - rect.bottom;
      const availableAbove = rect.top;
      let top;
      let side;

      if (availableBelow >= height + margin) {
        top = rect.bottom + margin;
        side = "bottom";
      } else if (availableAbove >= height + margin) {
        top = rect.top - height - margin;
        side = "top";
      } else if (rect.top + rect.height / 2 < innerHeight / 2) {
        top = Math.min(innerHeight - height - 12, rect.bottom + margin);
        side = "bottom";
      } else {
        top = Math.max(12, rect.top - height - margin);
        side = "top";
      }

      tooltip.style.top = `${Math.max(12, Math.min(innerHeight - height - 12, top))}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.right = "12px";
      tooltip.style.bottom = "auto";
      tooltip.style.width = "auto";
      tooltip.dataset.position = side;
      return;
    }

    tooltip.style.right = "auto";
    tooltip.style.width = "min(370px, calc(100vw - 24px))";
    const spaces = {
      bottom: innerHeight - rect.bottom,
      top: rect.top,
      right: innerWidth - rect.right,
      left: rect.left
    };

    const candidates = [
      {
        side: "bottom",
        fits: spaces.bottom >= height + margin,
        top: rect.bottom + margin,
        left: Math.min(innerWidth - width - 12, Math.max(12, rect.left + rect.width / 2 - width / 2))
      },
      {
        side: "right",
        fits: spaces.right >= width + margin,
        top: Math.min(innerHeight - height - 12, Math.max(12, rect.top + rect.height / 2 - height / 2)),
        left: rect.right + margin
      },
      {
        side: "top",
        fits: spaces.top >= height + margin,
        top: rect.top - height - margin,
        left: Math.min(innerWidth - width - 12, Math.max(12, rect.left + rect.width / 2 - width / 2))
      },
      {
        side: "left",
        fits: spaces.left >= width + margin,
        top: Math.min(innerHeight - height - 12, Math.max(12, rect.top + rect.height / 2 - height / 2)),
        left: rect.left - width - margin
      }
    ];

    let chosen = candidates.find(candidate => candidate.fits);
    if (!chosen) {
      const bestSide = Object.entries(spaces).sort((a, b) => b[1] - a[1])[0][0];
      chosen = candidates.find(candidate => candidate.side === bestSide) || candidates[0];
      chosen.top = Math.min(innerHeight - height - 12, Math.max(12, chosen.top));
      chosen.left = Math.min(innerWidth - width - 12, Math.max(12, chosen.left));
    }

    tooltip.style.top = `${chosen.top}px`;
    tooltip.style.left = `${chosen.left}px`;
    tooltip.style.bottom = "auto";
    tooltip.dataset.position = chosen.side;
  }

  function refreshPosition() {
    if (!active || !currentTarget || !document.body.contains(currentTarget)) return;
    const rect = targetRect();
    updateMasks(rect);
    placeTooltip(rect);
  }

  function next() {
    if (index >= steps.length - 1) {
      endTour(true);
      return;
    }
    index++;
    showStep();
  }

  function previous() {
    if (index <= 0) return;
    index--;
    showStep();
  }

  function endTour(completed) {
    active = false;
    document.body.classList.remove("tour-open");
    masks.forEach(mask => mask.classList.remove("show"));
    ring.classList.remove("show");
    tooltip.classList.remove("visible");
    setTimeout(() => tooltip.classList.remove("show"), 180);
    currentTarget = null;

    if (completed) {
      localStorage.setItem("erpTutorialWelcome_v2", "completed");
      window.ERP?.completeTask("tutorial");
      window.ERP?.toast("Tutorial concluído", "Você pode revê-lo a qualquer momento na Central de aprendizagem.", "success");
    } else {
      localStorage.setItem("erpTutorialWelcome_v2", "dismissed");
      window.ERP?.toast("Tutorial encerrado", "Seu progresso foi preservado.", "processing");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    createElements();

    document.querySelectorAll("[data-start-tour]").forEach(button => {
      button.addEventListener("click", () => {
        document.querySelector("#helpModal")?.classList.remove("show");
        document.querySelector("#helpBackdrop")?.classList.remove("show");
        setTimeout(() => startTour(true), 180);
      });
    });

    setTimeout(() => openWelcome(false), 650);
  });

  window.ERP_TOUR = {
    start: () => startTour(true),
    welcome: () => openWelcome(true)
  };
})();
