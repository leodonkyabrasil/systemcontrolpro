// Variáveis globais
let currentPage = {
    products: 1,
    pageSize: 10
};
let saleItems = [];
let quoteItems = [];
let allProducts = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDashboard();
    setupEventListeners();
});

// Inicializar aplicação
function initializeApp() {
    // Carregar configurações de tema
    loadThemeSettings();
    
    // Carregar produtos
    fetchProducts();
    
    // Carregar categorias para datalist
    loadCategories();
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Navegação por abas
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Busca global
    document.getElementById('search-btn').addEventListener('click', performGlobalSearch);
    document.getElementById('global-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performGlobalSearch();
    });
    
    // Produtos
    document.getElementById('add-product-btn').addEventListener('click', showProductModal);
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('product-search').addEventListener('input', filterProducts);
    document.getElementById('prev-page').addEventListener('click', () => changePage('products', -1));
    document.getElementById('next-page').addEventListener('click', () => changePage('products', 1));
    document.getElementById('cancel-product-btn').addEventListener('click', closeProductModal);
    document.getElementById('product-form').addEventListener('submit', saveProduct);
    
    // Vendas (PDV)
    document.getElementById('pdv-search').addEventListener('input', searchProductsPDV);
    document.getElementById('sale-discount').addEventListener('input', updateSaleTotals);
    document.getElementById('complete-sale-btn').addEventListener('click', completeSale);
    
    // Orçamentos
    document.getElementById('add-quote-btn').addEventListener('click', showQuoteModal);
    document.getElementById('quote-status-filter').addEventListener('change', filterQuotes);
    document.getElementById('cancel-quote-btn').addEventListener('click', closeQuoteModal);
    document.getElementById('quote-form').addEventListener('submit', saveQuote);
    document.getElementById('quote-search').addEventListener('input', searchProductsQuote);
    
    // Metas & Comissão
    document.getElementById('save-goals-btn').addEventListener('click', saveGoals);
    
    // Relatórios
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
    document.getElementById('backup-btn').addEventListener('click', backupData);
    
    // Configurações
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('reset-demo-btn').addEventListener('click', resetDemo);
    
    // Fechar modais
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Fechar modal clicando fora
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Carregar configurações de tema
function loadThemeSettings() {
    fetch('/api/config')
        .then(response => response.json())
        .then(config => {
            document.documentElement.setAttribute('data-theme-intensity', config.appearance.themeIntensity);
            document.getElementById('theme-intensity').value = config.appearance.themeIntensity;
            document.getElementById('company-name').value = config.company.name;
            document.getElementById('company-address').value = config.company.address;
            document.getElementById('company-phone').value = config.company.phone;
        })
        .catch(error => {
            showToast('Erro ao carregar configurações', 'error');
            console.error('Error:', error);
        });
}

// Alternar entre abas
function switchTab(tabName) {
    // Atualizar menu de navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Mostrar conteúdo da aba selecionada
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // Carregar dados específicos da aba
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'sales':
            loadSales();
            break;
        case 'quotes':
            loadQuotes();
            break;
        case 'goals':
            loadGoals();
            break;
        case 'reports':
            // Não precisa carregar nada inicialmente
            break;
        case 'settings':
            // Configurações já carregadas
            break;
    }
}

// Mostrar notificação toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Carregar dashboard
function loadDashboard() {
    // Carregar KPIs
    fetch('/api/goals/summary')
        .then(response => response.json())
        .then(data => {
            document.getElementById('monthly-target').textContent = formatCurrency(data.target);
            document.getElementById('sales-total').textContent = formatCurrency(data.sales_total);
            document.getElementById('target-percent').textContent = data.target_percent.toFixed(1) + '%';
            document.getElementById('commission-estimate').textContent = formatCurrency(data.commission);
            
            // Atualizar barra de progresso
            const progressFill = document.getElementById('progress-fill');
            progressFill.style.width = Math.min(data.target_percent, 100) + '%';
            
            // Carregar gráficos
            loadSalesChart();
            loadProductsChart();
        })
        .catch(error => {
            showToast('Erro ao carregar dashboard', 'error');
            console.error('Error:', error);
        });
}

