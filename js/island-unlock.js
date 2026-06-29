// ============================================================
// CADERNO DE DESCOBERTAS - Sistema de Desbloqueio da Ilha 3D
// ============================================================

var ISLAND_ELEMENTS = {
  "florir": {
    glbPath: "GLB/ipes.glb",
    targetScale: 1,
    title: "Ipe-amarelo",
    type: "Arvore brasileira",
    badge: "Flor da Jornada",
    emoji: "🌼",
    description: "Os ipes iluminam a paisagem com suas flores. Eles representam renovacao, beleza e os pequenos momentos que fazem a vida florescer.",
    color: "#F5C842",
    colorLight: "rgba(245,200,66,0.15)"
  }
};

var ISLAND_STORAGE_KEY = "caderno_ilha_desbloqueados";
var unlockedIslandElements = new Set();

// ============================================================
// INICIALIZACAO
// ============================================================
function initIslandUnlock() {
  loadIslandState();
  hookKeywordForm();
  // Nota: arvores NAO sao restauradas automaticamente ao recarregar.
  // Elas so aparecem quando a palavra-chave for digitada novamente.
}

function loadIslandState() {
  try {
    var saved = localStorage.getItem(ISLAND_STORAGE_KEY);
    if (saved) { unlockedIslandElements = new Set(JSON.parse(saved)); }
  } catch (e) {
    console.warn("[Ilha] Erro ao carregar estado:", e);
    unlockedIslandElements = new Set();
  }
}

function saveIslandState() {
  try {
    localStorage.setItem(ISLAND_STORAGE_KEY, JSON.stringify(Array.from(unlockedIslandElements)));
  } catch (e) {
    console.warn("[Ilha] Erro ao salvar estado:", e);
  }
}

// ============================================================
// HOOK NO FORMULARIO
// ============================================================
function hookKeywordForm() {
  var form = document.getElementById("keyword-form");
  var input = document.getElementById("keyword-input");
  var feedback = document.getElementById("keyword-feedback");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    var raw = input ? input.value.trim() : "";
    var keyword = normalizeIslandKeyword(raw);

    if (!keyword) {
      showIslandFeedback(feedback, "Digite uma palavra-chave!", "error");
      shakeIslandElement(input);
      return;
    }

    var element = ISLAND_ELEMENTS[keyword];

    if (element) {
      if (unlockedIslandElements.has(keyword)) {
        // Ja desbloqueou antes: mostra o modal de novo + re-anima as arvores
        showDiscoveryCard(element, function onModalClosed() {
          if (typeof window.replayThreeJSItem === "function") {
            window.replayThreeJSItem(element.glbPath, element.targetScale, keyword);
          }
        });
      } else {
        // Primeira vez: salva e mostra modal PRIMEIRO
        // arvores so crescem no callback de fechamento do modal
        unlockedIslandElements.add(keyword);
        saveIslandState();

        showDiscoveryCard(element, function onModalClosed() {
          if (typeof window.unlockThreeJSItem === "function") {
            window.unlockThreeJSItem(element.glbPath, element.targetScale, keyword);
          }
        });
      }

      if (input) input.value = "";
      showIslandFeedback(feedback, "", "");
      return;
    }

    // nao e elemento 3D: repassa para badges
    handleNonIslandKeyword(keyword, input, feedback, form);

  }, true);

  if (input) {
    input.addEventListener("input", function () {
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "keyword-feedback";
      }
    });
  }
}

function handleNonIslandKeyword(keyword, input, feedback, form) {
  var badgeId = (typeof KEYWORDS_MAP !== "undefined") ? KEYWORDS_MAP[keyword] : null;

  if (!badgeId) {
    showIslandFeedback(feedback, "Essa palavra ainda nao revelou uma descoberta. Continue explorando!", "error");
    shakeIslandElement(form);
    return;
  }

  var state = (typeof appState !== "undefined") ? appState : null;
  if (state && state.unlockedBadges && state.unlockedBadges.includes(badgeId)) {
    showIslandFeedback(feedback, "Voce ja desbloqueou esse distintivo!", "success");
    return;
  }

  if (typeof unlockBadge === "function") {
    unlockBadge(badgeId);
    if (input) input.value = "";
    showIslandFeedback(feedback, "", "");
  }
}

