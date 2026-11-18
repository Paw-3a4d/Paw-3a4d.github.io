/* Portal E&E + módulo Empresa+Eficiência
   Os dados do módulo adicional são armazenados localmente no navegador. */
(function () {
  "use strict";
  const root = document.getElementById("empresa-eficiencia");
  if (!root) return;
  const sessao = JSON.parse(localStorage.getItem("empresaEficienciaSessao") || "null");
  if (!sessao || !sessao.email) { window.location.replace("login.html"); return; }
  const KEY = "empresaEficienciaDados_v1_" + sessao.email.toLowerCase();
  const nomeUsuario = sessao.nome || sessao.responsavel || sessao.email.split("@")[0];
  const topoUsuario = document.getElementById("usuario-atual");
  if (topoUsuario) topoUsuario.textContent = nomeUsuario;
  const sairTopo = document.getElementById("sair-topo");
  if (sairTopo) sairTopo.addEventListener("click", () => { localStorage.removeItem("empresaEficienciaSessao"); window.location.href = "login.html"; });
  const hoje = () => new Date().toISOString().slice(0, 10);
  const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const vazio = () => ({ perfil:{empresa:"",responsavel:"",email:"",ramo:"",notificacoes:true}, recursos:[], estoque:[], perdas:[], acoes:[] });
  function carregar() {
    try { return Object.assign(vazio(), JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch (_) { return vazio(); }
  }
  let dados = carregar();
  if (!dados.perfil.responsavel) dados.perfil.responsavel = nomeUsuario;
  if (!dados.perfil.email) dados.perfil.email = sessao.email;
  if (!dados.perfil.empresa) dados.perfil.empresa = sessao.setor || sessao.empresa || "";
  if (!dados.perfil.ramo) dados.perfil.ramo = sessao.cargo || sessao.ramo || "";

  // Dados fictícios para demonstração. Coleções já utilizadas pelo usuário são preservadas.
  function dataRelativa(dias) {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  if (!dados.demoDadosInseridos) {
    if (!dados.recursos.length) {
      dados.recursos = [
        {id:id(),tipo:"Água",quantidade:18500,unidade:"L",valor:296,setor:"Produção",data:dataRelativa(-12),observacoes:"Consumo mensal demonstrativo"},
        {id:id(),tipo:"Energia",quantidade:4200,unidade:"kWh",valor:3360,setor:"Administrativo",data:dataRelativa(-9),observacoes:"Consumo mensal demonstrativo"},
        {id:id(),tipo:"Materiais",quantidade:320,unidade:"unidades",valor:1280,setor:"Escritório",data:dataRelativa(-5),observacoes:"Materiais de uso interno"},
        {id:id(),tipo:"Água",quantidade:9200,unidade:"L",valor:147.20,setor:"Refeitório",data:dataRelativa(-2),observacoes:"Consumo demonstrativo"}
      ];
    }
    if (!dados.estoque.length) {
      dados.estoque = [
        {id:id(),nome:"Papel A4",setor:"Administrativo",qtd:18,minimo:8,validade:""},
        {id:id(),nome:"Copos reutilizáveis",setor:"Refeitório",qtd:45,minimo:15,validade:""},
        {id:id(),nome:"Lâmpadas LED",setor:"Manutenção",qtd:12,minimo:5,validade:""},
        {id:id(),nome:"Produtos de limpeza",setor:"Serviços gerais",qtd:9,minimo:10,validade:dataRelativa(18)},
        {id:id(),nome:"Cartuchos de tinta",setor:"Administrativo",qtd:6,minimo:4,validade:""}
      ];
    }
    if (!dados.perdas.length) {
      dados.perdas = [
        {id:id(),tipo:"Água",quantidade:350,unidade:"L",data:dataRelativa(-10),setor:"Produção",custo:42,motivo:"Vazamento identificado",observacoes:"Exemplo demonstrativo"},
        {id:id(),tipo:"Energia",quantidade:120,unidade:"kWh",data:dataRelativa(-7),setor:"Administrativo",custo:96,motivo:"Equipamentos ligados sem uso",observacoes:"Exemplo demonstrativo"},
        {id:id(),tipo:"Materiais",quantidade:15,unidade:"unidades",data:dataRelativa(-3),setor:"Escritório",custo:75,motivo:"Materiais danificados",observacoes:"Exemplo demonstrativo"},
        {id:id(),tipo:"Alimentos",quantidade:8,unidade:"kg",data:dataRelativa(-1),setor:"Refeitório",custo:64,motivo:"Preparação acima da procura",observacoes:"Exemplo demonstrativo"}
      ];
    }
    if (!dados.acoes.length) {
      dados.acoes = [
        {id:id(),problema:"Consumo elevado de energia",causa:"Equipamentos ligados fora do expediente",acao:"Criar rotina de desligamento dos equipamentos",responsavel:"Administrativo",prazo:dataRelativa(-2),situacao:"Concluída"},
        {id:id(),problema:"Desperdício de água",causa:"Pequenos vazamentos",acao:"Verificar torneiras e pontos de água",responsavel:"Manutenção",prazo:dataRelativa(8),situacao:"Em andamento"},
        {id:id(),problema:"Uso excessivo de papel",causa:"Impressões desnecessárias",acao:"Priorizar documentos digitais",responsavel:"Recursos Humanos",prazo:dataRelativa(20),situacao:"Pendente"}
      ];
    }
    dados.demoDadosInseridos = true;
    localStorage.setItem(KEY, JSON.stringify(dados));
  }
  function salvar() { localStorage.setItem(KEY, JSON.stringify(dados)); renderizar(); }
  const $ = s => document.querySelector(s);
  const moeda = n => Number(n || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const num = n => Number(n || 0).toLocaleString("pt-BR",{maximumFractionDigits:2});
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const dataBR = s => s ? s.split("-").reverse().join("/") : "—";
  function linhas(lista, cols) {
    if (!lista.length) return `<tr><td colspan="${cols}" class="ee-vazio">Nenhum registro cadastrado.</td></tr>`;
    return "";
  }
  function barra(container, itens, format) {
    const max = Math.max(1,...itens.map(x=>Number(x.valor)||0));
    container.innerHTML = itens.length ? itens.map(x=>`<div class="ee-barra-linha"><span>${esc(x.nome)}</span><div class="ee-trilho"><div class="ee-preenchimento" style="width:${Math.max(1,(x.valor/max)*100)}%"></div></div><strong>${format(x.valor)}</strong></div>`).join("") : '<p class="ee-vazio">Sem dados suficientes para exibir.</p>';
  }
  function alertas() {
    const a=[];
    dados.estoque.forEach(x=>{
      if(Number(x.qtd)<=Number(x.minimo)) a.push({tipo:"erro",texto:`Estoque baixo: ${x.nome} (${x.qtd} disponível).`});
      if(x.validade && x.validade<=hoje()) a.push({tipo:"erro",texto:`Material vencido ou com validade hoje: ${x.nome}.`});
      else if(x.validade && (new Date(x.validade)-new Date(hoje()))/86400000<=30) a.push({tipo:"aviso",texto:`Material próximo do vencimento: ${x.nome} (${dataBR(x.validade)}).`});
    });
    dados.acoes.forEach(x=>{if(x.situacao!=="Concluída" && x.prazo<hoje())a.push({tipo:"erro",texto:`Plano de ação atrasado: ${x.problema} (prazo ${dataBR(x.prazo)}).`});});
    const perdasRecentes=dados.perdas.filter(x=>x.data>=new Date(Date.now()-30*86400000).toISOString().slice(0,10));
    if(perdasRecentes.length>=3)a.push({tipo:"aviso",texto:`Foram registradas ${perdasRecentes.length} perdas nos últimos 30 dias.`});
    return a;
  }
  let renderizar = function () {
    const totalGasto=dados.recursos.reduce((s,x)=>s+Number(x.valor),0);
    const agua=dados.recursos.filter(x=>x.tipo==="Água").reduce((s,x)=>s+Number(x.quantidade),0);
    const energia=dados.recursos.filter(x=>x.tipo==="Energia").reduce((s,x)=>s+Number(x.quantidade),0);
    const custoPerdas=dados.perdas.reduce((s,x)=>s+Number(x.custo),0);
    const concluidas=dados.acoes.filter(x=>x.situacao==="Concluída").length;
    $("#ee-kpi-gastos").textContent=moeda(totalGasto);
    $("#ee-kpi-agua").textContent=num(agua)+" L";
    $("#ee-kpi-energia").textContent=num(energia)+" kWh";
    $("#ee-kpi-perdas").textContent=dados.perdas.length;
    $("#ee-kpi-custo-perdas").textContent=moeda(custoPerdas);
    $("#ee-kpi-acoes").textContent=(dados.acoes.length?Math.round(concluidas/dados.acoes.length*100):0)+"%";
    const gastos={};dados.recursos.forEach(x=>gastos[x.tipo]=(gastos[x.tipo]||0)+Number(x.valor));
    barra($("#ee-grafico-gastos"),Object.entries(gastos).map(([nome,valor])=>({nome,valor})),moeda);
    barra($("#ee-grafico-consumo"),[{nome:"Água (L)",valor:agua},{nome:"Energia (kWh)",valor:energia}],num);
    $("#ee-lista-recursos").innerHTML=linhas(dados.recursos,6)||dados.recursos.map(x=>`<tr><td>${dataBR(x.data)}</td><td>${esc(x.tipo)}</td><td>${num(x.quantidade)} ${esc(x.unidade)}</td><td>${moeda(x.valor)}</td><td>${esc(x.setor)}</td><td><button data-del="recursos" data-id="${x.id}">Excluir</button></td></tr>`).join("");
    $("#ee-lista-estoque").innerHTML=linhas(dados.estoque,6)||dados.estoque.map(x=>{const status=Number(x.qtd)<=Number(x.minimo)?"Estoque baixo":x.validade&&x.validade<=hoje()?"Vencido":"Disponível";return `<tr><td>${esc(x.nome)}</td><td>${esc(x.setor)}</td><td>${num(x.qtd)}</td><td>${dataBR(x.validade)}</td><td>${status}</td><td><button data-stock="entrada" data-id="${x.id}">Entrada</button><button data-stock="saida" data-id="${x.id}">Saída</button><button data-stock="perda" data-id="${x.id}">Perda</button><button data-del="estoque" data-id="${x.id}">Excluir</button></td></tr>`}).join("");
    $("#ee-lista-perdas").innerHTML=linhas(dados.perdas,7)||dados.perdas.map(x=>`<tr><td>${dataBR(x.data)}</td><td>${esc(x.tipo)}</td><td>${num(x.quantidade)} ${esc(x.unidade)}</td><td>${esc(x.setor)}</td><td>${esc(x.motivo)}</td><td>${moeda(x.custo)}</td><td><button data-del="perdas" data-id="${x.id}">Excluir</button></td></tr>`).join("");
    $("#ee-lista-acoes").innerHTML=linhas(dados.acoes,6)||dados.acoes.map(x=>`<tr><td>${esc(x.problema)}</td><td>${esc(x.acao)}</td><td>${esc(x.responsavel)}</td><td>${dataBR(x.prazo)}</td><td><select data-status="${x.id}"><option ${x.situacao==="Pendente"?"selected":""}>Pendente</option><option ${x.situacao==="Em andamento"?"selected":""}>Em andamento</option><option ${x.situacao==="Concluída"?"selected":""}>Concluída</option></select></td><td><button data-del="acoes" data-id="${x.id}">Excluir</button></td></tr>`).join("");
    const avisos=alertas();
    $("#ee-resumo-alertas").innerHTML=avisos.length?avisos.slice(0,4).map(x=>`<div class="ee-alerta ${x.tipo==="erro"?"erro":""}">${esc(x.texto)}</div>`).join(""):'<div class="ee-alerta ok">Nenhum alerta identificado pelos registros atuais.</div>';
    $("#ee-lista-alertas").innerHTML=avisos.length?avisos.map(x=>`<div class="ee-alerta ${x.tipo==="erro"?"erro":""}">${esc(x.texto)}</div>`).join(""):'<div class="ee-alerta ok">Nenhum alerta no momento.</div>';
    const filtro=$("#ee-filtro-periodo")?.value||"todos";
    const limite=new Date();if(filtro==="mes")limite.setDate(1);if(filtro==="trimestre")limite.setMonth(limite.getMonth()-3);if(filtro==="ano")limite.setMonth(0,1);
    const perdasFiltradas=dados.perdas.filter(x=>filtro==="todos"||new Date(x.data+"T00:00:00")>=limite);
    const acoesFiltradas=dados.acoes;
    $("#ee-resultados-detalhados").innerHTML=[["Gastos com recursos",moeda(totalGasto)],["Desperdícios registrados",perdasFiltradas.length],["Custo estimado das perdas",moeda(perdasFiltradas.reduce((s,x)=>s+Number(x.custo),0))],["Consumo de água",num(agua)+" L"],["Consumo de energia",num(energia)+" kWh"],["Ações concluídas",concluidas+" de "+dados.acoes.length]].map(x=>`<article class="ee-kpi"><span>${x[0]}</span><strong>${x[1]}</strong></article>`).join("");
    const tipos={};perdasFiltradas.forEach(x=>tipos[x.tipo]=(tipos[x.tipo]||0)+1);
    barra($("#ee-grafico-perdas"),Object.entries(tipos).map(([nome,valor])=>({nome,valor})),num);
    const situacoes={};acoesFiltradas.forEach(x=>situacoes[x.situacao]=(situacoes[x.situacao]||0)+1);
    barra($("#ee-grafico-acoes"),Object.entries(situacoes).map(([nome,valor])=>({nome,valor})),num);
    $("#ee-resumo-relatorio").innerHTML=`<h3>Resumo dos registros</h3><p>Recursos cadastrados: ${dados.recursos.length}</p><p>Materiais no estoque: ${dados.estoque.length}</p><p>Ocorrências de desperdício: ${dados.perdas.length}</p><p>Planos de ação: ${dados.acoes.length}</p><p>Gastos registrados: ${moeda(totalGasto)}</p><p>Custo estimado das perdas: ${moeda(custoPerdas)}</p>`;
    const perfil=$("#ee-form-perfil");if(perfil && !perfil.dataset.loaded){Object.entries(dados.perfil).forEach(([k,v])=>{const el=perfil.elements[k];if(el){if(el.type==="checkbox")el.checked=!!v;else el.value=v;}});perfil.dataset.loaded="1";}
  };
  function formData(form){return Object.fromEntries(new FormData(form).entries());}
  function enviar(idForm,colecao,normalizar){const form=$("#"+idForm);form.addEventListener("submit",e=>{e.preventDefault();const item=normalizar(formData(form));item.id=id();dados[colecao].push(item);form.reset();if(form.elements.data)form.elements.data.value=hoje();salvar();});}
  enviar("ee-form-recurso","recursos",x=>({...x,quantidade:Number(x.quantidade),valor:Number(x.valor)}));
  enviar("ee-form-estoque","estoque",x=>({...x,qtd:Number(x.quantidade),minimo:Number(x.minimo)}));
  enviar("ee-form-perda","perdas",x=>({...x,quantidade:Number(x.quantidade),custo:Number(x.custo)}));
  enviar("ee-form-acao","acoes",x=>({...x}));
  $("#ee-form-perfil").addEventListener("submit",e=>{
    e.preventDefault();
    dados.perfil=formData(e.currentTarget);
    dados.perfil.notificacoes=e.currentTarget.elements.notificacoes.checked;
    const contas=JSON.parse(localStorage.getItem("empresaEficienciaContas_v1")||"[]");
    const conta=contas.find(x=>x.email.toLowerCase()===sessao.email.toLowerCase());
    if(conta){conta.setor=dados.perfil.empresa;conta.cargo=dados.perfil.ramo;conta.nome=dados.perfil.responsavel;conta.responsavel=dados.perfil.responsavel;localStorage.setItem("empresaEficienciaContas_v1",JSON.stringify(contas));}
    sessao.setor=dados.perfil.empresa;sessao.empresa=dados.perfil.empresa;sessao.nome=dados.perfil.responsavel;sessao.responsavel=dados.perfil.responsavel;sessao.cargo=dados.perfil.ramo;sessao.ramo=dados.perfil.ramo;
    if (topoUsuario) topoUsuario.textContent = sessao.nome;
    localStorage.setItem("empresaEficienciaSessao",JSON.stringify(sessao));
    salvar();alert("Configurações salvas neste navegador.");
  });
  root.querySelectorAll("form input[type=date]").forEach(x=>{if(!x.value)x.value=hoje();});
  root.addEventListener("click",e=>{
    const nav=e.target.closest("[data-ee-page]");if(nav){root.querySelectorAll(".ee-menu button").forEach(b=>b.classList.toggle("ativo",b===nav));root.querySelectorAll(".ee-pagina").forEach(v=>v.classList.toggle("ativa",v.dataset.eeView===nav.dataset.eePage));}
    const del=e.target.closest("[data-del]");if(del){const {del:col,id:itemId}=del.dataset;if(confirm("Excluir este registro?")){dados[col]=dados[col].filter(x=>x.id!==itemId);salvar();}}
    const stock=e.target.closest("[data-stock]");if(stock){const item=dados.estoque.find(x=>x.id===stock.dataset.id);if(!item)return;const qtd=Number(prompt("Informe a quantidade:"));if(!Number.isFinite(qtd)||qtd<=0)return;if(stock.dataset.stock==="entrada")item.qtd+=qtd;else if(stock.dataset.stock==="saida"){if(qtd>item.qtd)return alert("Quantidade maior que o estoque disponível.");item.qtd-=qtd;}else{if(qtd>item.qtd)return alert("Quantidade maior que o estoque disponível.");item.qtd-=qtd;dados.perdas.push({id:id(),tipo:"Materiais",quantidade:qtd,unidade:"unidades",data:hoje(),setor:item.setor,custo:0,motivo:"Material danificado ou perdido",observacoes:item.nome});}salvar();}
  });
  root.addEventListener("change",e=>{if(e.target.matches("[data-status]")){const item=dados.acoes.find(x=>x.id===e.target.dataset.status);if(item){item.situacao=e.target.value;salvar();}}if(e.target.id==="ee-filtro-periodo")renderizar();});
  $("#ee-exportar-csv").addEventListener("click",()=>{
    const linhasCsv=[["Categoria","Data","Descrição","Quantidade","Unidade","Valor/Custo","Setor","Detalhes"]];
    dados.recursos.forEach(x=>linhasCsv.push(["Recurso",x.data,x.tipo,x.quantidade,x.unidade,x.valor,x.setor,x.observacoes]));
    dados.perdas.forEach(x=>linhasCsv.push(["Perda",x.data,x.tipo,x.quantidade,x.unidade,x.custo,x.setor,x.motivo]));
    dados.estoque.forEach(x=>linhasCsv.push(["Estoque","",x.nome,x.qtd,"unidades","",x.setor,"Validade: "+x.validade]));
    dados.acoes.forEach(x=>linhasCsv.push(["Ação",x.prazo,x.problema,"","","",x.responsavel,x.acao+" - "+x.situacao]));
    const csv="\uFEFF"+linhasCsv.map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(";")).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="relatorio-empresa-eficiencia.csv";a.click();URL.revokeObjectURL(url);
  });
  $("#ee-imprimir").addEventListener("click",()=>window.print());
  // FUNCIONALIDADES DO PAINEL DO FUNCIONÁRIO
  function iniciarPainelFuncionario() {
    const el = id => document.getElementById(id);
    const nomeEl = el("nome-funcionario");
    if (!nomeEl) return;

    const CHAVE_FUNC = "portalEEFuncionarios_v1_" + String(sessao.email).toLowerCase();
    const dadosIniciais = { refeicoes: {}, bazar: [], formularios: [] };
    function carregarFuncionario() {
      try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_FUNC) || "{}");
        return {
          refeicoes: salvo.refeicoes || {},
          bazar: Array.isArray(salvo.bazar) ? salvo.bazar : [],
          formularios: Array.isArray(salvo.formularios) ? salvo.formularios : []
        };
      } catch (_) { return { ...dadosIniciais, refeicoes: {}, bazar: [], formularios: [] }; }
    }
    const func = carregarFuncionario();
    const nomePadrao = sessao.responsavel || String(sessao.email).split("@")[0];
    nomeEl.value = nomePadrao;
    const amanha = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    };
    const dataHoje = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    };
    const dataPt = valor => valor ? valor.split("-").reverse().join("/") : "—";
    const nomesDemo = [
      "Ana Souza", "Bruno Lima", "Camila Santos", "Daniel Oliveira",
      "Eduarda Costa", "Felipe Rocha", "Gabriela Alves", "Henrique Martins",
      "Isabela Ribeiro", "João Pedro", "Larissa Mendes", "Marcos Ferreira"
    ];
    // Garante os 12 funcionários confirmados para o dia seguinte, em qualquer dia de acesso.
    (function garantirAlmocoDemo() {
      const diaDemo = amanha();
      if (!func.refeicoes[diaDemo]) func.refeicoes[diaDemo] = {};
      nomesDemo.forEach(nome => {
        const chave = nome.toLowerCase();
        if (!func.refeicoes[diaDemo][chave]) func.refeicoes[diaDemo][chave] = { nome, resposta:"sim", atualizadoEm:dataHoje(), demo:true };
      });
      Object.keys(func.refeicoes).forEach(d => { if (d < dataHoje()) delete func.refeicoes[d]; });
      localStorage.setItem(CHAVE_FUNC, JSON.stringify(func));
    })();
    if (!func.demoFuncionariosInseridos) {
      if (!func.bazar.length) {
        func.bazar = [
          {id:id(),item:"Resmas de papel A4",quantidade:"3 pacotes",setor:"Administrativo",responsavel:"Ana Souza",data:dataPt(dataHoje())},
          {id:id(),item:"Cabos HDMI",quantidade:"4 unidades",setor:"TI",responsavel:"Bruno Lima",data:dataPt(dataHoje())},
          {id:id(),item:"Caixas organizadoras",quantidade:"6 unidades",setor:"Almoxarifado",responsavel:"Camila Santos",data:dataPt(dataHoje())}
        ];
      }
      if (!func.formularios.length) {
        func.formularios = [
          {id:id(),tipo:"Solicitação de material",descricao:"Solicitação demonstrativa de papel para o setor administrativo.",responsavel:"Daniel Oliveira",data:dataPt(dataHoje())},
          {id:id(),tipo:"Comunicação de manutenção",descricao:"Verificar uma torneira com pequeno vazamento no refeitório.",responsavel:"Eduarda Costa",data:dataPt(dataHoje())},
          {id:id(),tipo:"Registro de desperdício",descricao:"Foram observadas sobras de alimentos após o horário do almoço.",responsavel:"Felipe Rocha",data:dataPt(dataHoje())},
          {id:id(),tipo:"Sugestão de melhoria",descricao:"Instalar avisos para apagar as luzes ao sair das salas.",responsavel:"Gabriela Alves",data:dataPt(dataHoje())}
        ];
      }
      func.demoFuncionariosInseridos = true;
      localStorage.setItem(CHAVE_FUNC, JSON.stringify(func));
    }
    const nomeAtual = () => nomeEl.value.trim() || nomePadrao;
    function salvarFuncionario() {
      localStorage.setItem(CHAVE_FUNC, JSON.stringify(func));
    }

    // Confirmação de refeição: uma resposta por funcionário para cada dia.
    function renderRefeicoes() {
      const dia = amanha();
      const respostas = Object.entries(func.refeicoes[dia] || {});
      const sim = respostas.filter(([,v]) => v.resposta === "sim").length;
      const nao = respostas.filter(([,v]) => v.resposta === "nao").length;
      el("contagem-refeicao").textContent = `Para ${dataPt(dia)}: ${sim} confirmação(ões) de almoço e ${nao} ausência(s).`;
      const atual = (func.refeicoes[dia] || {})[nomeAtual().toLowerCase()];
      el("mensagem-refeicao").textContent = atual
        ? `Sua resposta está registrada: ${atual.resposta === "sim" ? "você vai almoçar" : "você não vai almoçar"}. Você pode alterá-la até o planejamento do refeitório.`
        : "Você ainda não confirmou sua presença para amanhã.";
      const historico = respostas.sort((a,b) => a[0].localeCompare(b[0],"pt-BR"));
      el("historico-refeicoes").innerHTML = historico.length
        ? `<h3>Respostas registradas</h3><ul>${historico.map(([nome,v]) => `<li>${esc(v.nome)} — ${v.resposta === "sim" ? "Vai almoçar" : "Não vai almoçar"}</li>`).join("")}</ul>`
        : '<p class="rodape-nota">Ainda não há respostas registradas para amanhã.</p>';
    }
    function responderRefeicao(resposta) {
      const nome = nomeAtual();
      if (!nome) { alert("Informe seu nome antes de confirmar."); nomeEl.focus(); return; }
      const dia = amanha();
      if (!func.refeicoes[dia]) func.refeicoes[dia] = {};
      func.refeicoes[dia][nome.toLowerCase()] = { nome, resposta, atualizadoEm: dataHoje() };
      salvarFuncionario();
      renderRefeicoes();
    }
    el("ref-sim").addEventListener("click", () => responderRefeicao("sim"));
    el("ref-nao").addEventListener("click", () => responderRefeicao("nao"));
    nomeEl.addEventListener("change", renderRefeicoes);

    // Bazar de insumos: publicar, pesquisar e remover anúncios.
    const listaBazar = el("lista-bazar");
    function renderBazar() {
      const termo = (el("busca-bazar").value || "").trim().toLocaleLowerCase("pt-BR");
      const itens = func.bazar.filter(x => `${x.item} ${x.setor} ${x.quantidade} ${x.responsavel}`.toLocaleLowerCase("pt-BR").includes(termo));
      listaBazar.innerHTML = itens.length ? itens.map(x => `
        <article class="item-bazar">
          <div><div class="setor">${esc(x.setor)} · ${esc(x.data)}</div><div class="descricao"><strong>${esc(x.item)}</strong> — ${esc(x.quantidade)}</div><small>Publicado por ${esc(x.responsavel)}</small></div>
          <button type="button" class="btn contorno" data-remover-bazar="${esc(x.id)}">Remover</button>
        </article>`).join("") : '<p class="rodape-nota">Nenhum item encontrado. Você pode anunciar um material disponível abaixo.</p>';
    }
    el("busca-bazar").addEventListener("input", renderBazar);
    el("btn-bazar-anunciar").addEventListener("click", () => {
      const item = el("bazar-item").value.trim();
      const quantidade = el("bazar-qtd").value.trim();
      const setor = el("bazar-setor").value;
      if (!item || !quantidade) { alert("Preencha o nome do item e a quantidade."); return; }
      func.bazar.unshift({ id: id(), item, quantidade, setor, responsavel: nomeAtual(), data: dataPt(dataHoje()) });
      salvarFuncionario();
      el("bazar-item").value = "";
      el("bazar-qtd").value = "";
      el("msg-bazar-enviado").style.display = "block";
      el("msg-bazar-enviado").textContent = "Anúncio publicado no bazar.";
      renderBazar();
    });
    listaBazar.addEventListener("click", e => {
      const botao = e.target.closest("[data-remover-bazar]");
      if (!botao) return;
      func.bazar = func.bazar.filter(x => x.id !== botao.dataset.removerBazar);
      salvarFuncionario();
      renderBazar();
    });

    // Calculadora de custo de reunião.
    function calcularReuniao() {
      const minutos = Math.max(0, Number(el("calc-duracao").value) || 0);
      const pessoas = Math.max(0, Number(el("calc-pessoas").value) || 0);
      const valorHora = Math.max(0, Number(el("calc-valorhora").value) || 0);
      const custo = (minutos / 60) * pessoas * valorHora;
      el("resultado-valor").textContent = moeda(custo);
      el("resultado-obs").textContent = `${pessoas} pessoa(s) × ${minutos} min × ${moeda(valorHora)}/h`;
    }
    ["calc-duracao", "calc-pessoas", "calc-valorhora"].forEach(campo => {
      el(campo).addEventListener("input", calcularReuniao);
      el(campo).addEventListener("change", calcularReuniao);
    });

    // Formulários digitais: abrir, enviar, consultar e excluir envios.
    const tiposFormulario = [
      "Solicitação de material",
      "Comunicação de manutenção",
      "Registro de desperdício",
      "Sugestão de melhoria"
    ];
    let formularioAtual = "";
    const listaFormularios = el("lista-formularios");
    function renderFormularios() {
      listaFormularios.innerHTML = tiposFormulario.map((titulo,i) => `
        <button type="button" class="item-formulario" data-abrir-formulario="${i}">${titulo}</button>`).join("");
      el("lista-formularios-enviados").innerHTML = func.formularios.length
        ? `<h3>Solicitações enviadas</h3>${func.formularios.map(x => `
          <article class="item-bazar"><div><strong>${esc(x.tipo)}</strong><p>${esc(x.descricao)}</p><small>${esc(x.responsavel)} · ${esc(x.data)}</small></div><button type="button" class="btn contorno" data-excluir-formulario="${esc(x.id)}">Excluir</button></article>`).join("")}`
        : '<p class="rodape-nota">Você ainda não enviou formulários.</p>';
    }
    listaFormularios.addEventListener("click", e => {
      const botao = e.target.closest("[data-abrir-formulario]");
      if (!botao) return;
      formularioAtual = tiposFormulario[Number(botao.dataset.abrirFormulario)];
      el("titulo-formulario").textContent = formularioAtual;
      el("form-descricao").value = "";
      el("confirmacao-formulario").textContent = "";
      el("caixa-formulario").style.display = "block";
      el("form-descricao").focus();
    });
    el("btn-enviar-form").addEventListener("click", () => {
      const descricao = el("form-descricao").value.trim();
      if (!formularioAtual || !descricao) { alert("Descreva sua solicitação antes de enviar."); return; }
      func.formularios.unshift({ id: id(), tipo: formularioAtual, descricao, responsavel: nomeAtual(), data: dataPt(dataHoje()) });
      salvarFuncionario();
      el("form-descricao").value = "";
      el("confirmacao-formulario").textContent = "Formulário enviado e salvo neste navegador.";
      formularioAtual = "";
      renderFormularios();
    });
    el("btn-cancelar-form").addEventListener("click", () => {
      formularioAtual = "";
      el("caixa-formulario").style.display = "none";
      el("form-descricao").value = "";
      el("confirmacao-formulario").textContent = "";
    });
    el("lista-formularios-enviados").addEventListener("click", e => {
      const botao = e.target.closest("[data-excluir-formulario]");
      if (!botao) return;
      func.formularios = func.formularios.filter(x => x.id !== botao.dataset.excluirFormulario);
      salvarFuncionario();
      renderFormularios();
    });

    renderRefeicoes();
    renderBazar();
    calcularReuniao();
    renderFormularios();
  }

  // PAINEL DO ADMINISTRADOR
  const IMPRESSOES = [
    {dep:"Administrativo", total:4850}, {dep:"Financeiro", total:3920}, {dep:"RH", total:3150},
    {dep:"Comercial", total:2740}, {dep:"Operações", total:2210}, {dep:"TI", total:1480}, {dep:"Marketing", total:960}
  ];
  function renderAdmin() {
    const hojeStr = hoje();
    const tb = document.getElementById("tabela-estoque");
    if (tb) {
      tb.innerHTML = dados.estoque.length ? dados.estoque.map(x => {
        const dias = x.validade ? Math.round((new Date(x.validade+"T00:00:00") - new Date(hojeStr+"T00:00:00"))/86400000) : null;
        let status = "Normal";
        if (dias !== null && dias < 0) status = "Vencido";
        else if (dias !== null && dias <= 30) status = "Validade próxima";
        else if (Number(x.qtd) <= Number(x.minimo)) status = "Estoque baixo";
        return `<tr><td>${esc(x.nome)}</td><td>${esc(x.setor)}</td><td>${num(x.qtd)}</td><td>${dataBR(x.validade)}</td><td>${status}</td></tr>`;
      }).join("") : '<tr><td colspan="5" class="ee-vazio">Nenhum material cadastrado. Use a aba Gestão de recursos.</td></tr>';
    }
    const cs = document.getElementById("consumo-setores");
    if (cs) {
      const porSetor = {};
      dados.recursos.forEach(x => { porSetor[x.setor] = (porSetor[x.setor]||0) + Number(x.valor); });
      const itens = Object.entries(porSetor).sort((a,b)=>b[1]-a[1]);
      const max = Math.max(1, ...itens.map(i=>i[1]));
      cs.innerHTML = '<h3>Gasto com recursos por setor</h3>' + (itens.length ? itens.map(([setor,v]) => {
        const p = Math.round(v/max*100);
        return `<div class="barra-setor${p>=60?" pico":""}"><span>${esc(setor)}</span><div class="trilha"><div class="preenc" style="width:${p}%;"></div></div><span class="valor-setor num">${moeda(v)}</span></div>`;
      }).join("") : '<p class="ee-vazio">Sem registros de recursos.</p>');
    }
    const ti = document.getElementById("tabela-impressao");
    const fi = document.getElementById("filtro-impressoes");
    if (ti && fi) {
      const f = fi.value;
      const lista = IMPRESSOES.filter(x => f==="todos" || (f==="critico" ? x.total>3000 : x.total<=3000));
      ti.innerHTML = lista.length ? lista.map((x,i) => `<tr><td>${i+1}º</td><td>${esc(x.dep)}</td><td class="num">${x.total.toLocaleString("pt-BR")}</td><td>${x.total>3000?"Crítico":"Normal"}</td></tr>`).join("") : '<tr><td colspan="4" class="ee-vazio">Nenhum departamento neste filtro.</td></tr>';
    }
  }
  const filtroImp = document.getElementById("filtro-impressoes");
  if (filtroImp) filtroImp.addEventListener("change", renderAdmin);
  const renderizarBase = renderizar;
  renderizar = function () { renderizarBase(); renderAdmin(); };

  iniciarPainelFuncionario();
  renderizar();
})();