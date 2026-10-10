import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useReservations } from "../context/ReservationContext";

export default function ReservationScreen() {
  const router = useRouter();

  const { addReservation, reservations } = useReservations();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [loading, setLoading] = useState(false);

  const myReservations = useMemo(
    () => reservations.slice().reverse(),
    [reservations],
  );

  const submitReservation = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }

    if (!/^03\d{2}-\d{7}$/.test(phone)) {
      Alert.alert("Invalid Phone", "Use this format: 03XX-XXXXXXX");
      return;
    }

    if (!date.trim()) {
      Alert.alert("Missing Date", "Please enter the reservation date.");
      return;
    }

    if (!/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(time.trim())) {
      Alert.alert("Invalid Time", "Use a time such as 6:00 PM.");
      return;
    }

    const size = Number(partySize);

    if (!Number.isInteger(size) || size < 1 || size > 12) {
      Alert.alert("Invalid Party Size", "Party size must be between 1 and 12.");
      return;
    }

    try {
      setLoading(true);

      const reservation = await addReservation({
        name: name.trim(),
        phone: phone.trim(),
        date: date.trim(),
        time: time.trim().toUpperCase(),
        partySize: size,
      });

      Alert.alert(
        "Reservation Submitted",
        `Reservation ID: ${reservation.id}\nStatus: ${reservation.status}${
          reservation.tableNumber ? `\nTable: ${reservation.tableNumber}` : ""
        }`,
      );

      setName("");
      setPhone("");
      setDate("");
      setTime("");
      setPartySize("2");
    } catch (error: any) {
      Alert.alert(
        "Reservation Failed",
        error?.message || "Unable to create reservation.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Make a Reservation</Text>
      <Text style={styles.subtitle}>Reserve a table for your visit.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          style={styles.input}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="03XX-XXXXXXX"
          keyboardType="phone-pad"
          style={styles.input}
          maxLength={12}
        />

        <Text style={styles.label}>Date</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />

        <Text style={styles.label}>Time</Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="6:00 PM"
          style={styles.input}
        />

        <Text style={styles.label}>Party Size</Text>
        <TextInput
          value={partySize}
          onChangeText={setPartySize}
          placeholder="1 - 12"
          keyboardType="number-pad"
          style={styles.input}
          maxLength={2}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={submitReservation}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "Reserve Table"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>My Reservations</Text>

      {myReservations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No reservations yet.</Text>
        </View>
      ) : (
        myReservations.map((reservation) => (
          <View key={reservation.id} style={styles.reservationCard}>
            <View style={styles.row}>
              <Text style={styles.reservationTitle}>Reservation</Text>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{reservation.status}</Text>
              </View>
            </View>

            <Text style={styles.detail}>ID: {reservation.id}</Text>

            <Text style={styles.detail}>Date: {reservation.date}</Text>

            <Text style={styles.detail}>Time: {reservation.time}</Text>

            <Text style={styles.detail}>Guests: {reservation.partySize}</Text>

            {reservation.tableNumber !== undefined && (
              <Text style={styles.detail}>
                Table: {reservation.tableNumber}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
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
    backgroundColor: "#fff",
  },

  button: {
    marginTop: 22,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
  },

  emptyText: {
    color: "#777",
    textAlign: "center",
  },

  reservationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  reservationTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  statusBadge: {
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  detail: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
});
