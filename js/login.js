document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const signupSection = document.getElementById("signup-section");
  const btnGoSignup = document.getElementById("btn-go-signup");
  const btnGoLogin = document.getElementById("btn-go-login");
  const loginTitle = document.querySelector(".login-title");
  const loginSubtitle = document.querySelector(".login-subtitle");

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  const loginHeader = document.querySelector(".login-header");

  // Transição para Criar Conta
  btnGoSignup.addEventListener("click", () => {
    loginSection.classList.remove("is-active");
    signupSection.classList.add("is-active");

    loginHeader.style.opacity = 0;
    setTimeout(() => {
      loginTitle.textContent = "Crie sua Conta";
      loginSubtitle.textContent = "Junte-se à aventura na ilha mágica.";
      loginHeader.style.opacity = 1;
    }, 300);
  });

  // Transição para Fazer Login
  btnGoLogin.addEventListener("click", () => {
    signupSection.classList.remove("is-active");
    loginSection.classList.add("is-active");

    loginHeader.style.opacity = 0;
    setTimeout(() => {
      loginTitle.textContent = "Bem-vindo(a) de volta!";
      loginSubtitle.textContent = "Entre para continuar sua jornada na ilha.";
      loginHeader.style.opacity = 1;
    }, 300);
  });

  // Mock Submit Login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector("button[type='submit']");
    btn.textContent = "Entrando...";
    btn.style.opacity = "0.8";

    // Para login, pula o tutorial configurando a chave
    localStorage.setItem("caderno-descobertas-tutorial-visto", "1");
    localStorage.setItem("isLoggedIn", "true");

    setTimeout(() => {
      window.location.href = "home.html";
    }, 800);
  });

  // Mock Submit Cadastro
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const familyName = document.getElementById("signup-family").value;
    if (familyName) {
      localStorage.setItem("familyName", familyName);
    }

    const btn = signupForm.querySelector("button[type='submit']");
    btn.textContent = "Criando conta...";
    btn.style.opacity = "0.8";

    // Para cadastro, remove a chave para forçar o início do tutorial
    localStorage.removeItem("caderno-descobertas-tutorial-visto");
    localStorage.setItem("isLoggedIn", "true");

    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  });
});
