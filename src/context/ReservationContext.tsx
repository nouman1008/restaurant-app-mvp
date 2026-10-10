import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { apiRequest } from "../config/api";
import { useAuth } from "./AuthContext";

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  tableNumber?: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  createdAt: string;
};

type AddReservationInput = {
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
};

type ReservationContextType = {
  reservations: Reservation[];
  addReservation: (reservation: AddReservationInput) => Promise<Reservation>;
  updateReservationStatus: (
    id: string,
    status: "Confirmed" | "Cancelled",
  ) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  refreshReservations: () => Promise<void>;
  clearReservations: () => void;
};

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined,
);

const formatReservation = (reservation: any): Reservation => ({
  id: String(reservation._id),
  name: String(reservation.name || ""),
  phone: String(reservation.phone || ""),
  date: String(reservation.date || ""),
  time: String(reservation.time || ""),
  partySize: Number(reservation.partySize || 0),
  tableNumber:
    reservation.tableNumber !== undefined
      ? Number(reservation.tableNumber)
      : undefined,
  status: reservation.status,
  createdAt: reservation.createdAt || new Date().toISOString(),
});

export function ReservationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const refreshReservations = useCallback(async () => {
    if (!token) {
      setReservations([]);
      return;
    }

    try {
      const data = await apiRequest("/reservations", {}, token);

      const formatted = Array.isArray(data) ? data.map(formatReservation) : [];

      setReservations(formatted);
    } catch (error: any) {
      console.log("Reservations fetch error:", error?.message);
    }
  }, [token]);

  useEffect(() => {
    refreshReservations();

    if (!token) {
      return;
    }

    const interval = setInterval(() => {
      refreshReservations();
    }, 10000);

    return () => clearInterval(interval);
  }, [token, refreshReservations]);

  const addReservation = useCallback(
    async (reservation: AddReservationInput) => {
      if (!token) {
        throw new Error("Please login first.");
      }

      const data = await apiRequest(
        "/reservations",
        {
          method: "POST",
          body: JSON.stringify({
            name: reservation.name,
            phone: reservation.phone,
            date: reservation.date,
            time: convertTimeTo24Hour(reservation.time),
            partySize: reservation.partySize,
          }),
        },
        token,
      );

      const newReservation = formatReservation(data.reservation);

      await refreshReservations();

      return newReservation;
    },
    [token, refreshReservations],
  );

  const updateReservationStatus = useCallback(
    async (id: string, status: "Confirmed" | "Cancelled") => {
      if (!token) {
        throw new Error("Please login first.");
      }

      await apiRequest(
        `/reservations/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        token,
      );

      await refreshReservations();
    },
    [token, refreshReservations],
  );

  const cancelReservation = useCallback(
    async (id: string) => {
      await updateReservationStatus(id, "Cancelled");
    },
    [updateReservationStatus],
  );

  const clearReservations = useCallback(() => {
    setReservations([]);
  }, []);

  const value = useMemo(
    () => ({
      reservations,
      addReservation,
      updateReservationStatus,
      cancelReservation,
      refreshReservations,
      clearReservations,
    }),
    [
      reservations,
      addReservation,
      updateReservationStatus,
      cancelReservation,
      refreshReservations,
      clearReservations,
    ],
  );

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

function convertTimeTo24Hour(time: string) {
  const [timePart, period] = time.split(" ");

  const [hoursString, minutesString] = timePart.split(":");

  let hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

export function useReservations() {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error(
      "useReservations must be used inside a ReservationProvider",
    );
  }

  return context;
}
