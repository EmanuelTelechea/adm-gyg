import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Articulo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  medidas: string;
  en_oferta: number;
  destacado: number;
  categoria: string;
  imagenes: string[];
}

type RootStackParamList = {
  AddProduct: undefined;
  EditProduct: { item: Articulo };
  RegisterSale: { item: Articulo };
};

export default function ArticulosScreen() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const apiUrl = "https://gyg-production.up.railway.app/api/articulos";
    fetch(apiUrl)
      .then(async (response) => {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setArticulos(data);
            setError(null);
          } else {
            setError("No se encontraron productos válidos.");
          }
        } catch (e) {
          setError("La respuesta de la API no es JSON válido.");
        }
      })
      .catch(() =>
        setError("Error al conectar con la API. Intenta nuevamente.")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: number) => {
    fetch(`https://gyg-production.up.railway.app/api/articulos/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setArticulos((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((error) => console.error(error));
  };

  const handleEdit = (item: Articulo) => {
    navigation.navigate("EditProduct", { item });
  };

  const handleRegisterSale = (item: Articulo) => {
    navigation.navigate("RegisterSale", { item });
  };

  return (
    <LinearGradient colors={["#F3EAD9", "#E9DAC1"]} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Lista de Productos</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddProduct")}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
          <Text style={styles.addButtonText}>Agregar Producto</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#8B5E3C" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={articulos.filter((a) => a.id !== undefined)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.nombre}</Text>
                  <Text style={styles.productCategory}>{item.categoria}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.price}>💲{item.precio}</Text>
                  <Text style={styles.stock}>Stock: {item.stock}</Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(item)}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.actionText}>Eliminar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saleButton]}
                    onPress={() => handleRegisterSale(item)}
                  >
                    <MaterialCommunityIcons
                      name="cart"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.actionText}>Venta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#3E2723",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 18,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#8B5E3C",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4E342E",
  },
  productCategory: {
    fontSize: 13,
    color: "#8D6E63",
  },
  cardBody: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6D4C41",
  },
  stock: {
    fontSize: 14,
    color: "#5D4037",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 14,
  },
  editButton: {
    backgroundColor: "#8B5E3C",
  },
  deleteButton: {
    backgroundColor: "#C67B5C",
  },
  saleButton: {
    backgroundColor: "#A47551",
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: 20,
  },
});
