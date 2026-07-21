import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors, statusMeta } from '../../theme/colors';
import { getStats } from '../../utils/storage';


function formatKz(value: number) {
  return `${Math.round(value).toLocaleString('pt-PT')} Kz`;
}


export default function DashboardScreen() {

  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);


  const load = useCallback(async () => {
    const s = await getStats();
    setStats(s);
  }, []);


  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );


  async function onRefresh() {
    setRefreshing(true);

    await load();

    setRefreshing(false);
  }


  if (!stats) {
    return (
      <View style={styles.screen} />
    );
  }


  const {
    contagemPorEstado,
    receitaTotal,
    ticketMedio,
    totalEncomendas,
    produtosEstoqueBaixo,
    ultimasEntregas,

  } = stats;



  const maxEntrega = Math.max(
    1,
    ...ultimasEntregas.map(
      (o: any) => o.precoUnitario * o.quantidade
    )
  );



  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingBottom: 40,
        paddingTop: 30
      }}

      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }

    >
      <Text style={styles.pageTitle}>KE SHOP</Text>

      <LinearGradient

        colors={[
          colors.gradientStart,
          colors.gradientEnd
        ]}

        style={styles.hero}

      >

        <Text style={styles.heroLabel}>
          Receita total
        </Text>


        <Text style={styles.heroValue}>
          {formatKz(receitaTotal)}
        </Text>


        <View style={styles.heroPill}>

          <Ionicons
            name="trending-up"
            size={16}
            color="white"
          />


          <Text style={styles.heroPillText}>
            {totalEncomendas} encomendas
          </Text>


        </View>


      </LinearGradient>





      <View style={styles.statsRow}>


        {
          Object.keys(statusMeta).map((key) => (

            <View
              key={key}
              style={styles.statCard}
            >

              <View
                style={[
                  styles.statDot,
                  {
                    backgroundColor:
                      statusMeta[key].color
                  }
                ]}
              />


              <Text style={styles.statNumber}>
                {contagemPorEstado[key] ?? 0}
              </Text>


              <Text style={styles.statLabel}>
                {statusMeta[key].label}
              </Text>


            </View>

          ))
        }


      </View>
{/* 
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Ticket médio
        </Text>
        <Text style={styles.bigNumber}>
          {formatKz(ticketMedio)}
        </Text>
      </View> */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Últimas entregas
        </Text>
        {
          ultimasEntregas.length === 0 ? (
            <Text style={styles.emptyText}>
              Sem entregas registadas.
            </Text>

          ) : (

            ultimasEntregas.map((o: any) => {


              const valor =
                o.precoUnitario *
                o.quantidade;


              const largura =
                Math.max(
                  8,
                  valor / maxEntrega * 100
                );



              return (

                <View
                  key={o.id}
                  style={styles.barRow}
                >

                  <Text style={styles.barLabel}>
                    {o.produtoNome}
                  </Text>


                  <View style={styles.barTrack}>


                    <View

                      style={[
                        styles.barFill,
                        {
                          width: `${largura}%`
                        }
                      ]}

                    />


                  </View>



                  <Text>
                    {formatKz(valor)}
                  </Text>


                </View>

              )


            })


          )
        }


      </View>

      <View style={[styles.card, {marginBottom: 190}]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>
            Estoque baixo
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/products')}
          >
            <Text style={styles.linkText}>
              Ver produtos
            </Text>
          </TouchableOpacity>
        </View>

        {
          produtosEstoqueBaixo.map((p: any) => (

            <View
              key={p.id}
              style={styles.lowStockRow}
            >

              <Text>
                {p.nome}
              </Text>


              <Text style={styles.lowStockQty}>
                {p.estoque} un.
              </Text>


            </View>

          ))
        }


      </View>



    </ScrollView>

  );

}






const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.background
  },

  hero: {
    margin: 16,
    padding: 22,
    borderRadius: 22
  },

  heroLabel: {
    color: "#fff",
    opacity: .8
  },

  heroValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800"
  },

  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12
  },

  heroPillText: {
    color: "#fff",
    marginLeft: 8
  },

statsRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  paddingHorizontal: 8,
},


statCard: {
  width: "48%",

  backgroundColor: colors.card,

  padding: 15,

  marginBottom: 12,

  borderRadius: 16,

  minHeight: 90,
},

  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800"
  },

  statLabel: {
    fontSize: 12
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textDark,
    marginTop: 16,
    marginHorizontal: 16,
  },

  card: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 18,
    borderRadius: 18
  },

  cardTitle: {
    fontWeight: "700"
  },

  bigNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primary
  },


  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12
  },


  barLabel: {
    width: 90
  },


  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#ddd",
    marginHorizontal: 8,
    borderRadius: 10
  },


  barFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 10
  },


  lowStockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },


  lowStockQty: {
    color: "red",
    fontWeight: "700"
  },


  linkText: {
    color: colors.primary
  },


  emptyText: {
    marginTop: 10
  },


  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  }

});