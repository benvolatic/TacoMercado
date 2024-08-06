import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import products from "@assets/data/products";
import { defaultTacoImage } from "@components/ProductListItem";

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { addItem } = useCart();

  const router = useRouter();

  const product = products.find((p) => p.id.toString() === id);

  if (!product) {
    return <Text>Product Not Found</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product?.name }} />

      <Image
        source={{ uri: product.image || defaultTacoImage }}
        style={styles.image}
      />
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  title: {
    fontSize: 20,
  },

  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProductDetailsScreen;
