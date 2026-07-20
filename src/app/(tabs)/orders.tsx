import React, {
    useCallback,
    useState,
} from 'react';


import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';


import {
    useFocusEffect,
    router,
} from 'expo-router';


import { Ionicons } from '@expo/vector-icons';


import {
    colors,
} from '@/theme/colors';


import {
    getOrders,
    setOrderStatus,
    deleteOrder,
} from '@/utils/storage';


import StatusBadge from '@/components/StatusBadge';



const FILTERS = [

    {
        key: 'todas',
        label: 'Todas'
    },

    {
        key: 'pendente',
        label: 'Pendente'
    },

    {
        key: 'entregue',
        label: 'Entregue'
    },

    {
        key: 'reagendado',
        label: 'Reagendado'
    },

    {
        key: 'cancelado',
        label: 'Cancelado'
    },

];







export default function OrdersScreen() {


    const [orders, setOrders] = useState<any[]>([]);


    const [filter, setFilter] = useState('todas');





    const load = useCallback(async () => {


        const data = await getOrders();


        setOrders(data);


    }, []);





    useFocusEffect(

        useCallback(() => {

            load();

        }, [load])

    );






    const filtered = orders.filter(

        (o) =>

            filter === 'todas'
            ||
            o.estado === filter

    );







    async function toggleEntregue(order: any) {


        const novoEstado =

            order.estado === 'entregue'

                ? 'pendente'

                : 'entregue';



        await setOrderStatus(

            order.id,

            novoEstado

        );


        load();


    }








    function confirmDelete(order: any) {


        Alert.alert(

            'Eliminar encomenda',

            'Deseja eliminar este registo?',


            [

                {
                    text: 'Cancelar',

                    style: 'cancel'
                },


                {

                    text: 'Eliminar',

                    style: 'destructive',


                    onPress: async () => {


                        await deleteOrder(order.id);


                        load();


                    }


                }


            ]

        );


    }








    return (


        <View style={styles.screen}>


            <View style={styles.header}>


                <Text style={styles.title}>

                    Encomendas

                </Text>





                <TouchableOpacity

                    style={styles.addButton}

                    onPress={() => router.push('/order-form')}

                >

                    <Ionicons

                        name="add"

                        size={22}

                        color={colors.white}

                    />


                </TouchableOpacity>


            </View>

            <FlatList

                horizontal

                showsHorizontalScrollIndicator={false}

                data={FILTERS}

                keyExtractor={(item) => item.key}


                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    gap: 6,
                }}


                style={{
                    maxHeight: 55,
                }}


                renderItem={({ item }) => {


                    const active = filter === item.key;


                    return (

                        <TouchableOpacity

                            activeOpacity={0.7}

                            onPress={() => setFilter(item.key)}

                            style={[
                                styles.chip,
                                active && styles.chipActive
                            ]}

                        >

                            <Text

                                style={[
                                    styles.chipText,
                                    active && styles.chipTextActive
                                ]}

                            >

                                {item.label}

                            </Text>


                        </TouchableOpacity>

                    );

                }}

            />

            <FlatList


                data={filtered}


                keyExtractor={
                    item => item.id
                }



                contentContainerStyle={{

                    padding: 16,

                    paddingTop: 0,

                    paddingBottom: 100

                }}



                ListEmptyComponent={

                    <Text style={styles.emptyText}>

                        Nenhuma encomenda nesta categoria.

                    </Text>

                }



                renderItem={({ item }) => (


                    <TouchableOpacity


                        style={styles.card}



                        onLongPress={() => confirmDelete(item)}



                        onPress={() =>


                            router.push({

                                pathname: '/order-form',

                                params: {

                                    orderId: item.id

                                }

                            })


                        }


                    >



                        <View style={styles.cardTop}>


                            <Text style={styles.phone}>

                                {item.telefone || 'Sem contacto'}

                            </Text>



                            <StatusBadge

                                estado={item.estado}

                                size="small"

                            />


                        </View>





                        <Text

                            style={styles.location}

                            numberOfLines={2}

                        >

                            {item.localizacao}

                        </Text>






                        <Text style={styles.product}>


                            {item.quantidade > 1

                                ? `${item.quantidade}x `

                                : ''}



                            {item.produtoNome}



                            {item.nota

                                ? ` · ${item.nota}`

                                : ''}



                        </Text>







                        <View style={styles.cardBottom}>


                            <Text style={styles.schedule}>


                                {item.dia || 'Sem dia definido'}



                                {item.hora

                                    ? ` · ${item.hora}`

                                    : ' · sem horário'}



                            </Text>





                            <TouchableOpacity


                                onPress={() => toggleEntregue(item)}


                                style={[

                                    styles.checkButton,


                                    item.estado === 'entregue'

                                    && {

                                        backgroundColor:
                                            colors.entregue

                                    }

                                ]}


                            >


                                <Ionicons


                                    name={

                                        item.estado === 'entregue'

                                            ? 'checkmark'

                                            : 'checkmark-outline'

                                    }


                                    size={16}


                                    color={

                                        item.estado === 'entregue'

                                            ? colors.white

                                            : colors.textMuted

                                    }


                                />


                            </TouchableOpacity>



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

        paddingTop: 16

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


    chip: {

        height: 30,

        paddingHorizontal: 12,

        borderRadius: 15,

        backgroundColor: colors.card,

        borderWidth: 1,

        borderColor: colors.border,

        justifyContent: 'center',

        alignItems: 'center',

    },


    chipActive: {

        backgroundColor: colors.primary,

        borderColor: colors.primary

    },


    chipText: {

        fontSize: 13,

        color: colors.textDark,

        fontWeight: '600'

    },


    chipTextActive: {

        color: colors.white

    },


    card: {

        backgroundColor: colors.card,

        borderRadius: 16,

        padding: 16,

        marginBottom: 12,

        marginTop: 8,

    },


    cardTop: {

        flexDirection: 'row',

        justifyContent: 'space-between',

        alignItems: 'center',

        marginBottom: 6

    },


    phone: {

        fontSize: 15,

        fontWeight: '700',

        color: colors.primary

    },


    location: {

        fontSize: 13,

        color: colors.textDark,

        marginBottom: 4

    },


    product: {

        fontSize: 13,

        color: colors.textMuted,

        marginBottom: 10

    },


    cardBottom: {

        flexDirection: 'row',

        justifyContent: 'space-between',

        alignItems: 'center'

    },


    schedule: {

        fontSize: 12,

        color: colors.textMuted,

        fontWeight: '600'

    },


    checkButton: {

        width: 30,

        height: 30,

        borderRadius: 15,

        backgroundColor: colors.cardAlt,

        alignItems: 'center',

        justifyContent: 'center'

    },


    emptyText: {

        textAlign: 'center',

        color: colors.textMuted,

        marginTop: 40,

        fontSize: 14

    }


});