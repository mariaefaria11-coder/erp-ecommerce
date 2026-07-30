(() => {
  const PRODUCT_KEY = "erpProducts_v2";
  const TASK_KEY = "erpTasks_v2";
  const ORDER_KEY = "erpOrders_v2";

  const defaultTasks = {
    tutorial: false,
    visitProducts: false,
    searchProduct: false,
    addProduct: false,
    editProduct: false,
    visitOrders: false,
    filterOrders: false,
    visitCustomers: false,
    quiz: false
  };

  let products = JSON.parse(localStorage.getItem(PRODUCT_KEY) || "null") || [...window.ERP_DATA.products];
  let orders = JSON.parse(localStorage.getItem(ORDER_KEY) || "null") || [...window.ERP_DATA.orders];
  let tasks = { ...defaultTasks, ...(JSON.parse(localStorage.getItem(TASK_KEY) || "{}")) };
  const page = document.body.dataset.page || "dashboard";

  function money(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
  }

  function statusClass(status = "") {
    const value = status.toLowerCase();
    if (["pago", "enviado", "ativo", "vip"].some(item => value.includes(item))) return "success";
    if (["pendente", "estoque baixo", "aguardando"].some(item => value.includes(item))) return "warning";
    if (["cancelado", "sem estoque", "estornado"].some(item => value.includes(item))) return "danger";
    if (["processando", "novo"].some(item => value.includes(item))) return "processing";
    return "neutral";
  }

  function toast(title, message = "", type = "processing") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const icons = { success: "✓", warning: "!", danger: "×", processing: "i" };
    const item = document.createElement("article");
    item.className = `toast ${type}`;
    item.innerHTML = `
      <div class="toast-icon">${icons[type] || "i"}</div>
      <div><strong>${title}</strong><span>${message}</span></div>
      <button class="toast-close" aria-label="Fechar">✕</button>`;
    container.appendChild(item);

    const remove = () => item.remove();
    item.querySelector(".toast-close").addEventListener("click", remove);
    setTimeout(remove, 3900);
  }

  function completeTask(name) {
    if (tasks[name]) return;
    tasks[name] = true;
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    updateOnboarding();
  }

  function saveProducts() {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
  }

  function saveOrders() {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  }

  function initNavigation() {
    document.querySelectorAll(".nav a").forEach(link => {
      link.classList.toggle("active", link.dataset.page === page);
    });

    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.querySelector(".mobile-sidebar-backdrop");
    const toggleSidebar = show => {
      sidebar?.classList.toggle("open", show);
      backdrop?.classList.toggle("show", show);
    };

    document.querySelector("[data-mobile-menu]")?.addEventListener("click", () => {
      toggleSidebar(!sidebar.classList.contains("open"));
    });
    backdrop?.addEventListener("click", () => toggleSidebar(false));
  }

  function initPageTracking() {
    if (page === "produtos") completeTask("visitProducts");
    if (page === "pedidos") completeTask("visitOrders");
    if (page === "clientes") completeTask("visitCustomers");

    const params = new URLSearchParams(location.search);
    if (params.get("trainingReset") === "1") {
      setTimeout(() => toast(
        "Trilha disponível novamente",
        "Você pode refazer o tutorial, as tarefas e o teste de domínio.",
        "success"
      ), 250);
      history.replaceState({}, "", location.pathname);
    }
  }

  function updateOnboarding() {
    const checklist = document.querySelector("#onboardingChecklist");
    const bar = document.querySelector("#onboardingProgress");
    const text = document.querySelector("#onboardingText");
    const badge = document.querySelector("#competencyBadge");
    if (!checklist) return;

    const labels = {
      tutorial: "Concluir o tutorial guiado",
      visitProducts: "Acessar Produtos",
      searchProduct: "Pesquisar um produto",
      addProduct: "Cadastrar um produto",
      editProduct: "Editar um produto",
      visitOrders: "Acessar Pedidos",
      filterOrders: "Filtrar pedidos",
      visitCustomers: "Acessar Clientes",
      quiz: "Concluir teste de domínio (mínimo 6/7)"
    };

    const entries = Object.entries(tasks);
    const completed = entries.filter(([, done]) => done).length;
    const percent = Math.round(completed / entries.length * 100);

    checklist.innerHTML = entries.map(([key, done]) => `
      <div class="check-item ${done ? "done" : ""}">
        <span class="check-dot">${done ? "✓" : ""}</span>
        <span>${labels[key]}</span>
      </div>`).join("");

    bar.style.width = `${percent}%`;
    text.textContent = `${completed} de ${entries.length} etapas concluídas (${percent}%)`;

    const mastered = tasks.quiz && completed >= 7;
    badge?.classList.toggle("show", mastered);

    const allCompleted = completed === entries.length;
    const onboardingCard = document.querySelector("#onboardingCard");
    const dashboardGrid = onboardingCard?.closest(".dashboard-grid");

    if (allCompleted && onboardingCard) {
      onboardingCard.classList.add("completed-hidden");
      dashboardGrid?.classList.add("onboarding-complete");
    } else {
      onboardingCard?.classList.remove("completed-hidden");
      dashboardGrid?.classList.remove("onboarding-complete");
    }
  }

  function renderProducts(list = products) {
    const body = document.querySelector("#productTableBody");
    if (!body) return;
    body.innerHTML = list.length ? list.map(product => `
      <tr>
        <td>
          <div class="product-cell">
            <div class="product-thumb">${product.icon || "📦"}</div>
            <div><strong>${product.name}</strong><br><small>${product.sku}</small></div>
          </div>
        </td>
        <td>${product.category}</td>
        <td>${money(product.price)}</td>
        <td>${product.stock}</td>
        <td><span class="badge ${statusClass(product.status)}">${product.status}</span></td>
        <td>
          <div class="actions">
            <button class="mini-button" data-product-action="edit" data-product-id="${product.id}">Editar</button>
            <button class="mini-button" data-product-action="stock" data-product-id="${product.id}">+10 estoque</button>
            <button class="mini-button" data-product-action="delete" data-product-id="${product.id}">Excluir</button>
          </div>
        </td>
      </tr>`).join("") : `<tr><td colspan="6"><div class="empty-state">Nenhum produto encontrado.</div></td></tr>`;
  }

  function initProducts() {
    const body = document.querySelector("#productTableBody");
    if (!body) return;

    const search = document.querySelector("#productSearch");
    const filter = document.querySelector("#productFilter");
    const form = document.querySelector("#productForm");
    const modal = document.querySelector("#productModal");
    const backdrop = document.querySelector("#productBackdrop");
    const title = document.querySelector("#productModalTitle");
    const idInput = document.querySelector("#productId");

    function updateStatus(product) {
      product.status = product.stock === 0 ? "Sem estoque" : product.stock <= 10 ? "Estoque baixo" : "Ativo";
    }

    function applyFilters() {
      const term = search.value.trim().toLowerCase();
      const status = filter.value;
      const filtered = products.filter(product => {
        const textMatch = !term
          || product.name.toLowerCase().includes(term)
          || product.sku.toLowerCase().includes(term);
        return textMatch && (!status || product.status === status);
      });
      renderProducts(filtered);
      if (term) completeTask("searchProduct");
    }

    function openModal(product = null) {
      form.reset();
      idInput.value = product?.id || "";
      title.textContent = product ? "Editar produto" : "Cadastrar produto";
      if (product) {
        form.elements.name.value = product.name;
        form.elements.sku.value = product.sku;
        form.elements.category.value = product.category;
        form.elements.price.value = product.price;
        form.elements.stock.value = product.stock;
      }
      backdrop.classList.add("show");
      modal.classList.add("show");
      setTimeout(() => form.elements.name.focus(), 120);
    }

    function closeModal() {
      backdrop.classList.remove("show");
      modal.classList.remove("show");
    }

    renderProducts();
    search.addEventListener("input", applyFilters);
    filter.addEventListener("change", applyFilters);
    document.querySelector("#addProductButton")?.addEventListener("click", () => openModal());
    document.querySelectorAll("[data-close-product]").forEach(element => element.addEventListener("click", closeModal));

    form.addEventListener("submit", event => {
      event.preventDefault();
      const values = new FormData(form);
      const editingId = Number(values.get("id"));
      const payload = {
        name: values.get("name").trim(),
        sku: values.get("sku").trim().toUpperCase(),
        category: values.get("category"),
        price: Number(values.get("price")),
        stock: Number(values.get("stock")),
        icon: "📦"
      };

      if (products.some(product => product.sku === payload.sku && product.id !== editingId)) {
        toast("SKU já cadastrado", "Informe um código diferente.", "warning");
        return;
      }

      if (editingId) {
        const product = products.find(item => item.id === editingId);
        Object.assign(product, payload);
        updateStatus(product);
        completeTask("editProduct");
        toast("Produto atualizado", `${product.name} foi editado com sucesso.`, "success");
      } else {
        const product = { id: Date.now(), ...payload };
        updateStatus(product);
        products.unshift(product);
        completeTask("addProduct");
        toast("Produto salvo", `${product.name} foi adicionado ao catálogo.`, "success");
      }

      saveProducts();
      renderProducts();
      closeModal();
    });

    body.addEventListener("click", event => {
      const button = event.target.closest("[data-product-action]");
      if (!button) return;
      const product = products.find(item => item.id === Number(button.dataset.productId));
      if (!product) return;

      const action = button.dataset.productAction;
      if (action === "edit") openModal(product);

      if (action === "stock") {
        product.stock += 10;
        updateStatus(product);
        saveProducts();
        renderProducts();
        toast("Estoque atualizado", `${product.name} recebeu 10 unidades.`, "success");
      }

      if (action === "delete") {
        const confirmed = confirm(`Excluir o produto "${product.name}"?`);
        if (!confirmed) return;
        products = products.filter(item => item.id !== product.id);
        saveProducts();
        renderProducts();
        toast("Produto excluído", `${product.name} foi removido do catálogo.`, "danger");
      }
    });
  }

  function renderOrders(list = orders) {
    const body = document.querySelector("#orderTableBody");
    if (!body) return;
    const statusOptions = ["Pago", "Pendente", "Cancelado", "Processando", "Enviado"];

    body.innerHTML = list.length ? list.map(order => `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>${order.customer}</td>
        <td>${order.channel}</td>
        <td>${order.date}</td>
        <td>${money(order.total)}</td>
        <td><span class="badge ${statusClass(order.status)}">${order.status}</span></td>
        <td>
          <select class="select-control" data-order-status="${order.id}" aria-label="Alterar status do pedido ${order.id}">
            ${statusOptions.map(status => `<option ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </td>
      </tr>`).join("") : `<tr><td colspan="7"><div class="empty-state">Nenhum pedido encontrado.</div></td></tr>`;
  }

  function initOrders() {
    const body = document.querySelector("#orderTableBody");
    if (!body) return;

    const search = document.querySelector("#orderSearch");
    const filter = document.querySelector("#orderStatusFilter");

    function applyFilters() {
      const term = search.value.trim().toLowerCase();
      const status = filter.value;
      const filtered = orders.filter(order => {
        const textMatch = !term
          || order.id.toLowerCase().includes(term)
          || order.customer.toLowerCase().includes(term);
        return textMatch && (!status || order.status === status);
      });
      renderOrders(filtered);
      if (status) completeTask("filterOrders");
    }

    renderOrders();
    search.addEventListener("input", applyFilters);
    filter.addEventListener("change", applyFilters);

    body.addEventListener("change", event => {
      const select = event.target.closest("[data-order-status]");
      if (!select) return;
      const order = orders.find(item => item.id === select.dataset.orderStatus);
      const previous = order.status;
      order.status = select.value;
      saveOrders();
      renderOrders();
      toast("Pedido atualizado", `${order.id}: ${previous} → ${order.status}.`, order.status === "Cancelado" ? "danger" : "success");
    });
  }

  function renderCustomers(list = window.ERP_DATA.customers) {
    const grid = document.querySelector("#customerGrid");
    if (!grid) return;
    grid.innerHTML = list.length ? list.map(customer => `
      <article class="card customer-card">
        <div class="customer-top">
          <div class="customer-avatar">${customer.initials}</div>
          <div>
            <strong>${customer.name}</strong><br>
            <small>${customer.email}</small>
          </div>
          <span class="badge ${statusClass(customer.segment)}" style="margin-left:auto">${customer.segment}</span>
        </div>
        <div class="customer-meta">
          <div><small>Pedidos</small><strong>${customer.orders}</strong></div>
          <div><small>Total comprado</small><strong>${money(customer.total)}</strong></div>
        </div>
      </article>`).join("") : `<div class="card empty-state">Nenhum cliente encontrado.</div>`;
  }

  function initCustomers() {
    if (!document.querySelector("#customerGrid")) return;
    renderCustomers();
    document.querySelector("#customerSearchInput")?.addEventListener("input", event => {
      const term = event.target.value.trim().toLowerCase();
      renderCustomers(window.ERP_DATA.customers.filter(customer =>
        !term
        || customer.name.toLowerCase().includes(term)
        || customer.email.toLowerCase().includes(term)
      ));
    });
  }

  function initHelpCenter() {
    const modal = document.querySelector("#helpModal");
    const backdrop = document.querySelector("#helpBackdrop");
    if (!modal || !backdrop) return;

    function open() {
      modal.classList.add("show");
      backdrop.classList.add("show");
      const completed = Object.values(tasks).filter(Boolean).length;
      document.querySelector("#helpProgressText").textContent = `${completed} de ${Object.keys(tasks).length} etapas concluídas`;
    }

    function close() {
      modal.classList.remove("show");
      backdrop.classList.remove("show");
    }

    document.querySelectorAll("[data-open-help]").forEach(button => button.addEventListener("click", open));
    document.querySelectorAll("[data-close-help]").forEach(button => button.addEventListener("click", close));

    document.querySelectorAll(".help-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".help-tab").forEach(item => item.classList.remove("active"));
        document.querySelectorAll(".help-panel").forEach(panel => panel.classList.remove("active"));
        tab.classList.add("active");
        document.querySelector(`#${tab.dataset.panel}`).classList.add("active");
      });
    });
    document.querySelector("#submitQuiz")?.addEventListener("click", () => {
      const form = document.querySelector("#quizForm");
      const answers = new FormData(form);
      const keys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];
      const answered = keys.filter(key => answers.has(key)).length;
      const score = keys.reduce(
        (total, key) => total + (answers.get(key) === "correct" ? 1 : 0),
        0
      );
      const result = document.querySelector("#quizResult");

      if (answered < keys.length) {
        result.innerHTML = `<strong class="negative">Responda todas as perguntas.</strong> Faltam ${keys.length - answered} resposta(s).`;
        toast("Teste incompleto", "Responda as 7 situações antes de corrigir.", "warning");
        return;
      }

      if (score >= 6) {
        completeTask("quiz");
        result.innerHTML = `
          <div class="quiz-feedback success-box">
            <strong>Aprovado: ${score}/7.</strong>
            <span>Você demonstrou domínio das rotinas principais. A trilha também exige ações práticas dentro das páginas.</span>
          </div>`;
        toast("Teste de domínio concluído", `Resultado: ${score} de 7 acertos.`, "success");
      } else {
        result.innerHTML = `
          <div class="quiz-feedback warning-box">
            <strong>Resultado: ${score}/7.</strong>
            <span>São necessários 6 acertos. Consulte o guia, pratique as ações indicadas e tente novamente.</span>
          </div>`;
        toast("Revisão necessária", "A nota mínima é 6 de 7.", "warning");
      }
    });
  }


  function initTrainingReset() {
    document.querySelectorAll("[data-reset-training]").forEach(button => {
      button.addEventListener("click", () => {
        const confirmed = confirm(
          "Reiniciar somente a trilha de aprendizagem? Produtos, pedidos e tema serão mantidos."
        );
        if (!confirmed) return;

        localStorage.removeItem(TASK_KEY);
        localStorage.removeItem("erpTutorialWelcome_v2");
        localStorage.removeItem("erpTutorialSeen_v1");
        localStorage.removeItem("erpQuizPassed_v1");

        toast(
          "Treinamento reiniciado",
          "A trilha e o tutorial voltarão ao estado inicial.",
          "processing"
        );
        setTimeout(() => {
          location.href = "dashboard.html?trainingReset=1";
        }, 550);
      });
    });
  }

  function initDemoReset() {
    document.querySelectorAll("[data-reset-demo]").forEach(button => {
      button.addEventListener("click", () => {
        if (!confirm("Restaurar todos os dados de demonstração e também reiniciar a aprendizagem?")) return;
        [PRODUCT_KEY, ORDER_KEY, TASK_KEY, "erpTutorialWelcome_v2"].forEach(key => localStorage.removeItem(key));
        toast("Dados restaurados", "Produtos, pedidos e aprendizagem voltarão ao estado inicial.", "processing");
        setTimeout(() => location.reload(), 550);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initPageTracking();
    initProducts();
    initOrders();
    initCustomers();
    initHelpCenter();
    initTrainingReset();
    initDemoReset();
    updateOnboarding();
  });

  window.ERP = { money, statusClass, toast, completeTask };
})();
