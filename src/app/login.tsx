import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import users from "../data/users";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "manager">("customer");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (field: string) => {
    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (mode === "signup" && !fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8 || !/\d/.test(password)) {
      newErrors.password =
        "Password must be 8+ characters and contain a digit.";
    }

    if (mode === "signup" && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (mode === "login") {
        const user = users.find(
          (item) =>
            item.email.toLowerCase() === email.trim().toLowerCase() &&
            item.password === password,
        );

        setIsSubmitting(false);

        if (!user) {
          Alert.alert("Login Failed", "Incorrect email or password.");
          return;
        }

        // Store logged-in user in AuthContext
        login(user);

        if (user.role === "manager") {
          router.replace("/manager");
        } else {
          router.replace("/home");
        }

        return;
      }

      const existingUser = users.find(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
      );

      setIsSubmitting(false);

      if (existingUser) {
        Alert.alert(
          "Signup Failed",
          "An account with this email already exists.",
        );
        return;
      }

      Alert.alert(
        "Signup Successful",
        "Your mock account has been created. You can now log in.",
      );

      setMode("login");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("customer");
      setErrors({});
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🍽️</Text>

          <Text style={styles.title}>Restaurant App</Text>

          <Text style={styles.subtitle}>
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, mode === "login" && styles.activeMode]}
              onPress={() => {
                setMode("login");
                setErrors({});
              }}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === "login" && styles.activeModeText,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "signup" && styles.activeMode,
              ]}
              onPress={() => {
                setMode("signup");
                setErrors({});
              }}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === "signup" && styles.activeModeText,
                ]}
              >
                Signup
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "signup" && (
            <>
              <Text style={styles.label}>Full Name</Text>

              <TextInput
                style={[styles.input, errors.fullName && styles.errorInput]}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  clearError("fullName");
                }}
              />

              {errors.fullName ? (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              ) : null}
            </>
          )}

          <Text style={styles.label}>Email</Text>

          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearError("email");
            }}
          />

          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          <Text style={styles.label}>Password</Text>

          <View
            style={[
              styles.passwordContainer,
              errors.password && styles.errorInput,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError("password");
              }}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          {mode === "signup" && (
            <>
              <Text style={styles.label}>Confirm Password</Text>

              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.errorInput,
                ]}
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError("confirmPassword");
                }}
              />

              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}

              <Text style={styles.label}>Role</Text>

              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "customer" && styles.selectedRole,
                  ]}
                  onPress={() => setRole("customer")}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === "customer" && styles.selectedRoleText,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "manager" && styles.selectedRole,
                  ]}
                  onPress={() => setRole("manager")}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === "manager" && styles.selectedRoleText,
                    ]}
                  >
                    Manager
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {mode === "login" ? "Login" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.demoTitle}>Demo Accounts</Text>

          <Text style={styles.demoText}>Customer: customer@restaurant.com</Text>

          <Text style={styles.demoText}>Password: Customer123</Text>

          <Text style={styles.demoText}>Manager: manager@restaurant.com</Text>

          <Text style={styles.demoText}>Password: Manager123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7ed",
  },

  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 25,
  },

  logo: {
    fontSize: 45,
    marginBottom: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f97316",
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  modeContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    borderRadius: 8,
  },

  activeMode: {
    backgroundColor: "#f97316",
  },

  modeText: {
    fontWeight: "600",
    color: "#555",
  },

  activeModeText: {
    color: "#fff",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },

  errorInput: {
    borderColor: "#ef4444",
  },

  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  showText: {
    color: "#f97316",
    fontWeight: "600",
    marginRight: 12,
  },

  roleContainer: {
    flexDirection: "row",
    gap: 10,
  },

  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  selectedRole: {
    backgroundColor: "#fff7ed",
    borderColor: "#f97316",
  },

  roleText: {
    color: "#555",
    fontWeight: "600",
  },

  selectedRoleText: {
    color: "#f97316",
  },

  submitButton: {
    backgroundColor: "#f97316",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  demoTitle: {
    textAlign: "center",
    marginTop: 22,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#333",
  },

  demoText: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
});
