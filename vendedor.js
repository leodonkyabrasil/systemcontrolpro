// vendedor.js — login híbrido (SystemControlPro + SCP)
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    // popula já e repete após 300ms (caso o Admin tenha acabado de salvar)
    popularEmpresasSelect();
    setTimeout(popularEmpresasSelect, 300);

    var loginForm = byId('login-form');
    if (loginForm) loginForm.addEventListener('submit', onLoginSubmit);

    var logoutBtn = byId('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);

    // quando voltar foco para esta aba, repopula
    window.addEventListener('focus', function () {
      try { popularEmpresasSelect(); } catch (e) {}
    });

    // se outra aba alterar o storage (Admin), repopula
    window.addEventListener('storage', function (e) {
      if (e && (e.key === 'systemControlPro_data' || e.key === 'empresas')) {
        try { popularEmpresasSelect(); } catch (err) {}
      }
    });

    // expõe um comando manual para você chamar no console: VND_refreshEmpresas()
    window.VND_refreshEmpresas = function () {
      try { popularEmpresasSelect(); } catch (e) { console.warn(e); }
    };

    restaurarSessao();
  }

  // util seguro para ler JSON do localStorage
  function readJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  // acesso seguro ao SCP.getData
  function scpGetData(key) {
    try {
      if (window && window.SCP && typeof window.SCP.getData === 'function') {
        var v = window.SCP.getData(key);
        return Array.isArray(v) ? v : (v || []);
      }
    } catch (e) {}
    return [];
  }

   


  // Preenche o <select id="empresa"> usando as duas fontes (novo e antigo)
  function popularEmpresasSelect() {
    var sel = byId('empresa');
    if (!sel) return;

    // limpa mantendo a 1ª opção
    var opts = sel.querySelectorAll('option:not([value=""])');
    for (var i = 0; i < opts.length; i++) {
      opts[i].parentNode.removeChild(opts[i]);
    }

    // 1) lê o formato novo (systemControlPro_data)
    var empresasNova = [];
    try {
      var sys = readJSON('systemControlPro_data') || {};
if (Array.isArray(sys.empresas)) {
  // usa apenas ativas do Admin
  empresasNova = sys.empresas.filter(function(e){
    return e && (e.status || 'active') !== 'inactive';
  });
}

    } catch (e) {}

    // 2) lê o formato antigo (SCP plano)
    var empresasSCP = scpGetData('empresas');

    // Estratégia: prioriza Admin; só cai pro SCP se Admin estiver vazio
var empresas = [];
if (empresasNova.length > 0) {
  empresas = empresasNova.slice();
} else {
  empresas = empresasSCP.slice();
}
// garantia extra: remove inativas (se vierem do SCP)
empresas = empresas.filter(function(e){
  return e && (e.status || 'active') !== 'inactive';
});

    // Renderiza
    for (var m = 0; m < empresas.length; m++) {
      var e = empresas[m] || {};
      var opt = document.createElement('option');
      var idVal = (e.id != null) ? e.id : '';
      var codigoBase = (e.codigo != null) ? String(e.codigo) : String(idVal);
      var codigo = (codigoBase && codigoBase !== 'undefined') ? codigoBase : '';
      if (codigo) {
        while (codigo.length < 4) codigo = '0' + codigo;
      } else {
        codigo = '----';
      }
      opt.value = idVal;
      opt.textContent = codigo + ' — ' + (e.nome || 'Sem nome');
      sel.appendChild(opt);
    }
  }

  function onLoginSubmit(ev) {
    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();

    var empresaField = byId('empresa');
    var empresaId = empresaField ? Number(empresaField.value) : 0;
    var usernameEl = byId('username');
    var passwordEl = byId('password');
    var rememberEl = byId('remember-me');

    var username = usernameEl ? String(usernameEl.value || '').trim() : '';
var password = passwordEl ? String(passwordEl.value || '').trim() : '';
// Força lembrar sempre (mesmo sem checkbox)
var remember = true;

    if (!empresaId || !username || !password) {
      alert('Preencha empresa, usuário e senha.');
      return;
    }

    var user = null;

    // 1) formato novo (systemControlPro_data.usuarios[empresaId] = [])
    try {
      var sys = readJSON('systemControlPro_data') || {};
      var lista = (sys.usuarios && sys.usuarios[empresaId]) || [];
      if (Array.isArray(lista)) {
        for (var i = 0; i < lista.length; i++) {
          var u = lista[i] || {};
          var status = (u.status || 'active');
          if (u.username === username && u.password === password && status !== 'inactive') {
            user = u;
            break;
          }
        }
      }
    } catch (e) {}

    // 2) fallback: formato antigo (SCP.usuarios = array)
    if (!user) {
      var usuarios = scpGetData('usuarios');
      for (var j = 0; j < usuarios.length; j++) {
        var ua = usuarios[j] || {};
        var empOk = Number(ua.empresaId) === Number(empresaId);
        var ativoOk = ua.ativo !== false;
        if (empOk && ua.username === username && ua.password === password && ativoOk) {
          user = ua;
          break;
        }
      }
    }

    if (!user) {
      alert('Usuário/senha inválidos para a empresa selecionada.');
      return;
    }

    var session = { empresaId: empresaId, userId: user.id, username: username, role: user.role };
    try { sessionStorage.setItem('scp_session', JSON.stringify(session)); } catch (e) {}
    if (remember) {
  try { localStorage.setItem('scp_last_session', JSON.stringify(session)); } catch (e) {}
}

// >>> MONTA A UI IMEDIATAMENTE
try {
  if (window.SystemControlPro && typeof window.SystemControlPro.showApp === 'function') {
    window.SystemControlPro.showApp();                  // monta a UI agora
  } else if (window.SystemControlPro && typeof window.SystemControlPro.tryAutoLogin === 'function') {
    window.SystemControlPro.tryAutoLogin();
  }
} catch (e) {}

// >>> dentro de restaurarSessao(), quando okEmpresa && okUsuario for true
window.SystemControlPro = window.SystemControlPro || {};
window.SystemControlPro.currentUser = {
  username: session.username,
  role: session.role,
    notas: {}, // <-- AQUI: estrutura de notas fiscais

  id: session.userId
};
window.SystemControlPro.currentEmpresa = session.empresaId;


try {
  if (typeof mostrarApp === 'function') {
    // Se a função existir, use-a (caminho normal)
    mostrarApp(session);
  } else if (window.SystemControlPro && typeof window.SystemControlPro.showApp === 'function') {
    // Se o app principal estiver disponível, monte por ele
    window.SystemControlPro.currentUser = { username: username, role: user.role, id: user.id };
    window.SystemControlPro.currentEmpresa = empresaId;
    window.SystemControlPro.showApp();
  } else {
    // Fallback duro: alterna containers manualmente
    var loginContainer = byId('login-container');
    var appContainer = byId('app-container');
    if (loginContainer) loginContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
  }
} catch (e) {}

// >>> ADICIONE: pedir para o app montar abas/timers
try { window.SystemControlPro && window.SystemControlPro.tryAutoLogin && window.SystemControlPro.tryAutoLogin(); } catch (e) {}
    if (!empresa) {
      var empresas = scpGetData('empresas');
      for (var j = 0; j < empresas.length; j++) {
        var es = empresas[j];
        if (Number(es && es.id) === Number(session.empresaId)) { empresa = es; break; }
      }
    }

    var empresaNameEl = byId('empresa-name');
    if (empresaNameEl) empresaNameEl.textContent = empresa && empresa.nome ? empresa.nome : '—';

    var currentUserEl = byId('current-user');
    if (currentUserEl) currentUserEl.textContent = session.username || '';

    var roleEl = byId('user-role');
    if (roleEl) {
      var isAdmin = session.role === 'admin';
      roleEl.textContent = isAdmin ? 'Admin' : 'Vendedor';
      roleEl.className = 'access-badge ' + (isAdmin ? 'access-admin' : 'access-seller');
    }
  }

  function doLogout() {
    try { sessionStorage.removeItem('scp_session'); } catch (e) {}
    var appContainer = byId('app-container');
    var loginContainer = byId('login-container');
    if (appContainer) appContainer.style.display = 'none';
    if (loginContainer) loginContainer.style.display = 'flex';
  }

  function restaurarSessao() {
    var last = null;
    try { last = localStorage.getItem('scp_last_session'); } catch (e) {}
    if (!last) return;
    try {
      var session = JSON.parse(last);
      if (!session || !session.empresaId || !session.userId) return;

      // valida empresa (prioriza apenas Admin)
var okEmpresa = false;
var sysEmp = readJSON('systemControlPro_data') || {};
var listaEmp = Array.isArray(sysEmp.empresas) ? sysEmp.empresas : [];
for (var i = 0; i < listaEmp.length; i++) {
  var e = listaEmp[i];
  if (Number(e && e.id) === Number(session.empresaId) && (e.status || 'active') !== 'inactive') {
    okEmpresa = true; break;
  }
}
      // valida usuário: tenta novo -> antigo
      var okUsuario = false;
      try {
        var sys = readJSON('systemControlPro_data') || {};
        var lista = (sys.usuarios && sys.usuarios[session.empresaId]) || [];
        if (Array.isArray(lista)) {
          for (var j = 0; j < lista.length; j++) {
            var u = lista[j];
            if (Number(u && u.id) === Number(session.userId)) { okUsuario = true; break; }
          }
        }
      } catch (err) {}
      if (!okUsuario) {
  var usuarios = scpGetData('usuarios');
  for (var k = 0; k < usuarios.length; k++) {
    var ua = usuarios[k];
    var sameEmp = Number(ua && ua.empresaId) === Number(session.empresaId);
    if (Number(ua && ua.id) === Number(session.userId) && sameEmp) { okUsuario = true; break; }
  }
}
      

      if (okEmpresa && okUsuario) {
        try {
  if (typeof mostrarApp === 'function') {
    mostrarApp(session);
  } else if (window.SystemControlPro && typeof window.SystemControlPro.showApp === 'function') {
    window.SystemControlPro.currentUser = { username: session.username, role: session.role, id: session.userId };
    window.SystemControlPro.currentEmpresa = session.empresaId;
    window.SystemControlPro.showApp();
  } else {
    var loginContainer = byId('login-container');
    var appContainer = byId('app-container');
    if (loginContainer) loginContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
  }
} catch (e) {}


// >>> ADICIONE: espelhar a sessão no formato do app index.html
  try {
    var scpSess = {
      username: session.username,
      role: session.role,
      empresaId: session.empresaId,
      ts: Date.now(),
      remember: true
    };
    localStorage.setItem('scp_session', JSON.stringify(scpSess));
  } catch (e) {}

  // >>> ADICIONE: pedir para o app montar abas/timers
  try { window.SystemControlPro && window.SystemControlPro.tryAutoLogin && window.SystemControlPro.tryAutoLogin(); } catch (e) {}

} else {
  try { sessionStorage.removeItem('scp_session'); } catch (e1) {}

      
        try { localStorage.removeItem('scp_last_session'); } catch (e2) {}
      }
    } catch (e) {}
  }

  // helpers locais
  function byId(id) { return document.getElementById(id); }

  // ===== NF-e: emissor e payload (usa configs do SCP) =====
