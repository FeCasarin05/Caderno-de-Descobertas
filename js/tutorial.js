/* ════════════════════════════════════════════════════════════
   TUTORIAL ONBOARDING – Caderno de Descobertas
   Personagens: Nina (capivara guardiã) & Lira (arara aventureira)
════════════════════════════════════════════════════════════ */

'use strict';

/* ── Chave de localStorage ────────────────────────────────── */
const TUTORIAL_KEY = 'caderno-descobertas-tutorial-visto';

/* ── Definição dos 8 passos ───────────────────────────────── */
const TUTORIAL_STEPS = [
  {
    char: 'nina',
    charName: 'Nina',
    charEmoji: '🦫',
    highlight: null,          /* Passo 1: apresentação geral, sem destaque */
    text: 'Olá! Eu sou a Nina, guardiã desta ilha. Por aqui, cada cantinho guarda descobertas para viver em família.'
  },
  {
    char: 'nina',
    charName: 'Nina',
    charEmoji: '🦫',
    highlight: null,          /* Passo 2: visão geral da ilha */
    text: 'Esta é a sua ilha de descobertas! Vocês podem clicar e arrastar a tela para girar e explorar cada detalhe dela de pertinho.'
  },
  {
    char: 'nina',
    charName: 'Nina',
    charEmoji: '🦫',
    highlight: 'btn-distintivos',
    text: 'Os distintivos mostram as conquistas da família. Conforme vocês participam das atividades, novas descobertas e medalhas podem ser desbloqueadas.'
  },
  {
    char: 'nina',
    charName: 'Nina',
    charEmoji: '🦫',
    highlight: null,          /* Passo 4: Nina chama a Lira */
    text: 'Agora vou chamar a Lira! Ela adora aventuras e vai mostrar como acessar nosso grande livro.',
    btn: 'Conhecer a Lira ✨'
  },
  {
    char: 'lira',
    charName: 'Lira',
    charEmoji: '🦜',
    highlight: null,          /* Passo 5: Lira se apresenta */
    position: 'left',
    text: 'Caa-caw! Olá, exploradores destemidos! Eu sou a Lira, a arara guia desta grande jornada. Preparados para desbravar os mistérios da ilha?'
  },
  {
    char: 'lira',
    charName: 'Lira',
    charEmoji: '🦜',
    highlight: 'btn-atividades',
    position: 'left',
    text: "É aqui em 'Ver atividades' que vocês abrem o nosso grande Livro de Aventuras! Nele, vocês encontrarão desafios incríveis para viver momentos épicos em família!"
  },
  {
    char: 'lira',
    charName: 'Lira',
    charEmoji: '🦜',
    highlight: 'keyword-form',
    position: 'right',
    text: 'Fiquem de olhos bem abertos! Algumas aventuras escondem palavras secretas. Quando encontrarem uma, digitem aqui para desbloquear tesouros e conquistas lendárias!'
  },
  {
    char: 'lira',
    charName: 'Lira',
    charEmoji: '🦜',
    highlight: 'btn-dicas',
    position: 'right',
    text: 'Se ficarem perdidos na expedição, é só me chamar aqui nas dicas. Peguem suas mochilas... A nossa grande aventura vai começar!',
    btn: 'Começar exploração 🚀'
  }
];

/* ── Estado interno ───────────────────────────────────────── */
let tutorialStep = 0;
let tutorialActive = false;
let tutorialAnimLock = false; /* impede cliques duplos durante fade */

/* ════════════════════════════════════════════════════════════
   FUNÇÕES PÚBLICAS
════════════════════════════════════════════════════════════ */

/** Verifica localStorage e abre automaticamente no 1º acesso */
function checkAutoStartTutorial() {
  if (!localStorage.getItem(TUTORIAL_KEY)) {
    /* Aguarda a HOME carregar visualmente antes de exibir */
    setTimeout(() => startTutorial(), 1400);
  }
}

/** Abre o tutorial a partir do passo 1 */
function startTutorial() {
  tutorialStep = 0;
  tutorialActive = true;

  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) return;

  overlay.hidden = false;
  overlay.classList.add('is-active');
  overlay.removeAttribute('aria-hidden');

  /* Esconde Nina fixa da HOME */
  document.body.classList.add('tutorial-active');

  /* Renderiza o primeiro passo (sem animação de troca) */
  applyStep(tutorialStep);
}

/** Avança para o próximo passo */
function nextTutorialStep() {
  if (tutorialAnimLock) return;
  if (tutorialStep >= TUTORIAL_STEPS.length - 1) {
    finishTutorial();
    return;
  }
  tutorialStep++;
  animateStepChange();
}

/** Volta para o passo anterior */
function previousTutorialStep() {
  if (tutorialAnimLock || tutorialStep <= 0) return;
  tutorialStep--;
  animateStepChange();
}

/** Pula o tutorial */
function skipTutorial() {
  finishTutorial();
}

/** Finaliza e salva no localStorage */
function finishTutorial() {
  localStorage.setItem(TUTORIAL_KEY, '1');
  tutorialActive = false;

  clearAllHighlights();

  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.38s ease';
    setTimeout(() => {
      overlay.hidden = true;
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.opacity = '';
      overlay.style.transition = '';

      /* Esconde personagens do tutorial */
      hideChar('tutorial-nina');
      hideChar('tutorial-lira');

      /* Restaura Nina fixa da HOME */
      document.body.classList.remove('tutorial-active');
    }, 400);
  }
}

/* ════════════════════════════════════════════════════════════
   FUNÇÕES INTERNAS
════════════════════════════════════════════════════════════ */

