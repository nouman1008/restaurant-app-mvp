import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import useForm from "../hooks/useForm";
import useDebounce from "../hooks/useDebounce";
import { useReservations } from "../context/ReservationContext";

type ReservationFormValues = {
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: string;
};

type ReservationErrors = Partial<
  Record<keyof ReservationFormValues, string>
>;

type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  status: "Confirmed" | "Cancelled";
};

const timeSlots = [
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
];

const TOTAL_TABLES = 10;

export default function ReservationScreen() {
  const form = useForm({
    name: "",
    phone: "",
    date: "",
    time: "",
    partySize: "",
  });

  const values = form.values as ReservationFormValues;
  const errors = form.errors as ReservationErrors;

  const { setErrors, handleChange, resetForm } = form;

  const {
    reservations,
    addReservation,
    cancelReservation,
  } = useReservations();

  const typedReservations = reservations as Reservation[];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedReservation, setConfirmedReservation] =
    useState<Reservation | null>(null);

  const debouncedPhone = useDebounce(values.phone, 400);

  const minBookingTime = useMemo(() => {
    return new Date(Date.now() + 60 * 60 * 1000);
  }, []);

  const availableTables = useMemo(() => {
    const confirmedCount = typedReservations.filter(
      (reservation) => reservation.status === "Confirmed",
    ).length;

    return Math.max(0, TOTAL_TABLES - confirmedCount);
  }, [typedReservations]);

  const validate = () => {
    const newErrors: ReservationErrors = {};

    // Name
    if (!values.name.trim()) {
      newErrors.name = "Name is required.";
    }

    // Pakistani mobile number
    const phoneRegex = /^03\d{2}-\d{7}$/;

    if (!phoneRegex.test(debouncedPhone)) {
      newErrors.phone = "Use format 03XX-XXXXXXX.";
    }

    // Date
    if (!values.date) {
      newErrors.date = "Date is required.";
    } else {
      const selectedDate = new Date(`${values.date}T00:00:00`);

      const now = new Date();

      const todayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      if (selectedDate < todayDate) {
        newErrors.date = "Date cannot be in the past.";
      }
    }

    // Time
    if (!values.time) {
      newErrors.time = "Please select a time.";
    }

    // Party size
    const partySize = Number(values.partySize);

    if (
      !values.partySize ||
      !Number.isInteger(partySize) ||
      partySize < 1 ||
      partySize > 12
    ) {
      newErrors.partySize =
        "Party size must be between 1 and 12.";
    }

    // At least one hour ahead
    if (values.date && values.time) {
      const [timePart, period] = values.time.split(" ");

      let hours = Number(timePart.split(":")[0]);

      if (period === "PM" && hours !== 12) {
        hours += 12;
      }

      if (period === "AM" && hours === 12) {
        hours = 0;
      }

      const [year, month, day] = values.date
        .split("-")
        .map(Number);

      const selectedDateTime = new Date(
        year,
        month - 1,
        day,
        hours,
        0,
        0,
      );

      if (selectedDateTime < minBookingTime) {
        newErrors.time =
          "Booking must be at least 1 hour ahead.";
      }
    }

    // Table availability
    if (availableTables <= 0) {
      newErrors.time = "No tables are currently available.";
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
      const reservationData = {
        name: values.name.trim(),
        phone: values.phone,
        date: values.date,
        time: values.time,
        partySize: Number(values.partySize),
      };

      const returnedReservation = addReservation(
        reservationData,
      );

      /*
       * Your ReservationContext currently returns the
       * reservation ID. Build the confirmation object locally.
       */
      const reservation: Reservation = {
        id: String(returnedReservation),
        name: reservationData.name,
        phone: reservationData.phone,
        date: reservationData.date,
        time: reservationData.time,
        partySize: reservationData.partySize,
        status: "Confirmed",
      };

      setConfirmedReservation(reservation);
      setShowConfirmation(true);

      resetForm();
      setIsSubmitting(false);
    }, 700);
  };

  const handleCancel = (id: string) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelReservation(id),
        },
      ],
    );
  };

  const renderReservation = ({
    item,
  }: {
    item: Reservation;
  }) => {
    return (
      <View style={styles.reservationCard}>
        <View style={styles.reservationHeader}>
          <Text style={styles.reservationId}>
            {item.id}
          </Text>

          <Text
            style={[
              styles.status,
              item.status === "Cancelled" &&
                styles.cancelledStatus,
            ]}
          >
            {item.status}
          </Text>
        </View>

        <Text style={styles.reservationText}>
          👤 {item.name}
        </Text>

        <Text style={styles.reservationText}>
          📱 {item.phone}
        </Text>

        <Text style={styles.reservationText}>
          📅 {item.date}
        </Text>

        <Text style={styles.reservationText}>
          🕐 {item.time}
        </Text>

        <Text style={styles.reservationText}>
          👥 {item.partySize} people
        </Text>

        {item.status === "Confirmed" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item.id)}
          >
            <Text style={styles.cancelButtonText}>
              Cancel Reservation
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={typedReservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservation}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>
              Reserve a Table
            </Text>

            <Text style={styles.subtitle}>
              Book your table at our restaurant
            </Text>

            <View style={styles.availabilityCard}>
              <Text style={styles.availabilityTitle}>
                Available Tables
              </Text>

              <Text style={styles.availabilityNumber}>
                {availableTables}
              </Text>

              <Text style={styles.availabilityText}>
                tables available
              </Text>
            </View>

            <Text style={styles.label}>
              Your Name
            </Text>

            <TextInput
              style={[
                styles.input,
                errors.name && styles.errorInput,
              ]}
              placeholder="Enter your name"
              value={values.name}
              onChangeText={(text) =>
                handleChange("name", text)
              }
            />

            {errors.name && (
              <Text style={styles.error}>
                {errors.name}
              </Text>
            )}

            <Text style={styles.label}>
              Phone Number
            </Text>

            <TextInput
              style={[
                styles.input,
                errors.phone && styles.errorInput,
              ]}
              placeholder="03XX-XXXXXXX"
              keyboardType="phone-pad"
              value={values.phone}
              onChangeText={(text) =>
                handleChange("phone", text)
              }
            />

            {errors.phone && (
              <Text style={styles.error}>
                {errors.phone}
              </Text>
            )}

            <Text style={styles.label}>
              Date
            </Text>

            <TextInput
              style={[
                styles.input,
                errors.date && styles.errorInput,
              ]}
              placeholder="YYYY-MM-DD"
              value={values.date}
              onChangeText={(text) =>
                handleChange("date", text)
              }
            />

            {errors.date && (
              <Text style={styles.error}>
                {errors.date}
              </Text>
            )}

            <Text style={styles.label}>
              Party Size
            </Text>

            <TextInput
              style={[
                styles.input,
                errors.partySize &&
                  styles.errorInput,
              ]}
              placeholder="1 - 12 people"
              keyboardType="number-pad"
              value={values.partySize}
              onChangeText={(text) =>
                handleChange("partySize", text)
              }
            />

            {errors.partySize && (
              <Text style={styles.error}>
                {errors.partySize}
              </Text>
            )}

            <Text style={styles.label}>
              Select Time
            </Text>

            <View style={styles.timeGrid}>
              {timeSlots.map((time) => {
                const selected =
                  values.time === time;

                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      selected &&
                        styles.selectedTime,
                    ]}
                    onPress={() =>
                      handleChange("time", time)
                    }
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selected &&
                          styles.selectedTimeText,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errors.time && (
              <Text style={styles.error}>
                {errors.time}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.bookButton,
                isSubmitting &&
                  styles.disabledButton,
              ]}
              disabled={isSubmitting}
              onPress={handleSubmit}
            >
              <Text style={styles.bookButtonText}>
                {isSubmitting
                  ? "Booking..."
                  : "Confirm Reservation"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
              My Reservations
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No reservations yet.
          </Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowConfirmation(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.successIcon}>
              ✅
            </Text>

            <Text style={styles.modalTitle}>
              Reservation Confirmed!
            </Text>

            {confirmedReservation && (
              <>
                <Text style={styles.modalText}>
                  Reservation ID:
                </Text>

                <Text style={styles.modalValue}>
                  {confirmedReservation.id}
                </Text>

                <Text style={styles.modalText}>
                  {confirmedReservation.date} •{" "}
                  {confirmedReservation.time}
                </Text>

                <Text style={styles.modalText}>
                  {confirmedReservation.partySize}{" "}
                  people
                </Text>
              </>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() =>
                setShowConfirmation(false)
              }
            >
              <Text style={styles.modalButtonText}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  listContent: {
    padding: 18,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },

  subtitle: {
    color: "#777",
    marginTop: 4,
    marginBottom: 15,
  },

  availabilityCard: {
    backgroundColor: "#FFF1E8",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },

  availabilityTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },

  availabilityNumber: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E85D04",
    marginTop: 3,
  },

  availabilityText: {
    color: "#777",
    fontSize: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    color: "#333",
  },

  errorInput: {
    borderColor: "#D00000",
  },

  error: {
    color: "#D00000",
    fontSize: 12,
    marginTop: 4,
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  timeButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },

  selectedTime: {
    backgroundColor: "#E85D04",
    borderColor: "#E85D04",
  },

  timeText: {
    color: "#555",
    fontSize: 12,
  },

  selectedTimeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  bookButton: {
    backgroundColor: "#E85D04",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 30,
    marginBottom: 12,
  },

  reservationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  reservationId: {
    fontWeight: "bold",
    color: "#E85D04",
  },

  status: {
    color: "#16803C",
    fontWeight: "bold",
    fontSize: 12,
  },

  cancelledStatus: {
    color: "#D00000",
  },

  reservationText: {
    color: "#555",
    marginTop: 5,
  },

  cancelButton: {
    backgroundColor: "#FFE5E5",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  cancelButtonText: {
    color: "#B00000",
    fontWeight: "bold",
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 10,
    marginBottom: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
  },

  successIcon: {
    fontSize: 45,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
    marginTop: 10,
    marginBottom: 15,
  },

  modalText: {
    color: "#666",
    marginTop: 5,
  },

  modalValue: {
    color: "#E85D04",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 3,
  },

  modalButton: {
    backgroundColor: "#E85D04",
    width: "100%",
    paddingVertical: 13,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 20,
  },

  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});