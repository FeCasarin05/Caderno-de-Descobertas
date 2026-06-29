/* ═══════════════════════════════════════════════════════════
   CADERNO DE DESCOBERTAS – Script Principal
   ═══════════════════════════════════════════════════════════

   CONFIGURAÇÃO DA CENA SPLINE
   ─────────────────────────────────────────────────────────
   Para usar a cena LOCAL (.splinecode) da pasta do projeto,
   o arquivo já está configurado em index.html como:
     url="./scene (1).splinecode"

   Se quiser trocar para a URL online exportada pelo Spline,
   edite o atributo 'url' do <spline-viewer> no index.html
   ou use a constante abaixo para controle dinâmico:
*/
const SPLINE_SCENE_URL = "https://prod.spline.design/KBrLJcFhRZSzrpmw/scene.splinecode";

let splineApp = null;
let splineReady = false;
let islandObject = null;
let isDraggingIsland = false;
let lastPointerX = 0;

/* ═══════════════════════════════════════════════════════════
   BANCO DE PALAVRAS-CHAVE E DISTINTIVOS
   ─────────────────────────────────────────────────────────
   Adicione novas palavras-chave aqui com o badgeId correspondente.
   O badge será desbloqueado quando a família inserir essa palavra.
═══════════════════════════════════════════════════════════ */
const KEYWORDS_MAP = {
  "natureza": "badge_natureza",
  "agua": "badge_agua",
  "estrelas": "badge_estrelas",
  "explorador": "badge_explorador",
  "familia": "badge_familia",
  "descoberta": "badge_descoberta",
};

/* ═══════════════════════════════════════════════════════════
   DEFINIÇÃO DOS DISTINTIVOS
═══════════════════════════════════════════════════════════ */
const BADGES_DATA = [
  {
    id: "badge_natureza",
    name: "Guardião da Natureza",
    emoji: "🌱",
    description: "Explorou a trilha da natureza!",
  },
  {
    id: "badge_agua",
    name: "Mestre das Águas",
    emoji: "💧",
    description: "Dominou o experimento da água!",
  },
  {
    id: "badge_estrelas",
    name: "Astrônomo Mirim",
    emoji: "⭐",
    description: "Mapeou as estrelas do céu!",
  },
  {
    id: "badge_explorador",
    name: "Grande Explorador",
    emoji: "🧭",
    description: "Corajoso e curioso!",
  },
  {
    id: "badge_familia",
    name: "Família Unida",
    emoji: "👨‍👩‍👧",
    description: "Explorou junto com a família!",
  },
  {
    id: "badge_descoberta",
    name: "Espírito Descobridor",
    emoji: "🔍",
    description: "Encontrou todos os segredos!",
  },
  {
    id: "badge_arte",
    name: "Pequeno Artista",
    emoji: "🎨",
    description: "Criou uma obra prima em família!",
  },
  {
    id: "badge_musica",
    name: "Mestre Musical",
    emoji: "🎵",
    description: "Tocou ou cantou sua primeira música!",
  },
  {
    id: "badge_culinaria",
    name: "Chef de Cozinha",
    emoji: "🍳",
    description: "Ajudou a preparar uma refeição deliciosa!",
  },
  {
    id: "badge_jardim",
    name: "Dedos Verdes",
    emoji: "🌻",
    description: "Plantou uma sementinha ou cuidou de uma planta!",
  },
  {
    id: "badge_fotografia",
    name: "Olhar Atento",
    emoji: "📸",
    description: "Capturou um momento especial da família!",
  },
  {
    id: "badge_leitura",
    name: "Traça de Livros",
    emoji: "📚",
    description: "Leu uma nova história fantástica juntos!",
  },
];

const BADGES_PER_PAGE = 6;
let currentBadgePage = 0;

function nextBadgePage() {
  const totalPages = Math.ceil(BADGES_DATA.length / BADGES_PER_PAGE);
  if (currentBadgePage < totalPages - 1) {
    currentBadgePage++;
    renderBadgesGrid();
  }
}