// Carregar gráfico de vendas por dia
function loadSalesChart() {
    // Implementar gráfico de vendas por dia
    const ctx = document.getElementById('sales-chart').getContext('2d');
    
    // Dados de exemplo (substituir por dados reais da API)
    const salesData = {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        datasets: [{
            label: 'Vendas por Dia (R$)',
            data: [1200, 1900, 800, 2100, 1500, 1700, 2300],
            backgroundColor: 'rgba(248, 187, 208, 0.5)',
            borderColor: 'rgba(248, 187, 208, 1)',
            borderWidth: 1
        }]
    };
    
    // Criar gráfico
    new Chart(ctx, {
        type: 'bar',
        data: salesData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Carregar gráfico de produtos mais vendidos
function loadProductsChart() {
    // Implementar gráfico de produtos mais vendidos
    const ctx = document.getElementById('products-chart').getContext('2d');
    
    // Dados de exemplo (substituir por dados reais da API)
    const productsData = {
        labels: ['Kit Ferramentas', 'Furadeira', 'Luvas', 'Óculos', 'Serra'],
        datasets: [{
            label: 'Unidades Vendidas',
            data: [12, 8, 25, 18, 5],
            backgroundColor: [
                'rgba(248, 187, 208, 0.7)',
                'rgba(196, 139, 159, 0.7)',
                'rgba(244, 143, 177, 0.7)',
                'rgba(255, 222, 239, 0.7)',
                'rgba(252, 228, 236, 0.7)'
            ],
            borderWidth: 1
        }]
    };
    
    // Criar gráfico
    new Chart(ctx, {
        type: 'doughnut',
        data: productsData,
        options: {
            responsive: true
        }
    });
}

// Busca global de produtos
function performGlobalSearch() {
    const searchTerm = document.getElementById('global-search').value.trim();
    if (searchTerm) {
        // Mudar para a aba de produtos e realizar busca
        switchTab('products');
        document.getElementById('product-search').value = searchTerm;
        filterProducts();
    }
}

// Carregar produtos
function fetchProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            loadProducts();
        })
        .catch(error => {
            showToast('Erro ao carregar produtos', 'error');
            console.error('Error:', error);
        });
}

function loadProducts() {
    const categoryFilter = document.getElementById('category-filter').value;
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    
    // Filtrar produtos
    let filteredProducts = allProducts;
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.id.toLowerCase().includes(searchTerm)
        );
    }
    
    // Paginação
    const totalPages = Math.ceil(filteredProducts.length / currentPage.pageSize);
    const startIndex = (currentPage.products - 1) * currentPage.pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + currentPage.pageSize);
    
    // Atualizar informações de paginação
    document.getElementById('page-info').textContent = `Página ${currentPage.products} de ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage.products <= 1;
    document.getElementById('next-page').disabled = currentPage.products >= totalPages;
    
    // Renderizar tabela
    const tbody = document.getElementById('products-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    paginatedProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.stock}</td>
            <td>${product.active ? 'Ativo' : 'Inativo'}</td>
            <td>
                <button class="btn-secondary edit-product" data-id="${product.id}">Editar</button>
                <button class="btn-secondary stock-in" data-id="${product.id}">Entrada</button>
                <button class="btn-secondary stock-out" data-id="${product.id}">Saída</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Adicionar event listeners aos botões
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.stock-in').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            adjustStock(productId, 'in');
        });
    });
    
    document.querySelectorAll('.stock-out').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            adjustStock(productId, 'out');
        });
    });
    
    // Atualizar filtro de categorias
    updateCategoryFilter();
}

// Filtrar produtos
function filterProducts() {
    currentPage.products = 1; // Reset para primeira página
    loadProducts();
}

// Mudar página
function changePage(section, direction) {
    currentPage[section] += direction;
    loadProducts();
}

// Atualizar filtro de categorias
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    // Manter a opção selecionada atual
    const currentValue = categoryFilter.value;
    
    // Limpar opções exceto a primeira
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Adicionar categorias
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restaurar seleção anterior se ainda existir
    if (categories.includes(currentValue)) {
        categoryFilter.value = currentValue;
    }
    
    // Atualizar datalist de categorias
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        categoriesList.appendChild(option);
    });
}

// Carregar categorias para datalist
function loadCategories() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            const categories = [...new Set(products.map(p => p.category))];
            const categoriesList = document.getElementById('categories-list');
            categoriesList.innerHTML = '';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                categoriesList.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Mostrar modal de produto
function showProductModal() {
    document.getElementById('product-modal-title').textContent = 'Adicionar Produto';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-active').checked = true;
    document.getElementById('product-modal').style.display = 'flex';
}

// Editar produto
function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        document.getElementById('product-modal-title').textContent = 'Editar Produto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-cost').value = product.cost || '';
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-min-stock').value = product.min_stock;
        document.getElementById('product-image').value = product.image || '';
        document.getElementById('product-active').checked = product.active;
        
        document.getElementById('product-modal').style.display = 'flex';
    }
}

// Fechar modal de produto
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Salvar produto
function saveProduct(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        cost: parseFloat(document.getElementById('product-cost').value) || 0,
        stock: parseInt(document.getElementById('product-stock').value),
        min_stock: parseInt(document.getElementById('product-min-stock').value),
        image: document.getElementById('product-image').value,
        active: document.getElementById('product-active').checked
    };
    
    const url = productId ? `/api/products/${productId}` : '/api/products';
    const method = productId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(() => {
        showToast('Produto salvo com sucesso');
        closeProductModal();
        fetchProducts(); // Recarregar lista
    })
    .catch(error => {
        showToast('Erro ao salvar produto', 'error');
        console.error('Error:', error);
    });
}

// Ajustar estoque
function adjustStock(productId, operation) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const message = operation === 'in' 
        ? `Quantidade para adicionar ao estoque de ${product.name}:`
        : `Quantidade para retirar do estoque de ${product.name}:`;
    
    const qty = prompt(message, '0');
    if (qty === null) return;
    
    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
        showToast('Quantidade inválida', 'error');
        return;
    }
    
    if (operation === 'out' && product.stock < quantity) {
        showToast('Estoque insuficiente', 'error');
        return;
    }
    
    fetch(`/api/products/${productId}/stock_${operation}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qty: quantity })
    })
    .then(response => response.json())
    .then(() => {
        showToast(`Estoque ${operation === 'in' ? 'aumentado' : 'reduzido'} com sucesso`);
        fetchProducts(); // Recarregar lista
    })
    .catch(error => {
        showToast('Erro ao ajustar estoque', 'error');
        console.error('Error:', error);
    });
}

