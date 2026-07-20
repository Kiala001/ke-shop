// components/ProductPickerModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ProductPickerModal({ visible, products, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Escolher produto</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Procurar produto"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={{ marginTop: 8 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum produto encontrado. Cadastre produtos no separador Produtos.
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => onSelect(item)}>
                <View>
                  <Text style={styles.rowName}>{item.nome}</Text>
                  <Text style={styles.rowMeta}>
                    {item.categoria} · {item.estoque} un. em estoque
                  </Text>
                </View>
                <Text style={styles.rowPrice}>{Math.round(item.preco).toLocaleString('pt-PT')} Kz</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,27,61,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: colors.textDark },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  rowMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: 30, paddingHorizontal: 10 },
});