window.SystemControlPro = window.SystemControlPro || {};

// empresa atual (id) de forma segura
SystemControlPro._empresaIdAtiva = function(){
  try {
    const s = JSON.parse(sessionStorage.getItem('scp_session')||'null');
    if (s && s.empresaId) return s.empresaId;
  } catch(e){}
  // fallback: primeira empresa do espelho
  try {
    const emps = (window.SCP && SCP.getData('empresas')) || [];
    if (Array.isArray(emps) && emps.length) return emps[0].id;
  } catch(e){}
  return 1;
};

// payload fiscal “mínimo” a partir do pedido
SystemControlPro._montarPayloadNFe = function(pedido){
  const empresaId = this._empresaIdAtiva();
  const cfg = SCP._getFiscalCfg(empresaId);

  const produtos = (this.produtos && this.produtos[empresaId]) || [];
  const itens = (pedido.items||[]).map(it=>{
    const p = produtos.find(x=> String(x.id) === String(it.produtoId)) || {};
    const preco = Number(it.preco || p.preco || 0);
    const qtd   = Number(it.quantidade || 1);
    const total = Number(it.total || (preco*qtd));
    const intra = true; // TODO: comparar UF empresa vs UF cliente
    const cfop  = p.cfop || (intra ? cfg.cfopDentro : cfg.cfopFora);
    return {
      codigo: String(p.codigo || p.id || it.produtoId),
      descricao: p.nome || `Item ${it.produtoId}`,
      ncm: p.ncm || '00000000',
      cest: p.cest || undefined,
      cfop,
      quantidade: qtd,
      valorUnitario: preco,
      valorTotal: total,
      icms: { csosn: (p.csosn || cfg.cst_csosn) },
      pis:  { cst: '49' },
      cofins:{ cst: '49' }
    };
  });

  // cliente (melhorar depois se necessário)
  const clientes = (this.clientes && this.clientes[empresaId]) || [];
  const cli = clientes.find(c=> String(c.id) === String(pedido.clienteId))
           || { nome: pedido.clienteNome || 'Consumidor' };

  const empresas = (SCP.getData('empresas')||[]);
  const emp = empresas.find(e=> Number(e.id)===Number(empresaId)) || {};

  return {
    ambiente: cfg.ambiente,
    regime: cfg.regime,
    emitente: {
      cnpj: emp.cnpj || '',
      ie: emp.ie || '',
      razaoSocial: emp.nome || '',
      endereco: emp.endereco || ''
    },
    destinatario: {
      nome: cli.nome || 'Consumidor',
      cpfCnpj: cli.cpfCnpj || '',
      email: cli.email || '',
      endereco: cli.endereco || ''
    },
    itens,
    numero: pedido.numero,
    serie: emp.serieNFe || '1',
    dataEmissao: new Date(pedido.createdAt || pedido.data || Date.now()).toISOString()
  };
};

