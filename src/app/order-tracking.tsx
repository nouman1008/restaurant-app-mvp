import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useOrders } from "../context/OrdersContext";

const STATUS_STEPS = [
  "Pending",
  "Preparing",
  "Ready",
  "Served",
] as const;

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{
    orderId: string;
  }>();

  const { orders, updateStatus } = useOrders();

  const order = orders.find((item) => item.id === orderId);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!order || order.status === "Cancelled") {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - new Date(order.timestamp).getTime()) / 1000,
      );

      setElapsedSeconds(Math.max(0, elapsed));

      let nextStatus: (typeof STATUS_STEPS)[number] = "Pending";

      if (elapsed >= 30) {
        nextStatus = "Served";
      } else if (elapsed >= 20) {
        nextStatus = "Ready";
      } else if (elapsed >= 10) {
        nextStatus = "Preparing";
      }

      if (STATUS_STEPS.includes(nextStatus) && order.status !== nextStatus) {
        updateStatus(order.id, nextStatus);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [order, updateStatus]);

  const currentStep = useMemo(() => {
    if (!order) {
      return 0;
    }

    if (order.status === "Cancelled") {
      return -1;
    }

    return STATUS_STEPS.indexOf(order.status);
  }, [order]);

  const progress = useMemo(() => {
    if (!order) {
      return 0;
    }

    if (order.status === "Cancelled") {
      return 0;
    }

    if (order.status === "Served") {
      return 100;
    }

    return Math.min(100, Math.round((elapsedSeconds / 30) * 100));
  }, [order, elapsedSeconds]);

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Order Not Found</Text>

        <Text style={styles.errorText}>This order could not be found.</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Tracking</Text>

      <Text style={styles.orderId}>{order.id}</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>

        <Text style={styles.status}>{order.status}</Text>

        {order.status !== "Cancelled" && (
          <>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <Text style={styles.elapsed}>{elapsedSeconds} seconds elapsed</Text>
          </>
        )}
      </View>

      {order.status === "Cancelled" ? (
        <View style={styles.cancelledCard}>
          <Text style={styles.cancelledIcon}>❌</Text>

          <Text style={styles.cancelledTitle}>Order Cancelled</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {STATUS_STEPS.map((status, index) => {
            const completed = index <= currentStep;

            const active = index === currentStep;

            return (
              <View key={status} style={styles.timelineRow}>
                <View
                  style={[styles.circle, completed && styles.completedCircle]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      completed && styles.completedCircleText,
                    ]}
                  >
                    {completed ? "✓" : index + 1}
                  </Text>
                </View>

                <View style={styles.timelineInfo}>
                  <Text
                    style={[
                      styles.timelineStatus,
                      completed && styles.completedText,
                    ]}
                  >
                    {status}
                  </Text>

                  {active && (
                    <Text style={styles.activeText}>Current status</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.orderCard}>
        <Text style={styles.sectionTitle}>Order Details</Text>

        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.name} × {item.quantity}
            </Text>

            <Text style={styles.itemPrice}>
              Rs. {(Number(item.price) * item.quantity).toFixed(0)}
            </Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>

          <Text style={styles.total}>Rs. {Number(order.total).toFixed(0)}</Text>
        </View>

        <Text style={styles.typeText}>
          {order.type === "Dine-in"
            ? `🍽️ Dine-in • Table ${order.tableNumber}`
            : `🥡 Takeaway • Pickup ${order.pickupTime}`}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#F7F7F7",
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },

  errorText: {
    color: "#777",
    marginTop: 8,
    marginBottom: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#222",
  },

  orderId: {
    color: "#E85D04",
    fontWeight: "bold",
    marginTop: 4,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 18,
  },

  statusLabel: {
    color: "#777",
    fontSize: 13,
  },

  status: {
    color: "#E85D04",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 5,
  },

  progressBackground: {
    height: 9,
    backgroundColor: "#EEEEEE",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 18,
  },

  progressFill: {
    height: 9,
    backgroundColor: "#E85D04",
    borderRadius: 5,
  },

  elapsed: {
    color: "#888",
    fontSize: 12,
    marginTop: 8,
  },

  timeline: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 15,
  },

  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  circle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },

  completedCircle: {
    backgroundColor: "#E85D04",
    borderColor: "#E85D04",
  },

  circleText: {
    color: "#888",
    fontWeight: "bold",
  },

  completedCircleText: {
    color: "#FFFFFF",
  },

  timelineInfo: {
    marginLeft: 12,
  },

  timelineStatus: {
    color: "#888",
    fontSize: 15,
    fontWeight: "600",
  },

  completedText: {
    color: "#222",
  },

  activeText: {
    color: "#E85D04",
    fontSize: 11,
    marginTop: 2,
  },

  cancelledCard: {
    backgroundColor: "#FFE5E5",
    borderRadius: 16,
    padding: 25,
    marginTop: 15,
    alignItems: "center",
  },

  cancelledIcon: {
    fontSize: 40,
  },

  cancelledTitle: {
    color: "#B00000",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 8,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  itemName: {
    color: "#555",
    flex: 1,
  },

  itemPrice: {
    color: "#E85D04",
    fontWeight: "bold",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: "bold",
  },

  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E85D04",
  },

  typeText: {
    color: "#666",
    marginTop: 12,
    fontSize: 12,
  },

  button: {
    backgroundColor: "#E85D04",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 22,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  homeButton: {
    backgroundColor: "#E85D04",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },

  homeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});
