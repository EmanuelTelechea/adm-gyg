import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BarChart, PieChart } from "react-native-chart-kit";
import { FontAwesome5, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

interface Venta {
  id: number;
  fecha: string;
  total: number;
}

interface DetalleVenta {
  detalle_id: number;
  articulo_nombre?: string;
  nombre?: string;
  cantidad: number;
  precio_unitario: number;
  venta_id?: number;
  tipo?: string;
  esPersonalizado?: boolean;
}

const screenWidth = Dimensions.get("window").width - 32;

export default function ReportsScreen() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detallesVentas, setDetallesVentas] = useState<DetalleVenta[]>([]);
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    setDetallesVentas([]);
    fetch("https://gyg-production.up.railway.app/ventas")
      .then((res) => res.json())
      .then((data) => {
        const ventasData = Array.isArray(data) ? data : [];
        setVentas(ventasData);

        ventasData.forEach((venta: Venta) => {
          fetch(`https://gyg-production.up.railway.app/ventas/${venta.id}/detalle`)
            .then((res) => res.json())
            .then((detalles) => {
              if (Array.isArray(detalles)) {
                const detallesConVentaId = detalles.map((d: any) => ({
                  detalle_id: d.detalle_id,
                  venta_id: d.venta_id,
                  cantidad: d.cantidad,
                  precio_unitario: d.precio_unitario,
                  tipo: d.tipo,
                  nombre: d.nombre_personalizado ?? d.articulo_nombre ?? "Sin nombre",
                  esPersonalizado: d.tipo === "personalizado",
                }));
                setDetallesVentas((prev) => [...prev, ...detallesConVentaId]);
              }
            })
            .catch(() => Alert.alert("Error", "No se pudieron cargar los detalles."));
        });
      })
      .catch(() => Alert.alert("Error", "No se pudieron cargar las ventas."));
  }, [refreshFlag]);

  const ventasFiltradas = ventas.filter((v) => {
    const fechaVenta = new Date(v.fecha);
    return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
  });

  const ventasFiltradasIds = ventasFiltradas.map((v) => v.id);

  const detallesFiltrados = detallesVentas
    .filter((d) => d.venta_id && ventasFiltradasIds.includes(d.venta_id))
    .map((d) => ({
      ...d,
      subtotal: d.cantidad * d.precio_unitario,
    }));

  const detallesPorVenta = ventasFiltradas.map((venta) => {
    const detalles = detallesFiltrados.filter((d) => d.venta_id === venta.id);
    const totalVenta = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    return { venta, detalles, totalVenta };
  });

  const totalVendido = detallesFiltrados.reduce((sum, d) => sum + d.subtotal, 0);
  const productosVendidos = detallesFiltrados.length;
  const cantidadVentas = ventasFiltradas.length;

  const productosMasVendidos = detallesFiltrados
    .reduce((acc: any[], item) => {
      const idx = acc.findIndex((p) => p.nombre === item.nombre);
      if (idx >= 0) acc[idx].cantidadVendida += item.cantidad;
      else acc.push({ nombre: item.nombre, cantidadVendida: item.cantidad, esPersonalizado: item.esPersonalizado });
      return acc;
    }, [])
    .sort((a, b) => b.cantidadVendida - a.cantidadVendida);

  const personalizados = detallesFiltrados.filter((d) => d.esPersonalizado).length;
  const normales = detallesFiltrados.filter((d) => !d.esPersonalizado).length;

  const barData = {
    labels: productosMasVendidos.slice(0, 5).map((p) => p.nombre),
    datasets: [
      {
        data: productosMasVendidos.slice(0, 5).map((p) => p.cantidadVendida),
      },
    ],
  };

  const pieData = [
    {
      name: "Artículos",
      cantidad: normales,
      color: "#a07d4b",
      legendFontColor: "#3a2e1f",
      legendFontSize: 13,
    },
    {
      name: "Personalizados",
      cantidad: personalizados,
      color: "#d5b895",
      legendFontColor: "#3a2e1f",
      legendFontSize: 13,
    },
  ];

  const generatePDF = async () => {
  try {
    const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { text-align: center; color: #3a2e1f; }
          h2 { color: #a07d4b; margin-top: 24px; }
          .card { padding: 12px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 8px; }
          .item { margin-left: 10px; font-size: 14px; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Reporte de Ventas</h1>

        <h2>Resumen General</h2>
        <div class="card">
          <p><span class="bold">Total Vendido:</span> $${totalVendido.toFixed(0)}</p>
          <p><span class="bold">Cantidad de Ventas:</span> ${cantidadVentas}</p>
          <p><span class="bold">Productos Vendidos:</span> ${productosVendidos}</p>
          <p><span class="bold">Artículos Normales:</span> ${normales}</p>
          <p><span class="bold">Personalizados:</span> ${personalizados}</p>
          <p><span class="bold">Fecha inicio:</span> ${fechaInicio}</p>
          <p><span class="bold">Fecha fin:</span> ${fechaFin}</p>
        </div>

        <h2>Productos más vendidos</h2>
        <div class="card">
          ${productosMasVendidos
            .slice(0, 10)
            .map(
              (p) => `
              <p class="item">• ${p.nombre} — ${p.cantidadVendida} unidades</p>
              `
            )
            .join("")}
        </div>

        <h2>Detalles por Venta</h2>
        ${detallesPorVenta
          .map(
            (item) => `
          <div class="card">
            <p><span class="bold">Venta #${item.venta.id}</span> — ${new Date(
              item.venta.fecha
            ).toLocaleDateString()}</p>
            ${item.detalles
              .map(
                (d) => `
              <p class="item">
                ${d.esPersonalizado ? "Personalizado" : "Artículo"}: 
                <span class="bold">${d.nombre}</span>
                — Cant: ${d.cantidad}, Precio: $${d.precio_unitario}
                <br />Subtotal: <span class="bold">$${d.subtotal}</span>
              </p>
            `
              )
              .join("")}
            <p><span class="bold">Total Venta: $${item.totalVenta}</span></p>
          </div>
        `
          )
          .join("")}
      </body>
    </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(uri);
  } catch (error) {
    Alert.alert("Error", "Hubo un problema creando el PDF.");
  }
};
  const handleManualRefresh = () => setRefreshFlag((f) => f + 1);

  return (
    <ScrollView style={styles.container} >
      <Text style={styles.title}>📊 Reportes de Ventas</Text>

      {/* 🧾 Resumen general */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: "#a07d4b" }]}>
          <View>
            <Text style={styles.summaryLabel}>Total Vendido</Text>
            <Text style={styles.summaryValue}>${totalVendido.toFixed(0)}</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: "#b08a5a" }]}>
          <MaterialCommunityIcons name="receipt-text" size={22} color="#fff" />
          <View>
            <Text style={styles.summaryLabel}>Ventas</Text>
            <Text style={styles.summaryValue}>{cantidadVentas}</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: "#d5b895" }]}>
          <Feather name="box" size={22} color="#3a2e1f" />
          <View>
            <Text style={[styles.summaryLabel, { color: "#3a2e1f" }]}>Productos</Text>
            <Text style={[styles.summaryValue, { color: "#3a2e1f" }]}>{productosVendidos}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText}>📄 Generar PDF</Text>
      </TouchableOpacity>
      
      {/* 📅 Filtros y actualización */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.button} onPress={handleManualRefresh}>
          <Text style={styles.buttonText}>🔄 Actualizar Datos</Text>
        </TouchableOpacity>

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowInicioPicker(true)}>
            <Text style={styles.dateButtonText}>Desde: {fechaInicio.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showInicioPicker && (
            <DateTimePicker
              value={fechaInicio}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowInicioPicker(false);
                if (date) setFechaInicio(date);
              }}
            />
          )}

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowFinPicker(true)}>
            <Text style={styles.dateButtonText}>Hasta: {fechaFin.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showFinPicker && (
            <DateTimePicker
              value={fechaFin}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowFinPicker(false);
                if (date) setFechaFin(date);
              }}
            />
          )}
        </View>
      </View>

      {/* 🏆 Productos más vendidos */}
      <Text style={styles.subtitle}>🏆 Productos más vendidos</Text>
      {productosMasVendidos.length > 0 ? (
        <BarChart
          data={barData}
          width={screenWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#f9f4ef",
            backgroundGradientFrom: "#f9f4ef",
            backgroundGradientTo: "#f9f4ef",
            decimalPlaces: 0,
            color: () => "#a07d4b",
            labelColor: () => "#3a2e1f",
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.emptyText}>No hay productos vendidos en este rango.</Text>
      )}

      {/* 🥧 Tipos de venta */}
      <Text style={styles.subtitle}>📊 Tipos de venta</Text>
      <PieChart
        data={pieData}
        width={screenWidth}
        height={200}
        chartConfig={{
          color: () => "#3a2e1f",
        }}
        accessor="cantidad"
        backgroundColor="transparent"
        paddingLeft="10"
      />

      {/* 📋 Detalles */}
      <Text style={styles.subtitle}>🧾 Detalles por venta</Text>
      {detallesPorVenta.length === 0 ? (
        <Text style={styles.emptyText}>No hay detalles en este rango.</Text>
      ) : (
        detallesPorVenta.map((item) => (
          <View key={item.venta.id} style={styles.saleCard}>
            <Text style={styles.saleHeader}>
              Venta #{item.venta.id} — {new Date(item.venta.fecha).toLocaleDateString()}
            </Text>
            {item.detalles.map((d) => (
              <View key={d.detalle_id} style={styles.saleItem}>
                <Text style={styles.saleText}>
                  {d.esPersonalizado ? "✨ Personalizado" : "🪵 Artículo"}: {d.nombre}
                </Text>
                <Text style={styles.saleText}>Cantidad: {d.cantidad}</Text>
                <Text style={styles.saleText}>Precio: ${d.precio_unitario}</Text>
                <Text style={styles.saleSubtotal}>Subtotal: ${d.subtotal}</Text>
              </View>
            ))}
            <Text style={styles.totalVenta}>💰 Total: ${item.totalVenta}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f4ef", padding: 16,marginBottom: 84 },
  title: { fontSize: 26, marginTop: 16, fontWeight: "bold", textAlign: "center", color: "#3a2e1f", marginBottom: 16 },
  summaryContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: { color: "#fff", fontSize: 13 },
  summaryValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: { backgroundColor: "#a07d4b", borderRadius: 8, paddingVertical: 10, alignItems: "center", marginBottom: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  dateRow: { flexDirection: "row", justifyContent: "space-between" },
  dateButton: { backgroundColor: "#e9dcc3", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  dateButtonText: { color: "#3a2e1f", fontWeight: "500" },
  subtitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10, color: "#3a2e1f" },
  chart: { borderRadius: 10, marginBottom: 20 },
  saleCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 16, elevation: 3 },
  saleHeader: { fontWeight: "bold", color: "#a07d4b", fontSize: 16, marginBottom: 8 },
  saleItem: { backgroundColor: "#f4ede4", padding: 10, borderRadius: 8, marginBottom: 8 },
  saleText: { color: "#3a2e1f" },
  saleSubtotal: { color: "#000", fontWeight: "bold" },
  totalVenta: { textAlign: "right", fontWeight: "bold", color: "#3a2e1f", fontSize: 16 },
  emptyText: { textAlign: "center", color: "#777", marginVertical: 8 },
});
