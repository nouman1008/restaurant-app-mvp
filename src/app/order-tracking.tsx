import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useOrders } from "../context/OrdersContext";

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { orders } = useOrders();

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [orders],
  );

  const getStatusIndex = (status: string) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Preparing":
        return 1;
      case "Ready":
        return 2;
      case "Served":
        return 3;
      case "Cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const renderProgress = (status: string) => {
    if (status === "Cancelled") {
      return (
        <View style={styles.cancelledBox}>
          <Text style={styles.cancelledText}>
            This order has been cancelled.
          </Text>
        </View>
      );
    }

    const currentIndex = getStatusIndex(status);

    const steps = ["Pending", "Preparing", "Ready", "Served"];

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => {
          const completed = index <= currentIndex;

          return (
            <View key={step} style={styles.stepContainer}>
              <View style={[styles.circle, completed && styles.activeCircle]}>
                <Text
                  style={[
                    styles.circleText,
                    completed && styles.activeCircleText,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <Text
                style={[styles.stepText, completed && styles.activeStepText]}
              >
                {step}
              </Text>

              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    index < currentIndex && styles.activeLine,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Order Tracking</Text>

      <Text style={styles.subtitle}>
        Track your orders and their current status.
      </Text>

      {sortedOrders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>

          <Text style={styles.emptyText}>
            Your placed orders will appear here.
          </Text>
        </View>
      ) : (
        sortedOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.orderTitle}>Order</Text>

                <Text style={styles.orderId}>#{order.id.slice(-8)}</Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Type: {order.type}</Text>

              {order.tableNumber && (
                <Text style={styles.infoText}>Table: {order.tableNumber}</Text>
              )}

              <Text style={styles.infoText}>
                Total: Rs. {order.total.toFixed(2)}
              </Text>

              <Text style={styles.infoText}>
                {new Date(order.timestamp).toLocaleString()}
              </Text>
            </View>

            <Text style={styles.itemsTitle}>Items</Text>

            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.name} × {item.quantity}
                </Text>

                <Text style={styles.itemPrice}>
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <Text style={styles.progressTitle}>Order Status</Text>

            {renderProgress(order.status)}
          </View>
        ))
      )}

      <View style={styles.refreshInfo}>
        <ActivityIndicator size="small" />

        <Text style={styles.refreshText}>
          Order status updates automatically.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
    marginBottom: 20,
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },

  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 17,
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  orderId: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  statusBadge: {
    backgroundColor: "#eee",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  infoBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
  },

  infoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },

  itemsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 8,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  itemName: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },

  progressTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 15,
  },

  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  stepContainer: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },

  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  activeCircle: {
    backgroundColor: "#111",
  },

  circleText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "700",
  },

  activeCircleText: {
    color: "#fff",
  },

  stepText: {
    fontSize: 11,
    color: "#999",
    marginTop: 6,
    textAlign: "center",
  },

  activeStepText: {
    color: "#111",
    fontWeight: "700",
  },

  line: {
    position: "absolute",
    top: 14,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: "#ddd",
    zIndex: -1,
  },

  activeLine: {
    backgroundColor: "#111",
  },

  cancelledBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 14,
  },

  cancelledText: {
    color: "#555",
    textAlign: "center",
    fontWeight: "600",
  },

  refreshInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },

  refreshText: {
    fontSize: 12,
    color: "#777",
  },
});