// emissor oficial (stub) — tenta no provedor; se não configurado, retorna ok:false
SystemControlPro.emitOfficialNFe = async function(pedido){
  const empresaId = this._empresaIdAtiva();
  const cfg = SCP._getFiscalCfg(empresaId);

  if (!cfg.enabled || !cfg.provider || !cfg.apiToken) {
    return { ok:false, msg:'Provedor não configurado' };
  }

  const payload = this._montarPayloadNFe(pedido);

  // URL genérica (trocaremos quando você definir o provedor real)
  const url =
    cfg.provider === 'nfeio'
      ? (cfg.ambiente==='homolog'
           ? 'https://api-homolog.nfe.io/v2/invoices'
           : 'https://api.nfe.io/v2/invoices')
    : cfg.provider === 'focus'
      ? (cfg.ambiente==='homolog'
           ? 'https://homologacao.focusnfe.com.br/nfe2'
           : 'https://api.focusnfe.com.br/nfe2')
    : 'https://exemplo-aggregador.com/api/nfe';

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) return { ok:false, msg:`HTTP ${resp.status}` };

    const data = await resp.json();
    return {
      ok: true,
      chaveAcesso: data.chaveAcesso || data.access_key || null,
      pdfUrl: data.danfeUrl || data.pdfUrl || null,
      pdfDataUrl: data.pdfBase64 ? `data:application/pdf;base64,${data.pdfBase64}` : null,
      xml: data.xml || null,
      xmlDataUrl: data.xmlBase64 ? `data:application/xml;base64,${data.xmlBase64}` : null,
      raw: data
    };
  } catch (e) {
    console.error('emitOfficialNFe error', e);
    return { ok:false, msg:'erro de rede' };
  }
};