function prevBadgePage() {
  if (currentBadgePage > 0) {
    currentBadgePage--;
    renderBadgesGrid();
  }
}

/* ═══════════════════════════════════════════════════════════
   FRASES DA NINA (rotaciona no balão)
═══════════════════════════════════════════════════════════ */
const NINA_PHRASES = [
  "Oi! Vamos explorar a ilha e descobrir novas atividades em família? 🌟",
  "Dica: cada atividade esconde uma palavra especial. Consegue encontrar? 🔍",
  "Que bom te ver por aqui! Você já coleciona distintivos? 🏅",
  "Descubra as palavras-chave nas atividades e desbloqueie surpresas! ✨",
  "A ilha tem muitos segredos esperando por você e sua família! 🌿",
];

/* ═══════════════════════════════════════════════════════════
   ESTADO DO APLICATIVO
═══════════════════════════════════════════════════════════ */
let appState = {
  soundEnabled: true,
  unlockedBadges: [],
  currentNinaPhrase: 0,
};

/* ═══════════════════════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════�// Ângulo atual da rotação da ilha (em graus)
let islandRotationY = 0;


/* ═══════════════════════════════════════════════════════════
   NINA – BALÃO DE FALA
═══════════════════════════════════════════════════════════ */
function initNina() {
  const ninaText = document.getElementById("nina-text");
  if (!ninaText) return;

  // Rotaciona frases a cada 10 segundos
  setInterval(() => {
    appState.currentNinaPhrase = (appState.currentNinaPhrase + 1) % NINA_PHRASES.length;
    const bubble = document.querySelector(".speech-bubble");
    if (bubble) {
      bubble.style.opacity = "0";
      bubble.style.transform = "scale(0.9)";
      setTimeout(() => {
        ninaText.textContent = NINA_PHRASES[appState.currentNinaPhrase];
        bubble.style.opacity = "1";
        bubble.style.transform = "scale(1)";
        bubble.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      }, 300);
    }
  }, 10000);
}

/* ═══════════════════════════════════════════════════════════
   FORMULÁRIO DE PALAVRA-CHAVE
═══════════════════════════════════════════════════════════ */
function initKeywordForm() {
  const form = document.getElementById("keyword-form");
  const input = document.getElementById("keyword-input");
  const feedback = document.getElementById("keyword-feedback");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    const keyword = normalizeKeyword(raw);

    if (!keyword) {
      showFeedback(feedback, "Digite uma palavra-chave!", "error");
      shakeElement(input);
      return;
    }

    // Verifica se a palavra-chave existe
    const badgeId = KEYWORDS_MAP[keyword];
    if (!badgeId) {
      showFeedback(feedback, "❌ Palavra-chave não encontrada. Tente de novo!", "error");
      shakeElement(form);
      return;
    }

    // Verifica se já foi desbloqueada
    if (appState.unlockedBadges.includes(badgeId)) {
      showFeedback(feedback, "✅ Você já desbloqueou esse distintivo!", "success");
      return;
    }

    // Desbloqueia o badge!
    unlockBadge(badgeId);
    input.value = "";
    showFeedback(feedback, "", "");
  });

  // Limpa feedback ao digitar
  input.addEventListener("input", () => {
    feedback.textContent = "";
    feedback.className = "keyword-feedback";
  });
}

function normalizeKeyword(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]/g, "");      // só letras e números
}

function showFeedback(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = "keyword-feedback" + (type ? ` ${type}` : "");
}

/* ═══════════════════════════════════════════════════════════
   SISTEMA DE DISTINTIVOS
═══════════════════════════════════════════════════════════ */
function unlockBadge(badgeId) {
  appState.unlockedBadges.push(badgeId);
  saveState();

  const badge = BADGES_DATA.find(b => b.id === badgeId);
  if (!badge) return;

  // Atualiza UI
  renderBadgesGrid();
  updateBadgeProgress();

  // Toast comemorativo
  showToast(`🎉 Distintivo desbloqueado: ${badge.emoji} ${badge.name}!`);

  // Nina reage
  const ninaText = document.getElementById("nina-text");
  if (ninaText) {
    ninaText.textContent = `UAU! Você desbloqueou o distintivo "${badge.name}"! Parabéns! 🎉`;
  }
}

