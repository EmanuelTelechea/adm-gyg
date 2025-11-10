import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function TabLayout() {
  const colors = {
    active: "#a07d4b", // dorado cálido
    inactive: "#8b7355",
    background: "#f9f4ef", // crema madera
    gradientStart: "#c8a97e",
    gradientEnd: "#a07d4b",
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#f5e6d3",
        tabBarBackground: () => (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={{
              flex: 1,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            }}
          />
        ),
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 8,
          height: Platform.OS === "ios" ? 105 : 90,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: Platform.OS === "ios" ? 25 : 15,
          paddingTop: 12,
          overflow: "hidden",
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Productos",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "package-variant" : "package-variant-closed"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categorías",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="RegisterSale"
        options={{
          title: "Ventas",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="CustomProducts"
        options={{
          title: "Personalizados",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "palette" : "palette-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* 📊 Reportes */}
      <Tabs.Screen
        name="ReportsScreen" // 👈 debe coincidir con tu archivo: ReportsScreen.tsx
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "chart-box" : "chart-box-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* Pantallas ocultas */}
      <Tabs.Screen name="AddProduct" options={{ href: null }} />
      <Tabs.Screen name="EditProduct" options={{ href: null }} />
    </Tabs>
  );
}
