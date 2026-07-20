import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { colors } from '@/theme/colors';

import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';

import {
  getOrders,
  saveDivisao,
  deleteDivisao,
} from '@/utils/storage';

function formatKz(value: number) {
  return `${Math.round(value || 0).toLocaleString('pt-PT')} Kz`;
}

export default function DivisaoFormScreen() {

  const { orderId } =
    useLocalSearchParams<{
      orderId: string;
    }>();

  const [order, setOrder] = useState<any>(null);

  const [valorRecebido, setValorRecebido] = useState('0');

  const [custoProduto, setCustoProduto] = useState('0');

  const [taxi, setTaxi] = useState('0');

  const [desconto, setDesconto] = useState('0');

  const [descontoObs, setDescontoObs] = useState('');

  const [loading, setLoading] = useState(false);

  const [jaTemDivisao, setJaTemDivisao] = useState(false);

  useEffect(() => {

    (async () => {

      const orders = await getOrders();

      const o = orders.find(
        x => x.id === orderId
      );

      if (!o) return;

      setOrder(o);

      if (o.divisao) {

        setJaTemDivisao(true);

        setValorRecebido(
          String(o.divisao.valorRecebido)
        );

        setCustoProduto(
          String(o.divisao.custoProduto)
        );

        setTaxi(
          String(o.divisao.taxi)
        );

        setDesconto(
          String(o.divisao.desconto)
        );

        setDescontoObs(
          o.divisao.descontoObs || ''
        );

      } else {

        setValorRecebido(
          String(
            (o.precoUnitario || 0) *
            (o.quantidade || 1)
          )
        );

      }

    })();

  }, [orderId]);

  const lucro =
    (Number(valorRecebido) || 0)
    - (Number(custoProduto) || 0)
    - (Number(taxi) || 0)
    - (Number(desconto) || 0);

  async function handleSave() {

    setLoading(true);

    try {

      await saveDivisao(
        orderId,
        {
          valorRecebido,
          custoProduto,
          taxi,
          desconto,
          descontoObs,
        }
      );

      router.back();

    } finally {

      setLoading(false);

    }

  }

  function handleDelete() {

    Alert.alert(

      'Remover divisão',

      'Deseja remover esta divisão de valor?',

      [

        {
          text: 'Cancelar',
          style: 'cancel',
        },

        {

          text: 'Remover',

          style: 'destructive',

          onPress: async () => {

            await deleteDivisao(orderId);

            router.back();

          },

        },

      ]

    );

  }

  if (!order) {

    return (
      <View style={styles.screen} />
    );

  }

  return (

    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40,
      }}
    >

      <View style={styles.summary}>

        <Text style={styles.summaryProduct}>

          {order.quantidade > 1
            ? `${order.quantidade}x `
            : ''}

          {order.produtoNome}

        </Text>

        <Text style={styles.summaryMeta}>

          {order.telefone}
          {' • '}
          {order.localizacao}

        </Text>

      </View>

      <FormField
        label="Valor recebido"
        value={valorRecebido}
        onChangeText={setValorRecebido}
        placeholder="0"
        keyboardType="numeric"
      />

      <FormField
        label="Valor do perfume (custo)"
        value={custoProduto}
        onChangeText={setCustoProduto}
        placeholder="0"
        keyboardType="numeric"
      />

      <FormField
        label="Táxi"
        value={taxi}
        onChangeText={setTaxi}
        placeholder="0"
        keyboardType="numeric"
        optional
      />

      <FormField
        label="Desconto"
        value={desconto}
        onChangeText={setDesconto}
        placeholder="0"
        keyboardType="numeric"
        optional
      />

      <FormField
        label="Observação do desconto"
        value={descontoObs}
        onChangeText={setDescontoObs}
        placeholder="Ex: cliente fiel"
        optional
      />

      <View style={styles.lucroBox}>

        <Text style={styles.lucroLabel}>
          Lucro (o que sobrou)
        </Text>

        <Text
          style={[
            styles.lucroValue,
            {
              color:
                lucro >= 0
                  ? colors.success
                  : colors.danger,
            },
          ]}
        >
          {formatKz(lucro)}
        </Text>

        <Text style={styles.lucroHint}>
          Calculado automaticamente:
          valor recebido − custo do perfume −
          táxi − desconto.
        </Text>

      </View>

      <View style={{ marginTop: 12 }}>

        <PrimaryButton
          title={
            jaTemDivisao
              ? 'Guardar alterações'
              : 'Guardar divisão'
          }
          onPress={handleSave}
          loading={loading}
        />

      </View>

      {jaTemDivisao && (

        <View style={{ marginTop: 12 }}>

          <PrimaryButton
            title="Remover divisão"
            variant="danger"
            onPress={handleDelete}
          />

        </View>

      )}

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  summary: {
    backgroundColor: colors.cardAlt,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  summaryProduct: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textDark,
  },

  summaryMeta: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
  },

  lucroBox: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  lucroLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },

  lucroValue: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },

  lucroHint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

});