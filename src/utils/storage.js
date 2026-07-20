// utils/storage.js
// Camada de dados 100% offline usando AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './id';

const PRODUCTS_KEY = '@keshop_products';
const ORDERS_KEY = '@keshop_orders';
const FINANCE_KEY = '@keshop_finance';

// ---------- Helpers genéricos ----------

async function readJSON(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Erro a ler', key, e);
    return [];
  }
}

async function writeJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('Erro a gravar', key, e);
    return false;
  }
}

async function readObject(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('Erro a ler', key, e);
    return fallback;
  }
}

// ---------- Produtos ----------
// { id, nome, preco, categoria, ml (opcional), estoque }

export async function getProducts() {
  return readJSON(PRODUCTS_KEY);
}

export async function saveProducts(products) {
  return writeJSON(PRODUCTS_KEY, products);
}

export async function addProduct(product) {
  const products = await getProducts();
  const newProduct = {
    id: generateId('prod'),
    nome: product.nome.trim(),
    preco: Number(product.preco) || 0,
    categoria: product.categoria?.trim() || 'Sem categoria',
    ml: product.ml ? Number(product.ml) : null,
    estoque: Number(product.estoque) || 0,
    criadoEm: new Date().toISOString(),
  };
  const updated = [newProduct, ...products];
  await saveProducts(updated);
  return newProduct;
}

export async function updateProduct(id, updates) {
  const products = await getProducts();
  const updated = products.map((p) =>
    p.id === id
      ? {
          ...p,
          ...updates,
          preco: updates.preco !== undefined ? Number(updates.preco) || 0 : p.preco,
          ml:
            updates.ml !== undefined
              ? updates.ml === '' || updates.ml === null
                ? null
                : Number(updates.ml)
              : p.ml,
          estoque:
            updates.estoque !== undefined ? Number(updates.estoque) || 0 : p.estoque,
        }
      : p
  );
  await saveProducts(updated);
  return updated.find((p) => p.id === id);
}

export async function deleteProduct(id) {
  const products = await getProducts();
  await saveProducts(products.filter((p) => p.id !== id));
}

export async function adjustStock(productId, delta) {
  const products = await getProducts();
  const updated = products.map((p) =>
    p.id === productId ? { ...p, estoque: Math.max(0, (p.estoque || 0) + delta) } : p
  );
  await saveProducts(updated);
}

// ---------- Encomendas ----------
// { id, telefone, localizacao, produtoId, produtoNome, precoUnitario,
//   quantidade, nota, dia, hora, estado, stockAplicado, criadoEm }

export const ESTADOS = ['pendente', 'entregue', 'cancelado', 'reagendado'];

export async function getOrders() {
  return readJSON(ORDERS_KEY);
}

export async function saveOrders(orders) {
  return writeJSON(ORDERS_KEY, orders);
}

export async function addOrder(order) {
  const orders = await getOrders();
  const newOrder = {
    id: generateId('enc'),
    telefone: order.telefone?.trim() || '',
    localizacao: order.localizacao?.trim() || '',
    produtoId: order.produtoId || null,
    produtoNome: order.produtoNome?.trim() || '',
    precoUnitario: Number(order.precoUnitario) || 0,
    quantidade: Number(order.quantidade) || 1,
    nota: order.nota?.trim() || '',
    dia: order.dia?.trim() || '',
    hora: order.hora?.trim() || '',
    estado: order.estado || 'pendente',
    stockAplicado: false,
    criadoEm: new Date().toISOString(),
  };

  // Se já nascer como "entregue", debita o estoque de imediato
  if (newOrder.estado === 'entregue' && newOrder.produtoId) {
    await adjustStock(newOrder.produtoId, -newOrder.quantidade);
    newOrder.stockAplicado = true;
  }

  const updated = [newOrder, ...orders];
  await saveOrders(updated);
  return newOrder;
}

export async function updateOrder(id, updates) {
  const orders = await getOrders();
  const current = orders.find((o) => o.id === id);
  if (!current) return null;

  const merged = { ...current, ...updates };

  // Gestão de estoque quando o estado muda
  const estadoAntigo = current.estado;
  const estadoNovo = merged.estado;

  if (estadoAntigo !== 'entregue' && estadoNovo === 'entregue' && merged.produtoId) {
    await adjustStock(merged.produtoId, -merged.quantidade);
    merged.stockAplicado = true;
  } else if (estadoAntigo === 'entregue' && estadoNovo !== 'entregue' && current.stockAplicado) {
    await adjustStock(current.produtoId, merged.quantidade);
    merged.stockAplicado = false;
  }

  const updatedOrders = orders.map((o) => (o.id === id ? merged : o));
  await saveOrders(updatedOrders);
  return merged;
}