function renderBadgesGrid() {
  const grid = document.getElementById("badges-grid");
  if (!grid) return;

  const totalPages = Math.ceil(BADGES_DATA.length / BADGES_PER_PAGE);
  const startIdx = currentBadgePage * BADGES_PER_PAGE;
  const pageBadges = BADGES_DATA.slice(startIdx, startIdx + BADGES_PER_PAGE);

  const chunks = [];
  for (let i = 0; i < pageBadges.length; i += 3) {
    chunks.push(pageBadges.slice(i, i + 3));
  }

  grid.innerHTML = chunks.map((chunk, index) => {
    return `
      <div class="signpost-plank plank-row-${index}">
        <div class="plank-nails"><div class="nail left"></div><div class="nail right"></div></div>
        <div class="badges-row">
          ${chunk.map(badge => {
      const isUnlocked = appState.unlockedBadges.includes(badge.id);
      return `
              <div class="badge-item ${isUnlocked ? "unlocked" : "locked"}"
                   title="${isUnlocked ? badge.description : "Ainda não desbloqueado"}">
                ${isUnlocked
          ? `<div class="badge-emoji">${badge.emoji}</div>`
          : `<div class="badge-locked-icon">🔒</div>`
        }
                <div class="${isUnlocked ? "badge-name" : "badge-locked-name"}">
                  ${isUnlocked ? badge.name : "???"}
                </div>
              </div>
            `;
    }).join("")}
        </div>
      </div>
    `;
  }).join("");

  // Controla exibição dos botões
  const prevBtn = document.getElementById("badges-prev-btn");
  const nextBtn = document.getElementById("badges-next-btn");
  if (prevBtn) prevBtn.style.display = currentBadgePage > 0 ? "flex" : "none";
  if (nextBtn) nextBtn.style.display = currentBadgePage < totalPages - 1 ? "flex" : "none";
}

function updateBadgeProgress() {
  const count = appState.unlockedBadges.length;
  const total = BADGES_DATA.length;
  const pct = total > 0 ? (count / total) * 100 : 0;

  const countEl = document.getElementById("badges-count");
  const barEl = document.getElementById("progress-bar");

  if (countEl) countEl.textContent = count;
  if (barEl) barEl.style.width = `${pct}%`;
}

