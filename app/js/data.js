window.ERP_DATA = {
  products: [
    { id: 1, name: "Fone Bluetooth Pro", sku: "FON-001", category: "Eletrônicos", price: 189.90, stock: 42, status: "Ativo", icon: "🎧" },
    { id: 2, name: "Smartwatch Fit X", sku: "SMA-014", category: "Wearables", price: 349.90, stock: 8, status: "Estoque baixo", icon: "⌚" },
    { id: 3, name: "Carregador Turbo 30W", sku: "CAR-110", category: "Acessórios", price: 79.90, stock: 0, status: "Sem estoque", icon: "🔌" },
    { id: 4, name: "Capa Premium MagSafe", sku: "CAP-202", category: "Acessórios", price: 99.90, stock: 65, status: "Ativo", icon: "📱" },
    { id: 5, name: "Teclado Mecânico Mini", sku: "TEC-051", category: "Informática", price: 279.90, stock: 17, status: "Ativo", icon: "⌨️" },
    { id: 6, name: "Mouse Sem Fio Silent", sku: "MOU-088", category: "Informática", price: 129.90, stock: 25, status: "Ativo", icon: "🖱️" }
  ],
  orders: [
    { id: "#1048", customer: "Mariana Costa", date: "30/07/2026", total: 349.90, status: "Pago", channel: "Loja própria" },
    { id: "#1047", customer: "Lucas Almeida", date: "30/07/2026", total: 189.90, status: "Processando", channel: "Marketplace" },
    { id: "#1046", customer: "Beatriz Souza", date: "29/07/2026", total: 459.80, status: "Enviado", channel: "Loja própria" },
    { id: "#1045", customer: "Rafael Lima", date: "29/07/2026", total: 79.90, status: "Pendente", channel: "Marketplace" },
    { id: "#1044", customer: "Carla Mendes", date: "28/07/2026", total: 279.90, status: "Cancelado", channel: "Loja própria" },
    { id: "#1043", customer: "Felipe Rocha", date: "28/07/2026", total: 579.70, status: "Enviado", channel: "Marketplace" },
    { id: "#1042", customer: "Aline Martins", date: "27/07/2026", total: 129.90, status: "Pago", channel: "Loja própria" }
  ],
  customers: [
    { name: "Mariana Costa", email: "mariana@email.com", orders: 7, total: 1849.30, segment: "VIP", initials: "MC" },
    { name: "Lucas Almeida", email: "lucas@email.com", orders: 3, total: 689.70, segment: "Recorrente", initials: "LA" },
    { name: "Beatriz Souza", email: "beatriz@email.com", orders: 5, total: 1280.50, segment: "VIP", initials: "BS" },
    { name: "Rafael Lima", email: "rafael@email.com", orders: 1, total: 79.90, segment: "Novo", initials: "RL" },
    { name: "Carla Mendes", email: "carla@email.com", orders: 2, total: 459.80, segment: "Recorrente", initials: "CM" },
    { name: "Felipe Rocha", email: "felipe@email.com", orders: 4, total: 1139.60, segment: "Recorrente", initials: "FR" }
  ],
  sales: {
    labels: ["24 Jul", "25 Jul", "26 Jul", "27 Jul", "28 Jul", "29 Jul", "30 Jul"],
    values: [4200, 5800, 4900, 7100, 8400, 6600, 7920]
  }
};
