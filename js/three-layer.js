import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Variáveis globais do Three.js
let scene, camera, renderer, controls;
let activeModels = {}; // Guarda os modelos já carregados (como as árvores)

function initThreeJS() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  // 1. Configurar Renderer
  // Removido alpha: true, pois agora preenchemos o fundo com uma cor, 
  // mas vamos deixar alpha para o sky-bg aparecer caso haja um.
  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Melhoria de Cores (Deixa as cores mais vivas e cinematográficas)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // 2. Cena e Câmera
  scene = new THREE.Scene();
  // Se quiser um fundo sólido  // Aproximamos bastante a câmera para a ilha ficar maior na tela!
  // (Antes estava 0, 1000, 2000)
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);

  // Câmera afastada para visão geral da ilha
  camera.position.set(0, 5, 20);

  // 3. Controles (OrbitControls) - Permite girar a ilha como no Spline!
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);

  // 4. Iluminação (Suavizada e preenchida por baixo)
  // HemisphereLight: Primeira cor é o céu (vinda de cima), segunda cor é o chão (vinda de baixo).
  // Mudei a cor de baixo para ficar bem mais clara (0x888899).
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888899, 1.2);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  // Luz ambiente global para garantir que nenhuma sombra fique 100% preta
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Luz do sol principal (reduzi um pouquinho a força para não estourar)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(100, 200, 100);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Luz vinda exatamente de BAIXO PARA CIMA para "matar" as sombras duras do chão
  const bottomLight = new THREE.DirectionalLight(0xffffff, 1.0);
  bottomLight.position.set(0, -200, 0); // O "Y" negativo faz a luz vir do subsolo apontando pra cima
  scene.add(bottomLight);

  // Luz extra vindo de trás
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-100, 100, -100);
  scene.add(fillLight);

  // Lidar com redimensionamento
  window.addEventListener('resize', onWindowResize, false);

  // 5. CARREGAR A ILHA BASE
  carregarIlhaBase();

  // Iniciar loop de renderização
  animate();
  console.log("[ThreeLayer] Motor Inicializado com sucesso.");
}

function carregarIlhaBase() {
  const loader = new GLTFLoader();
  loader.load(
    'GLB/ilha.glb',
    function (gltf) {
      const ilha = gltf.scene;

      // Centralizar a ilha
      ilha.position.set(0, 0, 0);

      // Ajustar escala da Ilha Base (Se ainda estiver pequena, troque 1 para 2, 3, etc)
      ilha.scale.set(1, 1, 1);

      scene.add(ilha);
      console.log("[ThreeLayer] Ilha base carregada!");
    },
    function (xhr) {
      console.log(`[ThreeLayer] Ilha: ${Math.round(xhr.loaded / xhr.total * 100)}% carregada`);
    },
    function (error) {
      console.error("[ThreeLayer] Erro ao carregar a Ilha Base:", error);
    }
  );
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update(); // Necessário para o damping (suavidade)
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// -----------------------------------------------------------------
// FUNÇÃO GLOBAL DE DESBLOQUEIO DAS ÁRVORES (Chamada pelo island-unlock.js)
// -----------------------------------------------------------------
window.unlockThreeJSItem = function (glbPath, targetScale, keyword) {
  if (!scene) {
    console.warn("[ThreeLayer] Cena não inicializada!");
    return;
  }

  if (activeModels[keyword]) {
    console.log("[ThreeLayer] Modelo " + keyword + " já foi carregado.");
    return;
  }

  console.log("[ThreeLayer] Carregando árvore:", glbPath);
  const loader = new GLTFLoader();

  loader.load(
    glbPath,
    function (gltf) {
      const model = gltf.scene;

      // Ajustes iniciais: Posição onde a árvore deve nascer.
      // Você terá que ajustar X, Y, Z para casar exatamente com o buraco na ilha.
      model.position.set(0, 0, 0);

      // Começa com escala 0 para a animação de "crescimento"
      model.scale.set(0.001, 0.001, 0.001);

      scene.add(model);
      activeModels[keyword] = model;

      // Inicia a animação de escala
      animateModelScale(model, targetScale || 1);
    },
    undefined,
    function (error) {
      console.error("[ThreeLayer] Erro ao carregar a árvore:", error);
    }
  );
};

// -----------------------------------------------------------------
// FUNÇÃO GLOBAL PARA RESTAURAR (Chamada ao recarregar a página)
// -----------------------------------------------------------------
window.restoreThreeJSItem = function (glbPath, targetScale, keyword) {
  if (!scene) return;
  if (activeModels[keyword]) return;

  const loader = new GLTFLoader();
  loader.load(glbPath, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(targetScale, targetScale, targetScale);
    scene.add(model);
    activeModels[keyword] = model;
  });
};

// -----------------------------------------------------------------
// REPLAY: Remove o modelo existente e re-anima do zero (para re-entradas)
// -----------------------------------------------------------------
window.replayThreeJSItem = function (glbPath, targetScale, keyword) {
  if (!scene) return;

  // Remove o modelo antigo se existir
  if (activeModels[keyword]) {
    scene.remove(activeModels[keyword]);
    activeModels[keyword] = null;
  }

  // Recarrega e anima novamente
  console.log("[ThreeLayer] Replaying modelo:", glbPath);
  const loader = new GLTFLoader();
  loader.load(
    glbPath,
    function (gltf) {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(0.001, 0.001, 0.001);
      scene.add(model);
      activeModels[keyword] = model;
      animateModelScale(model, targetScale || 1);
    },
    undefined,
    function (error) {
      console.error("[ThreeLayer] Erro ao recarregar modelo:", error);
    }
  );
};


function animateModelScale(model, targetScale) {
  const duration = 1200;
  const startTime = performance.now();
  const startScale = 0.001;

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const scale = startScale + (targetScale - startScale) * easeOutBack(progress);
    model.scale.set(scale, scale, scale);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      model.scale.set(targetScale, targetScale, targetScale);
      console.log("[ThreeLayer] Crescimento da arvore concluido.");
    }
  }
  requestAnimationFrame(step);
}

// Inicia assim que o script é carregado
initThreeJS();
