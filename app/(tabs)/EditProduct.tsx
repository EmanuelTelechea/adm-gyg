import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";

interface Categoria {
  id: number;
  nombre: string;
}

interface Articulo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  medidas: string;
  en_oferta: number;
  destacado: number;
  categoria_id: number;
  imagenes: string[];
}

export default function EditProductScreen() {
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
  const route = useRoute();
  const { item } = route.params as { item: Articulo };

  useEffect(() => {
    fetch("https://gyg-production.up.railway.app/api/categorias")
      .then((response) => response.json())
      .then((data) => setCategorias(data))
      .catch((error) => console.error(error));

    if (item) {
      setNombre(item.nombre);
      setDescripcion(item.descripcion);
      setPrecio(item.precio.toString());
      setStock(item.stock.toString());
      setMedidas(item.medidas);
      setEnOferta(item.en_oferta === 1);
      setDestacado(item.destacado === 1);
      setCategoriaId(item.categoria_id);
      setImagenes(item.imagenes);
    }
  }, [item]);

  const handleEditProduct = () => {
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

    fetch(`https://gyg-production.up.railway.app/api/articulos/${item.id}`, {
      method: "PUT",
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
        <Text style={styles.title}>Editar Producto</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={styles.label}>Precio</Text>
        <TextInput
          style={styles.input}
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Stock</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Medidas</Text>
        <TextInput style={styles.input} value={medidas} onChangeText={setMedidas} />

        <View style={styles.switchContainer}>
          <Text style={styles.label}>En oferta</Text>
          <Switch
            value={enOferta}
            onValueChange={setEnOferta}
            trackColor={{ false: "#ccc", true: "#a07d4b" }}
            thumbColor={enOferta ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Destacado</Text>
          <Switch
            value={destacado}
            onValueChange={setDestacado}
            trackColor={{ false: "#ccc", true: "#a07d4b" }}
            thumbColor={destacado ? "#fff" : "#f4f3f4"}
          />
        </View>

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoriaId}
            onValueChange={(itemValue) => setCategoriaId(itemValue)}
          >
            {categorias.map((cat) => (
              <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>📷 Seleccionar Imagen</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {imagenes.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleEditProduct}>
          <Text style={styles.saveButtonText}>💾 Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#faf7f2",
    paddingBottom: 40, // 🔹 agrega espacio para el botón al final
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3b2f2f",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#4a3c2b",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  imageButton: {
    backgroundColor: "#a07d4b",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // 🔹 para Android
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: "#7a531c", // 🔹 más oscuro para mejor contraste
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4, // 🔹 sombra visible en Android
    marginBottom: 30, // 🔹 margen inferior visible
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    textTransform: "uppercase",
  },
});