/** Aplica o conteúdo do passo atual ao DOM */
function applyStep(index) {
  const step = TUTORIAL_STEPS[index];
  const total = TUTORIAL_STEPS.length;
  const isLast = index === total - 1;
  const isFirst = index === 0;

  /* ─── Texto e badge ─── */
  const elText = document.getElementById('tutorial-text');
  const elEmoji = document.getElementById('tutorial-char-emoji');
  const elName = document.getElementById('tutorial-char-name');
  const badge = document.getElementById('tutorial-char-badge');

  if (elText) elText.textContent = step.text;
  if (elEmoji) elEmoji.textContent = step.charEmoji;
  if (elName) elName.textContent = step.charName;

  if (badge) {
    badge.className = 'tutorial-char-badge char-' + step.char;
  }

  /* ─── Botão próximo ─── */
  const nextBtn = document.getElementById('tutorial-next');
  if (nextBtn) {
    const label = step.btn || (isLast ? 'Começar exploração 🚀' : 'Próximo →');
    nextBtn.textContent = label;
  }

  /* ─── Botão voltar ─── */
  const prevBtn = document.getElementById('tutorial-prev');
  if (prevBtn) prevBtn.hidden = isFirst;

  /* ─── Pular ─── */
  const skipBtn = document.getElementById('tutorial-skip');
  if (skipBtn) skipBtn.hidden = isLast;

  /* ─── Dots ─── */
  renderDots(index, total);

  /* ─── Highlight ─── */
  clearAllHighlights();
  const backdrop = document.getElementById('tutorial-backdrop');
  if (step.highlight) {
    const el = document.getElementById(step.highlight);
    if (el) {
      el.classList.add('tutorial-highlight');
      if (backdrop) {
        backdrop.classList.add('has-hole');
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Raio do spotlight: um pouco maior que o elemento
        const rx = Math.max(rect.width / 2 + 24, 45);
        const ry = Math.max(rect.height / 2 + 24, 45);

        backdrop.style.setProperty('--hole-x', `${cx}px`);
        backdrop.style.setProperty('--hole-y', `${cy}px`);
        backdrop.style.setProperty('--hole-rx', `${rx}px`);
        backdrop.style.setProperty('--hole-ry', `${ry}px`);
      }
    }
  } else {
    if (backdrop) {
      backdrop.classList.remove('has-hole');
    }
  }

  /* ─── Personagens ─── */
  updateChars(step.char, step.position);
}

/** Fade suave ao trocar de passo */
function animateStepChange() {
  tutorialAnimLock = true;
  const bubble = document.getElementById('tutorial-bubble');

  if (bubble) {
    /* Fade out */
    bubble.classList.add('step-fade');
    setTimeout(() => {
      applyStep(tutorialStep);
      /* Fade in */
      bubble.classList.remove('step-fade');
      bubble.classList.add('step-show');
      setTimeout(() => {
        bubble.classList.remove('step-show');
        tutorialAnimLock = false;
      }, 240);
    }, 160);
  } else {
    applyStep(tutorialStep);
    tutorialAnimLock = false;
  }
}

/** Mostra/esconde personagens conforme quem está falando */
function updateChars(activeChar, position) {
  const ninaEl = document.getElementById('tutorial-nina');
  const liraEl = document.getElementById('tutorial-lira');

  if (activeChar === 'nina') {
    showChar(ninaEl);
    hideChar(liraEl);
  } else {
    const isChangingSide = (position === 'right') !== liraEl.classList.contains('pos-right');

    if (position === 'right') {
      liraEl.classList.add('pos-right');
    } else {
      liraEl.classList.remove('pos-right');
    }

    if (isChangingSide) {
      liraEl.classList.remove('is-visible');
      showChar(liraEl);
    } else {
      showChar(liraEl);
    }

    hideChar(ninaEl);
  }
}

function showChar(el) {
  if (!el) return;
  el.style.display = '';
  /* double-rAF para garantir transição CSS após display */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add('is-visible');
    });
  });
}

function hideChar(el) {
  if (!el) return;
  if (typeof el === 'string') el = document.getElementById(el);
  if (!el) return;
  el.classList.remove('is-visible');
}

/** Renderiza os dots de progresso */
function renderDots(current, total) {
  const container = document.getElementById('tutorial-dots');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.className = 'tutorial-dot';
    if (i < current) dot.classList.add('done');
    if (i === current) dot.classList.add('active');
    container.appendChild(dot);
  }
}

/** Remove .tutorial-highlight de qualquer elemento que o tenha */
function clearAllHighlights() {
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });
}

/* ════════════════════════════════════════════════════════════
   INIT – registra listeners e verifica auto-start
════════════════════════════════════════════════════════════ */
function initTutorial() {
  /* Botões do balão */
  document.getElementById('tutorial-next')
    ?.addEventListener('click', nextTutorialStep);
  document.getElementById('tutorial-prev')
    ?.addEventListener('click', previousTutorialStep);
  document.getElementById('tutorial-skip')
    ?.addEventListener('click', skipTutorial);

  /* Teclado */
  document.addEventListener('keydown', (e) => {
    if (!tutorialActive) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); nextTutorialStep(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); previousTutorialStep(); }
    if (e.key === 'Escape') { e.preventDefault(); skipTutorial(); }
  });

  /* Auto-start no 1º acesso */
  checkAutoStartTutorial();
}

/* Expõe para uso externo (btn-dicas em script.js) */
window.startTutorial = startTutorial;
