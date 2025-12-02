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
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { fetchJson, fetchJsonSafe } from "@/src/utils/fetchJson";

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

type ProductoSeleccionado =
  | (Articulo & { tipo: "articulo" })
  | (CustomProduct & { tipo: "personalizado" })
  | null;

export default function RegisterSaleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = {
    background: isDark ? "#0b1220" : "#fffaf0",
    card: isDark ? "#0f1724" : "#fff",
    text: isDark ? "#e6eef8" : "#3a2e1f",
    muted: isDark ? "#9aa4b2" : "#b08a5a",
    accent: "#0f4c81",
    // color más claro del acento para iconos/énfasis
    accentLight: isDark ? "#6fb8e6" : "#b08a5a",
    // color de borde usado en inputs/selects
    border: isDark ? "#22303a" : "#e9dcc3",
    danger: "#b91c1c",
  };

  const [productos, setProductos] = useState<Articulo[]>([]);
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [tipoProducto, setTipoProducto] = useState<TipoProducto>("articulo");
  const [selectedProducto, setSelectedProducto] =
    useState<ProductoSeleccionado>(null);
  const [cantidad, setCantidad] = useState("");
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = (route.params as { item?: Articulo }) || {};

  const fetchProductos = async () => {
    try {
      const data = await fetchJson(
        "https://gyg-production.up.railway.app/api/articulos"
      );
      const disponibles = Array.isArray(data) ? data.filter((p) => p.stock > 0) : [];
      setProductos(disponibles);
      if (item) setSelectedProducto({ ...item, tipo: "articulo" });
    } catch (err) {
      console.error("Error fetching articulos:", (err as any)?.message ?? err);
      setProductos([]);
    }

    try {
      // Intentar primero el endpoint "disponibles", si falla probar el endpoint general y normalizar.
      const urlPreferida = "https://gyg-production.up.railway.app/personalizados/disponibles";
      const urlFallback = "https://gyg-production.up.railway.app/pedidos_personalizados";

      const safe = await fetchJsonSafe(urlPreferida);
      let data: any = null;
      let source: 'preferida' | 'fallbackArray' | 'candidate' | null = null;

      if (safe.ok && Array.isArray(safe.data)) {
        data = safe.data;
        source = 'preferida';
      } else {
        // Intentar fallback
        const safe2 = await fetchJsonSafe(urlFallback);
        if (safe2.ok && Array.isArray(safe2.data)) {
          data = safe2.data;
          source = 'fallbackArray';
        } else {
          // Si alguno devolvió objeto que contiene el array en otra propiedad (p.ej. .data or .items), intentarlo
          const candidate = safe.data ?? safe2.data;
          if (candidate) {
            if (Array.isArray(candidate)) {
              data = candidate;
              source = 'candidate';
            }
            else if (Array.isArray(candidate.items)) {
              data = candidate.items;
              source = 'candidate';
            }
            else if (Array.isArray(candidate.data)) {
              data = candidate.data;
              source = 'candidate';
            }
          }
        }
      }

      // filtro estricto para fallback: incluir SOLO items que explícitamente indiquen disponibilidad
      const strictAvailableFilter = (arr: any[]) => {
        return arr.filter((it) => {
          if (!it || typeof it !== "object") return false;
          // si explícitamente marcado como disponible -> incluir
          if ("disponible" in it) return Boolean((it as any).disponible);
          // si explícitamente marcado como no vendido -> incluir
          if ("vendido" in it) return !Boolean((it as any).vendido);
          // stock explícito positivo -> incluir
          if ("stock" in it && typeof (it as any).stock === "number") return (it as any).stock > 0;
          // estado explícito que denote disponibilidad
          if ("estado" in it) {
            const s = String((it as any).estado || "").toLowerCase();
            return ["disponible", "available", "activo", "pending", "pendiente"].includes(s);
          }
          if ("status" in it) {
            const s = String((it as any).status || "").toLowerCase();
            return ["available", "active", "pending"].includes(s);
          }
          // si está vinculado a una venta/pedido -> excluir
          if ("venta_id" in it && (it as any).venta_id != null) return false;
          if ("pedido_id" in it && (it as any).pedido_id != null) return false;
          // campos que indican comprador/cliente -> excluir
          const buyerFields = ["comprador", "cliente", "buyer"];
          for (const f of buyerFields) {
            if (f in it && (it as any)[f] != null) return false;
          }
          // no hay indicador explícito -> excluir en fallback (estricto)
          return false;
        });
      };

      // filtro leniente (mejor esfuerzo) para cuando strict deja vacío
      const lenientAvailableFilter = (arr: any[]) => {
        return arr.filter((it) => {
          if (!it || typeof it !== "object") return false;
          // excluir si explícitamente marcado como vendido o tiene venta_id/pedido_id o comprador
          if ("vendido" in it && Boolean((it as any).vendido)) return false;
          if ("venta_id" in it && (it as any).venta_id != null) return false;
          if ("pedido_id" in it && (it as any).pedido_id != null) return false;
          const buyerFields = ["comprador", "cliente", "buyer"];
          for (const f of buyerFields) {
            if (f in it && (it as any)[f] != null) return false;
          }
          // otherwise include (lenient)
          return true;
        });
      };

      if (!data) {
        const msg = safe.data?.error ?? safe.text ?? `HTTP ${safe.status}`;
        console.warn("No se pudieron obtener personalizados (tried varios endpoints):", msg);
        setCustomProducts([]);
      } else {
        if (source === 'preferida') {
          // endpoint /disponibles -> asumir correcto
          setCustomProducts(Array.isArray(data) ? data : []);
        } else {
          const arr = Array.isArray(data) ? data : [];
          const strict = strictAvailableFilter(arr);
          if (strict.length > 0) {
            setCustomProducts(strict);
          } else {
            const lenient = lenientAvailableFilter(arr);
            if (lenient.length > 0) {
              console.warn("Strict filter removed all items; using lenient filter for personalizados");
              setCustomProducts(lenient);
            } else {
              console.warn("No personalizados pasaron strict/lenient filters; showing original array for inspection");
              setCustomProducts(arr);
            }
          }
        }
      }
    } catch (err) {
      // Fallback: cualquier excepción imprevista
      console.error("Error fetching personalizados (unexpected):", (err as any)?.message ?? err);
      setCustomProducts([]);
    }
  };

  useEffect(() => {
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const cantidadVenta = parseInt(cantidad, 10) || 0;
  const cantidadValidaArticulo =
    tipoProducto === "articulo" &&
    selectedProducto?.tipo === "articulo" &&
    cantidadVenta > 0 &&
    cantidadVenta <= selectedProducto.stock;

  const cantidadValidaCustom =
    tipoProducto === "personalizado" &&
    selectedProducto?.tipo === "personalizado" &&
    cantidad === "1";

  const puedeAgregar = cantidadValidaArticulo || cantidadValidaCustom;

  const handleAgregarProducto = () => {
    if (!selectedProducto) {
      Alert.alert("Error", "Debe seleccionar un producto válido.");
      return;
    }

    if (tipoProducto === "articulo" && cantidadValidaArticulo) {
      setProductosVenta((prev) => [
        ...prev,
        {
          tipo: "articulo",
          articulo_id: selectedProducto.id,
          cantidad: cantidadVenta,
          precio_unitario: selectedProducto.precio,
        },
      ]);
      setProductos((prev) =>
        prev.map((p) =>
          p.id === selectedProducto.id
            ? { ...p, stock: p.stock - cantidadVenta }
            : p
        )
      );
    } else if (tipoProducto === "personalizado" && cantidadValidaCustom) {
      setProductosVenta((prev) => [
        ...prev,
        {
          tipo: "personalizado",
          personalizado_id: selectedProducto.id,
          nombre: selectedProducto.nombre,
          descripcion: selectedProducto.descripcion,
          cantidad: 1,
          precio_unitario: selectedProducto.precio,
        },
      ]);
    } else {
      Alert.alert("Error", "Cantidad inválida.");
      return;
    }

    setCantidad("");
    setSelectedProducto(null);
    Keyboard.dismiss();
  };

  const handleEliminarProductoVenta = (idx: number) => {
    const prod = productosVenta[idx];
    if (prod.tipo === "articulo" && prod.articulo_id) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === prod.articulo_id
            ? { ...p, stock: p.stock + prod.cantidad }
            : p
        )
      );
    }
    setProductosVenta((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRegisterSale = () => {
    if (productosVenta.length === 0) {
      Alert.alert("Error", "Agregue al menos un producto a la venta.");
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const resp = await fetch("https://gyg-production.up.railway.app/ventas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articulos: productosVenta }),
        });
        const text = await resp.text().catch(() => "");
        if (!resp.ok) {
          let msg = text;
          try {
            msg = JSON.parse(text || "{}").error ?? JSON.stringify(JSON.parse(text || "{}"));
          } catch {}
          throw new Error(msg || "Error al registrar la venta");
        }

        // parse success body if exists
        try {
          JSON.parse(text);
        } catch {}

        Alert.alert("Venta registrada", "La venta se registró correctamente.", [
          {
            text: "OK",
            onPress: () => {
              setProductosVenta([]);
              setCantidad("");
              setSelectedProducto(null);
              fetchProductos();
              Keyboard.dismiss();
              try {
                navigation.goBack?.();
              } catch {}
            },
          },
        ]);
      } catch (err: any) {
        console.error("Error registrando venta:", err?.message ?? err);
        Alert.alert("Error", err?.message ?? "Error al registrar la venta.");
      } finally {
        setLoading(false);
      }
    })();
  };

  const totalVenta = productosVenta.reduce(
    (acc, p) => acc + p.cantidad * p.precio_unitario,
    0
  );

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 0 });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Encabezado tipo dashboard */}
      <View style={styles.headerContainer}>
        <Ionicons name="cash-outline" size={28} color={colors.accentLight} />
        <Text style={[styles.title, { color: colors.text }]}>
          Registrar venta
        </Text>
      </View>

      {/* Resumen actual */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Ionicons name="cart-outline" size={22} color={colors.accentLight} />
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>
            Productos
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {productosVenta.length}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Ionicons name="cash-outline" size={22} color={colors.accentLight} />
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>
            Total
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${fmt(totalVenta)}
          </Text>
        </View>
      </View>

      {/* Tarjeta selección de producto */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.muted }]}>
          Tipo de producto
        </Text>
        <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
          <Picker
            selectedValue={tipoProducto}
            onValueChange={(v) => {
              setTipoProducto(v as TipoProducto);
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
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={
                  selectedProducto?.tipo === "articulo"
                    ? selectedProducto.id
                    : undefined
                }
                onValueChange={(v) => {
                  const p = productos.find((x) => x.id === v);
                  setSelectedProducto(p ? { ...p, tipo: "articulo" } : null);
                }}
              >
                <Picker.Item
                  label="Seleccione un producto..."
                  value={undefined}
                />
                {productos.map((p) => (
                  <Picker.Item
                    key={p.id}
                    label={`${p.nombre} (Stock: ${p.stock})`}
                    value={p.id}
                  />
                ))}
              </Picker>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: colors.muted }]}>
              Personalizado
            </Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={
                  selectedProducto?.tipo === "personalizado"
                    ? selectedProducto.id
                    : undefined
                }
                onValueChange={(v) => {
                  const p = customProducts.find((x) => x.id === v);
                  setSelectedProducto(p ? { ...p, tipo: "personalizado" } : null);
                  setCantidad("1");
                }}
              >
                <Picker.Item
                  label="Seleccione un personalizado..."
                  value={undefined}
                />
                {customProducts.map((p) => (
                  <Picker.Item
                    key={p.id}
                    label={`${p.nombre} ($${fmt(p.precio)})`}
                    value={p.id}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: "#fff",
              color: colors.text,
            },
          ]}
          placeholder="Cantidad"
          placeholderTextColor={colors.muted}
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
        />

        <Pressable
          style={[
            styles.actionButton,
            {
              backgroundColor: puedeAgregar ? colors.accentLight : "#ac7a3eff",
            },
          ]}
          onPress={handleAgregarProducto}
          disabled={!puedeAgregar}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Agregar producto</Text>
        </Pressable>
      </View>

      {/* Lista de productos agregados */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Productos agregados
        </Text>

        {productosVenta.length === 0 ? (
          <Text style={{ color: colors.muted }}>No hay productos agregados.</Text>
        ) : (
          productosVenta.map((p, i) => (
            <View
              key={i}
              style={[
                styles.productoVentaItem,
                { backgroundColor: "#f9fafb" },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  {p.tipo === "articulo"
                    ? productos.find((x) => x.id === p.articulo_id)?.nombre
                    : p.nombre}
                </Text>
                <Text style={{ color: colors.accentLight, fontWeight: "600" }}>
                  ${fmt(p.precio_unitario * p.cantidad)}
                </Text>
              </View>
              <Text style={{ color: colors.muted }}>Cantidad: {p.cantidad}</Text>

              <Pressable
                style={[styles.removeButton, { backgroundColor: colors.danger }]}
                onPress={() => handleEliminarProductoVenta(i)}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={{ color: "#fff", marginLeft: 4, fontWeight: "600" }}>
                  Eliminar
                </Text>
              </Pressable>
            </View>
          ))
        )}

        {/* Total y botón final */}
        <View style={styles.totalRow}>
          <Text style={{ color: colors.muted, fontSize: 16 }}>Total:</Text>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18 }}>
            ${fmt(totalVenta)}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.accent}
            style={{ marginTop: 12 }}
          />
        ) : (
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  productosVenta.length === 0 ? "#ac7a3eff" : colors.accent,
                marginTop: 12,
              },
            ]}
            onPress={handleRegisterSale}
            disabled={productosVenta.length === 0 || loading}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {loading ? "Registrando..." : "Registrar venta"}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f4ef", // tono cálido crema
    padding: 16,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3a2e1f", // marrón oscuro tipo madera
    textAlign: "center",
    marginBottom: 16,
  },

  // 🧾 Resumen superior estilo dashboard
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#a07d4b", // tono dorado-marrón
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  summaryLabel: {
    color: "#fff",
    fontSize: 13,
  },

  summaryValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  // 🗂️ Tarjetas generales
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    color: "#3a2e1f",
    marginBottom: 6,
  },

  pickerContainer: {
    borderColor: "#e9dcc3",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#fdfaf6",
  },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e9dcc3",
    borderRadius: 10,
    backgroundColor: "#fdfaf6",
    paddingHorizontal: 10,
    marginBottom: 12,
    color: "#3a2e1f",
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3a2e1f",
    marginBottom: 8,
  },

  productoVentaItem: {
    borderWidth: 1,
    borderColor: "#e9dcc3",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fdfaf6",
    marginBottom: 8,
  },

  removeButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b91c1c",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e9dcc3",
    paddingTop: 10,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: "#a07d4b",
  },

  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

