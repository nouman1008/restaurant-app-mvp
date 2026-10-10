import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useOrders } from "../context/OrdersContext";
import { useReservations } from "../context/ReservationContext";

export default function ManagerScreen() {
  const router = useRouter();

  const { orders, updateStatus, refreshOrders } = useOrders();

  const { reservations, updateReservationStatus, refreshReservations } =
    useReservations();

  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const [updatingReservation, setUpdatingReservation] = useState<string | null>(
    null,
  );

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [orders],
  );

  const sortedReservations = useMemo(
    () =>
      [...reservations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [reservations],
  );

  const handleOrderStatus = async (
    id: string,
    status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled",
  ) => {
    try {
      setUpdatingOrder(id);

      await updateStatus(id, status);

      Alert.alert("Order Updated", `Order status changed to ${status}.`);
    } catch (error: any) {
      Alert.alert("Update Failed", error?.message || "Unable to update order.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleReservationStatus = async (
    id: string,
    status: "Confirmed" | "Cancelled",
  ) => {
    try {
      setUpdatingReservation(id);

      await updateReservationStatus(id, status);

      Alert.alert(
        "Reservation Updated",
        `Reservation status changed to ${status}.`,
      );
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error?.message || "Unable to update reservation.",
      );
    } finally {
      setUpdatingReservation(null);
    }
  };

  const refreshAll = async () => {
    try {
      await Promise.all([refreshOrders(), refreshReservations()]);

      Alert.alert("Updated", "Orders and reservations refreshed.");
    } catch (error: any) {
      Alert.alert(
        "Refresh Failed",
        error?.message || "Unable to refresh data.",
      );
    }
  };

  const getNextOrderStatus = (
    status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled",
  ) => {
    switch (status) {
      case "Pending":
        return "Preparing";

      case "Preparing":
        return "Ready";

      case "Ready":
        return "Served";

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Manager Dashboard</Text>

          <Text style={styles.subtitle}>Manage orders and reservations.</Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={refreshAll}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{orders.length}</Text>

          <Text style={styles.summaryLabel}>Orders</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reservations.length}</Text>

          <Text style={styles.summaryLabel}>Reservations</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Orders</Text>

      {sortedOrders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No orders found.</Text>
        </View>
      ) : (
        sortedOrders.map((order) => {
          const nextStatus = getNextOrderStatus(order.status);

          const isUpdating = updatingOrder === order.id;

          return (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>
                    Order #{order.id.slice(-8)}
                  </Text>

                  <Text style={styles.smallText}>
                    {order.type}
                    {order.tableNumber ? ` • Table ${order.tableNumber}` : ""}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.itemsContainer}>
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
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>

                <Text style={styles.totalValue}>
                  Rs. {order.total.toFixed(2)}
                </Text>
              </View>

              {nextStatus && (
                <Pressable
                  style={[
                    styles.primaryButton,
                    isUpdating && styles.buttonDisabled,
                  ]}
                  disabled={isUpdating}
                  onPress={() => handleOrderStatus(order.id, nextStatus)}
                >
                  <Text style={styles.primaryButtonText}>
                    {isUpdating ? "Updating..." : `Mark ${nextStatus}`}
                  </Text>
                </Pressable>
              )}

              {order.status !== "Served" && order.status !== "Cancelled" && (
                <Pressable
                  style={[
                    styles.cancelButton,
                    isUpdating && styles.buttonDisabled,
                  ]}
                  disabled={isUpdating}
                  onPress={() => handleOrderStatus(order.id, "Cancelled")}
                >
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </Pressable>
              )}
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Reservations</Text>

      {sortedReservations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No reservations found.</Text>
        </View>
      ) : (
        sortedReservations.map((reservation) => {
          const isUpdating = updatingReservation === reservation.id;

          return (
            <View key={reservation.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>
                    Reservation #{reservation.id.slice(-8)}
                  </Text>

                  <Text style={styles.smallText}>{reservation.name}</Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{reservation.status}</Text>
                </View>
              </View>

              <Text style={styles.detail}>Phone: {reservation.phone}</Text>

              <Text style={styles.detail}>Date: {reservation.date}</Text>

              <Text style={styles.detail}>Time: {reservation.time}</Text>

              <Text style={styles.detail}>Guests: {reservation.partySize}</Text>

              {reservation.tableNumber !== undefined && (
                <Text style={styles.detail}>
                  Table: {reservation.tableNumber}
                </Text>
              )}

              {reservation.status === "Pending" && (
                <View style={styles.buttonRow}>
                  <Pressable
                    style={[
                      styles.confirmButton,
                      isUpdating && styles.buttonDisabled,
                    ]}
                    disabled={isUpdating}
                    onPress={() =>
                      handleReservationStatus(reservation.id, "Confirmed")
                    }
                  >
                    <Text style={styles.confirmButtonText}>
                      {isUpdating ? "Updating..." : "Confirm"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.cancelButton,
                      isUpdating && styles.buttonDisabled,
                    ]}
                    disabled={isUpdating}
                    onPress={() =>
                      handleReservationStatus(reservation.id, "Cancelled")
                    }
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={styles.autoRefreshBox}>
        <Text style={styles.autoRefreshText}>
          Orders and reservations automatically refresh every 10 seconds.
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
    paddingBottom: 50,
  },

  back: {
    fontSize: 16,
    color: "#333",
    marginBottom: 18,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },

  refreshButton: {
    backgroundColor: "#111",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  refreshButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  summaryNumber: {
    fontSize: 24,
    fontWeight: "700",
  },

  summaryLabel: {
    color: "#777",
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },

  emptyText: {
    color: "#777",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 13,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  smallText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  itemName: {
    flex: 1,
    fontSize: 14,
    color: "#444",
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 15,
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: "#111",
    borderRadius: 9,
    paddingVertical: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  confirmButton: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: "center",
  },

  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelButton: {
    marginTop: 9,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#555",
    fontWeight: "700",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  detail: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },

  autoRefreshBox: {
    marginTop: 15,
    padding: 14,
    alignItems: "center",
  },

  autoRefreshText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});