// ============================================================
// RESTAURAR AO RECARREGAR (sem animacao, sem modal)
// ============================================================
function restoreUnlockedIslandObjects() {
  if (unlockedIslandElements.size === 0) return;
  var attempts = 0;
  var tryRestore = setInterval(function () {
    attempts++;
    if (typeof window.restoreThreeJSItem === "function") {
      clearInterval(tryRestore);
      unlockedIslandElements.forEach(function (keyword) {
        var el = ISLAND_ELEMENTS[keyword];
        if (!el || !el.glbPath) return;
        window.restoreThreeJSItem(el.glbPath, el.targetScale, keyword);
      });
    } else if (attempts > 20) {
      clearInterval(tryRestore);
    }
  }, 300);
}

// ============================================================
// CARD DE DESCOBERTA — recebe callback para crescimento
// ============================================================
function showDiscoveryCard(element, onClosedCallback) {
  var existing = document.getElementById("discovery-card-overlay");
  if (existing) { existing.remove(); }

  var overlay = document.createElement("div");
  overlay.id = "discovery-card-overlay";
  overlay.className = "discovery-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Descoberta: " + element.title);

  var cardStyle = "--el-color:" + element.color + "; --el-color-light:" + element.colorLight + ";";

  overlay.innerHTML = [
    '<div class="discovery-card" id="discovery-card" style="' + cardStyle + '">',
    '<div class="discovery-particles" aria-hidden="true">',
    '<span class="dp p1">&#10038;</span>',
    '<span class="dp p2">&#127775;</span>',
    '<span class="dp p3">&#10038;</span>',
    '<span class="dp p4">&#11088;</span>',
    '<span class="dp p5">&#10038;</span>',
    '</div>',
    '<button class="discovery-close" id="discovery-close-btn" aria-label="Fechar">',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">',
    '<line x1="18" y1="6" x2="6" y2="18"></line>',
    '<line x1="6" y1="6" x2="18" y2="18"></line>',
    '</svg>',
    '</button>',
    '<div class="discovery-header">',
    '<div class="discovery-emoji-ring">',
    '<span class="discovery-emoji" aria-hidden="true">' + element.emoji + '</span>',
    '</div>',
    '<div class="discovery-label">Nova Descoberta!</div>',
    '</div>',
    '<div class="discovery-body">',
    '<h2 class="discovery-title">' + element.title + '</h2>',
    '<div class="discovery-meta">',
    '<div class="discovery-meta-item">',
    '<span class="discovery-meta-icon">&#127807;</span>',
    '<span class="discovery-meta-text">' + element.type + '</span>',
    '</div>',
    '<div class="discovery-meta-item">',
    '<span class="discovery-meta-icon">&#127941;</span>',
    '<span class="discovery-meta-text">' + element.badge + '</span>',
    '</div>',
    '</div>',
    '<p class="discovery-description">' + element.description + '</p>',
    '</div>',
    '<div class="discovery-footer">',
    '<div class="discovery-island-hint">',
    '<span aria-hidden="true">&#127965;</span>',
    ' Feche e veja o que aparece na ilha!',
    '</div>',
    '<button class="discovery-cta" id="discovery-cta-btn">Incrivel! Quero ver! &#10024;</button>',
    '</div>',
    '</div>'
  ].join("");

  document.body.appendChild(overlay);

  var closed = false;
  function closeCard() {
    if (closed) return;
    closed = true;
    overlay.classList.add("discovery-leaving");
    setTimeout(function () {
      overlay.remove();
      if (typeof onClosedCallback === "function") {
        onClosedCallback();
      }
    }, 400);
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) { closeCard(); }
  });

  var closeBtn = document.getElementById("discovery-close-btn");
  if (closeBtn) { closeBtn.addEventListener("click", closeCard); }

  var ctaBtn = document.getElementById("discovery-cta-btn");
  if (ctaBtn) { ctaBtn.addEventListener("click", closeCard); }

  function escListener(e) {
    if (e.key === "Escape") {
      closeCard();
      document.removeEventListener("keydown", escListener);
    }
  }
  document.addEventListener("keydown", escListener);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      overlay.classList.add("discovery-visible");
    });
  });

  // Auto-fecha apos 12s
  setTimeout(function () {
    if (!closed) { closeCard(); }
  }, 12000);
}

// ============================================================
// UTILITARIOS
// ============================================================
function normalizeIslandKeyword(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function showIslandFeedback(el, msg, type) {
  if (!el) { return; }
  el.textContent = msg;
  el.className = "keyword-feedback" + (type ? " " + type : "");
}

function shakeIslandElement(el) {
  if (!el) { return; }
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
  setTimeout(function () { el.classList.remove("shake"); }, 500);
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  initIslandUnlock();
});
