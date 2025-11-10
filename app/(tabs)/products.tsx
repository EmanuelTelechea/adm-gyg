import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // Usa la URL correcta para productos
    const apiUrl = "https://gyg-production.up.railway.app/api/articulos";
    fetch(apiUrl)
      .then(async (response) => {
        // Si el proxy responde con texto plano, muestra advertencia
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          console.log("Respuesta de la API:", data);
          if (Array.isArray(data)) {
            setArticulos(data);
            setError(null);
          } else {
            setArticulos([]);
            setError("No se encontraron productos o la respuesta no es válida.");
          }
        } catch (e) {
          setArticulos([]);
          if (text.startsWith("See")) {
            setError("Debes habilitar el proxy CORS Anywhere en https://cors-anywhere.herokuapp.com/corsdemo antes de usarlo.");
          } else {
            setError("La respuesta de la API no es JSON válido.");
          }
        }
      })
      .catch((error) => {
        setArticulos([]);
        if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
          setError("No se pudo conectar con el servidor. Es posible que la API no permita solicitudes desde el navegador web (CORS). Prueba en un dispositivo móvil o usa un proxy.");
        } else {
          setError("Error al cargar productos.");
        }
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: number) => {
    // Usa la URL correcta para productos
    fetch(`https://gyg-production.up.railway.app/api/articulos/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setArticulos((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((error) => console.error(error));
  };

  const handleEdit = (item: Articulo) => {
    navigation.navigate('EditProduct', { item });
  };

  const handleRegisterSale = (item: Articulo) => {
    navigation.navigate('RegisterSale', { item });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Cargando productos...</Text>
      ) : error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              <Text style={styles.title}>Página de Productos</Text>
              <Button title="Agregar Producto" onPress={() => navigation.navigate('AddProduct')} color="#a07d4b"/>
            </>
          }
          data={Array.isArray(articulos) ? articulos.filter(item => item.id !== undefined) : []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemTextContainer}>
                <Text>{item.nombre}</Text>
                <Text>Precio: ${item.precio}</Text>
                <Text>Cantidad en stock: {item.stock}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <Button title="Editar" onPress={() => handleEdit(item)} color="#a07d4b" />
                <Button title="Eliminar" onPress={() => handleDelete(item.id)} color="#a07d4b" />
                <Button title="Registrar Venta" onPress={() => handleRegisterSale(item)} color="#a07d4b" />
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTextContainer: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  listContent: {
    paddingBottom: 16,
  },
});
