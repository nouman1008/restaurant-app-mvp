import { useCallback, useMemo, useState } from "react";

const TOTAL_TABLES = 10;

export default function useReservation() {
  const [reservations, setReservations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTables = useMemo(() => {
    return TOTAL_TABLES - reservations.length;
  }, [reservations]);

  const addReservation = useCallback((reservation) => {
    setIsSubmitting(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const newReservation = {
          id: `R${Date.now()}`,
          ...reservation,
          status: "Confirmed",
          createdAt: new Date().toISOString(),
        };

        setReservations((previous) => [...previous, newReservation]);

        setIsSubmitting(false);
        resolve(newReservation);
      }, 700);
    });
  }, []);

  const cancelReservation = useCallback((id) => {
    setReservations((previous) =>
      previous.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              status: "Cancelled",
            }
          : reservation,
      ),
    );
  }, []);

  const getAvailableTables = useCallback(
    (partySize) => {
      const usedTables = reservations.filter(
        (reservation) => reservation.status === "Confirmed",
      ).length;

      const freeTables = TOTAL_TABLES - usedTables;

      return freeTables >= 1 && partySize <= 12;
    },
    [reservations],
  );

  return {
    reservations,
    isSubmitting,
    availableTables,
    addReservation,
    cancelReservation,
    getAvailableTables,
  };
}
