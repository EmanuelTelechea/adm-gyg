import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, TextInput, Modal, TouchableOpacity, Alert } from "react-native";

interface CustomProduct {
  id: number;
  nombre: string;
  descripcion: string;
  medidas: string;
  precio: number;
}

export default function CustomProducts() {
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [medidas, setMedidas] = useState("");
  const [precio, setPrecio] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CustomProduct | null>(null);

  const fetchCustomProducts = () => {
    setLoading(true);
    fetch("https://gyg-production.up.railway.app/pedidos_personalizados")
      .then(res => res.json())
      .then(data => setCustomProducts(Array.isArray(data) ? data : []))
      .catch(() => setCustomProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomProducts();
  }, []);

  const handleAddCustomProduct = () => {
    if (!nombre.trim() || !descripcion.trim() || !medidas.trim() || isNaN(Number(precio)) || Number(precio) <= 0) {
      Alert.alert("Error", "Complete todos los campos correctamente.");
      return;
    }
    setLoading(true);
    fetch("https://gyg-production.up.railway.app/pedidos_personalizados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, medidas, precio: Number(precio) }),
    })
      .then(res => res.json())
      .then(() => {
        setModalVisible(false);
        setNombre("");
        setDescripcion("");
        setMedidas("");
        setPrecio("");
        fetchCustomProducts();
      })
      .catch(() => Alert.alert("Error", "No se pudo crear el personalizado."))
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Artículos Personalizados</Text>
      <Button title="Agregar personalizado" onPress={() => setModalVisible(true)} />
      <FlatList
        data={customProducts}
        keyExtractor={item => item.id.toString()}
        refreshing={loading}
        onRefresh={fetchCustomProducts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => setSelectedProduct(item)}
          >
            <Text style={styles.itemTitle}>{item.nombre}</Text>
            <Text>Precio: ${item.precio}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No hay personalizados registrados.</Text>}
      />
      {/* Modal para agregar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.subtitle}>Nuevo Personalizado</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
            />
            <TextInput
              style={styles.input}
              placeholder="Medidas"
              value={medidas}
              onChangeText={setMedidas}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              value={precio}
              onChangeText={setPrecio}
              keyboardType="numeric"
            />
            <Button title="Guardar" onPress={handleAddCustomProduct} />
            <Button title="Cancelar" color="#b00" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      {/* Modal para detalle */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.subtitle}>Detalle Personalizado</Text>
            <Text>Nombre: {selectedProduct?.nombre}</Text>
            <Text>Descripción: {selectedProduct?.descripcion}</Text>
            <Text>Medidas: {selectedProduct?.medidas}</Text>
            <Text>Precio: ${selectedProduct?.precio}</Text>
            <Button title="Cerrar" onPress={() => setSelectedProduct(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  subtitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
    borderRadius: 6,
  },
  itemTitle: { fontWeight: "bold", fontSize: 16 },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#fff"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    elevation: 5
  }
});
