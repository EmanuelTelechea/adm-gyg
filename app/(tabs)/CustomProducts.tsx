import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { fetchJson } from "@/src/utils/fetchJson";

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
    (async () => {
      setLoading(true);
      try {
        const data = await fetchJson("https://gyg-production.up.railway.app/pedidos_personalizados");
        setCustomProducts(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching personalizados:", err?.message ?? err);
        setCustomProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    fetchCustomProducts();
  }, []);

  const handleAddCustomProduct = () => {
    if (!nombre.trim() || !descripcion.trim() || !medidas.trim() || isNaN(Number(precio)) || Number(precio) <= 0) {
      Alert.alert("Error", "Complete todos los campos correctamente.");
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const resp = await fetch("https://gyg-production.up.railway.app/pedidos_personalizados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, descripcion, medidas, precio: Number(precio) }),
        });
        const text = await resp.text();
        if (!resp.ok) {
          let msg = text;
          try { msg = JSON.parse(text)?.error ?? text; } catch {}
          throw new Error(msg || "Error al crear personalizado");
        }
        // success
        setModalVisible(false);
        setNombre("");
        setDescripcion("");
        setMedidas("");
        setPrecio("");
        fetchCustomProducts();
      } catch (err: any) {
        console.error("Error creating personalizado:", err?.message ?? err);
        Alert.alert("Error", err?.message ?? "No se pudo crear el personalizado.");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Artículos Personalizados</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Agregar Personalizado</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#a07d4b" style={{ marginVertical: 10 }} />}

      <FlatList
        data={customProducts}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={fetchCustomProducts}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedProduct(item)}>
            <View>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardSubtitle}>${item.precio}</Text>
            </View>
            <Text style={styles.verMas}>Ver detalles</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay personalizados registrados.</Text>}
      />

      {/* Modal para agregar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nuevo Personalizado</Text>

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

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCustomProduct}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para detalle */}
      <Modal visible={!!selectedProduct} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Detalle del Personalizado</Text>
            <Text style={styles.detailText}>🪵 {selectedProduct?.nombre}</Text>
            <Text style={styles.detailText}>📏 {selectedProduct?.medidas}</Text>
            <Text style={styles.detailText}>📝 {selectedProduct?.descripcion}</Text>
            <Text style={[styles.detailText, { fontWeight: "bold", color: "#5a3e1b" }]}>
              💰 ${selectedProduct?.precio}
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedProduct(null)}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f5f0", padding: 20, paddingBottom: 80 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5a3e1b",
    textAlign: "center",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#a07d4b",
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#3a2a10" },
  cardSubtitle: { color: "#a07d4b", fontWeight: "bold", marginTop: 4 },
  verMas: { color: "#a07d4b", fontWeight: "bold" },
  emptyText: { textAlign: "center", color: "#777", marginTop: 30 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5a3e1b",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fdfdfd",
    borderColor: "#d1c7b7",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#a07d4b",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: "#c97a53",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelText: { color: "#fff", fontWeight: "bold" },
  detailText: { fontSize: 16, color: "#333", marginVertical: 4 },
  closeButton: {
    backgroundColor: "#a07d4b",
    borderRadius: 10,
    marginTop: 16,
    paddingVertical: 10,
  },
  closeText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
});