// Carregar vendas
function loadSales() {
    // Carregar vendas recentes
    fetch('/api/sales')
        .then(response => response.json())
        .then(sales => {
            const recentSales = sales.slice(-5).reverse(); // Últimas 5 vendas
            const container = document.querySelector('.recent-sales');
            container.innerHTML = '';
            
            recentSales.forEach(sale => {
                const saleElement = document.createElement('div');
                saleElement.className = 'recent-sale-item';
                saleElement.innerHTML = `
                    <div><strong>${sale.id}</strong> - ${formatCurrency(sale.total)}</div>
                    <div>${new Date(sale.datetime).toLocaleDateString()} - ${sale.payment_method}</div>
                `;
                container.appendChild(saleElement);
            });
        })
        .catch(error => {
            showToast('Erro ao carregar vendas', 'error');
            console.error('Error:', error);
        });
}

// Buscar produtos no PDV
function searchProductsPDV() {
    const searchTerm = document.getElementById('pdv-search').value.toLowerCase();
    const resultsContainer = document.getElementById('pdv-search-results');
    
    if (searchTerm.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    const filteredProducts = allProducts.filter(p => 
        p.active && (
            p.name.toLowerCase().includes(searchTerm) || 
            p.id.toLowerCase().includes(searchTerm)
        )
    );
    
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = filteredProducts.length ? 'block' : 'none';
    
    filteredProducts.forEach(product => {
        const resultItem = document.createElement('div');
        resultItem.textContent = `${product.id} - ${product.name} - ${formatCurrency(product.price)}`;
        resultItem.addEventListener('click', () => {
            addProductToSale(product);
            resultsContainer.style.display = 'none';
            document.getElementById('pdv-search').value = '';
        });
        resultsContainer.appendChild(resultItem);
    });
}

// Adicionar produto à venda
function addProductToSale(product) {
    // Verificar se o produto já está na venda
    const existingItemIndex = saleItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
        // Aumentar quantidade se já existir
        saleItems[existingItemIndex].qty += 1;
    } else {
        // Adicionar novo item
        saleItems.push({
            product_id: product.id,
            name: product.name,
            qty: 1,
            unit_price: product.price,
            discount: 0
        });
    }
    
    updateSaleItemsTable();
    updateSaleTotals();
}

