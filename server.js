const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

// Middleware para bloquear requisições externas
app.use((req, res, next) => {
  const allowedHosts = ['localhost', '127.0.0.1'];
  const host = req.hostname;
  
  if (!allowedHosts.includes(host)) {
    return res.status(403).json({ error: 'Acesso não permitido' });
  }
  next();
});

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Função para ler dados do arquivo JSON
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir, criar com dados iniciais
    if (error.code === 'ENOENT') {
      const initialData = {
  config: {
    company: {
      name: "Jama Se Tem Ferramentas",
      address: "R. Joaquim Marra, 920 – Vila Matilde – São Paulo – SP",
      phone: ""
    },
    goals: {
      monthly_target: 100000,
      commission_percent: 3
    },
    appearance: {
      themeIntensity: 2
    },
    plan: {
      price: 200,
      maxSellers: 5
    }
  },
  sellers: [
    {
      id: 1,
      name: "Ingrid",
      email: "ingrid@jamaferramentas.com",
      phone: "(11) 99999-9999",
      commission: 3,
      status: "active"
    }
  ],
  products: [
    {
      id: "SKU-0001",
      name: "Kit de ferramentas em carrinho",
      category: "Ferramentas",
      price: 1299.90,
      cost: 800.00,
      stock: 5,
      min_stock: 1,
      active: true,
      image: ""
    },
    // ... outros produtos
  ],
  sales: [
    // ... vendas existentes
  ],
  quotes: [
          {
            id: "SKU-0001",
            name: "Kit de ferramentas em carrinho",
            category: "Ferramentas",
            price: 1299.90,
            cost: 800.00,
            stock: 5,
            min_stock: 1,
            active: true,
            image: ""
          },
          {
            id: "SKU-0002",
            name: "Martelo de Unha 20mm",
            category: "Ferramentas Manuais",
            price: 29.90,
            cost: 15.00,
            stock: 20,
            min_stock: 5,
            active: true,
            image: ""
          },
          {
            id: "SKU-0003",
            name: "Furadeira Impacto 500W",
            category: "Ferramentas Elétricas",
            price: 299.90,
            cost: 180.00,
            stock: 8,
            min_stock: 2,
            active: true,
            image: ""
          },
          {
            id: "SKU-0004",
            name: "Serra Tico-Tico 600W",
            category: "Ferramentas Elétricas",
            price: 459.90,
            cost: 280.00,
            stock: 6,
            min_stock: 2,
            active: true,
            image: ""
          },
          {
            id: "SKU-0005",
            name: "Luvas de Segurança Couro",
            category: "EPI",
            price: 24.90,
            cost: 12.00,
            stock: 30,
            min_stock: 10,
            active: true,
            image: ""
          },
          {
            id: "SKU-0006",
            name: "Óculos de Proteção",
            category: "EPI",
            price: 19.90,
            cost: 9.00,
            stock: 25,
            min_stock: 5,
            active: true,
            image: ""
          },
          {
            id: "SKU-0007",
            name: "Parafusadeira 12V",
            category: "Ferramentas Elétricas",
            price: 199.90,
            cost: 120.00,
            stock: 10,
            min_stock: 3,
            active: true,
            image: ""
          },
          {
            id: "SKU-0008",
            name: "Alicate Universal 8\"",
            category: "Ferramentas Manuais",
            price: 22.90,
            cost: 11.00,
            stock: 15,
            min_stock: 5,
            active: true,
            image: ""
          },
          {
            id: "SKU-0009",
            name: "Chave de Fenda Phillips",
            category: "Ferramentas Manuais",
            price: 9.90,
            cost: 4.50,
            stock: 40,
            min_stock: 10,
            active: true,
            image: ""
          },
          {
            id: "SKU-0010",
            name: "Carrinho de Mão",
            category: "Utilidades",
            price: 189.90,
            cost: 110.00,
            stock: 7,
            min_stock: 2,
            active: true,
            image: ""
          }
        ],
        sales: [
          {
            id: "S-2025-0001",
            datetime: new Date(new Date().setDate(1)).toISOString(),
            items: [
              { product_id: "SKU-0001", name: "Kit de ferramentas em carrinho", qty: 1, unit_price: 1299.90, discount: 0 }
            ],
            subtotal: 1299.90,
            discount_total: 0,
            total: 1299.90,
            payment_method: "PIX",
            seller: "Ingrid",
            related_quote: "Q-2025-0001"
          },
          {
            id: "S-2025-0002",
            datetime: new Date(new Date().setDate(2)).toISOString(),
            items: [
              { product_id: "SKU-0003", name: "Furadeira Impacto 500W", qty: 2, unit_price: 299.90, discount: 0 },
              { product_id: "SKU-0005", name: "Luvas de Segurança Couro", qty: 3, unit_price: 24.90, discount: 0 }
            ],
            subtotal: 299.90 * 2 + 24.90 * 3,
            discount_total: 0,
            total: 299.90 * 2 + 24.90 * 3,
            payment_method: "Cartão",
            seller: "Ingrid",
            related_quote: ""
          },
          {
            id: "S-2025-0003",
            datetime: new Date(new Date().setDate(5)).toISOString(),
            items: [
              { product_id: "SKU-0004", name: "Serra Tico-Tico 600W", qty: 1, unit_price: 459.90, discount: 20.00 }
            ],
            subtotal: 459.90,
            discount_total: 20.00,
            total: 439.90,
            payment_method: "Dinheiro",
            seller: "Ingrid",
            related_quote: ""
          },
          {
            id: "S-2025-0004",
            datetime: new Date(new Date().setDate(10)).toISOString(),
            items: [
              { product_id: "SKU-0006", name: "Óculos de Proteção", qty: 5, unit_price: 19.90, discount: 0 },
              { product_id: "SKU-0008", name: "Alicate Universal 8\"", qty: 2, unit_price: 22.90, discount: 0 }
            ],
            subtotal: 19.90 * 5 + 22.90 * 2,
            discount_total: 0,
            total: 19.90 * 5 + 22.90 * 2,
            payment_method: "PIX",
            seller: "Ingrid",
            related_quote: ""
          },
          {
            id: "S-2025-0005",
            datetime: new Date(new Date().setDate(15)).toISOString(),
            items: [
              { product_id: "SKU-0010", name: "Carrinho de Mão", qty: 2, unit_price: 189.90, discount: 30.00 }
            ],
            subtotal: 189.90 * 2,
            discount_total: 30.00,
            total: 189.90 * 2 - 30.00,
            payment_method: "Boleto",
            seller: "Ingrid",
            related_quote: "Q-2025-0002"
          }
        ],
        quotes: [
          {
            id: "Q-2025-0001",
            datetime: new Date(new Date().setDate(1) - 86400000).toISOString(),
            client: { name: "Construtora Silva", phone: "(11) 9999-8888", email: "contato@construtorasilva.com.br" },
            items: [
              { name: "Kit de ferramentas em carrinho", qty: 1, unit_price: 1299.90, discount: 0 }
            ],
            valid_days: 7,
            status: "Aprovado",
            notes: "Entrega em 3 dias úteis.",
            total: 1299.90
          },
          {
            id: "Q-2025-0002",
            datetime: new Date(new Date().setDate(14)).toISOString(),
            client: { name: "José da Silva", phone: "(11) 97777-5555", email: "jose.silva@email.com" },
            items: [
              { name: "Carrinho de Mão", qty: 2, unit_price: 189.90, discount: 30.00 }
            ],
            valid_days: 7,
            status: "Aprovado",
            notes: "Retirar na loja.",
            total: 189.90 * 2 - 30.00
          },
          {
            id: "Q-2025-0003",
            datetime: new Date(new Date().setDate(20)).toISOString(),
            client: { name: "Mercado Central", phone: "(11) 93333-2222", email: "compras@mercadocentral.com.br" },
            items: [
              { name: "Luvas de Segurança Couro", qty: 10, unit_price: 24.90, discount: 20.00 },
              { name: "Óculos de Proteção", qty: 10, unit_price: 19.90, discount: 15.00 }
            ],
            valid_days: 15,
            status: "Aberto",
            notes: "Entregar com nota fiscal.",
            total: (24.90 * 10 - 20.00) + (19.90 * 10 - 15.00)
          }
        ],
        history: []
      };
      
      // Criar diretório se não existir
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    throw error;
  }
}

