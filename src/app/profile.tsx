import React from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  const styles = createStyles(colors);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.dismissAll();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>👤</Text>

        <Text style={styles.title}>No User Logged In</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileIcon}>
        <Text style={styles.profileEmoji}>👤</Text>
      </View>

      <Text style={styles.title}>My Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{user.fullName}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>
          {user.role === "manager" ? "Restaurant Manager" : "Customer"}
        </Text>
      </View>

      <View style={styles.themeRow}>
        <View>
          <Text style={styles.themeTitle}>Dark Mode</Text>

          <Text style={styles.themeSubtitle}>
            {isDark ? "Dark theme enabled" : "Light theme enabled"}
          </Text>
        </View>

        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
          thumbColor={colors.card}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      backgroundColor: colors.background,
    },

    profileIcon: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 15,
    },

    profileEmoji: {
      fontSize: 45,
    },

    icon: {
      fontSize: 55,
      textAlign: "center",
      marginBottom: 10,
    },

    title: {
      fontSize: 27,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 25,
      color: colors.primary,
    },

    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 20,
      marginBottom: 15,
    },

    label: {
      fontSize: 13,
      marginTop: 10,
      color: colors.secondaryText,
    },

    value: {
      fontSize: 17,
      fontWeight: "600",
      marginTop: 4,
      color: colors.text,
    },

    themeRow: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 18,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    themeTitle: {
      fontSize: 17,
      fontWeight: "bold",
      color: colors.text,
    },

    themeSubtitle: {
      fontSize: 13,
      marginTop: 4,
      color: colors.secondaryText,
    },

    button: {
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: colors.primary,
    },

    buttonText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: "bold",
    },

    backButton: {
      alignItems: "center",
      marginTop: 18,
    },

    backText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },
  });
