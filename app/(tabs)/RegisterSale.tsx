import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from "@/hooks/useColorScheme";

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

type TipoProducto = "articulo" | "personalizado";

interface ProductoVenta {
  tipo: TipoProducto;
  articulo_id?: number;
  personalizado_id?: number;
  nombre?: string;
  descripcion?: string;
  cantidad: number;
  medidas?: string;  
  precio_unitario: number;
}

interface CustomProduct {
  id: number;
  nombre: string;
  descripcion: string;
  medidas: string;
  precio: number;
}

type ProductoSeleccionado = (Articulo & { tipo: "articulo" }) | (CustomProduct & { tipo: "personalizado" }) | null;

export default function RegisterSaleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = {
    background: isDark ? "#0b1220" : "#f4f6fb",
    card: isDark ? "#0f1724" : "#ffffff",
    text: isDark ? "#e6eef8" : "#111827",
    muted: isDark ? "#9aa4b2" : "#6b7280",
    accent: "#0f4c81",
    danger: "#b91c1c"
  };

  const [productos, setProductos] = useState<Articulo[]>([]);
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [tipoProducto, setTipoProducto] = useState<TipoProducto>("articulo");
  const [selectedProducto, setSelectedProducto] = useState<ProductoSeleccionado>(null);
  const [cantidad, setCantidad] = useState("");
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = (route.params as { item?: Articulo }) || {};

  const fetchProductos = () => {
    // Artículos con stock > 0
    fetch("https://gyg-production.up.railway.app/api/articulos")
      .then((response) => response.json())
      .then((data) => {
        const disponibles = Array.isArray(data) ? data.filter(p => p.stock > 0) : [];
        setProductos(disponibles);
        if (item) {
          setSelectedProducto({ ...item, tipo: "articulo" });
        }
      })
      .catch((error) => {
        console.error(error);
        setProductos([]);
      });

    // Personalizados disponibles
    fetch("https://gyg-production.up.railway.app/pedidos_personalizados/disponibles")
      .then((response) => response.json())
      .then((data) => setCustomProducts(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error(error);
        setCustomProducts([]);
      });
  };

  useEffect(() => {
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const cantidadVenta = parseInt(cantidad, 10) || 0;
  const cantidadValidaArticulo =
    tipoProducto === "articulo" &&
    selectedProducto &&
    selectedProducto.tipo === "articulo" &&
    !isNaN(cantidadVenta) &&
    cantidadVenta > 0 &&
    cantidadVenta <= selectedProducto.stock;

  const cantidadValidaCustom =
    tipoProducto === "personalizado" &&
    selectedProducto &&
    selectedProducto.tipo === "personalizado" &&
    cantidad === "1"; // Solo uno para personalizados

  const personalizadoValido = cantidadValidaCustom;

  const puedeAgregar =
    (tipoProducto === "articulo" && cantidadValidaArticulo) ||
    (tipoProducto === "personalizado" && personalizadoValido);

  const handleAgregarProducto = () => {
    if (tipoProducto === "articulo") {
      if (!selectedProducto || selectedProducto.tipo !== "articulo") {
        Alert.alert("Error", "Debe seleccionar un producto.");
        return;
      }
      if (!cantidadValidaArticulo) {
        Alert.alert("Error", "Cantidad inválida o supera el stock.");
        return;
      }
      setProductosVenta(prev => [
        ...prev,
        {
          tipo: "articulo",
          articulo_id: selectedProducto.id,
          cantidad: cantidadVenta,
          precio_unitario: selectedProducto.precio,
        }
      ]);
      // Actualizar stock localmente
      setProductos(prev =>
        prev.map(p =>
          p.id === selectedProducto.id
            ? { ...p, stock: p.stock - cantidadVenta }
            : p
        )
      );
      setCantidad("");
      setSelectedProducto(null);
      Keyboard.dismiss();
    } else {
      if (!personalizadoValido || !selectedProducto || selectedProducto.tipo !== "personalizado") {
        Alert.alert("Error", "Seleccione un personalizado y cantidad válida.");
        return;
      }
      setProductosVenta(prev => [
        ...prev,
        {
          tipo: "personalizado",
          personalizado_id: selectedProducto.id,
          nombre: selectedProducto.nombre,
          descripcion: selectedProducto.descripcion,
          cantidad: cantidadVenta || 1,
          precio_unitario: selectedProducto.precio ?? 0,
        }
      ]);
      setSelectedProducto(null);
      setCantidad("");
      Keyboard.dismiss();
    }
  };

  const handleEliminarProductoVenta = (idx: number) => {
    const prod = productosVenta[idx];
    if (prod.tipo === "articulo" && prod.articulo_id) {
      setProductos(prev =>
        prev.map(p =>
          p.id === prod.articulo_id
            ? { ...p, stock: p.stock + prod.cantidad }
            : p
        )
      );
    }
    setProductosVenta(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRegisterSale = () => {
    if (productosVenta.length === 0) {
      Alert.alert("Error", "Agregue al menos un producto a la venta.");
      return;
    }
    setLoading(true);

    const venta = {
      articulos: productosVenta
    };

    fetch("https://gyg-production.up.railway.app/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venta),
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          let errorMsg = text;
          try {
            const json = JSON.parse(text || "{}");
            errorMsg = json.error || JSON.stringify(json);
          } catch {}
          console.error("Error backend:", errorMsg);
          throw new Error(errorMsg || "Error al registrar la venta");
        }
        return response.json();
      })
      .then((data) => {
        Alert.alert(
          "Venta registrada",
          "La venta se registró correctamente.",
          [
            {
              text: "OK",
              onPress: () => {
                setProductosVenta([]);
                setCantidad("");
                setSelectedProducto(null);
                fetchProductos();
                Keyboard.dismiss();
                // Volver si es posible
                try {
                  // @ts-ignore
                  navigation.goBack?.();
                } catch {}
              }
            }
          ]
        );
      })
      .catch((error) => {
        console.error("Error fetch:", error);
        Alert.alert("Error", error.message || "Error al registrar la venta.");
      })
      .finally(() => setLoading(false));
  };

  const totalVenta = productosVenta.reduce((acc, p) => acc + p.cantidad * p.precio_unitario, 0);
  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>Registrar venta</Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.muted }]}>Tipo de producto</Text>
        <View style={[styles.pickerContainer, { borderColor: "#e6e9ef" }]}>
          <Picker
            selectedValue={tipoProducto}
            onValueChange={(value) => {
              setTipoProducto(value as TipoProducto);
              setSelectedProducto(null);
              setCantidad("");
            }}
          >
            <Picker.Item label="Artículo" value="articulo" />
            <Picker.Item label="Personalizado" value="personalizado" />
          </Picker>
        </View>

        {tipoProducto === "articulo" ? (
          <>
            <Text style={[styles.label, { color: colors.muted }]}>Producto</Text>
            <View style={[styles.pickerContainer, { borderColor: "#e6e9ef" }]}>
              <Picker
                selectedValue={selectedProducto?.tipo === "articulo" ? selectedProducto.id : undefined}
                onValueChange={(itemValue) => {
                  const producto = productos.find(p => p.id === itemValue);
                  setSelectedProducto(producto ? { ...producto, tipo: "articulo" } : null);
                }}
              >
                <Picker.Item label="Seleccione un producto..." value={undefined} />
                {(productos || []).map((producto) => (
                  <Picker.Item key={producto.id} label={`${producto.nombre} (Stock: ${producto.stock})`} value={producto.id} />
                ))}
              </Picker>
            </View>
            {selectedProducto && selectedProducto.tipo === "articulo" && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: colors.text }}>Precio: ${fmt(selectedProducto.precio)}</Text>
                <Text style={{ color: colors.muted }}>Cantidad en stock: {selectedProducto.stock}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: colors.muted }]}>Personalizado</Text>
            <View style={[styles.pickerContainer, { borderColor: "#e6e9ef" }]}>
              <Picker
                selectedValue={selectedProducto?.tipo === "personalizado" ? selectedProducto.id : undefined}
                onValueChange={(itemValue) => {
                  const producto = customProducts.find(p => p.id === itemValue);
                  setSelectedProducto(producto ? { ...producto, tipo: "personalizado" } : null);
                  setCantidad("1");
                }}
              >
                <Picker.Item label="Seleccione un personalizado..." value={undefined} />
                {(customProducts || []).map((producto) => (
                  <Picker.Item key={producto.id} label={`${producto.nombre} ($${fmt(producto.precio)})`} value={producto.id} />
                ))}
              </Picker>
            </View>
            {selectedProducto && selectedProducto.tipo === "personalizado" && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: colors.text }}>Descripción: {selectedProducto.descripcion}</Text>
                <Text style={{ color: colors.text }}>Medidas: {selectedProducto.medidas}</Text>
                <Text style={{ color: colors.text }}>Precio: ${fmt(selectedProducto.precio)}</Text>
              </View>
            )}
          </>
        )}

        <TextInput
          style={[styles.input, { borderColor: "#e6e9ef", backgroundColor: isDark ? "#0b1220" : "#fff" }]}
          placeholder="Cantidad"
          placeholderTextColor={isDark ? "#9aa4b2" : "#9aa4b2"}
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
          editable={tipoProducto === "articulo" ? !!selectedProducto : !!selectedProducto}
        />

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: puedeAgregar ? colors.accent : "#c4cdd6", opacity: pressed ? 0.9 : 1 }
          ]}
          onPress={handleAgregarProducto}
          disabled={!puedeAgregar}
        >
          <Text style={styles.addButtonText}>Agregar a la venta</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.subtitle, { color: colors.text }]}>Productos en la venta</Text>

        {productosVenta.length === 0 ? (
          <Text style={{ color: colors.muted }}>No hay productos agregados.</Text>
        ) : (
          productosVenta.map((prod, idx) => (
            <View key={idx} style={[styles.productoVentaItem, { backgroundColor: isDark ? "#071025" : "#fafafa" }]}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                {prod.tipo === "articulo"
                  ? `Artículo: ${productos.find(p => p.id === prod.articulo_id)?.nombre || "?"}`
                  : `Personalizado: ${prod.nombre}`}
              </Text>
              <Text style={{ color: colors.muted }}>Cantidad: {prod.cantidad}</Text>
              <Text style={{ color: colors.muted }}>Precio unitario: ${fmt(prod.precio_unitario)}</Text>
              <Pressable style={styles.removeButton} onPress={() => handleEliminarProductoVenta(idx)}>
                <Text style={{ color: colors.card }}>Eliminar</Text>
              </Pressable>
            </View>
          ))
        )}

        <View style={styles.totalRow}>
          <Text style={{ color: colors.muted }}>Total:</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>${fmt(totalVenta)}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 8 }} />
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.registerButton,
              { backgroundColor: productosVenta.length === 0 ? "#c4cdd6" : colors.accent, opacity: pressed ? 0.95 : 1 }
            ]}
            onPress={handleRegisterSale}
            disabled={productosVenta.length === 0 || loading}
          >
            <Text style={styles.registerButtonText}>{loading ? "Registrando..." : "Registrar venta"}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: {
    marginBottom: 14,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6
  },
  label: { fontSize: 13, marginBottom: 6 },
  pickerContainer: { borderColor: "gray", borderWidth: 1, borderRadius: 8, overflow: "hidden", marginBottom: 8 },
  input: {
    height: 44,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6
  },
  addButtonText: { color: "#fff", fontWeight: "700" },
  subtitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  productoVentaItem: {
    borderWidth: 1,
    borderColor: "#e6e9ef",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8
  },
  removeButton: {
    marginTop: 8,
    backgroundColor: "#b91c1c",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  registerButton: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
  },
  registerButtonText: { color: "#fff", fontWeight: "700" }
});
