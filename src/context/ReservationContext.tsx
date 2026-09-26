import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  status: "Confirmed" | "Cancelled";
  createdAt: string;
};

type ReservationContextType = {
  reservations: Reservation[];
  addReservation: (
    reservation: Omit<Reservation, "id" | "status" | "createdAt">,
  ) => string;
  cancelReservation: (id: string) => void;
  clearReservations: () => void;
};

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined,
);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const addReservation = useCallback(
    (reservation: Omit<Reservation, "id" | "status" | "createdAt">) => {
      const id = `RES-${Date.now()}`;

      const newReservation: Reservation = {
        ...reservation,
        id,
        status: "Confirmed",
        createdAt: new Date().toISOString(),
      };

      setReservations((current) => [newReservation, ...current]);

      return id;
    },
    [],
  );

  const cancelReservation = useCallback((id: string) => {
    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              status: "Cancelled",
            }
          : reservation,
      ),
    );
  }, []);

  const clearReservations = useCallback(() => {
    setReservations([]);
  }, []);

  const value = useMemo(
    () => ({
      reservations,
      addReservation,
      cancelReservation,
      clearReservations,
    }),
    [reservations, addReservation, cancelReservation, clearReservations],
  );

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
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
