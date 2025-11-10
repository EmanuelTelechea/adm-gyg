import { Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type RootStackParamList = {
  products: undefined;
  categories: undefined;
  AddProduct: undefined;
  RegisterSale: undefined;
  ReportsScreen: undefined;
  CustomProducts: undefined; // <-- Agrega esta línea
};

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('@/assets/images/back2.jpg')}
        style={styles.reactLogo}
      />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bienvenido a la app de gestión de G&G</ThemedText>
      </ThemedView>
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('products')}>
          <ThemedText style={styles.buttonText}>Ver Productos</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('categories')}>
          <ThemedText style={styles.buttonText}>Ver Categorías</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddProduct')}>
          <ThemedText style={styles.buttonText}>Agregar Producto</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegisterSale')}>
          <ThemedText style={styles.buttonText}>Vender Producto</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ReportsScreen')}>
          <ThemedText style={styles.buttonText}>Ver Reportes</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CustomProducts')}>
          <ThemedText style={styles.buttonText}>Ver Artículos Personalizados</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
  },
  reactLogo: {
    height: 178,
    width: 290,
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#a07d4b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export { default as CustomProducts } from './CustomProducts';
