import { FlatList, Text, ActivityIndicator } from "react-native";
import OrderListItem from "@components/OrdersListItem";
import { useAdminOrderList } from "src/api/orders";

export default function OrdersScreen() {
  const {
    data: orders,
    isLoading,
    error,
  } = useAdminOrderList({ archived: true });

  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (error) {
    return <Text>Failed to Fetch</Text>;
  }
  return (
    <FlatList
      data={orders}
      inverted={true}
      renderItem={({ item }) => <OrderListItem order={item} />}
      contentContainerStyle={{ gap: 10, padding: 10 }}
    />
  );
}
