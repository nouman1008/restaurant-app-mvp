const Reservation = require("../models/Reservation");

const TABLES = [
  { number: 1, seats: 2 },
  { number: 2, seats: 2 },
  { number: 3, seats: 4 },
  { number: 4, seats: 4 },
  { number: 5, seats: 4 },
  { number: 6, seats: 6 },
  { number: 7, seats: 6 },
  { number: 8, seats: 8 },
  { number: 9, seats: 10 },
  { number: 10, seats: 12 },
];

const createReservation = async (req, res) => {
  try {
    const { name, phone, date, time, partySize } = req.body;

    if (!name || !phone || !date || !time || !partySize) {
      return res.status(400).json({
        message: "All reservation fields are required",
      });
    }

    const phonePattern = /^03\d{2}-\d{7}$/;

    if (!phonePattern.test(phone)) {
      return res.status(400).json({
        message: "Phone must be in format 03XX-XXXXXXX",
      });
    }

    if (partySize < 1 || partySize > 12) {
      return res.status(400).json({
        message: "Party size must be between 1 and 12",
      });
    }

    const reservationDate = new Date(date);

    if (isNaN(reservationDate.getTime())) {
      return res.status(400).json({
        message: "Invalid reservation date",
      });
    }

    const [hours, minutes] = time.split(":").map(Number);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 12 ||
      hours > 22 ||
      (hours === 22 && minutes > 0) ||
      minutes < 0 ||
      minutes > 59
    ) {
      return res.status(400).json({
        message: "Reservation time must be between 12:00 PM and 10:00 PM",
      });
    }

    const availableTable = TABLES.find((table) => {
      return table.seats >= partySize;
    });

    if (!availableTable) {
      return res.status(400).json({
        message: "No table is available for this party size",
      });
    }

    const conflictingReservations = await Reservation.find({
      date,
      time,
      status: { $in: ["Pending", "Confirmed"] },
      tableNumber: { $exists: true },
    });

    const usedTables = conflictingReservations.map(
      (reservation) => reservation.tableNumber,
    );

    const freeTable = TABLES.find(
      (table) =>
        table.seats >= partySize && !usedTables.includes(table.number),
    );

    if (!freeTable) {
      return res.status(400).json({
        message: "No table is available at the selected date and time",
      });
    }

    const reservation = await Reservation.create({
      user: req.user.id,
      name,
      phone,
      date,
      time,
      partySize,
      tableNumber: freeTable.number,
      status: "Pending",
    });

    res.status(201).json({
      message: "Reservation created successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create reservation",
      error: error.message,
    });
  }
};

const getReservations = async (req, res) => {
  try {
    let reservations;

    if (req.user.role === "manager") {
      reservations = await Reservation.find()
        .populate("user", "name email role")
        .sort({ date: 1, time: 1 });
    } else {
      reservations = await Reservation.find({
        user: req.user.id,
      }).sort({ date: 1, time: 1 });
    }

    res.json(reservations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reservations",
      error: error.message,
    });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Manager access required",
      });
    }

    const { status } = req.body;

    if (!["Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Confirmed or Cancelled",
      });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found",
      });
    }

    if (reservation.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot change reservation status from ${reservation.status}`,
      });
    }

    reservation.status = status;
    await reservation.save();

    const updatedReservation = await Reservation.findById(reservation._id)
      .populate("user", "name email role");

    res.json({
      message: `Reservation ${status.toLowerCase()} successfully`,
      reservation: updatedReservation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update reservation status",
      error: error.message,
    });
  }
};

module.exports = {
  createReservation,
  getReservations,
  updateReservationStatus,
};