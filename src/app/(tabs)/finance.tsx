
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { getFinanceStats, setInvestimento } from '../../utils/storage';

function formatKz(value) {
  return `${Math.round(value).toLocaleString('pt-PT')} Kz`;
}

export default function FinancasScreen() {
  const [finance, setFinance] = useState(null);
  const [investimentoInput, setInvestimentoInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [savingInvestimento, setSavingInvestimento] = useState(false);

  const load = useCallback(async () => {
    const f = await getFinanceStats();
    setFinance(f);
    setInvestimentoInput(String(f.investimento || 0));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSaveInvestimento = async () => {
    setSavingInvestimento(true);
    Keyboard.dismiss();
    try {
      await setInvestimento(investimentoInput);
      await load();
    } finally {
      setSavingInvestimento(false);
    }
  };

  if (!finance) {
    return <View style={styles.screen} />;
  }

  const { lucroTotal, saldo, valorEstoque, unidadesEstoque, totais, registos } = finance;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.pageTitle}>Finanças</Text>

      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.hero}>
        <Text style={styles.heroLabel}>Lucro acumulado</Text>
        <Text style={styles.heroValue}>{formatKz(lucroTotal)}</Text>
        <Text style={styles.heroSub}>
          {saldo >= 0
            ? `Investimento já recuperado. Sobram ${formatKz(saldo)}.`
            : `Faltam ${formatKz(Math.abs(saldo))} para recuperar o investimento.`}
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Investimento no negócio</Text>
        <Text style={styles.cardSubtitle}>
          Valor total que já investiste (compra de produtos, materiais, etc.)
        </Text>
        <View style={styles.investRow}>
          <View style={styles.investInputWrapper}>
            <Text style={styles.investSuffix}>Kz</Text>
            <TextInput
              style={styles.investInput}
              value={investimentoInput}
              onChangeText={setInvestimentoInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveInvestimento}
            disabled={savingInvestimento}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Valor em estoque</Text>
          <Text style={styles.statValue}>{formatKz(valorEstoque)}</Text>
          <Text style={styles.statHint}>{unidadesEstoque} unidades</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total recebido</Text>
          <Text style={styles.statValue}>{formatKz(totais.valorRecebido)}</Text>
          <Text style={styles.statHint}>{registos.length} encomendas divididas</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Custo em produtos</Text>
          <Text style={[styles.statValue, { color: colors.textDark }]}>
            {formatKz(totais.custoProduto)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Táxi</Text>
          <Text style={[styles.statValue, { color: colors.textDark }]}>{formatKz(totais.taxi)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Descontos</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>
            {formatKz(totais.desconto)}
          </Text>
        </View>
      </View>

      <View style={[styles.card, { marginBottom: 80 }]}>
        <Text style={styles.cardTitle}>Registos de lucro</Text>
        {registos.length === 0 ? (
          <Text style={styles.emptyText}>
            Ainda não dividiste o valor de nenhuma encomenda entregue. Abre uma encomenda
            entregue no separador Encomendas para começar.
          </Text>
        ) : (
          registos.map((r) => (
            <TouchableOpacity
              key={r.orderId}
              style={styles.registoRow}
              onPress={() => router.push(`/financas/divisao/${r.orderId}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.registoProduto}>
                  {r.quantidade > 1 ? `${r.quantidade}x ` : ''}
                  {r.produtoNome || 'Produto'}
                </Text>
                <Text style={styles.registoMeta}>
                  Recebido {formatKz(r.valorRecebido)} · Custo {formatKz(r.custoProduto)}
                  {r.taxi ? ` · Táxi ${formatKz(r.taxi)}` : ''}
                  {r.desconto ? ` · Desconto ${formatKz(r.desconto)}` : ''}
                </Text>
                {r.descontoObs ? <Text style={styles.registoObs}>{r.descontoObs}</Text> : null}
              </View>
              <Text
                style={[styles.registoLucro, { color: r.lucro >= 0 ? colors.success : colors.danger }]}
              >
                {formatKz(r.lucro)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
    marginTop: 16,
    marginHorizontal: 16,
  },
  hero: { margin: 16, borderRadius: 22, padding: 22 },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 6 },
  heroValue: { color: colors.white, fontSize: 34, fontWeight: '800', marginBottom: 10 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  cardSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  investRow: { flexDirection: 'row', marginTop: 14, gap: 10 },
  investInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  investSuffix: { fontSize: 13, color: colors.textMuted, marginRight: 8, fontWeight: '600' },
  investInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.textDark },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 4, gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    marginTop: 12,
  },
  statLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 6 },
  statValue: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  statHint: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  emptyText: { color: colors.textMuted, marginTop: 10, fontSize: 13, lineHeight: 19 },
  registoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 4,
  },
  registoProduto: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  registoMeta: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  registoObs: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  registoLucro: { fontSize: 15, fontWeight: '800', marginLeft: 10 },
});