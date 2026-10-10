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
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { apiRequest } from "../config/api";

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    if (mode === "signup") {
      Alert.alert(
        "Signup Not Available",
        "Backend signup is not available yet. Please use one of the existing demo accounts to log in.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      login(data.user, data.token);

      if (data.user.role === "manager") {
        router.replace("/manager");
      } else {
        router.replace("/home");
      }
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.message || "Unable to connect to the server.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
                placeholderTextColor={colors.secondaryText}
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
            placeholderTextColor={colors.secondaryText}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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
              placeholderTextColor={colors.secondaryText}
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
                placeholderTextColor={colors.secondaryText}
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
              <ActivityIndicator color={colors.card} />
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.primary,
    },

    subtitle: {
      fontSize: 15,
      color: colors.secondaryText,
      marginTop: 5,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 4,
      shadowColor: colors.text,
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },

    modeContainer: {
      flexDirection: "row",
      backgroundColor: colors.background,
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
      backgroundColor: colors.primary,
    },

    modeText: {
      fontWeight: "600",
      color: colors.secondaryText,
    },

    activeModeText: {
      color: colors.card,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 7,
      marginTop: 10,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.background,
    },

    errorInput: {
      borderColor: colors.error,
    },

    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
    },

    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.background,
    },

    passwordInput: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },

    showText: {
      color: colors.primary,
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
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },

    selectedRole: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
    },

    roleText: {
      color: colors.secondaryText,
      fontWeight: "600",
    },

    selectedRoleText: {
      color: colors.primary,
    },

    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 25,
    },

    disabledButton: {
      opacity: 0.7,
    },

    submitText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: "bold",
    },

    demoTitle: {
      textAlign: "center",
      marginTop: 22,
      marginBottom: 6,
      fontWeight: "bold",
      color: colors.text,
    },

    demoText: {
      textAlign: "center",
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },
  });
