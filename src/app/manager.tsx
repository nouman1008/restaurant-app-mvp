import React, { useState } from "react";

import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useOrders } from "../context/OrdersContext";
import { useReservations } from "../context/ReservationContext";
import { useMenu, MenuItem } from "../context/MenuContext";

type Tab = "Orders" | "Reservations" | "Menu";

export default function ManagerScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { orders, updateStatus } = useOrders();
  const { reservations, cancelReservation } = useReservations();

  const {
    menuItems,
    updateMenuItem,
    toggleAvailability,
    toggleSpecial,
    resetMenu,
  } = useMenu();

  const [activeTab, setActiveTab] = useState<Tab>("Orders");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");

  if (!user || user.role !== "manager") {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.accessDenied, { color: colors.text }]}>
          Access Denied
        </Text>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Manager account required.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  const activeOrders = orders.filter(
    (order) => order.status !== "Served" && order.status !== "Cancelled",
  );

  const servedOrders = orders.filter((order) => order.status === "Served");

  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "Confirmed",
  );

  const cancelledReservations = reservations.filter(
    (reservation) => reservation.status === "Cancelled",
  );

  const availableItems = menuItems.filter((item) => item.isAvailable);

  const specialItems = menuItems.filter((item) => item.isSpecial);

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditPrice(String(item.price));
    setEditDescription(item.description);
  };

  const saveMenuItem = () => {
    if (!editingItem) {
      return;
    }

    const price = Number(editPrice);

    if (!editPrice.trim() || Number.isNaN(price)) {
      Alert.alert("Invalid Price", "Please enter a valid price.");
      return;
    }

    if (price <= 0) {
      Alert.alert("Invalid Price", "Price must be greater than 0.");
      return;
    }

    if (!editDescription.trim()) {
      Alert.alert("Invalid Description", "Description cannot be empty.");
      return;
    }

    updateMenuItem(editingItem.id, {
      price: price,
      description: editDescription.trim(),
    });

    setEditingItem(null);

    Alert.alert("Updated", `${editingItem.name} has been updated.`);
  };

  const confirmResetMenu = () => {
    Alert.alert("Reset Menu", "Reset all menu changes to the original menu?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          resetMenu();

          Alert.alert("Menu Reset", "Menu has been restored.");
        },
      },
    ]);
  };

  const confirmLogout = () => {
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

  const handleStatus = (
    id: string,
    status: "Preparing" | "Ready" | "Served",
  ) => {
    updateStatus(id, status);
  };

  const renderOrder = ({ item }: { item: (typeof orders)[number] }) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {item.id}
        </Text>

        <Text style={[styles.cardText, { color: colors.muted }]}>
          Type: {item.type}
        </Text>

        {item.tableNumber ? (
          <Text style={[styles.cardText, { color: colors.muted }]}>
            Table: {item.tableNumber}
          </Text>
        ) : null}

        {item.pickupTime ? (
          <Text style={[styles.cardText, { color: colors.muted }]}>
            Pickup: {item.pickupTime}
          </Text>
        ) : null}

        <Text style={[styles.cardText, { color: colors.muted }]}>
          Total: Rs. {item.total.toFixed(0)}
        </Text>

        <Text style={[styles.status, { color: colors.accent }]}>
          Status: {item.status}
        </Text>

        <View style={styles.row}>
          {item.status === "Pending" ? (
            <Pressable
              style={styles.smallButton}
              onPress={() => handleStatus(item.id, "Preparing")}
            >
              <Text style={styles.smallButtonText}>Preparing</Text>
            </Pressable>
          ) : null}

          {item.status === "Preparing" ? (
            <Pressable
              style={styles.smallButton}
              onPress={() => handleStatus(item.id, "Ready")}
            >
              <Text style={styles.smallButtonText}>Ready</Text>
            </Pressable>
          ) : null}

          {item.status === "Ready" ? (
            <Pressable
              style={styles.smallButton}
              onPress={() => handleStatus(item.id, "Served")}
            >
              <Text style={styles.smallButtonText}>Served</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  const renderReservation = ({
    item,
  }: {
    item: (typeof reservations)[number];
  }) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {item.name}
        </Text>

        <Text style={[styles.cardText, { color: colors.muted }]}>
          Phone: {item.phone}
        </Text>

        <Text style={[styles.cardText, { color: colors.muted }]}>
          Date: {item.date}
        </Text>

        <Text style={[styles.cardText, { color: colors.muted }]}>
          Time: {item.time}
        </Text>

        <Text style={[styles.cardText, { color: colors.muted }]}>
          Guests: {item.partySize}
        </Text>

        <Text
          style={[
            styles.status,
            {
              color: item.status === "Confirmed" ? "#16803A" : "#B42318",
            },
          ]}
        >
          {item.status}
        </Text>

        {item.status === "Confirmed" ? (
          <Pressable
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                "Cancel Reservation",
                `Cancel reservation for ${item.name}?`,
                [
                  {
                    text: "No",
                    style: "cancel",
                  },
                  {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => cancelReservation(item.id),
                  },
                ],
              );
            }}
          >
            <Text style={styles.dangerText}>Cancel Reservation</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.menuHeader}>
          <Text style={styles.menuEmoji}>{item.image}</Text>

          <View style={styles.menuInfo}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {item.name}
            </Text>

            <Text style={[styles.category, { color: colors.muted }]}>
              {item.category}
            </Text>
          </View>
        </View>

        <Text style={[styles.cardText, { color: colors.muted }]}>
          {item.description}
        </Text>

        <Text style={[styles.price, { color: colors.accent }]}>
          Rs. {item.price}
        </Text>

        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              {
                borderColor: item.isAvailable ? "#16803A" : "#B42318",
              },
            ]}
          >
            <Text
              style={{
                color: item.isAvailable ? "#16803A" : "#B42318",
                fontWeight: "700",
              }}
            >
              {item.isAvailable ? "Available" : "Unavailable"}
            </Text>
          </View>

          {item.isSpecial ? (
            <View style={[styles.badge, { borderColor: "#B26A00" }]}>
              <Text
                style={{
                  color: "#B26A00",
                  fontWeight: "700",
                }}
              >
                ⭐ Special
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.menuActions}>
          <Pressable
            style={styles.smallButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.smallButtonText}>Edit</Text>
          </Pressable>

          <Pressable
            style={[
              styles.outlineButton,
              {
                borderColor: colors.accent,
              },
            ]}
            onPress={() => toggleAvailability(item.id)}
          >
            <Text style={[styles.outlineButtonText, { color: colors.accent }]}>
              {item.isAvailable ? "Disable" : "Enable"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.outlineButton,
              {
                borderColor: "#B26A00",
              },
            ]}
            onPress={() => toggleSpecial(item.id)}
          >
            <Text style={[styles.outlineButtonText, { color: "#B26A00" }]}>
              {item.isSpecial ? "Remove Special" : "Make Special"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Manager Dashboard</Text>

            <Text style={styles.headerSubtitle}>Welcome, {user.fullName}</Text>
          </View>

          <Pressable style={styles.logoutButton} onPress={confirmLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.tabs,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {(["Orders", "Reservations", "Menu"] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                backgroundColor: colors.accent,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? "#FFFFFF" : colors.text,
                },
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "Orders" ? (
        <View style={styles.flex}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>{activeOrders.length}</Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Active
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>{servedOrders.length}</Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Served
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>{orders.length}</Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Total
              </Text>
            </View>
          </View>

          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.muted }]}>
                No orders yet.
              </Text>
            }
          />
        </View>
      ) : null}

      {activeTab === "Reservations" ? (
        <View style={styles.flex}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>
                {confirmedReservations.length}
              </Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Confirmed
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>
                {cancelledReservations.length}
              </Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Cancelled
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>{reservations.length}</Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Total
              </Text>
            </View>
          </View>

          <FlatList
            data={reservations}
            keyExtractor={(item) => item.id}
            renderItem={renderReservation}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.muted }]}>
                No reservations yet.
              </Text>
            }
          />
        </View>
      ) : null}

      {activeTab === "Menu" ? (
        <View style={styles.flex}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>{menuItems.length}</Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Items
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>{availableItems.length}</Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Available
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statNumber}>{specialItems.length}</Text>

              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Specials
              </Text>
            </View>
          </View>

          <View style={styles.menuTopRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Menu Management
            </Text>

            <Pressable style={styles.resetButton} onPress={confirmResetMenu}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          </View>

          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.id}
            renderItem={renderMenuItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.muted }]}>
                No menu items.
              </Text>
            }
          />
        </View>
      ) : null}

      <Modal
        visible={editingItem !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Menu Item
            </Text>

            <Text style={[styles.modalItemName, { color: colors.muted }]}>
              {editingItem?.name}
            </Text>

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Price
            </Text>

            <TextInput
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
              placeholder="Enter price"
              placeholderTextColor="#888888"
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Description
            </Text>

            <TextInput
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              placeholder="Enter description"
              placeholderTextColor="#888888"
              style={[
                styles.input,
                styles.descriptionInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setEditingItem(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.saveButton} onPress={saveMenuItem}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  accessDenied: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 5,
  },

  logoutButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },

  logoutText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "800",
  },

  tabs: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
  },

  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    borderRadius: 10,
  },

  tabText: {
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },

  statCard: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "800",
  },

  statLabel: {
    fontSize: 12,
    marginTop: 3,
  },

  list: {
    padding: 12,
    paddingBottom: 30,
  },

  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 5,
  },

  cardText: {
    fontSize: 14,
    lineHeight: 21,
  },

  status: {
    fontWeight: "800",
    marginTop: 8,
  },

  row: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
    flexWrap: "wrap",
  },

  button: {
    backgroundColor: "#C84B00",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  smallButton: {
    backgroundColor: "#C84B00",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 9,
  },

  smallButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  outlineButton: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 9,
  },

  outlineButtonText: {
    fontWeight: "700",
    fontSize: 12,
  },

  dangerButton: {
    borderWidth: 1,
    borderColor: "#B42318",
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 12,
  },

  dangerText: {
    color: "#B42318",
    fontWeight: "700",
  },

  empty: {
    textAlign: "center",
    padding: 30,
    fontSize: 16,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  menuEmoji: {
    fontSize: 38,
    marginRight: 12,
  },

  menuInfo: {
    flex: 1,
  },

  category: {
    fontSize: 13,
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 7,
  },

  badges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },

  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  menuActions: {
    flexDirection: "row",
    gap: 7,
    marginTop: 13,
    flexWrap: "wrap",
  },

  menuTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  resetButton: {
    borderWidth: 1,
    borderColor: "#B42318",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  resetText: {
    color: "#B42318",
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
  },

  modalItemName: {
    marginTop: 4,
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    marginBottom: 14,
  },

  descriptionInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 5,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#888888",
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  cancelText: {
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#C84B00",
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
});