// Atualizar tabela de itens da venda
function updateSaleItemsTable() {
    const tbody = document.getElementById('sale-items-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    saleItems.forEach((item, index) => {
        const row = document.createElement('tr');
        const total = (item.unit_price * item.qty) - item.discount;
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td><input type="number" value="${item.qty}" min="1" class="item-qty" data-index="${index}"></td>
            <td>${formatCurrency(item.unit_price)}</td>
            <td><input type="number" value="${item.discount}" min="0" step="0.01" class="item-discount" data-index="${index}"></td>
            <td>${formatCurrency(total)}</td>
            <td><button class="btn-secondary remove-item" data-index="${index}">Remover</button></td>
        `;
        tbody.appendChild(row);
    });
    
    // Adicionar event listeners
    document.querySelectorAll('.item-qty').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            saleItems[index].qty = parseInt(this.value) || 1;
            updateSaleItemsTable();
            updateSaleTotals();
        });
    });
    
    document.querySelectorAll('.item-discount').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            saleItems[index].discount = parseFloat(this.value) || 0;
            updateSaleItemsTable();
            updateSaleTotals();
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            saleItems.splice(index, 1);
            updateSaleItemsTable();
            updateSaleTotals();
        });
    });
}

// Atualizar totais da venda
function updateSaleTotals() {
    const subtotal = saleItems.reduce((sum, item) => sum + (item.unit_price * item.qty), 0);
    const discount = parseFloat(document.getElementById('sale-discount').value) || 0;
    const total = subtotal - discount;
    
    document.getElementById('sale-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('sale-total').textContent = formatCurrency(total);
}

// Finalizar venda
function completeSale() {
    if (saleItems.length === 0) {
        showToast('Adicione pelo menos um item à venda', 'error');
        return;
    }
    
    const paymentMethod = document.getElementById('payment-method').value;
    const discount = parseFloat(document.getElementById('sale-discount').value) || 0;
    const subtotal = saleItems.reduce((sum, item) => sum + (item.unit_price * item.qty), 0);
    
    const saleData = {
        items: saleItems,
        subtotal: subtotal,
        discount_total: discount,
        total: subtotal - discount,
        payment_method: paymentMethod
    };
    
    fetch('/api/sales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
    })
    .then(response => response.json())
    .then(sale => {
        showToast('Venda realizada com sucesso');
        
        // Limpar PDV
        saleItems = [];
        document.getElementById('sale-discount').value = '0';
        updateSaleItemsTable();
        updateSaleTotals();
        
        // Recarregar vendas recentes
        loadSales();
        
        // Gerar recibo (poderia abrir em nova janela para impressão)
        generateReceipt(sale);
    })
    .catch(error => {
        showToast('Erro ao finalizar venda', 'error');
        console.error('Error:', error);
    });
}

// Gerar recibo
function generateReceipt(sale) {
    // Esta função poderia abrir uma nova janela com o recibo formatado para impressão
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
        <html>
        <head>
            <title>Recibo - ${sale.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .company { font-weight: bold; font-size: 18px; }
                .address { margin-bottom: 10px; }
                .receipt-details { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                .total { font-weight: bold; text-align: right; }
                .footer { margin-top: 30px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company">Jama Se Tem Ferramentas</div>
                <div class="address">R. Joaquim Marra, 920 – Vila Matilde – São Paulo – SP</div>
                <div>Recibo de Venda: ${sale.id}</div>
                <div>Data: ${new Date(sale.datetime).toLocaleDateString()} ${new Date(sale.datetime).toLocaleTimeString()}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Preço Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${sale.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.qty}</td>
                            <td>${formatCurrency(item.unit_price)}</td>
                            <td>${formatCurrency(item.unit_price * item.qty)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total">Subtotal: ${formatCurrency(sale.subtotal)}</div>
            <div class="total">Desconto: ${formatCurrency(sale.discount_total)}</div>
            <div class="total">Total: ${formatCurrency(sale.total)}</div>
            <div class="total">Forma de Pagamento: ${sale.payment_method}</div>
            
            <div class="footer">
                <div>Atendido por: ${sale.seller}</div>
                <div>Obrigado pela preferência!</div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
}

// Carregar orçamentos
function loadQuotes() {
    const statusFilter = document.getElementById('quote-status-filter').value;
    let url = '/api/quotes';
    if (statusFilter) {
        url += `?status=${statusFilter}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(quotes => {
            const tbody = document.getElementById('quotes-table').querySelector('tbody');
            tbody.innerHTML = '';
            
            quotes.forEach(quote => {
                const row = document.createElement('tr');
                const expiryDate = new Date(quote.datetime);
                expiryDate.setDate(expiryDate.getDate() + quote.valid_days);
                
                row.innerHTML = `
                    <td>${quote.id}</td>
                    <td>${quote.client.name || 'Não informado'}</td>
                    <td>${new Date(quote.datetime).toLocaleDateString()}</td>
                    <td>${expiryDate.toLocaleDateString()}</td>
                    <td>${formatCurrency(quote.total)}</td>
                    <td>${quote.status}</td>
                    <td>
                        <button class="btn-secondary view-quote" data-id="${quote.id}">Ver</button>
                        ${quote.status === 'Aberto' ? `
                            <button class="btn-secondary approve-quote" data-id="${quote.id}">Aprovar</button>
                            <button class="btn-secondary convert-quote" data-id="${quote.id}">Converter</button>
                        ` : ''}
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Adicionar event listeners
            document.querySelectorAll('.view-quote').forEach(btn => {
                btn.addEventListener('click', function() {
                    const quoteId = this.getAttribute('data-id');
                    viewQuote(quoteId);
                });
            });
            
            document.querySelectorAll('.approve-quote').forEach(btn => {
                btn.addEventListener('click', function() {
                    const quoteId = this.getAttribute('data-id');
                    approveQuote(quoteId);
                });
            });
            
            document.querySelectorAll('.convert-quote').forEach(btn => {
                btn.addEventListener('click', function() {
                    const quoteId = this.getAttribute('data-id');
                    convertQuote(quoteId);
                });
            });
        })
        .catch(error => {
            showToast('Erro ao carregar orçamentos', 'error');
            console.error('Error:', error);
        });
}

// Filtrar orçamentos
function filterQuotes() {
    loadQuotes();
}

// Mostrar modal de orçamento
function showQuoteModal() {
    document.getElementById('quote-modal-title').textContent = 'Novo Orçamento';
    document.getElementById('quote-form').reset();
    document.getElementById('quote-id').value = '';
    document.getElementById('quote-valid-days').value = 7;
    quoteItems = [];
    updateQuoteItemsTable();
    updateQuoteTotal();
    document.getElementById('quote-modal').style.display = 'flex';
}

// Fechar modal de orçamento
function closeQuoteModal() {
    document.getElementById('quote-modal').style.display = 'none';
}

// Buscar produtos para orçamento
function searchProductsQuote() {
    const searchTerm = document.getElementById('quote-search').value.toLowerCase();
    const resultsContainer = document.getElementById('quote-search-results');
    
    if (searchTerm.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    const filteredProducts = allProducts.filter(p => 
        p.active && (
            p.name.toLowerCase().includes(searchTerm) || 
            p.id.toLowerCase().includes(searchTerm)
        )
    );
    
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = filteredProducts.length ? 'block' : 'none';
    
    filteredProducts.forEach(product => {
        const resultItem = document.createElement('div');
        resultItem.textContent = `${product.id} - ${product.name} - ${formatCurrency(product.price)}`;
        resultItem.addEventListener('click', () => {
            addProductToQuote(product);
            resultsContainer.style.display = 'none';
            document.getElementById('quote-search').value = '';
        });
        resultsContainer.appendChild(resultItem);
    });
}

// Adicionar produto ao orçamento
function addProductToQuote(product) {
    // Verificar se o produto já está no orçamento
    const existingItemIndex = quoteItems.findIndex(item => item.name === product.name);
    
    if (existingItemIndex >= 0) {
        // Aumentar quantidade se já existir
        quoteItems[existingItemIndex].qty += 1;
    } else {
        // Adicionar novo item
        quoteItems.push({
            name: product.name,
            qty: 1,
            unit_price: product.price,
            discount: 0
        });
    }
    
    updateQuoteItemsTable();
    updateQuoteTotal();
}

// Atualizar tabela de itens do orçamento
function updateQuoteItemsTable() {
    const tbody = document.getElementById('quote-items-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    quoteItems.forEach((item, index) => {
        const row = document.createElement('tr');
        const total = (item.unit_price * item.qty) - item.discount;
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td><input type="number" value="${item.qty}" min="1" class="quote-item-qty" data-index="${index}"></td>
            <td><input type="number" value="${item.unit_price}" min="0" step="0.01" class="quote-item-price" data-index="${index}"></td>
            <td><input type="number" value="${item.discount}" min="0" step="0.01" class="quote-item-discount" data-index="${index}"></td>
            <td>${formatCurrency(total)}</td>
            <td><button class="btn-secondary remove-quote-item" data-index="${index}">Remover</button></td>
        `;
        tbody.appendChild(row);
    });
    
    // Adicionar event listeners
    document.querySelectorAll('.quote-item-qty').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            quoteItems[index].qty = parseInt(this.value) || 1;
            updateQuoteItemsTable();
            updateQuoteTotal();
        });
    });
    
    document.querySelectorAll('.quote-item-price').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            quoteItems[index].unit_price = parseFloat(this.value) || 0;
            updateQuoteItemsTable();
            updateQuoteTotal();
        });
    });
    
    document.querySelectorAll('.quote-item-discount').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            quoteItems[index].discount = parseFloat(this.value) || 0;
            updateQuoteItemsTable();
            updateQuoteTotal();
        });
    });
    
    document.querySelectorAll('.remove-quote-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            quoteItems.splice(index, 1);
            updateQuoteItemsTable();
            updateQuoteTotal();
        });
    });
}

