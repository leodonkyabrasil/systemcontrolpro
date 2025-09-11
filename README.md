# Sistema de Gestão - Jama Se Tem Ferramentas

Sistema completo para gestão de vendas, orçamentos, produtos e metas para a empresa "Jama Se Tem Ferramentas".

## Características

- Painel de vendas e orçamentos com controle de metas e comissão
- Cadastro de produtos com controle de estoque
- PDV (Ponto de Venda) simples com emissão de recibos
- Geração de orçamentos com conversão para vendas
- Relatórios e exportação de dados
- Interface responsiva com tema em tons de rosa

## Requisitos

- Node.js (versão 14 ou superior)
- NPM (geralmente vem com Node.js)

## Instalação e Execução

1. Extraia todos os arquivos em uma pasta
2. Abra o terminal na pasta do projeto
3. Execute `npm install` para instalar as dependências
4. Execute `npm start` para iniciar o servidor
5. Acesse `http://127.0.0.1:3000` no navegador

## Estrutura de Arquivos

- `server.js` - Servidor Node.js + Express
- `package.json` - Dependências e scripts do projeto
- `data/data.json` - Arquivo de dados (criado automaticamente)
- `public/index.html` - Interface do usuário
- `public/styles.css` - Estilos da aplicação
- `public/main.js` - Lógica do frontend

## Funcionalidades Principais

### Dashboard
- Visualização de KPIs do mês (meta, vendas, comissão)
- Gráficos de vendas por dia e produtos mais vendidos

### Produtos
- Cadastro, edição e exclusão de produtos
- Controle de estoque (entradas e saídas)
- Filtros por categoria e busca

### Vendas
- PDV com busca de produtos por nome ou código
- Aplicação de descontos por item ou no total
- Várias formas de pagamento (dinheiro, cartão, PIX, boleto)
- Emissão de recibos imprimíveis

### Orçamentos
- Criação de orçamentos com dados do cliente
- Definição de validade e observações
- Conversão de orçamentos em vendas
- Emissão de orçamentos em PDF

### Metas & Comissão
- Definição de meta mensal de vendas
- Configuração de percentual de comissão
- Acompanhamento do progresso em relação à meta

### Relatórios
- Geração de relatórios de vendas, produtos e orçamentos
- Exportação de dados em CSV
- Backup do arquivo de dados

### Configurações
- Personalização dos dados da empresa
- Ajuste da intensidade do tema
- Reset dos dados de demonstração

## Exemplos de Uso da API

### 1. Listar produtos
```bash
curl -X GET http://127.0.0.1:3000/api/products