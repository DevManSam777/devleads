(function () {
  "use strict";

  let clickCount = 0;
  let clickTimer = null;
  let pizzaMode = false;
  let pizzaRainTimer = null;
  let flashTimer = null;
  let pizzaElements = [];

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPizzaEasterEgg);
  } else {
    initPizzaEasterEgg();
  }

  function initPizzaEasterEgg() {
    if (localStorage.getItem("pizzaModeActive") === "true") {
      applyPizzaBackground();
      applyPizzaTextStyling();
      applyPizzaCardBackgrounds();
      showExitButton();
    }

    const header = document.querySelector("h2");
    if (!header) {
      console.log("No h2 header found");
      return;
    }

    header.addEventListener("click", handleHeaderClick);
    header.addEventListener("touchend", handleHeaderTouch);
  }

  function handleHeaderClick() {
    incrementClickCount();
  }

  function handleHeaderTouch(e) {
    e.preventDefault();
    incrementClickCount();
  }

  function incrementClickCount() {
    clickCount++;

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 3000);

    if (clickCount >= 7) {
      clickCount = 0;
      clearTimeout(clickTimer);
      activatePizzaMode();
    }
  }

  function activatePizzaMode() {
    if (pizzaMode) return;

    pizzaMode = true;

    applyPizzaBackground();
    applyPizzaTextStyling();
    applyPizzaCardBackgrounds();
    startPizzaRain();
    startFlashingText();

    setTimeout(() => {
      showExitButton();
    }, 10000);

    console.log("🍕 PIZZA MODE ACTIVATED! 🍕");
  }

  function applyPizzaBackground() {
    const pizzaOverlay = document.createElement("div");
    pizzaOverlay.id = "pizza-background-overlay";
    pizzaOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-image: url('/dashboard/assets/pizza_bg.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        `;

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      pizzaOverlay.style.cssText += `
              background-attachment: scroll;
              background-size: cover;
              min-height: 100vh;
              min-width: 100vw;
          `;
    } else {
      pizzaOverlay.style.cssText += `
              background-attachment: fixed;
          `;
    }

    document.body.appendChild(pizzaOverlay);

    setTimeout(() => {
      pizzaOverlay.style.opacity = "1";
    }, 100);

    localStorage.setItem("pizzaModeActive", "true");

    const handleResize = () => {
      const isMobileNow = window.innerWidth <= 768;
      if (isMobileNow) {
        pizzaOverlay.style.backgroundAttachment = "scroll";
        pizzaOverlay.style.backgroundSize = "cover";
        pizzaOverlay.style.minHeight = "100vh";
        pizzaOverlay.style.minWidth = "100vw";
      } else {
        pizzaOverlay.style.backgroundAttachment = "fixed";
      }
    };

    window.addEventListener('resize', handleResize);
    pizzaOverlay._resizeHandler = handleResize;
  }

  function applyPizzaTextStyling() {
    window.originalTheme = document.documentElement.getAttribute('data-theme');
    
    const pizzaTextStyles = document.createElement("style");
    pizzaTextStyles.id = "pizza-text-styles";
    pizzaTextStyles.textContent = `
            .pizza-mode h2,
            .pizza-mode .header h2 {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8) !important;
            }
            
            .pizza-mode details summary h3,
            .pizza-mode summary h3 {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8) !important;
            }
            
            .pizza-mode .chart-card h3,
            .pizza-mode .chart-container h3,
            .pizza-mode .chart-card .chart-container h3 {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8) !important;
            }
            
            .pizza-mode .stats-card h3,
            .pizza-mode .stats-card .value,
            .pizza-mode .stats-card .change,
            .pizza-mode .stats-card .change span,
            .pizza-mode .stats-card *,
            .pizza-mode .chart-card *,
            .pizza-mode .chart-container *,
            .pizza-mode .chart-card text,
            .pizza-mode .chart-card tspan {
                color: white !important;
                fill: white !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
            }
            
            .pizza-mode .chart-container svg text,
            .pizza-mode .chart-container svg tspan,
            .pizza-mode .chart-card svg text,
            .pizza-mode .chart-card svg tspan {
                fill: white !important;
                color: white !important;
            }
            
            .pizza-mode .chart-container canvas {
                filter: brightness(1.2) contrast(1.1);
            }
            
            .pizza-mode .chart-container canvas + div,
            .pizza-mode .chart-card canvas + div,
            .pizza-mode canvas + div {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.9) !important;
            }
            
            .pizza-mode .chart-container *[style*="color"],
            .pizza-mode .chart-card *[style*="color"] {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.9) !important;
            }
        `;

    document.head.appendChild(pizzaTextStyles);
    document.body.classList.add("pizza-mode");

    if (window.updateAllCharts) {
      setTimeout(() => {
        window.updateAllCharts();
      }, 500);
    }

    if (window.getThemeColors) {
      window.originalGetThemeColors = window.getThemeColors;
      window.getThemeColors = function() {
        const colors = window.originalGetThemeColors();
        return {
          ...colors,
          textColor: "#ffffff",
          textMuted: "#ffffff"
        };
      };
    }

    window.pizzaModeChartOverride = function() {
      if (window.Chart && window.Chart.instances) {
        Object.values(window.Chart.instances).forEach(chart => {
          if (chart && chart.options) {
            if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
              chart.options.plugins.legend.labels.color = '#ffffff';
            }
            if (chart.options.plugins && chart.options.plugins.tooltip) {
              chart.options.plugins.tooltip.titleColor = '#ffffff';
              chart.options.plugins.tooltip.bodyColor = '#ffffff';
            }
            if (chart.options.scales) {
              Object.keys(chart.options.scales).forEach(scaleKey => {
                if (chart.options.scales[scaleKey].ticks) {
                  chart.options.scales[scaleKey].ticks.color = '#ffffff';
                }
              });
            }
            chart.update();
          }
        });
      }

      const chartContainers = document.querySelectorAll('.pizza-mode .chart-container, .pizza-mode .chart-card');
      chartContainers.forEach(container => {
        const canvas = container.querySelector('canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx && !canvas._pizzaOverridden) {
            canvas._pizzaOverridden = true;
            
            const originalFillText = ctx.fillText;
            
            ctx.fillText = function(text, x, y, maxWidth) {
              const originalStyle = this.fillStyle;
              const originalShadowColor = this.shadowColor;
              const originalShadowBlur = this.shadowBlur;
              const originalShadowOffsetX = this.shadowOffsetX;
              const originalShadowOffsetY = this.shadowOffsetY;
              
              this.fillStyle = '#ffffff';
              this.shadowColor = 'rgba(0,0,0,0.8)';
              this.shadowBlur = 3;
              this.shadowOffsetX = 2;
              this.shadowOffsetY = 2;
              
              const result = originalFillText.call(this, text, x, y, maxWidth);
              
              this.fillStyle = originalStyle;
              this.shadowColor = originalShadowColor;
              this.shadowBlur = originalShadowBlur;
              this.shadowOffsetX = originalShadowOffsetX;
              this.shadowOffsetY = originalShadowOffsetY;
              
              return result;
            };
          }
        }
      });
    };

    window.pizzaModeInterval = setInterval(window.pizzaModeChartOverride, 300);
    setTimeout(window.pizzaModeChartOverride, 1000);
  }

  function applyPizzaCardBackgrounds() {
    const pizzaCardStyles = document.createElement("style");
    pizzaCardStyles.id = "pizza-card-styles";
    pizzaCardStyles.textContent = `
            .pizza-mode .leads-container,
            .pizza-mode .hitlists-container,
            .pizza-mode .forms-container .forms-category,
            .pizza-mode .resource-card,
            .pizza-mode .settings-container,
            .pizza-mode .stats-cards .stats-card,
            .pizza-mode .charts-cards .chart-card {
                position: relative;
                overflow: hidden;
            }
            
            .pizza-mode .leads-container::before,
            .pizza-mode .hitlists-container::before,
            .pizza-mode .forms-container .forms-category::before,
            .pizza-mode .resource-card::before,
            .pizza-mode .settings-container::before,
            .pizza-mode .stats-cards .stats-card::before,
            .pizza-mode .charts-cards .chart-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/dashboard/assets/pizza_bg.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.4;
                z-index: 0;
                pointer-events: none;
            }
            
            .pizza-mode .leads-container,
            .pizza-mode .hitlists-container,
            .pizza-mode .forms-container .forms-category,
            .pizza-mode .resource-card,
            .pizza-mode .settings-container,
            .pizza-mode .stats-cards .stats-card,
            .pizza-mode .charts-cards .chart-card {
                background-color: rgba(0, 0, 0, 0.9) !important;
            }
            
            .pizza-mode .header,
            .pizza-mode .pagination {
                background-color: transparent !important;
            }
            
            .pizza-mode .pagination,
            .pizza-mode .pagination *,
            .pizza-mode .pagination button,
            .pizza-mode .pagination select,
            .pizza-mode .pagination option,
            .pizza-mode .pagination-controls,
            .pizza-mode .pagination-controls *,
            .pizza-mode .pagination-info,
            .pizza-mode .pagination-info *,
            .pizza-mode .forms-container .pagination,
            .pizza-mode .forms-container .pagination *,
            .pizza-mode .hitlists-container .pagination,
            .pizza-mode .hitlists-container .pagination *,
            .pizza-mode .pagination .btn,
            .pizza-mode .pagination button[class*="btn"],
            .pizza-mode .pagination .page-btn,
            .pizza-mode .pagination .page-link,
            .pizza-mode .pagination .page-item,
            .pizza-mode .pagination .page-item *,
            .pizza-mode .pagination [class*="page-"],
            .pizza-mode .pagination [class*="page-"] * {
                color: white !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
            }
            
            .pizza-mode .view-toggle button {
                background-color: rgba(0, 0, 0, 0.8) !important;
                border-color: rgba(255, 255, 255, 0.5) !important;
                color: white !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
            }
            
            .pizza-mode .view-toggle button.active {
                background-color: var(--primary) !important;
                border-color: var(--primary) !important;
                color: white !important;
                text-shadow: none !important;
            }
            
            .pizza-mode .hitlist-card,
            .pizza-mode .lead-card,
            .pizza-mode .template-card,
            .pizza-mode .business-item {
                background-color: rgba(255, 255, 255, 0.65) !important;
                position: relative;
                overflow: visible;
            }
            
            .pizza-mode .leads-table tbody tr,
            .pizza-mode .leads-table tr,
            .pizza-mode table tbody tr,
            .pizza-mode table tr {
                background-color: rgba(255, 255, 255, 0.6) !important;
            }
            
            .pizza-mode .leads-table tbody tr:hover,
            .pizza-mode .leads-table tr:hover,
            .pizza-mode table tbody tr:hover,
            .pizza-mode table tr:hover {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }
            
            .pizza-mode .leads-table,
            .pizza-mode .leads-table *,
            .pizza-mode table,
            .pizza-mode table * {
                color: var(--text-color) !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5) !important;
            }
            
            .pizza-mode .hitlist-card::before,
            .pizza-mode .lead-card::before,
            .pizza-mode .template-card::before,
            .pizza-mode .business-item::before {
                display: none !important;
            }
            
            [data-theme="dark"] .pizza-mode .hitlist-card,
            [data-theme="dark"] .pizza-mode .lead-card,
            [data-theme="dark"] .pizza-mode .template-card,
            [data-theme="dark"] .pizza-mode .business-item {
                background-color: rgba(45, 50, 56, 0.6) !important;
            }
            
            [data-theme="dark"] .pizza-mode .leads-table tbody tr,
            [data-theme="dark"] .pizza-mode .leads-table tr,
            [data-theme="dark"] .pizza-mode table tbody tr,
            [data-theme="dark"] .pizza-mode table tr {
                background-color: rgba(45, 50, 56, 0.75) !important;
            }
            
            [data-theme="dark"] .pizza-mode .leads-table tbody tr:hover,
            [data-theme="dark"] .pizza-mode .leads-table tr:hover,
            [data-theme="dark"] .pizza-mode table tbody tr:hover,
            [data-theme="dark"] .pizza-mode table tr:hover {
                background-color: rgba(45, 50, 56, 0.95) !important;
            }
            
            .pizza-mode .hitlist-card:hover,
            .pizza-mode .lead-card:hover,
            .pizza-mode .template-card:hover,
            .pizza-mode .business-item:hover {
                background-color: rgba(255, 255, 255, 0.8) !important;
            }
            
            [data-theme="dark"] .pizza-mode .hitlist-card:hover,
            [data-theme="dark"] .pizza-mode .lead-card:hover,
            [data-theme="dark"] .pizza-mode .template-card:hover,
            [data-theme="dark"] .pizza-mode .business-item:hover {
                background-color: rgba(45, 50, 56, 0.8) !important;
            }
            
            .pizza-mode .resource-card h3,
            .pizza-mode .resource-card h4,
            .pizza-mode .resource-card p,
            .pizza-mode .settings-container h3,
            .pizza-mode .settings-container label:not(.theme-segment):not(.date-format-segment) {
                color: white !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
            }
            
            [data-theme="dark"] .pizza-mode .leads-container,
            [data-theme="dark"] .pizza-mode .hitlists-container,
            [data-theme="dark"] .pizza-mode .forms-container .forms-category,
            [data-theme="dark"] .pizza-mode .resource-card,
            [data-theme="dark"] .pizza-mode .settings-container,
            [data-theme="dark"] .pizza-mode .stats-cards .stats-card,
            [data-theme="dark"] .pizza-mode .charts-cards .chart-card {
                background-color: rgba(0, 0, 0, 0.9) !important;
            }
            
            .pizza-mode .leads-container > *,
            .pizza-mode .hitlists-container > *,
            .pizza-mode .forms-container .forms-category > *,
            .pizza-mode .resource-card > *,
            .pizza-mode .settings-container > *,
            .pizza-mode .stats-cards .stats-card > *,
            .pizza-mode .charts-cards .chart-card > * {
                position: relative;
                z-index: 1;
            }
            
            .pizza-mode .template-card {
                position: relative;
                overflow: hidden;
            }
            
            .pizza-mode .template-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/dashboard/assets/pizza_bg.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.1;
                z-index: -1;
                pointer-events: none;
            }
            
            .pizza-mode .hitlist-card {
                position: relative;
                overflow: hidden;
            }
            
            .pizza-mode .hitlist-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/dashboard/assets/pizza_bg.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.1;
                z-index: -1;
                pointer-events: none;
            }
            
            .pizza-mode .lead-card {
                position: relative;
                overflow: hidden;
            }
            
            .pizza-mode .lead-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/dashboard/assets/pizza_bg.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0.08;
                z-index: -1;
                pointer-events: none;
            }
        `;

    document.head.appendChild(pizzaCardStyles);
  }

  function startPizzaRain() {
    const pizzaContainer = document.createElement("div");
    pizzaContainer.id = "pizza-rain-container";
    pizzaContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;

    document.body.appendChild(pizzaContainer);

    const rainInterval = setInterval(() => {
      createPizzaEmoji(pizzaContainer);
      createConfetti(pizzaContainer);
    }, 150);

    setTimeout(() => {
      clearInterval(rainInterval);
      setTimeout(() => {
        if (pizzaContainer.parentNode) {
          pizzaContainer.remove();
        }
        pizzaElements = [];
      }, 3000);
    }, 12000);
  }

  function createPizzaEmoji(container) {
    const pizza = document.createElement("div");
    pizza.textContent = "🍕";
    pizza.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 30 + 50}px;
            left: ${Math.random() * 100}%;
            top: -50px;
            animation: pizzaFall ${Math.random() * 3 + 4}s linear forwards;
            z-index: 10000;
            pointer-events: none;
            transform: rotate(${Math.random() * 360}deg);
        `;

    container.appendChild(pizza);
    pizzaElements.push(pizza);

    setTimeout(() => {
      if (pizza.parentNode) {
        pizza.remove();
      }
    }, 7000);
  }

  function createConfetti(container) {
    const confettiColors = ["🤩", "🥳", "⭐", "🎊", "🎉"];
    const confetti = document.createElement("div");
    confetti.textContent =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 15 + 50}px;
            left: ${Math.random() * 100}%;
            top: -50px;
            animation: confettiFall ${Math.random() * 2 + 3}s linear forwards;
            z-index: 10000;
            pointer-events: none;
            transform: rotate(${Math.random() * 360}deg);
        `;

    container.appendChild(confetti);
    pizzaElements.push(confetti);

    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.remove();
      }
    }, 12000);
  }

  function startFlashingText() {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const flashText = document.createElement("div");
    flashText.id = "pizza-gang-text";
    flashText.textContent = "Pizza Party!";
    flashText.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            font-weight: bold;
            font-family: 'Bagel Fat One', 'Comic Sans MS', cursive, sans-serif;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
            z-index: 10001;
            pointer-events: none;
            animation: pizzaFlash 0.5s infinite alternate;
            white-space: nowrap;
            width: max-content;
        `;

    document.body.appendChild(flashText);

    setTimeout(() => {
      if (flashText.parentNode) {
        flashText.remove();
      }
    }, 10000);
  }

  function showExitButton() {
    const exitButton = document.createElement("button");
    exitButton.id = "pizza-exit-button";
    exitButton.textContent = "Exit Pizza Mode";
    exitButton.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(45deg, #8b5cf6, #ec4899);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10002;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            animation: pizzaBounce 2s infinite;
        `;

    exitButton.addEventListener("click", exitPizzaMode);
    exitButton.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.1)";
      this.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
      this.style.background = "linear-gradient(45deg, #7c3aed, #db2777)";
    });
    exitButton.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
      this.style.background = "linear-gradient(45deg, #8b5cf6, #ec4899)";
    });

    document.body.appendChild(exitButton);
  }

  function exitPizzaMode() {
    pizzaMode = false;
    localStorage.removeItem("pizzaModeActive");
    document.body.classList.remove("pizza-mode");

    const pizzaOverlay = document.getElementById("pizza-background-overlay");
    if (pizzaOverlay) {
      if (pizzaOverlay._resizeHandler) {
        window.removeEventListener('resize', pizzaOverlay._resizeHandler);
      }
      
      pizzaOverlay.style.opacity = "0";
      setTimeout(() => {
        if (pizzaOverlay.parentNode) {
          pizzaOverlay.remove();
        }
      }, 500);
    }

    const pizzaTextStyles = document.getElementById("pizza-text-styles");
    if (pizzaTextStyles) {
      pizzaTextStyles.remove();
    }

    if (window.originalTheme && window.originalTheme !== document.documentElement.getAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', window.originalTheme);
    }
    if (window.originalTheme) {
      delete window.originalTheme;
    }

    if (window.originalGetThemeColors) {
      window.getThemeColors = window.originalGetThemeColors;
      delete window.originalGetThemeColors;
    }

    if (window.pizzaModeInterval) {
      clearInterval(window.pizzaModeInterval);
      delete window.pizzaModeInterval;
    }

    if (window.pizzaModeChartOverride) {
      delete window.pizzaModeChartOverride;
    }

    const pizzaCardStyles = document.getElementById("pizza-card-styles");
    if (pizzaCardStyles) {
      pizzaCardStyles.remove();
    }

    const exitButton = document.getElementById("pizza-exit-button");
    if (exitButton) {
      exitButton.remove();
    }

    pizzaElements.forEach((pizza) => {
      if (pizza.parentNode) {
        pizza.remove();
      }
    });
    pizzaElements = [];

    const rainContainer = document.getElementById("pizza-rain-container");
    if (rainContainer) {
      rainContainer.remove();
    }

    const gangText = document.getElementById("pizza-gang-text");
    if (gangText) {
      gangText.remove();
    }

    if (window.updateAllCharts) {
      setTimeout(() => {
        window.updateAllCharts();
      }, 500);
    }

    console.log("Pizza mode deactivated 🍕➜🏠");
  }

  function addPizzaStyles() {
    if (document.getElementById("pizza-styles")) return;

    const style = document.createElement("style");
    style.id = "pizza-styles";
    style.textContent = `
            @keyframes pizzaFall {
                to {
                    transform: translateY(calc(100vh + 50px)) rotate(720deg);
                }
            }
            
            @keyframes confettiFall {
                to {
                    transform: translateY(calc(100vh + 50px)) rotate(1080deg);
                }
            }
            
            @keyframes pizzaFlash {
                0% { 
                    color: #ff6b6b; 
                    transform: translate(-50%, -50%) scale(1);
                }
                25% { 
                    color: #4ecdc4; 
                    transform: translate(-50%, -50%) scale(1.1);
                }
                50% { 
                    color: #45b7d1; 
                    transform: translate(-50%, -50%) scale(1);
                }
                75% { 
                    color: #f39c12; 
                    transform: translate(-50%, -50%) scale(1.1);
                }
                100% { 
                    color: #e74c3c; 
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            @keyframes pizzaBounce {
                0%, 100% { 
                    transform: translateY(0); 
                }
                50% { 
                    transform: translateY(-10px); 
                }
            }
        `;

    document.head.appendChild(style);
  }

  addPizzaStyles();
})();