import { ActivityIndicator, FlatList, Text } from "react-native";
import OrderListItem from "@components/OrdersListItem";
import { useAdminOrderList } from "src/api/orders";
import { useInsertOrderSubscription } from "src/api/orders/subscriptions";

export default function OrdersScreen() {
  const {
    data: orders,
    isLoading,
    error,
  } = useAdminOrderList({ archived: false });

  useInsertOrderSubscription();

  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (error) {
    return <Text>Failed to Fetch</Text>;
  }

  return (
    <>
      <FlatList
        data={orders}
        renderItem={({ item }) => <OrderListItem order={item} />}
        inverted={true}
        contentContainerStyle={{ gap: 10, padding: 10 }}
      />
    </>
  );
}
