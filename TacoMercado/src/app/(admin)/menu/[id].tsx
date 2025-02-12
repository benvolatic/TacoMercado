import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import products from "@assets/data/products";
import { defaultTacoImage } from "@components/ProductListItem";
import { Link } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "src/constants/Colors";
import { useCart } from "src/providers/CartProvider";

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
      <Stack.Screen
        options={{
          title: "Menu",
          headerRight: () => (
            <Link href={`/(admin)/menu/create?id=${id}`} asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="pencil"
                    size={25}
                    color={Colors.light.tint}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
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