/* ═══════════════════════════════════════════════════════════
   MODAL LIVRO – CONTEÚDO DAS PÁGINAS
   ─────────────────────────────────────────────────────────
   Cada item do array = uma página individual.
   2 páginas por spread (esquerda + direita).
   Para trocar textos: edite os campos html de cada objeto.
   Para trocar a imagem da Lira: troque o src em pg[0].html.
   Para adicionar páginas: acrescente objetos ao array (sempre em pares).
═══════════════════════════════════════════════════════════ */
const BOOK_PAGES = [

  /* ── PÁGINA 1 (esquerda, spread 0): Lira dá boas-vindas ── */
  {
    side: "left",
    pageNum: 1,
    html: `
      <div class="pg-lira-layout">
        <div class="pg-lira-top">
          <!-- Lira: troque o src pelo arquivo real quando tiver a arte -->
          <div class="lira-illustration">
            <img
              src="SVG/LIRA ARARA.svg"
              alt="Lira, a arara guia"
              class="lira-img"
              onerror="this.style.display='none'; this.parentElement.classList.add('lira-placeholder'); this.parentElement.textContent='\uD83E\uDD9C'"
            />
          </div>
          <div class="lira-speech">
            Olá, aventureiros! Eu sou a <strong>Lira</strong>, e vou acompanhá-los nesta jornada cheia de descobertas!
            Juntos, vamos cultivar hábitos saudáveis, fortalecer vínculos e criar memórias inesquecíveis.
          </div>
        </div>
        <div class="pg-lira-body">
          <div class="pg-welcome-badge">✦ Caderno de Descobertas ✦</div>
          <div class="pg-title">
            <span class="pg-emoji">🌿</span>
            Bem-vindos ao Caderno de Descobertas!
          </div>
          <p class="pg-text">
            Preparem-se para abrir este caderno e embarcar em uma <strong>aventura repleta de cuidado,
            alegria e novas descobertas</strong>! Cada atividade é um convite para explorar, aprender
            e viver momentos especiais <strong>em família</strong>.
          </p>
        </div>
        <div class="pg-number left">pág. 1</div>
      </div>
    `
  },

  /* ── PÁGINA 2 (direita, spread 0): Alimentação ────────── */
  {
    side: "right",
    pageNum: 2,
    html: `
      <div class="pg-cat-layout pg-cat-alimentacao">
        <h2 class="pg-cat-title">ALIMENTAÇÃO</h2>
        <div class="pg-activity-grid">
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
        </div>
      </div>
      <div class="pg-number right">pág. 2</div>
    `
  },

  /* ── PÁGINA 3 (esquerda, spread 1): Saúde & Movimento ── */
  {
    side: "left",
    pageNum: 3,
    html: `
      <div class="pg-cat-layout pg-cat-saude">
        <h2 class="pg-cat-title">SAÚDE &amp; MOVIMENTO</h2>
        <div class="pg-activity-grid">
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
        </div>
      </div>
      <div class="pg-number left">pág. 3</div>
    `
  },

  /* ── PÁGINA 4 (direita, spread 1): Criatividade ──────── */
  {
    side: "right",
    pageNum: 4,
    html: `
      <div class="pg-cat-layout pg-cat-criatividade">
        <h2 class="pg-cat-title">CRIATIVIDADE</h2>
        <div class="pg-activity-grid">
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
        </div>
      </div>
      <div class="pg-number right">pág. 4</div>
    `
  },

  /* ── PÁGINA 5 (esquerda, spread 2): Atividades Artísticas ── */
  {
    side: "left",
    pageNum: 5,
    html: `
      <div class="pg-cat-layout pg-cat-artes">
        <h2 class="pg-cat-title">ARTES</h2>
        <div class="pg-activity-grid">
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
        </div>
      </div>
      <div class="pg-number left">pág. 5</div>
    `
  },

  /* ── PÁGINA 6 (direita, spread 2): Ar Livre ─────────── */
  {
    side: "right",
    pageNum: 6,
    html: `
      <div class="pg-cat-layout pg-cat-arlivre">
        <h2 class="pg-cat-title">AR LIVRE</h2>
        <div class="pg-activity-grid">
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
          <div class="pg-activity-card"><span class="pg-ac-soon">Em breve</span></div>
        </div>
      </div>
      <div class="pg-number right">pág. 6</div>
    `
  }
];

/* ═══════════════════════════════════════════════════════════
   MODAL LIVRO – ESTADO E LÓGICA
═══════════════════════════════════════════════════════════ */
let bookCurrentSpread = 0;    // spread atual (0-based)
function getBookTotalSpreads() {
  return window.innerWidth <= 720 ? BOOK_PAGES.length : Math.ceil(BOOK_PAGES.length / 2);
}
let bookIsAnimating = false;  // trava durante a animação de flip

/** Retorna o HTML de uma página (i = índice absoluto em BOOK_PAGES) */
function getPageHTML(index) {
  if (index < 0 || index >= BOOK_PAGES.length) return "";
  return BOOK_PAGES[index].html;
}

/** Renderiza as páginas do spread atual sem animação */
function renderCurrentSpread() {
  const isMobile = window.innerWidth <= 720;
  const pageLeft = document.getElementById("book-page-left");
  const pageRight = document.getElementById("book-page-right");

  if (isMobile) {
    if (pageRight) pageRight.innerHTML = getPageHTML(bookCurrentSpread);
  } else {
    const leftIdx = bookCurrentSpread * 2;
    const rightIdx = bookCurrentSpread * 2 + 1;
    if (pageLeft) pageLeft.innerHTML = getPageHTML(leftIdx);
    if (pageRight) pageRight.innerHTML = getPageHTML(rightIdx);
  }

  updateBookNav();
}

