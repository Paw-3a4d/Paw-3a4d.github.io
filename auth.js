(function () {
  "use strict";
  const CHAVE = "empresaEficienciaContas_v1";
  const lerContas = () => {
    try { return JSON.parse(localStorage.getItem(CHAVE) || "[]"); }
    catch (_) { return []; }
  };
  const mostrarErro = (id, mensagem) => {
    const campo = document.getElementById(id);
    if (campo) campo.textContent = mensagem;
  };

  const cadastro = document.getElementById("form-cadastro");
  if (cadastro) {
    cadastro.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const dados = Object.fromEntries(new FormData(cadastro).entries());
      const email = dados.email.trim().toLowerCase();
      if (dados.senha !== dados.confirmar) return mostrarErro("cadastro-erro", "As senhas não coincidem.");
      const contas = lerContas();
      if (contas.some(conta => conta.email.toLowerCase() === email)) return mostrarErro("cadastro-erro", "Este e-mail já está cadastrado.");
      const conta = {
        nome: dados.nome.trim(),
        responsavel: dados.nome.trim(),
        cargo: dados.cargo.trim(),
        setor: dados.setor.trim(),
        empresa: dados.setor.trim() || "",
        ramo: dados.cargo.trim() || "",
        email,
        senha: dados.senha
      };
      contas.push(conta);
      localStorage.setItem(CHAVE, JSON.stringify(contas));
      localStorage.setItem("empresaEficienciaSessao", JSON.stringify({ nome: conta.nome, responsavel: conta.nome, cargo: conta.cargo, setor: conta.setor, empresa: conta.empresa, ramo: conta.ramo, email }));
      window.location.href = "index.html";
    });
  }

  const login = document.getElementById("form-login");
  if (login) {
    login.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const dados = Object.fromEntries(new FormData(login).entries());
      const email = dados.email.trim().toLowerCase();
      const conta = lerContas().find(item => item.email.toLowerCase() === email && item.senha === dados.senha);
      if (!conta) return mostrarErro("login-erro", "E-mail ou senha incorretos. Confira seus dados ou faça o cadastro de funcionário.");
      localStorage.setItem("empresaEficienciaSessao", JSON.stringify({ nome: conta.nome || conta.responsavel, responsavel: conta.nome || conta.responsavel, cargo: conta.cargo || conta.ramo || "", setor: conta.setor || conta.empresa || "", empresa: conta.setor || conta.empresa || "", ramo: conta.cargo || conta.ramo || "", email: conta.email }));
      window.location.href = "index.html";
    });
  }
})();