// Atualizar total do orçamento
function updateQuoteTotal() {
    const total = quoteItems.reduce((sum, item) => sum + (item.unit_price * item.qty - item.discount), 0);
    document.getElementById('quote-total').textContent = formatCurrency(total);
}

// Salvar orçamento
function saveQuote(e) {
    e.preventDefault();
    
    if (quoteItems.length === 0) {
        showToast('Adicione pelo menos um item ao orçamento', 'error');
        return;
    }
    
    const quoteData = {
        client: {
            name: document.getElementById('quote-client-name').value,
            phone: document.getElementById('quote-client-phone').value,
            email: document.getElementById('quote-client-email').value
        },
        items: quoteItems,
        valid_days: parseInt(document.getElementById('quote-valid-days').value),
        notes: document.getElementById('quote-notes').value,
        total: quoteItems.reduce((sum, item) => sum + (item.unit_price * item.qty - item.discount), 0)
    };
    
    fetch('/api/quotes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(quoteData)
    })
    .then(response => response.json())
    .then(quote => {
        showToast('Orçamento salvo com sucesso');
        closeQuoteModal();
        loadQuotes(); // Recarregar lista
        
        // Gerar PDF do orçamento (poderia abrir em nova janela para impressão)
        generateQuotePDF(quote);
    })
    .catch(error => {
        showToast('Erro ao salvar orçamento', 'error');
        console.error('Error:', error);
    });
}