/** Atualiza botões e dots */
function updateBookNav() {
  const prev = document.getElementById("book-prev");
  const next = document.getElementById("book-next");
  const dots = document.getElementById("book-dots");

  const totalSpreads = getBookTotalSpreads();
  if (prev) prev.disabled = bookCurrentSpread === 0;
  if (next) next.disabled = bookCurrentSpread === totalSpreads - 1;

  if (dots) {
    dots.innerHTML = "";
    for (let i = 0; i < totalSpreads; i++) {
      const dot = document.createElement("button");
      dot.className = `book-dot${i === bookCurrentSpread ? " active" : ""}`;
      dot.setAttribute("aria-label", `Ir para a página ${i * 2 + 1}`);
      dot.addEventListener("click", () => goToSpread(i));
      dots.appendChild(dot);
    }
  }
}

/** Vai direto para um spread (sem flip) */
function goToSpread(index) {
  if (bookIsAnimating || index === bookCurrentSpread) return;
  bookCurrentSpread = index;
  renderCurrentSpread();
}

/* ── ANIMAÇÃO DE VIRAR PÁGINA ────────────────────────────── */

/**
 * Executa o flip para frente (spread + 1).
 * Técnica:
 *   1. flipper cobre a página DIREITA do spread atual
 *   2. face frontal = conteúdo atual da página direita
 *   3. face traseira = página ESQUERDA do próximo spread
 *   4. flip rotateY(0 → -180deg) com transform-origin: left
 *   5. após animação: atualiza páginas, esconde flipper
 */
function flipForward() {
  const totalSpreads = getBookTotalSpreads();
  if (bookIsAnimating || bookCurrentSpread >= totalSpreads - 1) return;
  bookIsAnimating = true;

  const isMobile = window.innerWidth <= 720;

  const flipper = document.getElementById("book-flipper");
  const front = document.getElementById("flipper-front");
  const back = document.getElementById("flipper-back");
  const pagesWrapper = flipper.parentElement;

  if (isMobile) {
    front.innerHTML = getPageHTML(bookCurrentSpread);
    bookCurrentSpread++;
    document.getElementById("book-page-right").innerHTML = getPageHTML(bookCurrentSpread);
    flipper.style.left = `0px`;
    flipper.style.width = `100%`;
    flipper.style.transformOrigin = "left center";
    flipper.style.display = "block";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flipper.classList.add("flipping-forward");
      });
    });

    setTimeout(() => {
      flipper.style.display = "none";
      flipper.className = "book-flipper";
      updateBookNav();
      bookIsAnimating = false;
    }, 580);
    return;
  }

  /* Conteúdo das faces (Desktop) */
  const curRightIdx = bookCurrentSpread * 2 + 1;
  const nextLeftIdx = (bookCurrentSpread + 1) * 2;
  front.innerHTML = getPageHTML(curRightIdx);
  back.innerHTML = getPageHTML(nextLeftIdx);

  /* Posiciona o flipper sobre a página direita */
  const leftPage = document.getElementById("book-page-left");
  const spine = pagesWrapper.querySelector(".book-center-spine");
  const spineWidth = spine ? spine.offsetWidth : 28;
  const halfWidth = (pagesWrapper.offsetWidth - spineWidth) / 2;

  flipper.style.left = `calc(50% + ${spineWidth / 2}px)`;
  flipper.style.width = `${halfWidth}px`;
  flipper.style.transformOrigin = "left center";
  flipper.style.display = "block";

  /* Dispara animação: double-rAF garante que o browser renderiza
     o flipper (display:block) antes de iniciar a transição CSS */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flipper.classList.add("flipping-forward");
    });
  });

  /* Após animação: limpa e atualiza */
  setTimeout(() => {
    bookCurrentSpread++;
    flipper.style.display = "none";
    flipper.className = "book-flipper";
    renderCurrentSpread();
    bookIsAnimating = false;
  }, 580);
}

/**
 * Executa o flip para trás (spread - 1).
 *   1. flipper cobre a página ESQUERDA do spread atual
 *   2. face frontal = conteúdo atual da página esquerda
 *   3. face traseira = página DIREITA do spread anterior
 *   4. flip rotateY(0 → 180deg) com transform-origin: right
 */
