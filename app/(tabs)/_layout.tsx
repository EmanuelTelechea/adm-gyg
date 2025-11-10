import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

function CentralActionButton({ onPress, color }: { onPress?: () => void; color: string }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Agregar"
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.centralButton, { backgroundColor: color, shadowColor: color }]}
    >
      <Ionicons name="add" size={22} color="#fff" />
    </TouchableOpacity>
  );
}

function TabBackgroundWithCentral({ color }: { color: string }) {
  const router = useRouter();
  return (
    <>
      {/* Render background original si existe, o un placeholder absoluto */}
      {TabBarBackground ? <TabBarBackground /> : <View style={StyleSheet.absoluteFill} />}
      {/* Overlay: central button, centrado horizontalmente */}
      <View pointerEvents="box-none" style={styles.centralOverlay}>
        <CentralActionButton
          color={color}
          onPress={() => {
            try {
              router.push('AddProduct');
            } catch {
              router.push('/AddProduct');
            }
          }}
        />
      </View>
    </>
  );
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const palette = {
    bg: isDark ? 'rgba(12,14,20,0.7)' : 'rgba(255,255,255,0.95)',
    tint: isDark ? '#9AD3FF' : '#0f4c81',
    inactive: isDark ? '#7a8490' : '#9aa4b2',
    central: isDark ? '#0f6fb2' : '#0f4c81'
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        // background component that also renders the central floating action
        // must be a zero-arg function returning a ReactNode
        tabBarBackground: () => <TabBackgroundWithCentral color={palette.central} />,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 64,
          borderRadius: 20,
          backgroundColor: palette.bg,
          borderWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 14,
          paddingHorizontal: 20,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between' // distribuye íconos de forma uniforme
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconFocused]}>
              <Ionicons name="home" size={20} color={focused ? palette.tint : palette.inactive} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconFocused]}>
              <MaterialCommunityIcons name="package-variant-closed" size={20} color={focused ? palette.tint : palette.inactive} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorías',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconFocused]}>
              <Ionicons name="list" size={20} color={focused ? palette.tint : palette.inactive} />
            </View>
          ),
        }}
      />

      {/* la ruta AddProduct queda oculta del tabBar (el botón central la abre) */}
      <Tabs.Screen name="AddProduct" options={{ tabBarButton: () => null }} />

      <Tabs.Screen
        name="RegisterSale"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconFocused]}>
              <Ionicons name="cart" size={20} color={focused ? palette.tint : palette.inactive} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="CustomProducts"
        options={{
          title: 'Personalizados',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconFocused]}>
              <MaterialCommunityIcons name="palette" size={20} color={focused ? palette.tint : palette.inactive} />
            </View>
          ),
        }}
      />

      {/* Rutas utility que no deben aparecer en la barra (se mantienen ocultas) */}
      <Tabs.Screen name="EditProduct" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFocused: {
    // sutil fondo cuando está activo
    backgroundColor: 'rgba(15,76,129,0.08)',
  },
  centralButton: {
    width: 66,
    height: 66,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 18 : 6,
    // sombra
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  centralOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none'
  }
});

