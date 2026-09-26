import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../context/CartContext";

export default function FoodDetailsScreen() {
  const { name, price, emoji, category } = useLocalSearchParams();
  const { addToCart } = useCart();

  const food = {
    name: String(name),
    price: Number(price),
    emoji: String(emoji),
    category: String(category),
  };

  const addFood = () => {
    addToCart(food);
    alert("Added to cart!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{food.emoji}</Text>

      <Text style={styles.name}>{food.name}</Text>

      <Text style={styles.category}>{food.category}</Text>

      <Text style={styles.price}>Rs. {food.price}</Text>

      <Text style={styles.description}>
        Delicious and freshly prepared with quality ingredients. Perfect for
        enjoying a tasty meal.
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={addFood}>
        <Text style={styles.buttonText}>🛒 Add to Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    padding: 25,
  },

  emoji: {
    fontSize: 100,
    marginTop: 70,
  },

  name: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },

  category: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },

  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E85D04",
    marginTop: 15,
  },

  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 30,
  },

  addButton: {
    backgroundColor: "#E85D04",
    paddingVertical: 15,
    paddingHorizontal: 45,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  backButton: {
    marginTop: 15,
    padding: 12,
  },

  backText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});
