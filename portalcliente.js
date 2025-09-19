// portalcliente.js
// Regras: Cliente adiciona → carrinho → envia orçamento.
// Se houver item com needsPriceConfirm (pricePolicy 'margin'|'consult'): status 'pending_supplier'.
// Produtos 'contract' mostram preço fixo; 'margin/consult' mostram aviso.

(function () {
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    SCP.normalizeData();
    montarCatalogo();
    renderCart();
  }

  function montarCatalogo() {
    // Ajuste se quiser filtrar por empresa (ex: querystring). Por ora, mostra tudo:
    const produtos = SCP.getData('produtos') || [];
    const grid = qs('.products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    produtos.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img class="product-image" src="https://picsum.photos/seed/${p.id}/600/400" alt="">
        <div class="product-info">
          <div class="product-company">${p.sku || ''}</div>
          <div class="product-name">${p.nome}</div>
          <div class="product-price">R$ ${Number(p.preco||0).toFixed(2)}</div>
          <button class="add-to-cart">Adicionar</button>
        </div>`;
      card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(p));
      grid.appendChild(card);
    });
  }

  function addToCart(prod) {
    const carrinho = SCP.getData('carrinho') || [];
    const existsIdx = carrinho.findIndex(i => i.produtoId === prod.id);
    const novoItem = {
      produtoId: prod.id,
      nome: prod.nome,
      qtd: 1,
      preco: Number(prod.preco||0),
      pricePolicy: prod.pricePolicy || 'contract',
      needsPriceConfirm: SCP.computeNeedsPriceConfirm(prod.pricePolicy)
    };

    if (existsIdx >= 0) {
      carrinho[existsIdx].qtd += 1;
    } else {
      carrinho.push(novoItem);
    }
    SCP.setData('carrinho', carrinho);
    renderCart();
  }

  function renderCart() {
    const wrap = qs('.cart-container');
    if (!wrap) return;

    const carrinho = SCP.getData('carrinho') || [];
    const precisaConfirm = carrinho.some(i => i.needsPriceConfirm);

    // Aviso laranja (borda tracejada) apenas quando necessário
    const aviso = precisaConfirm ? `
      <div style="background:#fff3e0;border:2px dashed #f39c12;color:#8a5a00;padding:12px;border-radius:8px;margin-bottom:12px">
        <strong>Atenção:</strong> Este item está sujeito à confirmação de preço do fornecedor antes da aprovação do orçamento.
      </div>` : '';

    const itensHtml = carrinho.map((i, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div><strong>${i.nome}</strong></div>
          <div style="font-size:12px;color:#7f8c8d">
            Política: ${i.pricePolicy}${i.needsPriceConfirm ? ' • requer confirmação de preço' : ''}
          </div>
        </div>
        <div class="cart-item-actions">
          <button onclick="PC_decItem(${idx})">-</button>
          <span>${i.qtd}</span>
          <button onclick="PC_incItem(${idx})">+</button>
          <button onclick="PC_remItem(${idx})" title="remover">x</button>
        </div>
      </div>`).join('');

    const total = carrinho.reduce((acc, i) => acc + i.preco * i.qtd, 0);

    wrap.innerHTML = `
      ${aviso}
      ${itensHtml || '<p>Carrinho vazio.</p>'}
      <div class="cart-total">Total: R$ ${total.toFixed(2)}</div>
      <button class="checkout-btn" ${carrinho.length ? '' : 'disabled'} onclick="PC_enviarOrcamento()">Enviar Orçamento</button>
    `;
  }

  // Funções expostas no window para os botões inline
  window.PC_incItem = function (idx) {
    const carrinho = SCP.getData('carrinho') || [];
    if (!carrinho[idx]) return;
    carrinho[idx].qtd += 1;
    SCP.setData('carrinho', carrinho);
    renderCart();
  };
  window.PC_decItem = function (idx) {
    const carrinho = SCP.getData('carrinho') || [];
    if (!carrinho[idx]) return;
    carrinho[idx].qtd = Math.max(1, carrinho[idx].qtd - 1);
    SCP.setData('carrinho', carrinho);
    renderCart();
  };
  window.PC_remItem = function (idx) {
    const carrinho = SCP.getData('carrinho') || [];
    carrinho.splice(idx, 1);
    SCP.setData('carrinho', carrinho);
    renderCart();
  };

  window.PC_enviarOrcamento = function () {
    const carrinho = SCP.getData('carrinho') || [];
    if (!carrinho.length) return;

    const precisaConfirm = carrinho.some(i => i.needsPriceConfirm);

    const orc = {
      id: SCP.nextId('orcamentos'),
      empresaId: null, // opcional: amarrar por empresa se o portal do cliente informar
      clienteId: null, // opcional: se cliente estiver logado
      itens: carrinho.map(i => ({
        produtoId: i.produtoId,
        qtd: i.qtd,
        preco: i.preco,
        pricePolicy: i.pricePolicy,
        needsPriceConfirm: i.needsPriceConfirm
      })),
      status: precisaConfirm ? 'pending_supplier' : 'awaiting_customer',
      createdAt: new Date().toISOString()
    };

    const all = SCP.getData('orcamentos') || [];
    all.push(orc);
    SCP.setData('orcamentos', all);

    // limpar carrinho
    SCP.setData('carrinho', []);
    renderCart();

    alert(precisaConfirm
      ? 'Seu orçamento foi enviado e aguarda validação de preço pelo fornecedor.'
      : 'Seu orçamento foi enviado! Aguarde a aprovação.');
  };

  function qs(sel) { return document.querySelector(sel); }
})();