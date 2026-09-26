import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";

export default function CheckoutScreen() {
  const { items, promoCode, discountPercent, clearCart } = useCart();

  const { addOrder } = useOrders();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway">(
    "Takeaway",
  );

  const [tableNumber, setTableNumber] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [items]);

  const serviceCharge = useMemo(() => {
    return subtotal * 0.05;
  }, [subtotal]);

  const tax = useMemo(() => {
    return subtotal * 0.15;
  }, [subtotal]);

  const discount = useMemo(() => {
    return subtotal * (discountPercent / 100);
  }, [subtotal, discountPercent]);

  const total = useMemo(() => {
    return subtotal + serviceCharge + tax - discount;
  }, [subtotal, serviceCharge, tax, discount]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const placeOrder = () => {
    if (items.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add food items before placing an order.",
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Missing Information", "Please enter your phone number.");
      return;
    }

    if (orderType === "Dine-in" && !tableNumber.trim()) {
      Alert.alert("Table Required", "Please enter your table number.");
      return;
    }

    if (orderType === "Takeaway" && !pickupTime.trim()) {
      Alert.alert("Pickup Time Required", "Please enter your pickup time.");
      return;
    }

    const orderId = addOrder({
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        note: item.note,
      })),
      total,
      type: orderType,
      ...(orderType === "Dine-in" ? { tableNumber } : { pickupTime }),
    });

    clearCart();

    router.replace({
      pathname: "/confirmation",
      params: {
        orderId,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <Text style={styles.subtitle}>
        {totalItems} item{totalItems !== 1 ? "s" : ""} in your order
      </Text>

      <Text style={styles.sectionTitle}>Customer Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.sectionTitle}>Order Type</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            orderType === "Takeaway" && styles.selectedType,
          ]}
          onPress={() => setOrderType("Takeaway")}
        >
          <Text
            style={[
              styles.typeText,
              orderType === "Takeaway" && styles.selectedTypeText,
            ]}
          >
            🥡 Takeaway
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            orderType === "Dine-in" && styles.selectedType,
          ]}
          onPress={() => setOrderType("Dine-in")}
        >
          <Text
            style={[
              styles.typeText,
              orderType === "Dine-in" && styles.selectedTypeText,
            ]}
          >
            🍽️ Dine-in
          </Text>
        </TouchableOpacity>
      </View>

      {orderType === "Dine-in" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Table Number"
            keyboardType="number-pad"
            value={tableNumber}
            onChangeText={setTableNumber}
          />
        </>
      )}

      {orderType === "Takeaway" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Pickup Time (e.g. 6:30 PM)"
            value={pickupTime}
            onChangeText={setPickupTime}
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Order Summary</Text>

      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.itemName}>
            {item.name} × {item.quantity}
          </Text>

          <Text style={styles.itemPrice}>
            Rs. {(Number(item.price) * item.quantity).toFixed(0)}
          </Text>
        </View>
      ))}

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>Rs. {subtotal.toFixed(0)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text>Service (5%)</Text>
          <Text>Rs. {serviceCharge.toFixed(0)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text>Tax (15%)</Text>
          <Text>Rs. {tax.toFixed(0)}</Text>
        </View>

        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text>Discount ({discountPercent}%)</Text>
            <Text>- Rs. {discount.toFixed(0)}</Text>
          </View>
        )}

        {promoCode && <Text style={styles.promoText}>Promo: {promoCode}</Text>}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>

          <Text style={styles.total}>Rs. {total.toFixed(0)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.placeButton} onPress={placeOrder}>
        <Text style={styles.placeButtonText}>Place Order</Text>
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

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
  },

  subtitle: {
    color: "#777",
    marginTop: 4,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 15,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 10,
    color: "#333",
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
  },

  typeButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  selectedType: {
    backgroundColor: "#E85D04",
    borderColor: "#E85D04",
  },

  typeText: {
    color: "#555",
    fontWeight: "600",
  },

  selectedTypeText: {
    color: "#FFFFFF",
  },

  itemRow: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemName: {
    color: "#333",
    flex: 1,
  },

  itemPrice: {
    color: "#E85D04",
    fontWeight: "bold",
  },

  summary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginTop: 8,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    color: "#555",
  },

  promoText: {
    color: "#16803C",
    fontSize: 12,
    marginBottom: 8,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },

  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E85D04",
  },

  placeButton: {
    backgroundColor: "#E85D04",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 18,
  },

  placeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
