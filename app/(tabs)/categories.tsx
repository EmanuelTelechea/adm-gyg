import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";

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
      <Text style={styles.headerTitle}>Categorías</Text>

      {/* Tarjeta del formulario */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>
          {editingId !== null ? "Editar categoría" : "Agregar nueva categoría"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre de la categoría"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#8a7a64"
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdate}>
          <Text style={styles.addButtonText}>
            {editingId !== null ? "Actualizar" : "Agregar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de categorías */}
      <Text style={styles.sectionTitle}>Listado de categorías</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
            </View>
            <View style={styles.cardButtons}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f3ed",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#3b2f2f",
    textAlign: "center",
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b3d2f",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fffaf3",
    borderColor: "#d2b48c",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#3b2f2f",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#a07d4b",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "column",
  },
  cardTitle: {
    fontSize: 17,
    color: "#3b2f2f",
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#8a7a64",
    marginTop: 4,
  },
  cardButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#c8a46b",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#b35d4f",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
});
