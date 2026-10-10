import React from "react";

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../../context/CartContext";

export default function FoodDetailsScreen() {
  const params = useLocalSearchParams<{
    name?: string | string[];
    price?: string | string[];
    category?: string | string[];
    image?: string | string[];
    description?: string | string[];
  }>();

  const { addToCart } = useCart();

  const getParam = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
      return value[0] || "";
    }

    return value || "";
  };

  const name = getParam(params.name);
  const priceValue = getParam(params.price);
  const category = getParam(params.category);
  const image = getParam(params.image);
  const descriptionParam = getParam(params.description);

  const price = Number(priceValue) || 0;

  const description =
    descriptionParam ||
    "Delicious and freshly prepared with quality ingredients. Perfect for enjoying a tasty meal.";

  const imageUri =
    typeof image === "string" && image.trim().length > 0 ? image.trim() : "";

  console.log("FOOD DETAILS DATA:", {
    name,
    price,
    category,
    image: imageUri,
  });

  const food = {
    id: `${name}-${price}`,
    name,
    price,
    category,
    image: imageUri,
    description,
  };

  const addFood = () => {
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      emoji: food.image,
      category: food.category,
    });

    Alert.alert("Success", "Added to cart!");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={(event) => {
            console.log(
              "FOOD DETAILS IMAGE ERROR:",
              imageUri,
              event.nativeEvent.error,
            );
          }}
        />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>🍽️</Text>
        </View>
      )}

      <Text style={styles.name}>{food.name || "Food Item"}</Text>

      <Text style={styles.category}>{food.category || "Food"}</Text>

      <Text style={styles.price}>Rs. {food.price}</Text>

      <Text style={styles.description}>{food.description}</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={addFood}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>🛒 Add to Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginTop: 30,
    backgroundColor: "#E5E5E5",
  },

  noImage: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginTop: 30,
    backgroundColor: "#DDDDDD",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    fontSize: 80,
  },

  name: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#222222",
  },

  category: {
    fontSize: 16,
    color: "#777777",
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
    color: "#555555",
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
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  backButton: {
    marginTop: 15,
    padding: 12,
  },

  backText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "600",
  },
});
