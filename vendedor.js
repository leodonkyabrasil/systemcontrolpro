/* vendedor.js — força ler empresas do empresas.json no Index */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    // Popula o select assim que abrir
    popularEmpresasSelect();
    // repete após 300ms (às vezes o core ainda está inicializando)
    setTimeout(popularEmpresasSelect, 300);

    // Eventos de login / logout
    const loginForm = byId('login-form');
    if (loginForm) loginForm.addEventListener('submit', onLoginSubmit);

    const logoutBtn = byId('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);

    // Recarrega a lista quando volta foco na aba
    window.addEventListener('focus', () => { try { popularEmpresasSelect(); } catch {} });

    // Se outra aba alterar o storage, repopula
    window.addEventListener('storage', (e) => {
      if (!e) return;
      if (e.key === 'empresas' || e.key === 'systemControlPro_data') {
        try { popularEmpresasSelect(); } catch {}
      }
    });

    // Comando manual no console, se quiser
    window.VND_refreshEmpresas = () => { try { popularEmpresasSelect(); } catch (e) { console.warn(e); } };

    // (opcional) restaurar sessão automática – mantido neutro por enquanto
    // restaurarSessao();
  }

  // ===== helpers =====
  function byId(id) { return document.getElementById(id); }
  function readJSON(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function scpGetData(key) {
    try {
      if (window.SCP && typeof window.SCP.getData === 'function') {
        const v = window.SCP.getData(key);
        return Array.isArray(v) ? v : (v || []);
      }
    } catch {}
    return [];
  }

  // ===== pega empresas.json toda vez que abrir o Index =====
  async function fetchEmpresasJson() {
    try {
      const res = await fetch('empresas.json', { cache: 'no-store' });
      if (!res.ok) return [];
      const j = await res.json();
      const empresas = Array.isArray(j.empresas) ? j.empresas : [];
      // Espelha no SCP (para quem usa SCP.getData('empresas'))
      try { if (window.SCP?.setData) SCP.setData('empresas', empresas); } catch {}
      return empresas;
    } catch (e) {
      console.warn('Falha ao buscar empresas.json', e);
      return [];
    }
  }

  // ===== monta o <select id="empresa"> =====
  async function popularEmpresasSelect() {
    const sel = byId('empresa');
    if (!sel) {
      console.warn('[vendedor] select #empresa não encontrado no DOM.');
      return;
    }

    // limpa opções (exceto a vazia "")
    sel.querySelectorAll('option:not([value=""])').forEach(o => o.remove());

    // 1) tenta ler do JSON (universal)
    let empresas = await fetchEmpresasJson();

    // 2) se deu ruim, tenta SCP (espelho local)
    if (!empresas.length && window.SCP?.getData) {
      empresas = (SCP.getData('empresas') || []).slice();
    }

    // 3) se ainda não tem, tenta Admin local (só vai funcionar na sua máquina/origem)
    if (!empresas.length) {
      const sys = readJSON('systemControlPro_data') || {};
      if (Array.isArray(sys.empresas)) empresas = sys.empresas.slice();
    }

    // filtra as ativas e ordena
    empresas = empresas
      .filter(e => (e.status || 'active') !== 'inactive')
      .sort((a, b) =>
        String(a.codigo || '').localeCompare(String(b.codigo || '')) ||
        String(a.nome || '').localeCompare(String(b.nome || ''))
      );

    // monta opções
    empresas.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = (e.codigo ? `${e.codigo} — ` : '') + e.nome;
      sel.appendChild(opt);
    });

    console.log(`[vendedor] empresas no login: ${empresas.length}`);
  }
  // expõe para o index chamar se precisar
  window.popularEmpresasSelect = popularEmpresasSelect;

  function syncUsersFromSystemData() {
  try {
    const sysData = JSON.parse(localStorage.getItem('systemControlPro_data') || '{}');
    const usuarios = [];
    
    // Converter estrutura do systemControlPro_data para estrutura do SCP
    Object.keys(sysData.usuarios || {}).forEach(empresaId => {
      sysData.usuarios[empresaId].forEach(usuario => {
        usuarios.push({
          ...usuario,
          empresaId: Number(empresaId)
        });
      });
    });
    
    // Salvar no SCP
    if (window.SCP && window.SCP.setData) {
      SCP.setData('usuarios', usuarios);
    }
  } catch (e) {
    console.error('Erro ao sincronizar usuários:', e);
  }
}
function syncUsersToSCP() {
  try {
    // Lê os dados do systemControlPro_data
    const sysData = JSON.parse(localStorage.getItem('systemControlPro_data') || '{}');
    const usuarios = [];

    // Converte a estrutura de usuários do systemControlPro_data para a estrutura do SCP
    if (sysData.usuarios && typeof sysData.usuarios === 'object') {
      Object.keys(sysData.usuarios).forEach(empresaId => {
        const usersInEmpresa = sysData.usuarios[empresaId];
        if (Array.isArray(usersInEmpresa)) {
          usersInEmpresa.forEach(user => {
            usuarios.push({
              id: user.id,
              empresaId: Number(empresaId),
              username: user.username,
              password: user.password,
              role: user.role,
              ativo: user.status !== 'inactive' // Assume que se não estiver inativo, está ativo
            });
          });
        }
      });
    }

    // Salva no SCP (core-storage)
    if (window.SCP && window.SCP.setData) {
      window.SCP.setData('usuarios', usuarios);
    }
  } catch (error) {
    console.error('Erro ao sincronizar usuários para SCP:', error);
  }
}
  async function onLoginSubmit(ev) {
  if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();

  // Sincroniza os usuários do systemControlPro_data para o SCP
  syncUsersToSCP();

  const empresaId = Number(document.getElementById('empresa')?.value || 0);
  const username  = String(document.getElementById('username')?.value || '').trim();
  const password  = String(document.getElementById('password')?.value || '').trim();

  if (!empresaId) return alert('Selecione a empresa.');
  if (!username || !password) return alert('Informe usuário e senha.');

  let user = null;

  // 1) Primeiro tenta no systemControlPro_data
  try {
    const sys = JSON.parse(localStorage.getItem('systemControlPro_data') || '{}');
    const lista = sys.usuarios?.[empresaId] || [];
    user = lista.find(u => u.username === username && u.password === password);
  } catch {}

  // 2) Se não encontrou, tenta no SCP
  if (!user && window.SCP?.getData) {
    const uArr = SCP.getData('usuarios') || [];
    user = uArr.find(u =>
      Number(u.empresaId) === empresaId &&
      u.username === username &&
      u.password === password
    );
  }

  // 3) Fallback para admin padrão
  if (!user && username === 'admin' && password === 'admin123') {
    user = { id: 1, empresaId, username, role: 'admin', ativo: true };
  }


  if (!user) {
    alert('Usuário ou senha inválidos para a empresa selecionada.');
    return false;
  }

  // Sessão completa (INCLUI userId)
  const session = {
    empresaId,
    userId: Number(user.id || 1),
    username: user.username,
    role: user.role || 'seller',
    ts: Date.now()
  };

  // Salva para quem lê sessionStorage e para quem lê localStorage
  try { sessionStorage.setItem('scp_session', JSON.stringify(session)); } catch {}
  try { localStorage.setItem('scp_last_session', JSON.stringify(session)); } catch {}


  // DEBUG: Verificar dados de usuários
console.log("=== DEBUG USER DATA ===");

// Verificar systemControlPro_data
const sysData = JSON.parse(localStorage.getItem('systemControlPro_data') || '{}');
console.log("SystemControlPro Data:", sysData);

// Verificar usuários no SCP
if (window.SCP && window.SCP.getData) {
    const scpUsers = SCP.getData('usuarios') || [];
    console.log("SCP Users:", scpUsers);
} else {
    console.log("SCP não está disponível");
}

// Verificar se há empresas
const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
console.log("Empresas no localStorage:", empresas);
  // Monta o app no próprio index (sem redirecionar)
  await montarAppDepoisDoLogin(session);
  return false;
}


