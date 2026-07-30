(() => {
  let salesChart;
  let statusChart;

  function palette() {
    const styles = getComputedStyle(document.documentElement);
    return {
      text: styles.getPropertyValue("--muted").trim(),
      line: styles.getPropertyValue("--line").trim(),
      cyan: "#3B82F6",
      cyanFill: "rgba(59,130,246,.10)",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#EF4444",
      processing: "#3B82F6",
      surface: styles.getPropertyValue("--surface").trim()
    };
  }

  function fallbackChart(canvas, values, labels) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(ratio, ratio);

    const p = palette();
    ctx.clearRect(0, 0, width, height);
    const max = Math.max(...values) * 1.15;
    const left = 42, right = 16, top = 24, bottom = 34;
    const usableW = width - left - right;
    const usableH = height - top - bottom;

    ctx.strokeStyle = p.line;
    ctx.fillStyle = p.text;
    ctx.font = "11px sans-serif";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = top + usableH * i / 4;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(width - right, y);
      ctx.stroke();
    }

    ctx.strokeStyle = p.cyan;
    ctx.lineWidth = 3;
    ctx.beginPath();
    values.forEach((value, i) => {
      const x = left + usableW * i / (values.length - 1);
      const y = top + usableH - (value / max) * usableH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      ctx.fillStyle = p.text;
      ctx.fillText(labels[i], Math.max(0, x - 17), height - 10);
    });
    ctx.stroke();
  }

  function destroyCharts() {
    salesChart?.destroy();
    statusChart?.destroy();
    salesChart = null;
    statusChart = null;
  }

  function initCharts() {
    const salesCanvas = document.querySelector("#salesChartCanvas");
    const statusCanvas = document.querySelector("#statusChartCanvas");
    if (!salesCanvas) return;

    destroyCharts();
    const p = palette();
    const sales = window.ERP_DATA.sales;

    if (!window.Chart) {
      fallbackChart(salesCanvas, sales.values, sales.labels);
      const note = document.querySelector("#chartOfflineNote");
      if (note) note.style.display = "block";
      return;
    }

    salesChart = new Chart(salesCanvas, {
      type: "line",
      data: {
        labels: sales.labels,
        datasets: [{
          label: "Faturamento",
          data: sales.values,
          borderColor: p.cyan,
          backgroundColor: p.cyanFill,
          fill: true,
          tension: .38,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: p.cyan,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => " " + new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(context.raw)
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: p.text } },
          y: {
            beginAtZero: true,
            grid: { color: p.line },
            ticks: {
              color: p.text,
              callback: value => "R$ " + (value / 1000) + "k"
            }
          }
        }
      }
    });

    const orders = window.ERP_DATA.orders;
    const statusCounts = ["Pago", "Pendente", "Cancelado", "Processando", "Enviado"].map(
      status => orders.filter(order => order.status === status).length
    );

    statusChart = new Chart(statusCanvas, {
      type: "doughnut",
      data: {
        labels: ["Pago", "Pendente", "Cancelado", "Processando", "Enviado"],
        datasets: [{
          data: statusCounts,
          backgroundColor: [p.success, p.warning, p.danger, p.processing, "#22C55E"],
          borderColor: p.surface,
          borderWidth: 4,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "66%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: p.text, boxWidth: 11, usePointStyle: true, padding: 16 }
          }
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initCharts);
  document.addEventListener("erp:themechange", () => {
    if (document.readyState === "loading") return;
    setTimeout(initCharts, 50);
  });
  window.addEventListener("resize", () => {
    if (!window.Chart && document.querySelector("#salesChartCanvas")) initCharts();
  });
})();
