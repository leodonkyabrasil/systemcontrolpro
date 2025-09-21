// core-storage.js
(function () {

  // ====== SNAPSHOTS: CONFIG E HELPERS ======
  // Ajuste a URL se rodar em outra porta/host:
  const SNAPSHOT_BASE = 'http://localhost:5500/api';

  let _snapshotTimer = null;
  let _snapshotReason = 'auto';

  function _getCurrentEmpresaIdSafe() {
    try {
      const s = JSON.parse(sessionStorage.getItem('scp_session') || 'null');
      return s?.empresaId ?? 0;
    } catch (e) {
      return 0;
    }
  }

  // ====== DADOS BASE ======
  const DEFAULTS = {
    empresas: [],
    usuarios: [],      // {id, empresaId, username, password, role: "admin"|"seller"|"customer", ativo: true}
    produtos: [],      // {id, empresaId, nome, sku, preco, pricePolicy: "contract"|"margin"|"consult"}
    clientes: [],      // {id, empresaId, nome, email, doc, telefone}
    orcamentos: [],    // {id, empresaId, clienteId, itens:[{produtoId, qtd, preco, pricePolicy, needsPriceConfirm}], status, createdAt}
    pedidos: [],       // {id, empresaId, orcamentoId, numero, createdAt}
    carrinho: []       // usado no portal do cliente
  };

  // ====== STORAGE API ======
  function getData(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }

  function _scheduleSnapshot(reason = 'auto') {
    _snapshotReason = reason;
    clearTimeout(_snapshotTimer);
    _snapshotTimer = setTimeout(() => _postSnapshot(_snapshotReason), 2500); // debounce 2.5s
  }

  function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    try { _scheduleSnapshot(`set:${key}`); } catch (e) {}
  }

  function pushData(key, item) {
    const arr = getData(key) || [];
    arr.push(item);
    setData(key, arr);
    return item;
  }

 function nextIdFromArray(arr) {
  return arr.length ? Math.max(...arr.map(i => +i.id || 0)) + 1 : 1;
}

  function nextId(key) {
    const arr = getData(key) || [];
    return nextIdFromArray(arr);
  }

  // ====== SNAPSHOT POST ======
  function _collectDump() {
    const dump = {};
    Object.keys(DEFAULTS).forEach(k => dump[k] = getData(k));
    return dump;
  }

  // se quiser ativar snapshots, remova o "return;" logo abaixo
  async function _postSnapshot(reason = 'auto') { return;
    const empresaId = _getCurrentEmpresaIdSafe();
    const body = {
      empresaId,
      userId: null,
      at: new Date().toISOString(),
      dump: _collectDump()
    };
    try {
      const resp = await fetch(`${SNAPSHOT_BASE}/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) console.warn('[snapshot] HTTP', resp.status);
    } catch (e) {
      console.warn('[snapshot] erro ao enviar', e);
    }
  }

  // ====== SEED & NORMALIZE ======
  // ====== SEED & NORMALIZE ======
async function seedIfEmpty() {
  // Se já tem empresas válidas, não faz nada
  const emp = getData('empresas');
  const temEmpresas = Array.isArray(emp) && emp.length > 0;
  if (temEmpresas) return;

  // 1) EMPRESAS: sempre tenta carregar do empresas.json
  try {
    const resp = await fetch('./empresas.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const empresas = Array.isArray(data.empresas) ? data.empresas : [];
    if (!empresas.length) return; // sem empresas, sem seed
    setData('empresas', empresas);

    // 2) USUÁRIOS:
    // tenta pegar do storage; se vazio, tenta usuarios.json;
    // e garante um admin/admin123 por empresa se faltar
    let usuarios = getData('usuarios') || [];

    if (usuarios.length === 0) {
      try {
        const ur = await fetch('./usuarios.json', { cache: 'no-store' });
        if (ur.ok) {
          const uj = await ur.json();
          const raw = Array.isArray(uj?.usuarios) ? uj.usuarios
                     : (Array.isArray(uj) ? uj : []);
          usuarios = raw.map((u, i) => ({
            id: Number(u.id ?? (i + 1)),
            empresaId: Number(u.empresaId),
            username: String(u.username || '').trim(),
            password: String(u.password || '').trim(),
            role: u.role || 'seller',
            ativo: u.ativo !== false
          })).filter(u => u.empresaId && u.username && u.password);
        }
      } catch (e) {
        console.warn('[seed] usuarios.json não encontrado ou inválido:', e);
      }
    }

    // garante admin/admin123 por empresa
    let nextId = usuarios.reduce((m, u) => Math.max(m, Number(u.id || 0)), 0) + 1;
    empresas.forEach(e => {
      const temAdmin = usuarios.some(u =>
        Number(u.empresaId) === Number(e.id) && u.username === 'admin'
      );
      if (!temAdmin) {
        usuarios.push({
          id: nextId++,
          empresaId: Number(e.id),
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          ativo: true
        });
      }
    });

    setData('usuarios', usuarios);
    console.log('[SCP] Seed concluído:', { empresas: empresas.length, usuarios: usuarios.length });

  } catch (e) {
    console.warn('Seed empresas falhou:', e);
  }
}


  // ===== Bridge: espelha systemControlPro_data -> SCP (empresas/usuarios) =====
  function bridgeSyncFromSystemControlPro() {
    window.SCP = Object.assign(window.SCP || {}, {
      syncFromAdmin: bridgeSyncFromSystemControlPro
    });

        // Expor a API básica no objeto SCP
    window.SCP = Object.assign(window.SCP, {
      getData,
      setData,
      pushData,
      nextId,
      seedIfEmpty, // útil para o index/portal puxarem empresas.json quando vazio
    });

    try {
      const sys = JSON.parse(localStorage.getItem('systemControlPro_data') || '{}');




   
  





      if (Array.isArray(sys.empresas) && sys.empresas.length > 0) {
        const empresasPlano = sys.empresas.map(e => ({
          id: e.id,
          nome: e.nome,
          cnpj: e.cnpj || '',
          email: e.email || '',
          telefone: e.telefone || '',
          endereco: e.endereco || '',
          plano: e.plano || 'basic',
          status: e.status || 'active',
          codigo: e.codigo || ''
         }));
        setData('empresas', empresasPlano);
      }

      if (sys.usuarios && typeof sys.usuarios === 'object') {
        const usuariosPlano = [];
        Object.keys(sys.usuarios).forEach(eid => {
          (sys.usuarios[eid] || []).forEach(u => {
            usuariosPlano.push({
              id: u.id,
              empresaId: Number(eid),
              username: u.username,
              password: u.password,
              role: u.role || 'admin',
              ativo: (u.status || 'active') !== 'inactive'
            });
          });
        });
        setData('usuarios', usuariosPlano);
      }
    } catch (e) {
      console.warn('[bridge] falha ao espelhar systemControlPro_data -> SCP', e);
    }
  }

  function normalizeData() {
    Object.keys(DEFAULTS).forEach(k => {
      if (getData(k) === null) setData(k, DEFAULTS[k]);
    });
  }

  // ====== REGRAS ======
  function computeNeedsPriceConfirm(pricePolicy) {
    return pricePolicy === 'margin' || pricePolicy === 'consult';
  }

  // ===== Funções públicas extras para backup/restauração =====
  async function backupNow() { return _postSnapshot('manual'); }

  async function listSnapshots(empresaId) {
    const id = empresaId ?? _getCurrentEmpresaIdSafe();
    const url = `${SNAPSHOT_BASE}/snapshot/list?empresaId=${encodeURIComponent(id)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Falha ao listar snapshots');
    const j = await r.json();
    return j.items || [];
  }

  async function restoreSnapshot(id, empresaId) {
    const eid = empresaId ?? _getCurrentEmpresaIdSafe();
    const url = `${SNAPSHOT_BASE}/snapshot/get?empresaId=${encodeURIComponent(eid)}&id=${encodeURIComponent(id)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Snapshot não encontrado');
    const j = await r.json();
    const dump = j?.snapshot?.dump;
    if (!dump) throw new Error('Dump inválido');

    Object.keys(DEFAULTS).forEach(k => setData(k, dump[k] ?? DEFAULTS[k]));
    return true;
  }

  // ===== BLOCO CONFIGURAÇÃO FISCAL =====
  const configFisco = {};

  function _getFiscalCfg(empresaId) {
  const base = {
    uf: 'SP',
    aliqICMS_intra: 12,
    aliqICMS_inter: 18,
    aliqPIS: 0.65,
    aliqCOFINS: 3.0,
    calcularTributosInternos: true
  };
  return { ...base, ...(configFisco[empresaId] || {}) };
}
  

function _saveFiscalCfg(empresaId, cfg) {
  configFisco[empresaId] = { ..._getFiscalCfg(empresaId), ...cfg };
  setData('configFisco', configFisco);
}

  // ====== EXPOSE ======
  window.SCP = {
    getData, setData, pushData, nextId,
    normalizeData, seedIfEmpty, computeNeedsPriceConfirm,
    backupNow, listSnapshots, restoreSnapshot,
    configFisco, _getFiscalCfg, _saveFiscalCfg,
    syncFromAdmin: bridgeSyncFromSystemControlPro
  };



  
  // ====== INIT ======
  (async function init() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'systemControlPro_data') {
        bridgeSyncFromSystemControlPro();
      }
    });

    if (window.SCP_DEMO_SEED === true) { await seedIfEmpty(); }
normalizeData();
bridgeSyncFromSystemControlPro();


    try {
      const savedCfg = getData('configFisco');
      if (savedCfg && typeof savedCfg === 'object') {
        Object.assign(configFisco, savedCfg);
      }
    } catch (e) {}

    normalizeData();
    bridgeSyncFromSystemControlPro();
  })();

})(); // fecha a IIFE principal