function flipBackward() {
  if (bookIsAnimating || bookCurrentSpread <= 0) return;
  bookIsAnimating = true;

  const isMobile = window.innerWidth <= 720;

  const flipper = document.getElementById("book-flipper");
  const front = document.getElementById("flipper-front");
  const back = document.getElementById("flipper-back");
  const pagesWrapper = flipper.parentElement;

  if (isMobile) {
    front.innerHTML = getPageHTML(bookCurrentSpread);
    bookCurrentSpread--;
    document.getElementById("book-page-right").innerHTML = getPageHTML(bookCurrentSpread);
    flipper.style.left = `0px`;
    flipper.style.width = `100%`;
    flipper.style.transformOrigin = "right center";
    flipper.style.display = "block";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flipper.classList.add("flipping-backward");
      });
    });

    setTimeout(() => {
      flipper.style.display = "none";
      flipper.className = "book-flipper";
      updateBookNav();
      bookIsAnimating = false;
    }, 580);
    return;
  }

  const curLeftIdx = bookCurrentSpread * 2;
  const prevRightIdx = (bookCurrentSpread - 1) * 2 + 1;
  front.innerHTML = getPageHTML(curLeftIdx);
  back.innerHTML = getPageHTML(prevRightIdx);

  const spine = pagesWrapper.querySelector(".book-center-spine");
  const spineWidth = spine ? spine.offsetWidth : 28;
  const halfWidth = (pagesWrapper.offsetWidth - spineWidth) / 2;

  flipper.style.left = `0px`;
  flipper.style.width = `${halfWidth}px`;
  flipper.style.transformOrigin = "right center";
  flipper.style.display = "block";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flipper.classList.add("flipping-backward");
    });
  });

  setTimeout(() => {
    bookCurrentSpread--;
    flipper.style.display = "none";
    flipper.className = "book-flipper";
    renderCurrentSpread();
    bookIsAnimating = false;
  }, 580);
}

/* ── ABRIR / FECHAR LIVRO ────────────────────────────────── */

/** Mostra o overlay com a CAPA FECHADA (largura de uma pagina) */
function openBook() {
  const overlay = document.getElementById("book-modal-overlay");
  if (!overlay) return;

  bookCurrentSpread = 0;
  overlay.hidden = false;
  overlay.removeAttribute("aria-hidden");
  document.body.classList.add("has-overlay");
  document.body.style.overflow = "hidden";

  /* Shell: comeca com uma pagina de largura (livro fechado) */
  const shell = document.getElementById("book-shell");
  if (shell) {
    shell.classList.remove("is-open");
    shell.classList.add("is-closed");
  }

  /* Garante estado correto: capa visivel, paginas escondidas */
  const coverPanel = document.getElementById("book-cover-panel");
  const pagesWrapper = document.getElementById("book-pages-wrapper");
  if (coverPanel) {
    coverPanel.classList.remove("is-opening", "is-open");
    coverPanel.style.display = "";
  }
  if (pagesWrapper) {
    pagesWrapper.classList.remove("is-visible");
  }

  renderCurrentSpread();

  setTimeout(() => {
    document.getElementById("btn-open-cover")?.focus();
  }, 150);
}

/** Anima a capa virando e expande o shell para duas paginas */
function openBookCover() {
  const coverPanel = document.getElementById("book-cover-panel");
  const pagesWrapper = document.getElementById("book-pages-wrapper");
  const shell = document.getElementById("book-shell");
  if (!coverPanel) return;

  /* 1. Capa comeca a girar */
  coverPanel.classList.add("is-opening");

  /* 2. Shell expande simultaneamente (uma pagina -> duas paginas) */
  if (shell) {
    shell.classList.remove("is-closed");
    shell.classList.add("is-open");
  }

  /* 3. Em ~340ms capa ja passou dos 90deg (invisivel):
        momento certo para revelar as paginas por baixo */
  setTimeout(() => {
    if (pagesWrapper) pagesWrapper.classList.add("is-visible");
  }, 340);

  /* 4. Apos animacao completa: esconde a capa definitivamente */
  setTimeout(() => {
    coverPanel.classList.add("is-open");
    coverPanel.classList.remove("is-opening");
    document.getElementById("book-next")?.focus();
  }, 720);
}

