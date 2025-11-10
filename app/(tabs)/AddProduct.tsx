import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

interface Categoria {
  id: number;
  nombre: string;
}

export default function AddProductScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [medidas, setMedidas] = useState("");
  const [enOferta, setEnOferta] = useState(false);
  const [destacado, setDestacado] = useState(false);
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetch("https://gyg-production.up.railway.app/api/categorias")
      .then((response) => response.json())
      .then((data) => setCategorias(data))
      .catch((error) => console.error(error));
  }, []);

  const handleAddProduct = () => {
    const articulo = {
      nombre,
      descripcion,
      precio: parseFloat(precio) || 0,
      stock: parseInt(stock) || 0,
      medidas,
      en_oferta: enOferta ? 1 : 0,
      destacado: destacado ? 1 : 0,
      categoria_id: categoriaId,
      imagenes,
    };

    fetch("https://gyg-production.up.railway.app/api/articulos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articulo),
    })
      .then((response) => response.json())
      .then(() => navigation.goBack())
      .catch((error) => console.error(error));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "upload.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("upload_preset", "GyGImagenes");

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dxoktkcmh/image/upload",
          {
            method: "POST",
            body: formData,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (!response.ok) throw new Error("Error al subir la imagen");

        const data = await response.json();
        setImagenes((prev) => [...prev, data.secure_url]);
      } catch (error) {
        console.error("Error al subir la imagen:", error);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Agregar Producto</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Precio"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Stock"
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Medidas"
          value={medidas}
          onChangeText={setMedidas}
        />

        {/* SWITCHES */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>En oferta</Text>
          <Switch
            value={enOferta}
            onValueChange={setEnOferta}
            trackColor={{ false: "#ccc", true: "#d3b17d" }}
            thumbColor={enOferta ? "#a07d4b" : "#f4f3f4"}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Destacado</Text>
          <Switch
            value={destacado}
            onValueChange={setDestacado}
            trackColor={{ false: "#ccc", true: "#d3b17d" }}
            thumbColor={destacado ? "#a07d4b" : "#f4f3f4"}
          />
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoriaId}
            style={styles.picker}
            onValueChange={(itemValue: number) => setCategoriaId(itemValue)}
          >
            <Picker.Item label="Seleccionar categoría..." value={undefined} />
            {categorias.map((cat: Categoria) => (
              <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>📸 Seleccionar Imagen</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {imagenes.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleAddProduct}>
          <Text style={styles.submitText}>Agregar Producto</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F8F4EE",
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5a3e1b",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  imageButton: {
    backgroundColor: "#d3b17d",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#a07d4b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
