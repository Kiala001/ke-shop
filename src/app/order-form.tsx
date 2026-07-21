import React, {
    useEffect,
    useState,
} from 'react';

import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';

import {
    router,
    useLocalSearchParams,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import {
    colors,
    statusMeta,
} from '@/theme/colors';

import FormField from '@/components/FormField';
import PrimaryButton from '@/components/PrimaryButton';
import ProductPickerModal from '@/components/ProductPickerModal';

import {
    addOrder,
    updateOrder,
    deleteOrder,
    getOrders,
    getProducts,
} from '@/utils/storage';

const DIAS = [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
    'Domingo',
];

export default function OrderFormScreen() {

    const { orderId } =
        useLocalSearchParams<{
            orderId?: string;
        }>();


    const isEditing = !!orderId;



    const [telefone, setTelefone] = useState('');

    const [localizacao, setLocalizacao] = useState('');

    const [produto, setProduto] = useState<any>(null);

    const [quantidade, setQuantidade] = useState('1');

    const [nota, setNota] = useState('');

    const [dia, setDia] = useState('');

    const [hora, setHora] = useState('');

    const [semHorario, setSemHorario] = useState(false);

    const [estado, setEstado] = useState('pendente');

    const [products, setProducts] = useState<any[]>([]);

    const [pickerVisible, setPickerVisible] = useState(false);

    const [loading, setLoading] = useState(false);



    useEffect(() => {

        (async () => {

            const prods = await getProducts();

            setProducts(prods);

            if (isEditing) {

                const orders = await getOrders();

                const o = orders.find(
                    (x) => x.id === orderId
                );

                if (o) {

                    setTelefone(o.telefone);

                    setLocalizacao(o.localizacao);

                    setProduto({

                        id: o.produtoId,

                        nome: o.produtoNome,

                        preco: o.precoUnitario,

                    });

                    setQuantidade(
                        String(o.quantidade)
                    );

                    setNota(o.nota);

                    setDia(o.dia);

                    setHora(o.hora);

                    setSemHorario(!o.hora);

                    setEstado(o.estado);

                }

            }

        })();

    }, [orderId]);



    function handleSelectProduct(
        p: any
    ) {

        setProduto({

            id: p.id,

            nome: p.nome,

            preco: p.preco,

        });

        setPickerVisible(false);

    }



    async function handleSave() {

        if (!telefone.trim()) {

            Alert.alert(

                'Falta o contacto',

                'Indique o número de telefone do cliente.'

            );

            return;

        }

        if (!localizacao.trim()) {

            Alert.alert(

                'Falta a localização',

                'Indique onde deve ser feita a entrega.'

            );

            return;

        }

        if (!produto) {

            Alert.alert(

                'Falta o produto',

                'Escolha um produto do catálogo.'

            );

            return;

        }

        setLoading(true);

        const payload = {

            telefone,

            localizacao,

            produtoId: produto.id,

            produtoNome: produto.nome,

            precoUnitario: produto.preco,

            quantidade,

            nota,

            dia,

            hora: semHorario
                ? ''
                : hora,

            estado,

        };

        try {

            if (isEditing) {

                await updateOrder(

                    orderId as string,

                    payload

                );

            } else {

                await addOrder(payload);

            }

            router.back();

        } finally {

            setLoading(false);

        }

    }



    function handleDelete() {

        Alert.alert(

            'Eliminar encomenda',

            'Tem a certeza que quer eliminar este registo?',

            [

                {

                    text: 'Cancelar',

                    style: 'cancel',

                },

                {

                    text: 'Eliminar',

                    style: 'destructive',

                    onPress: async () => {

                        await deleteOrder(
                            orderId as string
                        );

                        router.back();

                    },

                },

            ]

        );

    }
    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={{ padding: 20 }}
        >

            <FormField
                label="Telefone do cliente *"
                value={telefone}
                onChangeText={setTelefone}
                placeholder="Ex: 935283990"
                keyboardType="phone-pad"
            />

            <FormField
                label="Localização *"
                value={localizacao}
                onChangeText={setLocalizacao}
                placeholder="Ex: Vila de Viana, Candando"
                multiline
            />



            <Text style={styles.label}>
                Produto *
            </Text>

            <TouchableOpacity
                style={styles.productSelector}
                onPress={() => setPickerVisible(true)}
            >

                {produto ? (

                    <View>

                        <Text style={styles.productSelected}>
                            {produto.nome}
                        </Text>

                        <Text style={styles.productPrice}>
                            {Math.round(produto.preco).toLocaleString('pt-PT')} Kz / unidade
                        </Text>

                    </View>

                ) : (

                    <Text style={styles.productPlaceholder}>
                        Toque para escolher um produto
                    </Text>

                )}

                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                />

            </TouchableOpacity>



            <FormField
                label="Quantidade *"
                value={quantidade}
                onChangeText={setQuantidade}
                placeholder="1"
                keyboardType="numeric"
            />



            <FormField
                label="Observação"
                value={nota}
                onChangeText={setNota}
                placeholder="Ex: ligar para confirmar"
                optional
            />



            <Text style={styles.label}>
                Dia da entrega
            </Text>

            <View style={styles.daysRow}>

                {DIAS.map((d) => (

                    <TouchableOpacity
                        key={d}
                        onPress={() => setDia(d)}
                        style={[
                            styles.dayChip,
                            dia === d && styles.dayChipActive,
                        ]}
                    >

                        <Text
                            style={[
                                styles.dayChipText,
                                dia === d && styles.dayChipTextActive,
                            ]}
                        >
                            {d}
                        </Text>

                    </TouchableOpacity>

                ))}

            </View>
            <FormField
                label="Hora"
                value={hora}
                onChangeText={setHora}
                placeholder="Ex: 14:00"
                editable={!semHorario}
            />

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setSemHorario(!semHorario)}
            >
                <Ionicons
                    name={semHorario ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={colors.primary}
                />

                <Text style={styles.checkboxLabel}>
                    Sem horário definido
                </Text>
            </TouchableOpacity>

            <Text style={styles.label}>
                Estado da encomenda *
            </Text>

            <View style={styles.statusRow}>
                {Object.keys(statusMeta).map((key) => {
                    const active = estado === key;
                    const meta = statusMeta[key];

                    return (
                        <TouchableOpacity
                            key={key}
                            onPress={() => setEstado(key)}
                            style={[
                                styles.statusChip,
                                { borderColor: meta.color },
                                active && {
                                    backgroundColor: meta.color,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusChipText,
                                    {
                                        color: active
                                            ? colors.white
                                            : meta.color,
                                    },
                                ]}
                            >
                                {meta.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={{ marginTop: 12, marginBottom: 10 }}>
                <PrimaryButton
                    title={
                        isEditing
                            ? 'Guardar alterações'
                            : 'Registar encomenda'
                    }
                    onPress={handleSave}
                    loading={loading}
                />
            </View>

            {isEditing && (
                <View style={{ marginTop: 12, marginBottom: 40 }}>
                    <PrimaryButton
                        title="Eliminar encomenda"
                        variant="danger"
                        onPress={handleDelete}
                    />
                </View>
            )}

            <ProductPickerModal
                visible={pickerVisible}
                products={products}
                onSelect={handleSelectProduct}
                onClose={() => setPickerVisible(false)}
            />

        </ScrollView>
    );
}

 const styles = StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },

        label: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.textDark,
            marginBottom: 8,
            marginTop: 6,
        },

        productSelector: {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 14,
            marginBottom: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },

        productSelected: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.textDark,
        },

        productPrice: {
            fontSize: 12,
            color: colors.textMuted,
            marginTop: 4,
        },

        productPlaceholder: {
            fontSize: 14,
            color: colors.textMuted,
        },

        daysRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
        },

        dayChip: {
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 22,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
        },

        dayChipActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },

        dayChipText: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textDark,
        },

        dayChipTextActive: {
            color: colors.white,
        },

        checkboxRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 18,
        },

        checkboxLabel: {
            marginLeft: 8,
            fontSize: 14,
            color: colors.textDark,
        },

        statusRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
        },

        statusChip: {
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 20,
            borderWidth: 1.5,
        },

        statusChipText: {
            fontSize: 13,
            fontWeight: '700',
        },
    });