// Visualizar orçamento
function viewQuote(quoteId) {
    fetch('/api/quotes')
        .then(response => response.json())
        .then(quotes => {
            const quote = quotes.find(q => q.id === quoteId);
            if (quote) {
                generateQuotePDF(quote);
            }
        })
        .catch(error => {
            showToast('Erro ao carregar orçamento', 'error');
            console.error('Error:', error);
        });
}

// Aprovar orçamento
function approveQuote(quoteId) {
    fetch(`/api/quotes/${quoteId}/approve`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(() => {
        showToast('Orçamento aprovado com sucesso');
        loadQuotes(); // Recarregar lista
    })
    .catch(error => {
        showToast('Erro ao aprovar orçamento', 'error');
        console.error('Error:', error);
    });
}

// Converter orçamento em venda
function convertQuote(quoteId) {
    const paymentMethod = prompt('Selecione a forma de pagamento:', 'Dinheiro');
    if (!paymentMethod) return;
    
    fetch(`/api/quotes/${quoteId}/convert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_method: paymentMethod })
    })
    .then(response => response.json())
    .then(sale => {
        showToast('Orçamento convertido em venda com sucesso');
        loadQuotes(); // Recarregar lista
        
        // Gerar recibo
        generateReceipt(sale);
    })
    .catch(error => {
        showToast('Erro ao converter orçamento', 'error');
        console.error('Error:', error);
    });
}

// Gerar PDF do orçamento
function generateQuotePDF(quote) {
    const expiryDate = new Date(quote.datetime);
    expiryDate.setDate(expiryDate.getDate() + quote.valid_days);
    
    const quoteWindow = window.open('', '_blank');
    quoteWindow.document.write(`
        <html>
        <head>
            <title>Orçamento - ${quote.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background-color: #fff; }
                .header { text-align: center; margin-bottom: 20px; padding: 20px; background-color: #f8bbd0; border-radius: 8px; }
                .company { font-weight: bold; font-size: 20px; color: #333; }
                .address { margin-bottom: 10px; color: #666; }
                .quote-info { margin-bottom: 20px; }
                .client-info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f5f5f5; }
                .total { font-weight: bold; text-align: right; font-size: 18px; margin-top: 10px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #f8bbd0; }
                .validity { margin-top: 10px; font-style: italic; }
                .notes { margin-top: 20px; }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .header { background-color: #f8bbd0 !important; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company">Jama Se Tem Ferramentas</div>
                <div class="address">R. Joaquim Marra, 920 – Vila Matilde – São Paulo – SP</div>
            </div>
            
            <div class="quote-info">
                <div><strong>Orçamento:</strong> ${quote.id}</div>
                <div><strong>Data:</strong> ${new Date(quote.datetime).toLocaleDateString()}</div>
                <div><strong>Validade:</strong> ${expiryDate.toLocaleDateString()}</div>
            </div>
            
            <div class="client-info">
                <div><strong>Cliente:</strong> ${quote.client.name || 'Não informado'}</div>
                <div><strong>Telefone:</strong> ${quote.client.phone || 'Não informado'}</div>
                <div><strong>E-mail:</strong> ${quote.client.email || 'Não informado'}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Produto/Serviço</th>
                        <th>Quantidade</th>
                        <th>Preço Unit.</th>
                        <th>Desconto</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.qty}</td>
                            <td>${formatCurrency(item.unit_price)}</td>
                            <td>${formatCurrency(item.discount)}</td>
                            <td>${formatCurrency(item.unit_price * item.qty - item.discount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total">Total: ${formatCurrency(quote.total)}</div>
            
            <div class="notes">
                <strong>Observações:</strong><br>
                ${quote.notes || 'Nenhuma observação.'}
            </div>
            
            <div class="footer">
                <div>Atenciosamente,</div>
                <div><strong>Ingrid</strong></div>
                <div>Jama Se Tem Ferramentas</div>
                <div class="validity">Este orçamento é válido até ${expiryDate.toLocaleDateString()}</div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
}

// Carregar metas e comissão
function loadGoals() {
    fetch('/api/goals')
        .then(response => response.json())
        .then(goals => {
            document.getElementById('monthly-target-input').value = goals.monthly_target;
            document.getElementById('commission-percent-input').value = goals.commission_percent;
        })
        .catch(error => {
            showToast('Erro ao carregar metas', 'error');
            console.error('Error:', error);
        });
    
    // Carregar resumo do mês
    fetch('/api/goals/summary')
        .then(response => response.json())
        .then(summary => {
            document.getElementById('current-month-sales').textContent = formatCurrency(summary.sales_total);
            document.getElementById('current-month-percent').textContent = summary.target_percent.toFixed(1) + '%';
            document.getElementById('current-month-commission').textContent = formatCurrency(summary.commission);
            
            // Atualizar barra de progresso
            const progressFill = document.getElementById('goals-progress-fill');
            progressFill.style.width = Math.min(summary.target_percent, 100) + '%';
        })
        .catch(error => {
            showToast('Erro ao carregar resumo', 'error');
            console.error('Error:', error);
        });
}

// Salvar metas
function saveGoals() {
    const monthlyTarget = parseFloat(document.getElementById('monthly-target-input').value);
    const commissionPercent = parseFloat(document.getElementById('commission-percent-input').value);
    
    if (isNaN(monthlyTarget) || isNaN(commissionPercent)) {
        showToast('Valores inválidos', 'error');
        return;
    }
    
    fetch('/api/goals', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            monthly_target: monthlyTarget,
            commission_percent: commissionPercent
        })
    })
    .then(response => response.json())
    .then(() => {
        showToast('Metas salvas com sucesso');
        loadGoals(); // Recarregar dados
        loadDashboard(); // Atualizar dashboard
    })
    .catch(error => {
        showToast('Erro ao salvar metas', 'error');
        console.error('Error:', error);
    });
}

// Gerar relatório
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    let url = '/api/';
    switch(reportType) {
        case 'sales':
            url += 'sales';
            if (dateFrom && dateTo) {
                url += `?from=${dateFrom}&to=${dateTo}`;
            }
            break;
        case 'products':
            url += 'products';
            break;
        case 'quotes':
            url += 'quotes';
            break;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayReport(data, reportType);
        })
        .catch(error => {
            showToast('Erro ao gerar relatório', 'error');
            console.error('Error:', error);
        });
}

// Exibir relatório
function displayReport(data, reportType) {
    const thead = document.getElementById('report-table').querySelector('thead');
    const tbody = document.getElementById('report-table').querySelector('tbody');
    
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    switch(reportType) {
        case 'sales':
            thead.innerHTML = `
                <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Subtotal</th>
                    <th>Desconto</th>
                    <th>Total</th>
                    <th>Pagamento</th>
                </tr>
            `;
            
            data.forEach(sale => {
                const items = sale.items.map(item => `${item.name} (${item.qty}x)`).join(', ');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.id}</td>
                    <td>${new Date(sale.datetime).toLocaleDateString()}</td>
                    <td>${items}</td>
                    <td>${formatCurrency(sale.subtotal)}</td>
                    <td>${formatCurrency(sale.discount_total)}</td>
                    <td>${formatCurrency(sale.total)}</td>
                    <td>${sale.payment_method}</td>
                `;
                tbody.appendChild(row);
            });
            break;
            
        case 'products':
            thead.innerHTML = `
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Status</th>
                </tr>
            `;
            
            data.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>${product.stock}</td>
                    <td>${product.active ? 'Ativo' : 'Inativo'}</td>
                `;
                tbody.appendChild(row);
            });
            break;
            
        case 'quotes':
            thead.innerHTML = `
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Validade</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            `;
            
            data.forEach(quote => {
                const expiryDate = new Date(quote.datetime);
                expiryDate.setDate(expiryDate.getDate() + quote.valid_days);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${quote.id}</td>
                    <td>${quote.client.name || 'Não informado'}</td>
                    <td>${new Date(quote.datetime).toLocaleDateString()}</td>
                    <td>${expiryDate.toLocaleDateString()}</td>
                    <td>${formatCurrency(quote.total)}</td>
                    <td>${quote.status}</td>
                `;
                tbody.appendChild(row);
            });
            break;
    }
}

// Exportar CSV
function exportCSV() {
    const reportType = document.getElementById('report-type').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    let url = `/api/export?type=${reportType}`;
    if (dateFrom && dateTo && reportType === 'sales') {
        url += `&from=${dateFrom}&to=${dateTo}`;
    }
    
    window.location.href = url;
}

// Fazer backup
function backupData() {
    window.location.href = '/api/backup';
}

// Salvar configurações
function saveSettings() {
    const configData = {
        company: {
            name: document.getElementById('company-name').value,
            address: document.getElementById('company-address').value,
            phone: document.getElementById('company-phone').value
        },
        appearance: {
            themeIntensity: parseInt(document.getElementById('theme-intensity').value)
        }
    };
    
    fetch('/api/config', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
    })
    .then(response => response.json())
    .then(() => {
        showToast('Configurações salvas com sucesso');
        
        // Aplicar novo tema
        document.documentElement.setAttribute('data-theme-intensity', configData.appearance.themeIntensity);
    })
    .catch(error => {
        showToast('Erro ao salvar configurações', 'error');
        console.error('Error:', error);
    });
}

// Reset de demonstração
function resetDemo() {
    if (confirm('Tem certeza que deseja resetar os dados de demonstração? Todos os dados atuais serão perdidos.')) {
        fetch('/api/reset-demo', {
            method: 'POST',
            headers: {
                'X-Confirm': 'true'
            }
        })
        .then(response => response.json())
        .then(() => {
            showToast('Dados de demonstração resetados com sucesso');
            setTimeout(() => {
                location.reload();
            }, 2000);
        })
        .catch(error => {
            showToast('Erro ao resetar dados', 'error');
            console.error('Error:', error);
        });
    }
}

// Formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}