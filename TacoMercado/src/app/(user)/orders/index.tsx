import { FlatList } from "react-native";
import orders from "@assets/data/orders";
import OrderListItem from "@components/OrdersListItem";
import { Stack } from "expo-router";

export default function OrdersScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Orders" }} />
      <FlatList
        data={orders}
        renderItem={({ item }) => <OrderListItem order={item} />}
        numColumns={1}
        contentContainerStyle={{ gap: 10, padding: 10 }}
      />
    </>
  );
}