export async function deleteOrder(id) {
  const orders = await getOrders();
  const target = orders.find((o) => o.id === id);
  if (target && target.estado === 'entregue' && target.stockAplicado && target.produtoId) {
    await adjustStock(target.produtoId, target.quantidade);
  }
  await saveOrders(orders.filter((o) => o.id !== id));
}

export async function setOrderStatus(id, novoEstado) {
  return updateOrder(id, { estado: novoEstado });
}

// ---------- Divisão de valores por encomenda ----------
// order.divisao = { valorRecebido, custoProduto, taxi, desconto, descontoObs, lucro, criadoEm, atualizadoEm }

export async function getDivisao(orderId) {
  const orders = await getOrders();
  const order = orders.find((o) => o.id === orderId);
  return order?.divisao || null;
}

export async function saveDivisao(orderId, dados) {
  const orders = await getOrders();
  const current = orders.find((o) => o.id === orderId);
  if (!current) return null;

  const valorRecebido = Number(dados.valorRecebido) || 0;
  const custoProduto = Number(dados.custoProduto) || 0;
  const taxi = Number(dados.taxi) || 0;
  const desconto = Number(dados.desconto) || 0;
  const lucro = valorRecebido - custoProduto - taxi - desconto;

  const divisao = {
    valorRecebido,
    custoProduto,
    taxi,
    desconto,
    descontoObs: dados.descontoObs?.trim() || '',
    lucro,
    criadoEm: current.divisao?.criadoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, divisao } : o));
  await saveOrders(updatedOrders);
  return divisao;
}

export async function deleteDivisao(orderId) {
  const orders = await getOrders();
  const updatedOrders = orders.map((o) => {
    if (o.id !== orderId) return o;
    const { divisao, ...resto } = o;
    return resto;
  });
  await saveOrders(updatedOrders);
}

// ---------- Configurações financeiras (investimento) ----------

export async function getFinanceSettings() {
  return readObject(FINANCE_KEY, { investimento: 0 });
}

export async function setInvestimento(valor) {
  const settings = await getFinanceSettings();
  const updated = { ...settings, investimento: Number(valor) || 0 };
  await writeJSON(FINANCE_KEY, updated);
  return updated;
}

// ---------- Estatísticas de Finanças ----------

export async function getFinanceStats() {
  const [orders, products, settings] = await Promise.all([
    getOrders(),
    getProducts(),
    getFinanceSettings(),
  ]);

  const registos = orders
    .filter((o) => !!o.divisao)
    .map((o) => ({
      orderId: o.id,
      produtoNome: o.produtoNome,
      telefone: o.telefone,
      quantidade: o.quantidade,
      ...o.divisao,
    }))
    .sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm));

  const totais = registos.reduce(
    (acc, r) => {
      acc.valorRecebido += r.valorRecebido;
      acc.custoProduto += r.custoProduto;
      acc.taxi += r.taxi;
      acc.desconto += r.desconto;
      acc.lucro += r.lucro;
      return acc;
    },
    { valorRecebido: 0, custoProduto: 0, taxi: 0, desconto: 0, lucro: 0 }
  );

  const valorEstoque = products.reduce((acc, p) => acc + (p.preco || 0) * (p.estoque || 0), 0);
  const unidadesEstoque = products.reduce((acc, p) => acc + (p.estoque || 0), 0);

  return {
    investimento: settings.investimento || 0,
    lucroTotal: totais.lucro,
    saldo: totais.lucro - (settings.investimento || 0),
    totais,
    valorEstoque,
    unidadesEstoque,
    registos,
  };
}

// ---------- Estatísticas / Dashboard ----------

export async function getStats() {
  const [products, orders] = await Promise.all([getProducts(), getOrders()]);

  const totalProdutos = products.length;
  const estoqueBaixo = products.filter((p) => p.estoque <= 3).length;

  const contagemPorEstado = { pendente: 0, entregue: 0, cancelado: 0, reagendado: 0 };
  let receitaTotal = 0;
  let encomendasEntregues = 0;

  orders.forEach((o) => {
    if (contagemPorEstado[o.estado] !== undefined) {
      contagemPorEstado[o.estado] += 1;
    }
    if (o.estado === 'entregue') {
      receitaTotal += (o.precoUnitario || 0) * (o.quantidade || 1);
      encomendasEntregues += 1;
    }
  });

  // Receita dos últimos 7 registos de entrega (aproximação simples, sem datas reais por encomenda)
  const entregues = orders.filter((o) => o.estado === 'entregue');
  const ultimasEntregas = entregues.slice(0, 7).reverse();

  return {
    totalProdutos,
    estoqueBaixo,
    totalEncomendas: orders.length,
    contagemPorEstado,
    receitaTotal,
    encomendasEntregues,
    ticketMedio: encomendasEntregues > 0 ? receitaTotal / encomendasEntregues : 0,
    produtosEstoqueBaixo: products.filter((p) => p.estoque <= 3),
    ultimasEntregas,
    orders,
    products,
  };
}
