import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Button } from "react-native";

interface Categoria {
  id: number;
  nombre: string;
}

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://gyg-production.up.railway.app/api/categorias")
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Mensaje de depuración
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
          console.error("La respuesta no es un array:", data);
        }
      })
      .catch((error) => {
        setCategories([]);
        console.error("Error al cargar categorías:", error);
      });
  }, []);

  const handleAddOrUpdate = () => {
    const categoria = { nombre };
    if (editingId !== null) {
      // Update existing category
      fetch(`https://gyg-production.up.railway.app/api/categorias/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoria),
      })
        .then((response) => response.json())
        .then((updatedCategoria) => {
          setCategories((prev) =>
            prev.map((item) => (item.id === editingId ? updatedCategoria : item))
          );
          setEditingId(null);
          setNombre("");
        })
        .catch((error) => console.error(error));
    } else {
      // Add new category
      fetch("https://gyg-production.up.railway.app/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoria),
      })
        .then((response) => response.json())
        .then((newCategoria) => {
          setCategories((prev) => [...prev, newCategoria]);
          setNombre("");
        })
        .catch((error) => console.error(error));
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setNombre(categoria.nombre);
    setEditingId(categoria.id);
  };

  const handleDelete = (id: number) => {
    fetch(`https://gyg-production.up.railway.app/api/categorias/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setCategories((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((error) => console.error(error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página de Categorías</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <Button title={editingId !== null ? "Actualizar" : "Agregar"} onPress={handleAddOrUpdate} color="#a07d4b" />
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nombre}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Editar" onPress={() => handleEdit(item)} color="#a07d4b" />
              <Button title="Eliminar" onPress={() => handleDelete(item.id)} color="#a07d4b" />
            </View>
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
