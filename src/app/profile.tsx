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
          router.replace("/login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.icon}>👤</Text>

        <Text style={[styles.title, { color: colors.primary }]}>
          No User Logged In
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileIcon}>
        <Text style={styles.profileEmoji}>👤</Text>
      </View>

      <Text style={[styles.title, { color: colors.primary }]}>My Profile</Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.secondaryText }]}>
          Full Name
        </Text>

        <Text style={[styles.value, { color: colors.text }]}>
          {user.fullName}
        </Text>

        <Text style={[styles.label, { color: colors.secondaryText }]}>
          Email
        </Text>

        <Text style={[styles.value, { color: colors.text }]}>{user.email}</Text>

        <Text style={[styles.label, { color: colors.secondaryText }]}>
          Role
        </Text>

        <Text style={[styles.value, { color: colors.text }]}>
          {user.role === "manager" ? "Restaurant Manager" : "Customer"}
        </Text>
      </View>

      <View
        style={[
          styles.themeRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.themeTitle, { color: colors.text }]}>
            Dark Mode
          </Text>

          <Text style={[styles.themeSubtitle, { color: colors.secondaryText }]}>
            {isDark ? "Dark theme enabled" : "Light theme enabled"}
          </Text>
        </View>

        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{
            false: "#CCCCCC",
            true: colors.primary,
          }}
          thumbColor="#FFFFFF"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  profileIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFF1E8",
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
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    marginTop: 10,
  },

  value: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 4,
  },

  themeRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  themeTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },

  themeSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
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
  },
});
