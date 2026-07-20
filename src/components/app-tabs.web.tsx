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

      <TabSlot
        style={{
          flex: 1
        }}
      />
      <TabList asChild>
        <CustomTabList>

          <TabTrigger
            name="index"
            href="/"
            asChild
          >
            <TabButton icon="home">
              Home
            </TabButton>
          </TabTrigger>

          <TabTrigger
            name="product"
            href="/products"
            asChild
          >
            <TabButton icon="cube">
              Produtos
            </TabButton>
          </TabTrigger>

          <TabTrigger
            name="orders"
            href="/orders"
            asChild
          >
            <TabButton icon="receipt">
              Encomendas
            </TabButton>
          </TabTrigger>

          <TabTrigger
            name="finance"
            href="/finance"
            asChild
          >
            <TabButton icon="wallet">
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


      <ThemedText

        type="small"

        style={[
          styles.label,
          isFocused && styles.activeLabel
        ]}

      >

        {children}


      </ThemedText>


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

    paddingHorizontal: 10,

    paddingVertical: 10,

    borderRadius: 40,


    shadowColor: colors.black,

    shadowOpacity: 0.12,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 6,
    },


    elevation: 8,

    borderWidth: 1,

    borderColor: colors.border,

  },





  tabButton: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 18,

    paddingVertical: 11,

    borderRadius: 30,

    gap: 7,

  },





  activeButton: {

    backgroundColor: colors.cardAlt,

  },





  label: {

    fontSize: 13,

    color: colors.textMuted,

  },





  activeLabel: {

    color: colors.primary,

    fontWeight: '700',

  },


});