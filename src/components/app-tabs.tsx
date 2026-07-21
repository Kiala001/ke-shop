import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';

import {
  Pressable,
  View,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { colors } from '@/theme/colors';



export default function AppTabs() {


  return (

    <Tabs>


      {/* Conteúdo das páginas */}
      <TabSlot

        style={{
          flex: 1
        }}
      />

      {/* Menu personalizado */}
      <TabList asChild>
        <CustomTabList>
          <TabTrigger
            name="index"
            href="/"
            asChild
          >
            <TabButton icon="home-outline">
              Home
            </TabButton>
          </TabTrigger>

          <TabTrigger
            name="products"
            href="/products"
            asChild
          >
            <TabButton icon="cube-outline">
              Produtos
            </TabButton>

          </TabTrigger>
          <TabTrigger
            name="orders"
            href="/orders"
            asChild
          >
            <TabButton icon="receipt-outline">
              Encomendas
            </TabButton>
          </TabTrigger>

          <TabTrigger
            name="finance"
            href="/finance"
            asChild
          >
            <TabButton icon="wallet-outline">
              Finanças
            </TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}


function TabButton({
  children,
  icon,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  icon: keyof typeof Ionicons.glyphMap
}) {

  return (
    <Pressable
      {...props}
      style={[
        styles.tabButton,
        isFocused && styles.activeButton
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={
          isFocused
            ? colors.primary
            : colors.textMuted
        }
      />
      {isFocused && (
        <ThemedText
          type="small"
          style={styles.activeLabel}
        >
          {children}
        </ThemedText>
      )}
    </Pressable>
  );
}

function CustomTabList(
  props: TabListProps
) {
  return (
    <View
      {...props}
      style={styles.container}
    >
      <ThemedView
        style={styles.menu}
      >
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
    marginBottom: 35,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 6,
  },
  activeButton: {
    backgroundColor: colors.cardAlt,
  },
  activeLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },


});