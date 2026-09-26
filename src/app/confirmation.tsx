import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function ConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{
    orderId: string;
  }>();

  return (
    <View style={styles.container}>
      <Text style={styles.successIcon}>✅</Text>

      <Text style={styles.title}>Order Confirmed!</Text>

      <Text style={styles.subtitle}>
        Your order has been placed successfully.
      </Text>

      {orderId && (
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>Order ID</Text>

          <Text style={styles.orderId}>{orderId}</Text>

          <Text style={styles.status}>Status: Pending</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.trackButton}
        onPress={() =>
          router.replace({
            pathname: "/order-tracking",
            params: {
              orderId: String(orderId || ""),
            },
          })
        }
      >
        <Text style={styles.trackButtonText}>📦 Track My Order</Text>
      </TouchableOpacity>

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
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  successIcon: {
    fontSize: 65,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginTop: 15,
  },

  subtitle: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
  },

  orderCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginTop: 25,
  },

  orderLabel: {
    color: "#888",
    fontSize: 13,
  },

  orderId: {
    color: "#E85D04",
    fontSize: 21,
    fontWeight: "bold",
    marginTop: 5,
  },

  status: {
    color: "#E85D04",
    fontWeight: "bold",
    marginTop: 8,
  },

  trackButton: {
    width: "100%",
    backgroundColor: "#E85D04",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 25,
  },

  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  homeButton: {
    width: "100%",
    backgroundColor: "#333333",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
  },

  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
