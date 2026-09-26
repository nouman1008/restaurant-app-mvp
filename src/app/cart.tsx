import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";

export default function CartScreen() {
  const router = useRouter();

  const {
    items,
    promoCode,
    discountPercent,
    promoError,
    increase,
    decrease,
    remove,
    updateNote,
    clearCart,
    applyPromo,
    removePromo,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const discount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const deliveryFee = subtotal > 0 ? 0 : 0;

  const total = subtotal - discount + deliveryFee;

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: clearCart,
      },
    ]);
  };

  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
      return;
    }

    applyPromo(promoInput);
    setPromoInput("");
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>

        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>

        <Text style={styles.emptyText}>
          Add some delicious food to your cart.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/menu")}
        >
          <Text style={styles.primaryButtonText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.subtitle}>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemTop}>
            <Text style={styles.emoji}>{item.emoji}</Text>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>

              <Text style={styles.itemPrice}>Rs. {item.price}</Text>
            </View>

            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity</Text>

            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => decrease(item.id)}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.quantity}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => increase(item.id)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTotal}>
              Rs. {item.price * item.quantity}
            </Text>
          </View>

          <Text style={styles.noteLabel}>Special Note</Text>

          <TextInput
            style={styles.noteInput}
            placeholder="e.g. Less spicy, no onions..."
            value={item.note}
            onChangeText={(text) => updateNote(item.id, text)}
          />
        </View>
      ))}

      <View style={styles.promoCard}>
        <Text style={styles.sectionTitle}>Promo Code</Text>

        <View style={styles.promoRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code"
            value={promoInput}
            onChangeText={setPromoInput}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyPromo}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {promoError ? <Text style={styles.errorText}>{promoError}</Text> : null}

        {promoCode ? (
          <View style={styles.appliedPromo}>
            <Text style={styles.successText}>
              {promoCode} applied ({discountPercent}% off)
            </Text>

            <TouchableOpacity onPress={removePromo}>
              <Text style={styles.removePromoText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(0)}</Text>
        </View>

        {discount > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.discountLabel}>Discount</Text>
            <Text style={styles.discountValue}>
              - Rs. {discount.toFixed(0)}
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.freeText}>FREE</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs. {total.toFixed(0)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => router.push("/checkout")}
      >
        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => router.push("/menu")}
      >
        <Text style={styles.continueText}>← Continue Shopping</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F7F7F7",
  },

  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    color: "#777",
    marginBottom: 25,
    textAlign: "center",
  },

  primaryButton: {
    backgroundColor: "#E85D04",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
  },

  primaryButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
  },

  subtitle: {
    color: "#777",
    marginTop: 3,
  },

  clearText: {
    color: "#D62828",
    fontWeight: "600",
  },

  itemCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  itemTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  emoji: {
    fontSize: 40,
    marginRight: 12,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },

  itemPrice: {
    color: "#E85D04",
    fontWeight: "600",
    marginTop: 4,
  },

  removeText: {
    color: "#D62828",
    fontSize: 12,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  quantityLabel: {
    flex: 1,
    color: "#777",
  },

  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },

  quantityButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#E85D04",
    justifyContent: "center",
    alignItems: "center",
  },

  quantityButtonText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },

  quantity: {
    width: 35,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  itemTotal: {
    width: 80,
    textAlign: "right",
    fontWeight: "700",
    color: "#333",
  },

  noteLabel: {
    marginTop: 14,
    marginBottom: 6,
    color: "#555",
    fontWeight: "600",
  },

  noteInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#FAFAFA",
  },

  promoCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  promoRow: {
    flexDirection: "row",
    gap: 8,
  },

  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },

  applyButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: "center",
  },

  applyButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },

  errorText: {
    color: "#D62828",
    marginTop: 8,
  },

  appliedPromo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  successText: {
    color: "#198754",
    fontWeight: "600",
  },

  removePromoText: {
    color: "#D62828",
    fontWeight: "600",
  },

  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },

  summaryLabel: {
    color: "#666",
  },

  summaryValue: {
    color: "#333",
    fontWeight: "600",
  },

  discountLabel: {
    color: "#198754",
  },

  discountValue: {
    color: "#198754",
    fontWeight: "700",
  },

  freeText: {
    color: "#198754",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#E85D04",
  },

  checkoutButton: {
    backgroundColor: "#E85D04",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  checkoutText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },

  continueButton: {
    alignItems: "center",
    paddingVertical: 16,
  },

  continueText: {
    color: "#E85D04",
    fontWeight: "700",
  },
});