// Função para escrever dados no arquivo JSON
async function writeData(data) {
  const tmpFile = DATA_FILE + '.tmp';
  try {
    await fs.writeFile(tmpFile, JSON.stringify(data, null, 2));
    await fs.rename(tmpFile, DATA_FILE);
  } catch (error) {
    // Tentar remover arquivo temporário em caso de erro
    try { await fs.unlink(tmpFile); } catch (e) {}
    throw error;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

// Produtos
app.get('/api/products', async (req, res) => {
  try {
    const data = await readData();
    let products = data.products;
    
    // Aplicar filtros
    if (req.query.category) {
      products = products.filter(p => p.category === req.query.category);
    }
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.id.toLowerCase().includes(searchTerm)
      );
    }
    if (req.query.active === 'true') {
      products = products.filter(p => p.active);
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const data = await readData();
    const newProduct = {
      id: `SKU-${String(data.products.length + 1).padStart(4, '0')}`,
      ...req.body,
      stock: parseInt(req.body.stock) || 0,
      min_stock: parseInt(req.body.min_stock) || 0,
      active: true
    };
    
    data.products.push(newProduct);
    await writeData(data);
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    
    data.products[index] = { ...data.products[index], ...req.body };
    await writeData(data);
    res.json(data.products[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/:id/stock_in', async (req, res) => {
  try {
    const data = await readData();
    const index = data.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    
    const qty = parseInt(req.body.qty) || 0;
    data.products[index].stock += qty;
    await writeData(data);
    res.json(data.products[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/:id/stock_out', async (req, res) => {
  try {
    const data = await readData();
    const index = data.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    
    const qty = parseInt(req.body.qty) || 0;
    if (data.products[index].stock < qty) {
      return res.status(400).json({ error: "Estoque insuficiente" });
    }
    
    data.products[index].stock -= qty;
    await writeData(data);
    res.json(data.products[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendas
app.get('/api/sales', async (req, res) => {
  try {
    const data = await readData();
    let sales = data.sales;
    
    // Filtrar por período
    if (req.query.from && req.query.to) {
      const fromDate = new Date(req.query.from);
      const toDate = new Date(req.query.to);
      toDate.setDate(toDate.getDate() + 1); // Incluir o dia final
      
      sales = sales.filter(s => {
        const saleDate = new Date(s.datetime);
        return saleDate >= fromDate && saleDate < toDate;
      });
    }
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const data = await readData();
    const sale = req.body;
    
    // Validar estoque antes de finalizar a venda
    for (const item of sale.items) {
      const product = data.products.find(p => p.id === item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Produto ${item.product_id} não encontrado` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ error: `Estoque insuficiente para ${product.name}` });
      }
    }
    
    // Baixar estoque
    for (const item of sale.items) {
      const productIndex = data.products.findIndex(p => p.id === item.product_id);
      data.products[productIndex].stock -= item.qty;
    }
    
    // Gerar ID da venda
    const saleId = `S-${new Date().getFullYear()}-${String(data.sales.length + 1).padStart(4, '0')}`;
    
    const newSale = {
      id: saleId,
      datetime: new Date().toISOString(),
      items: sale.items,
      subtotal: sale.subtotal,
      discount_total: sale.discount_total,
      total: sale.total,
      payment_method: sale.payment_method,
      seller: "Ingrid",
      related_quote: sale.related_quote || ""
    };
    
    data.sales.push(newSale);
    await writeData(data);
    res.json(newSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orçamentos
app.get('/api/quotes', async (req, res) => {
  try {
    const data = await readData();
    let quotes = data.quotes;
    
    // Atualizar status de orçamentos vencidos
    const today = new Date();
    let updated = false;
    
    for (const quote of quotes) {
      const quoteDate = new Date(quote.datetime);
      const expiryDate = new Date(quoteDate);
      expiryDate.setDate(quoteDate.getDate() + quote.valid_days);
      
      if (quote.status === "Aberto" && today > expiryDate) {
        quote.status = "Vencido";
        updated = true;
      }
    }
    
    if (updated) {
      await writeData(data);
    }
    
    // Filtrar por status se solicitado
    if (req.query.status) {
      quotes = quotes.filter(q => q.status === req.query.status);
    }
    
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const data = await readData();
    const quote = req.body;
    
    // Gerar ID do orçamento
    const quoteId = `Q-${new Date().getFullYear()}-${String(data.quotes.length + 1).padStart(4, '0')}`;
    
    const newQuote = {
      id: quoteId,
      datetime: new Date().toISOString(),
      client: quote.client,
      items: quote.items,
      valid_days: parseInt(quote.valid_days) || 7,
      status: "Aberto",
      notes: quote.notes,
      total: quote.total
    };
    
    data.quotes.push(newQuote);
    await writeData(data);
    res.json(newQuote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/quotes/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.quotes.findIndex(q => q.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Orçamento não encontrado" });
    }
    
    data.quotes[index] = { ...data.quotes[index], ...req.body };
    await writeData(data);
    res.json(data.quotes[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quotes/:id/approve', async (req, res) => {
  try {
    const data = await readData();
    const index = data.quotes.findIndex(q => q.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Orçamento não encontrado" });
    }
    
    data.quotes[index].status = "Aprovado";
    await writeData(data);
    res.json(data.quotes[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quotes/:id/cancel', async (req, res) => {
  try {
    const data = await readData();
    const index = data.quotes.findIndex(q => q.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Orçamento não encontrado" });
    }
    
    data.quotes[index].status = "Cancelado";
    await writeData(data);
    res.json(data.quotes[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quotes/:id/convert', async (req, res) => {
  try {
    const data = await readData();
    const quoteIndex = data.quotes.findIndex(q => q.id === req.params.id);
    
    if (quoteIndex === -1) {
      return res.status(404).json({ error: "Orçamento não encontrado" });
    }
    
    const quote = data.quotes[quoteIndex];
    
    // Verificar se todos os produtos existem e têm estoque suficiente
    const saleItems = [];
    for (const item of quote.items) {
      // Encontrar produto pelo nome (não ideal, mas necessário sem ID no orçamento)
      const product = data.products.find(p => 
        p.name === item.name && p.active
      );
      
      if (!product) {
        return res.status(400).json({ error: `Produto "${item.name}" não encontrado ou inativo` });
      }
      
      if (product.stock < item.qty) {
        return res.status(400).json({ error: `Estoque insuficiente para ${product.name}` });
      }
      
      saleItems.push({
        product_id: product.id,
        name: product.name,
        qty: item.qty,
        unit_price: item.unit_price,
        discount: item.discount || 0
      });
    }
    
    // Calcular totais
    const subtotal = saleItems.reduce((sum, item) => sum + (item.unit_price * item.qty), 0);
    const discount_total = saleItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    const total = subtotal - discount_total;
    
    // Gerar ID da venda
    const saleId = `S-${new Date().getFullYear()}-${String(data.sales.length + 1).padStart(4, '0')}`;
    
    const newSale = {
      id: saleId,
      datetime: new Date().toISOString(),
      items: saleItems,
      subtotal: subtotal,
      discount_total: discount_total,
      total: total,
      payment_method: req.body.payment_method || "Dinheiro",
      seller: "Ingrid",
      related_quote: quote.id
    };
    
    // Baixar estoque
    for (const item of saleItems) {
      const productIndex = data.products.findIndex(p => p.id === item.product_id);
      data.products[productIndex].stock -= item.qty;
    }
    
    // Atualizar status do orçamento
    data.quotes[quoteIndex].status = "Aprovado";
    
    // Adicionar venda
    data.sales.push(newSale);
    await writeData(data);
    
    res.json(newSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Metas & Comissão
app.get('/api/goals', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.config.goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/goals', async (req, res) => {
  try {
    const data = await readData();
    data.config.goals = { ...data.config.goals, ...req.body };
    
    // Adicionar ao histórico
    data.history.push({
      type: "goals_update",
      datetime: new Date().toISOString(),
      data: data.config.goals
    });
    
    await writeData(data);
    res.json(data.config.goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/goals/summary', async (req, res) => {
  try {
    const data = await readData();
    const targetMonth = req.query.month || new Date().toISOString().slice(0, 7);
    
    // Filtrar vendas do mês
    const monthSales = data.sales.filter(s => {
      const saleDate = new Date(s.datetime);
      return saleDate.toISOString().slice(0, 7) === targetMonth;
    });
    
    // Calcular total de vendas
    const totalSales = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Calcular percentual da meta
    const target = data.config.goals.monthly_target;
    const percent = target > 0 ? (totalSales / target) * 100 : 0;
    
    // Calcular comissão
    const commission = totalSales * (data.config.goals.commission_percent / 100);
    
    res.json({
      month: targetMonth,
      sales_total: totalSales,
      target: target,
      target_percent: percent,
      commission: commission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configurações
app.get('/api/config', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/config', async (req, res) => {
  try {
    const data = await readData();
    data.config = { ...data.config, ...req.body };
    
    // Adicionar ao histórico
    data.history.push({
      type: "config_update",
      datetime: new Date().toISOString(),
      data: data.config
    });
    
    await writeData(data);
    res.json(data.config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exportar dados
app.get('/api/export', async (req, res) => {
  try {
    const data = await readData();
    const type = req.query.type || 'sales';
    let csv = '';
    
    if (type === 'sales') {
      // Cabeçalho
      csv = 'ID,Data,Itens,Subtotal,Desconto,Total,Forma de Pagamento,Vendedor\n';
      
      // Dados
      data.sales.forEach(sale => {
        const items = sale.items.map(item => `${item.name} (${item.qty}x)`).join('; ');
        const date = new Date(sale.datetime).toLocaleDateString('pt-BR');
        csv += `"${sale.id}","${date}","${items}",${sale.subtotal},${sale.discount_total},${sale.total},${sale.payment_method},${sale.seller}\n`;
      });
      
    } else if (type === 'products') {
      // Cabeçalho
      csv = 'ID,Nome,Categoria,Preço,Custo,Estoque,Estoque Mínimo,Status\n';
      
      // Dados
      data.products.forEach(product => {
        csv += `"${product.id}","${product.name}","${product.category}",${product.price},${product.cost || ''},${product.stock},${product.min_stock},${product.active ? 'Ativo' : 'Inativo'}\n`;
      });
      
    } else if (type === 'quotes') {
      // Cabeçalho
      csv = 'ID,Data,Cliente,Itens,Validade (dias),Status,Total,Observações\n';
      
      // Dados
      data.quotes.forEach(quote => {
        const items = quote.items.map(item => `${item.name} (${item.qty}x)`).join('; ');
        const date = new Date(quote.datetime).toLocaleDateString('pt-BR');
        const client = quote.client.name || '';
        csv += `"${quote.id}","${date}","${client}","${items}",${quote.valid_days},${quote.status},${quote.total},"${quote.notes}"\n`;
      });
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Vendedores - NOVAS ROTAS
app.get('/api/sellers', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.sellers || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sellers', async (req, res) => {
  try {
    const data = await readData();
    const newSeller = {
      id: `SELL-${String((data.sellers || []).length + 1).padStart(4, '0')}`,
      ...req.body,
      status: req.body.status || 'active'
    };
    
    if (!data.sellers) data.sellers = [];
    data.sellers.push(newSeller);
    
    await writeData(data);
    res.json(newSeller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sellers/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = (data.sellers || []).findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Vendedor não encontrado" });
    }
    
    data.sellers[index] = { ...data.sellers[index], ...req.body };
    await writeData(data);
    res.json(data.sellers[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sellers/:id', async (req, res) => {
  try {
    const data = await readData();
    
    // Verificar se o vendedor tem vendas
    const hasSales = (data.sales || []).some(s => s.sellerId === req.params.id);
    if (hasSales) {
      return res.status(400).json({ error: "Não é possível remover vendedor com vendas registradas" });
    }
    
    data.sellers = (data.sellers || []).filter(s => s.id !== req.params.id);
    await writeData(data);
    res.json({ message: "Vendedor removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Produtos - NOVA ROTA PARA REMOVER
app.delete('/api/products/:id', async (req, res) => {
  try {
    const data = await readData();
    
    // Verificar se o produto tem vendas
    const hasSales = (data.sales || []).some(s => s.items.some(i => i.product_id === req.params.id));
    if (hasSales) {
      return res.status(400).json({ error: "Não é possível remover produto com vendas registradas" });
    }
    
    data.products = data.products.filter(p => p.id !== req.params.id);
    await writeData(data);
    res.json({ message: "Produto removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Planos - NOVAS ROTAS
app.get('/api/plan', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.config.plan || { price: 200, maxSellers: 5 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/plan', async (req, res) => {
  try {
    const data = await readData();
    
    // Verificar se o novo limite é menor que vendedores ativos
    const activeSellers = (data.sellers || []).filter(s => s.status === 'active').length;
    if (req.body.maxSellers && req.body.maxSellers < activeSellers) {
      return res.status(400).json({ 
        error: `Não é possível definir limite menor que vendedores ativos (${activeSellers})` 
      });
    }
    
    data.config.plan = { ...data.config.plan, ...req.body };
    await writeData(data);
    res.json(data.config.plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup de dados
app.get('/api/backup', async (req, res) => {
  try {
    const data = await readData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=data-backup.json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset de demonstração
app.post('/api/reset-demo', async (req, res) => {
  try {
    if (req.headers['x-confirm'] !== 'true') {
      return res.status(400).json({ error: "Confirmação necessária" });
    }
    
    // Remover arquivo de dados para forçar recriação
    try {
      await fs.unlink(DATA_FILE);
    } catch (error) {
      // Ignora se o arquivo não existir
    }
    
    // Recriar dados
    await readData();
    res.json({ message: "Dados de demonstração resetados com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor rodando em http://127.0.0.1:${PORT}`);
});