async function montarAppDepoisDoLogin(session){
  try {
    // Garante seed do espelho (empresas/usuarios) a partir do empresas.json
    if (window.SCP?.seedIfEmpty) {
      try { await window.SCP.seedIfEmpty(); } catch(e){}
    }

    // --- Sessão esperada pelo index ---
window.SystemControlPro = window.SystemControlPro || {};

// Carrega a empresa como OBJETO (não só o id)
const empresas = (window.SCP?.getData('empresas') || []);
const empresaObj = empresas.find(e => Number(e.id) === Number(session.empresaId))
                 || { id: session.empresaId, nome: `Empresa ${String(session.empresaId).padStart(4,'0')}`, ativo: true };

SystemControlPro.currentUser    = { id: session.userId, username: session.username, role: session.role };
SystemControlPro.currentEmpresa = empresaObj;
SystemControlPro.session        = {
  currentUser: { id: session.userId, username: session.username, role: session.role },
  empresaId: session.empresaId
};

// (opcional) Atualiza label do cabeçalho se existir
try {
  const el = document.getElementById('empresa-name');
  if (el) el.textContent = empresaObj.nome || `Empresa ${String(empresaObj.id).padStart(4,'0')}`;
} catch {}

    // (re)carrega dados locais se existirem
    try { SystemControlPro.loadFromStorage && SystemControlPro.loadFromStorage(); } catch(e){}
    try { SystemControlPro.normalizeData && SystemControlPro.normalizeData(); } catch(e){}
    try { SystemControlPro.saveToStorage && SystemControlPro.saveToStorage(); } catch(e){}

    // Monta UI
    if (typeof window.mostrarApp === 'function') {
      window.mostrarApp(session);
    } else if (typeof SystemControlPro.showApp === 'function') {
      SystemControlPro.showApp();
    } else {
      // fallback: alterna containers padrão
      const loginContainer = document.getElementById('login-container');
      const appContainer   = document.getElementById('app-container');
      if (loginContainer) loginContainer.style.display = 'none';
      if (appContainer)   appContainer.style.display   = 'flex';
    }

    // Prepara tabs e ativa a primeira
    if (typeof window.setupTabs === 'function') {
      try { window.setupTabs(); } catch(e){}
    }
    const firstTab = document.querySelector('.tabs .tab');
    if (firstTab) firstTab.click();

    // Garantias extras de render (se essas funções existirem no seu app)
    try { SystemControlPro.renderOrders  && SystemControlPro.renderOrders(); } catch(e){}
    try { SystemControlPro.renderQuotes  && SystemControlPro.renderQuotes(); } catch(e){}
    try { SystemControlPro.renderNotas   && SystemControlPro.renderNotas(); } catch(e){}
    try { SystemControlPro.updateCartUI  && SystemControlPro.updateCartUI(); } catch(e){}

  } catch (err) {
    console.error('[montarAppDepoisDoLogin] falhou', err);
    alert('Login ok, mas não consegui montar as abas. Veja o Console (F12).');
  }
}



  function doLogout() {
    try { sessionStorage.removeItem('scp_session'); } catch {}
    const app  = byId('app-container');
    const login = byId('login-container');
    if (app) app.style.display = 'none';
    if (login) login.style.display = 'flex';
  }

  function restaurarSessao() {
    // Se quiser restaurar automaticamente, implemente aqui algo similar ao que você já tinha
    // Por enquanto, deixo neutro para evitar confusão
  }

})();
