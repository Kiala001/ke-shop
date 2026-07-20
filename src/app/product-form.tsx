import React, { useEffect, useState } from 'react';

import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';

import {
  useLocalSearchParams,
  router,
  Stack,
} from 'expo-router';


import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';

import {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} from '@/utils/storage';

import { colors } from '@/theme/colors';




export default function ProductFormScreen() {


  const { productId } = useLocalSearchParams<{
    productId?: string;
  }>();


  const isEditing = !!productId;



  const [nome, setNome] = useState('');

  const [preco, setPreco] = useState('');

  const [categoria, setCategoria] = useState('');

  const [ml, setMl] = useState('');

  const [estoque, setEstoque] = useState('');

  const [loading, setLoading] = useState(false);





  useEffect(() => {


    if (isEditing) {


      loadProduct();


    }


  }, [productId]);







  async function loadProduct() {


    const products = await getProducts();


    const product = products.find(
      (p) => p.id === productId
    );



    if(product){


      setNome(product.nome);

      setPreco(String(product.preco));

      setCategoria(product.categoria);

      setMl(
        product.ml
        ? String(product.ml)
        : ''
      );

      setEstoque(
        String(product.estoque)
      );


    }


  }









  async function handleSave(){


    if(!nome.trim()){


      Alert.alert(
        'Falta o nome',
        'Indique o nome do produto.'
      );

      return;

    }





    if(!preco || isNaN(Number(preco))){


      Alert.alert(
        'Preço inválido',
        'Indique um preço válido.'
      );


      return;

    }






    setLoading(true);



    try{


      const payload = {

        nome,

        preco,

        categoria,

        ml,

        estoque,

      };





      if(isEditing){


        await updateProduct(
          productId!,
          payload
        );


      }else{


        await addProduct(payload);


      }




      router.back();



    }finally{


      setLoading(false);


    }

  }


  function handleDelete(){


    Alert.alert(

      'Eliminar produto',

      'Tem a certeza que quer eliminar este produto?',


      [

        {
          text:'Cancelar',

          style:'cancel'
        },


        {

          text:'Eliminar',

          style:'destructive',


          onPress: async()=>{


            await deleteProduct(
              productId!
            );


            router.back();


          }

        }


      ]


    );


  }


  return (

    <>

      
      <Stack.Screen

        options={{

          headerStyle: {
            backgroundColor: colors.primary,
          },

          title:

            isEditing

            ? 'Editar produto'

            : 'Novo produto'

        }}

      />


      <ScrollView

        style={styles.screen}

        contentContainerStyle={{
          padding:20
        }}

      >


        <FormField

          label="Nome do produto"

          value={nome}

          onChangeText={setNome}

          placeholder="Ex: Ramz Lattafa preto"

        />



        <FormField

          label="Preço (Kz)"

          value={preco}

          onChangeText={setPreco}

          placeholder="Ex: 15000"

          keyboardType="numeric"

        />



        <FormField

          label="Categoria"

          value={categoria}

          onChangeText={setCategoria}

          placeholder="Ex: Perfume, Vape, Acessório"

        />



        <FormField

          label="Volume (ml)"

          value={ml}

          onChangeText={setMl}

          placeholder="Ex: 100"

          keyboardType="numeric"

          optional

        />



        <FormField

          label="Quantidade em estoque"

          value={estoque}

          onChangeText={setEstoque}

          placeholder="Ex: 20"

          keyboardType="numeric"

        />





        <View style={{marginTop:8}}>


          <PrimaryButton

            title={
              isEditing
              ? 'Guardar alterações'
              : 'Adicionar produto'
            }

            onPress={handleSave}

            loading={loading}

          />


        </View>






        {isEditing && (


          <View style={{marginTop:12}}>


            <PrimaryButton

              title="Eliminar produto"

              variant="danger"

              onPress={handleDelete}

            />


          </View>


        )}



      </ScrollView>


    </>


  );


}


const styles = StyleSheet.create({

  screen:{

    flex:1,

    backgroundColor: colors.background,

  },


});