// ===== cálculo de tributos para o comprovante interno =====
SystemControlPro._calcTributosInternos = function(pedido){
  try{
    const empresaId = this._empresaIdAtiva ? this._empresaIdAtiva() : ((SCP.getData('empresas')||[])[0]?.id || 1);
    const fx = SCP._getFiscalCfg(empresaId);
    if (!fx.calcularTributosInternos) return null;

    const produtos = (this.produtos && this.produtos[empresaId]) || [];
    const clientes = (this.clientes && this.clientes[empresaId]) || [];
    const cli = clientes.find(c=> String(c.id)===String(pedido.clienteId)) || {};
    const ufCli = (cli.uf || '').toUpperCase();
    const ufEmp = (fx.uf || 'SP').toUpperCase();

    let totalBase = 0, totalICMS = 0, totalPIS = 0, totalCOFINS = 0;

    (pedido.items||[]).forEach(it=>{
      const p = produtos.find(x=> String(x.id)===String(it.produtoId)) || {};
      const preco = Number(it.preco || p.preco || 0);
      const qtd   = Number(it.quantidade || 1);
      const val   = Number(it.total || (preco*qtd));
      const intra = !ufCli || (ufCli === ufEmp); // se cliente não tem UF, assume intra
      const aliqICMS = intra ? Number(fx.aliqICMS_intra||0) : Number(fx.aliqICMS_inter||0);
      const base = val;
      const icms = base * (aliqICMS/100);
      const pis = base * (Number(fx.aliqPIS||0)/100);
      const cofins = base * (Number(fx.aliqCOFINS||0)/100);

      it.tributos = { base, icms, pis, cofins, aliqICMS, aliqPIS:Number(fx.aliqPIS||0), aliqCOFINS:Number(fx.aliqCOFINS||0) };
      totalBase += base; totalICMS += icms; totalPIS += pis; totalCOFINS += cofins;
    });

    const resumo = {
      base: +(totalBase.toFixed(2)),
      icms: +(totalICMS.toFixed(2)),
      pis: +(totalPIS.toFixed(2)),
      cofins: +(totalCOFINS.toFixed(2)),
      totalImpostos: +((totalICMS+totalPIS+totalCOFINS).toFixed(2)),
      ufEmpresa: ufEmp, ufCliente: ufCli || '(não informado)'
    };
    pedido.tributosResumo = resumo;
    return resumo;
  }catch(e){
    console.warn('[calc-tributos] erro', e);
    return null;
  }
};



})();
