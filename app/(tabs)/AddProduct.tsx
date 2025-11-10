import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

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
  const [enOferta, setEnOferta] = useState("");
  const [destacado, setDestacado] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetch("https://gyg-production.up.railway.app/api/categorias")
      .then((response) => response.json())
      .then((data) => {
        setCategorias(data);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleAddProduct = () => {
    const articulo = {
      nombre,
      descripcion,
      precio: parseFloat(precio) || 0,
      stock: parseInt(stock) || 0,
      medidas,
      en_oferta: parseInt(enOferta) || 0,
      destacado: parseInt(destacado) || 0,
      categoria_id: categoriaId,
      imagenes,
    };

    fetch("https://gyg-production.up.railway.app/api/articulos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articulo),
    })
      .then((response) => response.json())
      .then((newArticulo) => {
        navigation.goBack();
      })
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

      // Crear FormData para la imagen
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
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error en la subida de la imagen");
        }

        const data = await response.json();
        console.log("Imagen subida con éxito:", data.secure_url);
        setImagenes((prev) => [...prev, data.secure_url]); // Guardar URL segura en el estado
      } catch (error) {
        console.error("Error al subir la imagen:", error);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Agregar Producto</Text>
        <Text>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <Text>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <Text>Precio</Text>
        <TextInput
          style={styles.input}
          placeholder="Precio"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
        />
        <Text>Stock</Text>
        <TextInput
          style={styles.input}
          placeholder="Stock"
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
        />
        <Text>Medidas</Text>
        <TextInput
          style={styles.input}
          placeholder="Medidas"
          value={medidas}
          onChangeText={setMedidas}
        />
        <Text>En Oferta</Text>
        <TextInput
          style={styles.input}
          placeholder="En Oferta"
          value={enOferta}
          onChangeText={setEnOferta}
          keyboardType="numeric"
        />
        <Text>Destacado</Text>
        <TextInput
          style={styles.input}
          placeholder="Destacado"
          value={destacado}
          onChangeText={setDestacado}
          keyboardType="numeric"
        />
        <Text>Categoría</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoriaId}
            style={styles.picker}
            onValueChange={(itemValue: number) => setCategoriaId(itemValue)}
          >
            {categorias.map((cat: Categoria) => (
              <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
            ))}
          </Picker>
        </View>
        <Button title="Seleccionar Imagen" onPress={pickImage} color="#a07d4b" />
        <View style={styles.imageContainer}>
          {imagenes.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </View>
        <Button title="Agregar" onPress={handleAddProduct} color="#a07d4b" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
  pickerContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
  },
});
