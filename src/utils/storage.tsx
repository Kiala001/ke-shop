// utils/storage.js
// Camada de dados 100% offline usando AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './id';

const PRODUCTS_KEY = '@keshop_products';
const ORDERS_KEY = '@keshop_orders';

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