function closeBook() {
  const overlay = document.getElementById("book-modal-overlay");
  if (!overlay) return;

  const modal = document.getElementById("book-modal");
  if (modal) {
    modal.style.transition = "opacity 0.28s ease, transform 0.28s ease";
    modal.style.opacity = "0";
    modal.style.transform = "scale(0.92) translateY(20px)";
  }

  setTimeout(() => {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    if (modal) {
      modal.style.opacity = "";
      modal.style.transform = "";
      modal.style.transition = "";
    }
    const anyOpen = [...document.querySelectorAll(".overlay")].some(o => !o.hidden);
    if (!anyOpen) {
      document.body.classList.remove("has-overlay");
      document.body.style.overflow = "";
    }
  }, 300);
}

/* ── INIT LIVRO ────────────────────────────────────────────── */
function initBook() {
  document.getElementById("book-next")?.addEventListener("click", flipForward);
  document.getElementById("book-prev")?.addEventListener("click", flipBackward);
  document.getElementById("btn-open-cover")?.addEventListener("click", openBookCover);
  document.getElementById("book-close-btn")?.addEventListener("click", closeBook);
  document.getElementById("book-backdrop")?.addEventListener("click", closeBook);

  document.addEventListener("keydown", (e) => {
    const overlay = document.getElementById("book-modal-overlay");
    if (overlay?.hidden) return;
    const pagesVisible = document.getElementById("book-pages-wrapper")?.classList.contains("is-visible");
    if (!pagesVisible) return; /* so navega se o livro estiver aberto */
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); flipForward(); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); flipBackward(); }
    if (e.key === "Escape") closeBook();
  });
}

/* ═══════════════════════════════════════════════════════════
   BOTÕES PRINCIPAIS
═══════════════════════════════════════════════════════════ */
function initButtons() {
  /* Ver atividades → abre o livro */
  document.getElementById("btn-atividades")?.addEventListener("click", openBook);

  /* Ver distintivos */
  document.getElementById("btn-distintivos")?.addEventListener("click", () => {
    openOverlay("overlay-distintivos");
  });

  /* Dicas e Ajuda → reabre o tutorial */
  document.getElementById("btn-dicas")?.addEventListener("click", () => {
    if (typeof startTutorial === 'function') {
      startTutorial();
    } else {
      showToast("💡 Explore as atividades, encontre palavras-chave e desbloqueie distintivos!");
    }
  });

  /* Configurações */
  document.getElementById("btn-settings")?.addEventListener("click", () => {
    const familyName = localStorage.getItem("familyName") || "Ilha da Família Silva";
    const familyNameEl = document.getElementById("settings-family-name");
    if (familyNameEl) familyNameEl.textContent = familyName;
    openOverlay("overlay-settings");
  });

  /* Logout */
  document.getElementById("btn-logout")?.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
  });
}

/* ═══════════════════════════════════════════════════════════
   OVERLAYS DISTINIVOS
═══════════════════════════════════════════════════════════ */
function initOverlays() {
  document.getElementById("close-distintivos")?.addEventListener("click", () => {
    closeOverlay("overlay-distintivos");
  });
  document.getElementById("backdrop-distintivos")?.addEventListener("click", () => {
    closeOverlay("overlay-distintivos");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("overlay-distintivos")?.hidden) {
      closeOverlay("overlay-distintivos");
    }
    if (e.key === "Escape" && !document.getElementById("overlay-settings")?.hidden) {
      closeOverlay("overlay-settings");
    }
  });

  /* Settings overlay close handlers */
  document.getElementById("close-settings")?.addEventListener("click", () => {
    closeOverlay("overlay-settings");
  });
  document.getElementById("backdrop-settings")?.addEventListener("click", () => {
    closeOverlay("overlay-settings");
  });
}

function openOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  document.body.classList.add("has-overlay");
  // Bloqueia scroll do fundo
  document.body.style.overflow = "hidden";
  // Foco no fechar para acessibilidade
  setTimeout(() => {
    const closeBtn = el.querySelector(".overlay-close") || el.querySelector(".board-close-btn");
    closeBtn?.focus();
  }, 100);
}

function closeOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // Animação de saída
  const panel = el.querySelector(".overlay-panel") || el.querySelector(".board-modal");
  if (panel) {
    panel.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    panel.style.opacity = "0";
    panel.style.transform = "scale(0.92)";
    setTimeout(() => {
      el.hidden = true;
      panel.style.opacity = "";
      panel.style.transform = "";
      panel.style.transition = "";
    }, 260);
  } else {
    el.hidden = true;
  }

  // Só remove se todos overlays estiverem fechados
  const allOverlays = document.querySelectorAll(".overlay");
  const anyOpen = [...allOverlays].some(o => !o.hidden);
  if (!anyOpen) {
    document.body.classList.remove("has-overlay");
    document.body.style.overflow = "";
  }
}

/* ═══════════════════════════════════════════════════════════
   SOM
═══════════════════════════════════════════════════════════ */
function initSoundToggle() {
  const btn = document.getElementById("btn-sound");
  if (!btn) return;

  updateSoundButton(btn);

  btn.addEventListener("click", () => {
    appState.soundEnabled = !appState.soundEnabled;
    saveState();
    updateSoundButton(btn);
    showToast(appState.soundEnabled ? "🔊 Som ativado!" : "🔇 Som desativado!");
  });
}

function updateSoundButton(btn) {
  if (!btn) return;
  const muted = !appState.soundEnabled;
  btn.classList.toggle("muted", muted);
  btn.setAttribute("aria-label", muted ? "Ativar som" : "Desativar som");
  btn.innerHTML = `<img src="SVG/ícone som.svg" alt="Som" aria-hidden="true" class="control-icon${muted ? ' icon-muted' : ''}" />`;
}

/* ═══════════════════════════════════════════════════════════
   TOAST DE NOTIFICAÇÃO
═══════════════════════════════════════════════════════════ */
let toastTimer = null;

function showToast(msg, type = "success", duration = 3200) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* ═══════════════════════════════════════════════════════════
   UTILITÁRIOS
═══════════════════════════════════════════════════════════ */
function shakeElement(el) {
  el.classList.remove("shake");
  void el.offsetWidth; // reflow para reiniciar animação
  el.classList.add("shake");
  setTimeout(() => el.classList.remove("shake"), 500);
}

/* ═══════════════════════════════════════════════════════════
   PERSISTÊNCIA DE ESTADO (localStorage)
═══════════════════════════════════════════════════════════ */
const STATE_KEY = "caderno_appState";

function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      soundEnabled: appState.soundEnabled,
      unlockedBadges: appState.unlockedBadges,
    }));
  } catch (e) {
    console.warn("[Caderno] Erro ao salvar estado:", e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (typeof saved.soundEnabled === "boolean") appState.soundEnabled = saved.soundEnabled;
    if (Array.isArray(saved.unlockedBadges)) appState.unlockedBadges = saved.unlockedBadges;
  } catch (e) {
    console.warn("[Caderno] Erro ao carregar estado:", e);
  }
}

/* ═══════════════════════════════════════════════════════════
   BOOT — Ponto de entrada principal
   Chamado quando o DOM está completamente carregado.
═══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Restaura estado salvo
  loadState();

  // 2. Inicializa todos os módulos de UI
  initNina();
  initKeywordForm();
  initBook();
  initButtons();
  initOverlays();
  initSoundToggle();

  // 3. Tutorial (registra listeners e verifica auto-start no 1º acesso)
  if (typeof initTutorial === "function") initTutorial();

  // 4. Renderiza badges e progresso com estado recuperado
  renderBadgesGrid();
  updateBadgeProgress();

  console.log("[Caderno] Site inicializado com sucesso! ✅");
});
