import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome, {user?.fullName || "Guest"}!</Text>

      <Text style={styles.subtitle}>Delicious food, easy ordering.</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/menu")}
      >
        <Text style={styles.primaryButtonText}>View Menu</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/cart")}
        >
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={styles.cardTitle}>My Cart</Text>
          <Text style={styles.cardText}>View your items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/reservation")}
        >
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardTitle}>Reservation</Text>
          <Text style={styles.cardText}>Book a table</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.cardIcon}>👤</Text>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardText}>View your profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/order-tracking")}
        >
          <Text style={styles.cardIcon}>📦</Text>
          <Text style={styles.cardTitle}>My Orders</Text>
          <Text style={styles.cardText}>Track your orders</Text>
        </TouchableOpacity>
      </View>

      {user?.role === "manager" && (
        <TouchableOpacity
          style={styles.managerButton}
          onPress={() => router.push("/manager")}
        >
          <Text style={styles.managerButtonText}>Manager Dashboard</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.aboutButton}
        onPress={() => router.push("/about")}
      >
        <Text style={styles.aboutButtonText}>About Restaurant</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 16,
      color: colors.secondaryText,
      marginBottom: 25,
    },

    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 20,
    },

    primaryButtonText: {
      color: colors.card,
      fontSize: 17,
      fontWeight: "bold",
    },

    row: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },

    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 18,
      minHeight: 140,
    },

    cardIcon: {
      fontSize: 30,
      marginBottom: 10,
    },

    cardTitle: {
      fontSize: 17,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
    },

    cardText: {
      fontSize: 13,
      color: colors.secondaryText,
    },

    managerButton: {
      backgroundColor: colors.accent,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    },

    managerButtonText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: "bold",
    },

    aboutButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 12,
    },

    aboutButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
