import React from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

type RootStackParamList = {
  products: undefined;
  categories: undefined;
  AddProduct: undefined;
  RegisterSale: undefined;
  ReportsScreen: undefined;
  CustomProducts: undefined;
};

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const menuItems = [
    {
      title: "Productos",
      icon: "hand-saw",
      color: "#8D6E63",
      navigateTo: "products",
    },
    {
      title: "Categorías",
      icon: "view-grid-outline",
      color: "#A1887F",
      navigateTo: "categories",
    },
    {
      title: "Agregar Producto",
      icon: "plus-box-outline",
      color: "#6D4C41",
      navigateTo: "AddProduct",
    },
    {
      title: "Registrar Venta",
      icon: "cart-outline",
      color: "#C67B5C",
      navigateTo: "RegisterSale",
    },
    {
      title: "Reportes",
      icon: "chart-line",
      color: "#5D4037",
      navigateTo: "ReportsScreen",
    },
    {
      title: "Pedidos Personalizados",
      icon: "pencil-ruler",
      color: "#795548",
      navigateTo: "CustomProducts",
    },
  ];

  return (
    <LinearGradient colors={["#F3EAD9", "#E9DAC1"]} style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <ImageBackground
          source={require("@/assets/images/wood-bg.jpg")}
          style={styles.header}
          imageStyle={{ borderRadius: 24 }}
        >
          <View style={styles.headerOverlay} />
          <ThemedText type="title" style={styles.headerTitle}>
            G&G 
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Artesanias en madera y más
          </ThemedText>
        </ImageBackground>

        {/* Sección de botones */}
        <ThemedView style={[styles.menuGrid, { backgroundColor: "transparent" }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(item.navigateTo as any)}
            >
              <LinearGradient
                colors={["#FFFFFF", "#FDF8F3"]}
                style={styles.cardInner}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${item.color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={36}
                    color={item.color}
                  />
                </View>
                <ThemedText style={styles.cardText}>{item.title}</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 25,
  },
  header: {
    width: "100%",
    height: 190,
    marginTop: 28,
    marginBottom: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 3,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(60, 35, 20, 0.5)",
    borderRadius: 24,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 42,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.8,
    zIndex: 1,
  },
  headerSubtitle: {
    color: "#FBEAD1",
    fontSize: 18,
    marginTop: 6,
    textAlign: "center",
    zIndex: 1,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
  card: {
    width: "48%",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: "#fff",
  },
  cardInner: {
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 26,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3E2723",
    textAlign: "center",
  },
});
