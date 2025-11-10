import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Alert } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

interface Venta {
  id: number;
  fecha: string;
  total: number;
}

interface DetalleVenta {
  detalle_id: number;
  articulo_nombre?: string;
  nombre?: string; // Para pedidos personalizados
  cantidad: number;
  precio_unitario: number;
  venta_id?: number;
  tipo?: string; // 'articulo' o 'personalizado'
}

interface Articulo {
  id: number;
  nombre: string;
  precio: number;
}

export default function ReportsScreen() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detallesVentas, setDetallesVentas] = useState<DetalleVenta[]>([]);
  const [productos, setProductos] = useState<Articulo[]>([]);
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    setDetallesVentas([]);

    // Cargar ventas
    fetch("https://gyg-production.up.railway.app/ventas")
      .then(res => res.json())
      .then(data => {
        const ventasData = Array.isArray(data) ? data : [];
        setVentas(ventasData);

        ventasData.forEach((venta: Venta) => {
          // Cargar detalles con join a artículos y pedidos personalizados
          fetch(`https://gyg-production.up.railway.app/ventas/${venta.id}/detalle`)
            .then(res => res.json())
            .then(detalles => {
              if (Array.isArray(detalles)) {
                const detallesConVentaId = detalles.map((d: any) => {
                  if (d.tipo === "personalizado") {
                    return {
                      detalle_id: d.detalle_id,
                      venta_id: d.venta_id,
                      cantidad: d.cantidad,
                      precio_unitario: d.precio_unitario,
                      tipo: "personalizado",
                      nombre: d.nombre_personalizado ?? "Sin nombre",
                      articulo_nombre: undefined,
                    };
                  } else {
                    return {
                      detalle_id: d.detalle_id,
                      venta_id: d.venta_id,
                      cantidad: d.cantidad,
                      precio_unitario: d.precio_unitario,
                      tipo: "articulo",
                      articulo_nombre: d.articulo_nombre,
                      nombre: undefined,
                    };
                  }
                });
                setDetallesVentas(prev => [...prev, ...detallesConVentaId]);
              }
            })
            .catch(err => {
              console.error(err);
              Alert.alert("Error", "No se pudieron cargar los detalles de ventas.");
            });
        });
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "No se pudieron cargar las ventas.");
      });

    // Cargar productos
    fetch("https://gyg-production.up.railway.app/api/articulos")
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "No se pudieron cargar los productos.");
      });
  }, [refreshFlag]);

  // Filtrar ventas por fecha
  const ventasFiltradas = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha);
    return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
  });

  const ventasFiltradasIds = ventasFiltradas.map(v => v.id);

  // Detalles filtrados y normalizados
  const detallesFiltrados = detallesVentas
    .filter(d => d.venta_id && ventasFiltradasIds.includes(d.venta_id))
    .map(d => ({
      ...d,
      displayNombre: d.tipo === "personalizado" ? d.nombre ?? "Sin nombre" : d.articulo_nombre,
      displayCantidad: d.cantidad,
      displayPrecio: d.precio_unitario,
      subtotal: d.cantidad * d.precio_unitario,
      esPersonalizado: d.tipo === "personalizado"
    }));

    const detallesPorVenta = ventasFiltradas.map(venta => {
      const detalles = detallesFiltrados.filter(d => d.venta_id === venta.id);
      const totalVenta = detalles.reduce((sum, d) => sum + d.subtotal, 0);
      return { venta, detalles, totalVenta };
    });
    const totalesPorVenta: Record<number, number> = {};
    detallesFiltrados.forEach(d => {
      if (d.venta_id) {
        if (!totalesPorVenta[d.venta_id]) totalesPorVenta[d.venta_id] = 0;
        totalesPorVenta[d.venta_id] += d.subtotal;
      }
    });
  // Productos más vendidos
  const productosVendidos = detallesFiltrados
    .reduce((acc: any[], item) => {
      const idx = acc.findIndex(p => p.displayNombre === item.displayNombre);
      if (idx >= 0) {
        acc[idx].cantidadVendida += item.displayCantidad;
      } else {
        acc.push({
          id: item.esPersonalizado ? `p-${item.detalle_id}` : item.detalle_id,
          displayNombre: item.displayNombre,
          cantidadVendida: item.displayCantidad,
          esPersonalizado: item.esPersonalizado
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.cantidadVendida - a.cantidadVendida);

  const handleManualRefresh = () => setRefreshFlag(f => f + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes de Ventas</Text>
      <Button title="Actualizar" onPress={handleManualRefresh} />

      <View style={styles.datePickerContainer}>
        <Button title="Seleccionar Fecha de Inicio" onPress={() => setShowInicioPicker(true)} />
        {showInicioPicker && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowInicioPicker(false);
              if (date) setFechaInicio(date);
            }}
          />
        )}
        <Button title="Seleccionar Fecha de Fin" onPress={() => setShowFinPicker(true)} />
        {showFinPicker && (
          <DateTimePicker
            value={fechaFin}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowFinPicker(false);
              if (date) setFechaFin(date);
            }}
          />
        )}
      </View>

      {/* Productos más vendidos */}
      <Text style={styles.subtitle}>Productos Más Vendidos</Text>
      <FlatList
        data={productosVendidos}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text>No hay productos vendidos en este rango.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.esPersonalizado ? "Personalizado" : "Artículo"}: {item.displayNombre}</Text>
            <Text>Cantidad Vendida: {item.cantidadVendida}</Text>
          </View>
        )}
      />

      {/* Detalles de ventas */}
      <Text style={styles.subtitle}>Detalles de Ventas</Text>
      <FlatList
        data={detallesPorVenta}
        keyExtractor={(item) => item.venta.id.toString()}
        ListEmptyComponent={<Text>No hay detalles de ventas en este rango.</Text>}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Venta: {item.venta.id} - Fecha: {new Date(item.venta.fecha).toLocaleString()}
            </Text>
            {item.detalles.map(d => (
              <View key={d.detalle_id} style={styles.item}>
                <Text>{d.esPersonalizado ? `Personalizado: ${d.displayNombre}` : `Producto: ${d.displayNombre}`}</Text>
                <Text>Cantidad: {d.displayCantidad}</Text>
                <Text>Precio unitario: ${d.displayPrecio}</Text>
                <Text>Subtotal: ${d.subtotal}</Text>
              </View>
            ))}
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>Total venta: ${item.totalVenta}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: '#f9f9f9'
  },
});
            