import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { useFocusEffect, router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';

import { getProducts } from '../../utils/storage';



export default function ProductsScreen() {


  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');



  const load = useCallback(async () => {

    const data = await getProducts();

    setProducts(data);

  }, []);





  useFocusEffect(

    useCallback(() => {

      load();

    }, [load])

  );






  const filtered = products.filter((p) =>


    `${p.nome} ${p.categoria}`

      .toLowerCase()

      .includes(
        search.toLowerCase()
      )

  );





  return (

    <View style={styles.screen}>

      <View style={styles.header}>
        <Text style={styles.title}>
          Produtos
        </Text>

        <Pressable

          style={styles.addButton}

          onPress={() => {
            console.log('clicou adicionar produto');
            router.push('/product-form');
          }}

        >

          <Ionicons

            name="add"

            size={22}

            color={colors.white}

          />


        </Pressable>


      </View>





      <View style={styles.searchBox}>


        <Ionicons

          name="search"

          size={18}

          color={colors.textMuted}

        />


        <TextInput

          style={styles.searchInput}

          placeholder="Procurar produto ou categoria"

          placeholderTextColor={
            colors.textMuted
          }
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 4,
          paddingBottom: 32
        }}

        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhum produto registado ainda.
          </Text>
        }

        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/product-form',
                params: {
                  productId: item.id
                }
              })
            }>

            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>
                {item.nome}
              </Text>

              <Text style={styles.productMeta}>
                {item.categoria}
                {
                  item.ml
                    ? ` · ${item.ml}ml`
                    : ''
                }
              </Text>
            </View>

            <View
              style={{
                alignItems: 'flex-end'
              }}
            >


              <Text style={styles.price}>

                {
                  Math.round(item.preco)
                    .toLocaleString('pt-PT')
                }

                {' '}Kz

              </Text>



              <Text

                style={[
                  styles.stock,

                  {
                    color:
                      item.estoque <= 3

                        ? colors.danger

                        : colors.textMuted

                  }

                ]}

              >

                {item.estoque} un. em estoque


              </Text>



            </View>



          </TouchableOpacity>


        )}

      />

    </View>

  );

}




const styles = StyleSheet.create({


  screen: {
    flex: 1,
    backgroundColor: colors.background
  },


  header: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingHorizontal: 20,

    paddingTop: 45

  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
    marginTop: 16,
    marginHorizontal: 16,
  },


  title: {

    fontSize: 24,

    fontWeight: '800',

    color: colors.textDark

  },



  addButton: {

    backgroundColor: colors.primary,

    width: 40,

    height: 40,

    borderRadius: 20,

    alignItems: 'center',

    justifyContent: 'center'

  },




  searchBox: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: colors.card,

    marginHorizontal: 20,

    marginTop: 14,

    paddingHorizontal: 14,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: colors.border

  },




  searchInput: {

    flex: 1,

    paddingVertical: 10,

    paddingHorizontal: 10,

    fontSize: 14,

    color: colors.textDark

  },




  card: {

    backgroundColor: colors.card,

    borderRadius: 16,

    padding: 16,

    marginBottom: 12,

    flexDirection: 'row',

    justifyContent: 'space-between'

  },



  productName: {

    fontSize: 16,

    fontWeight: '700',

    color: colors.textDark

  },



  productMeta: {

    fontSize: 12,

    color: colors.textMuted,

    marginTop: 4

  },



  price: {

    fontSize: 15,

    fontWeight: '700',

    color: colors.primary

  },



  stock: {

    fontSize: 12,

    marginTop: 4,

    fontWeight: '600'

  },



  emptyText: {

    textAlign: 'center',

    color: colors.textMuted,

    marginTop: 40,

    fontSize: 14,

    paddingHorizontal: 20

  }



});