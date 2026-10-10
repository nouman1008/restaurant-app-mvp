const Order = require("../models/Order");
const Menu = require("../models/Menu");

const createOrder = async (req, res) => {
  try {
    const { items, orderType, tableNumber, notes, discount = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item",
      });
    }

    if (!["Dine-in", "Takeaway"].includes(orderType)) {
      return res.status(400).json({
        message: "Invalid order type",
      });
    }

    if (orderType === "Dine-in" && !tableNumber) {
      return res.status(400).json({
        message: "Table number is required for Dine-in",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);

      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item not found: ${item.menuItem}`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message: `Invalid quantity for ${menuItem.name}`,
        });
      }

      const itemTotal = menuItem.price * item.quantity;

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
      });

      subtotal += itemTotal;
    }

    const serviceCharge = subtotal * 0.05;
    const tax = (subtotal + serviceCharge) * 0.15;
    const validDiscount = Math.max(0, Number(discount) || 0);
    const total = subtotal + serviceCharge + tax - validDiscount;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      orderType,
      tableNumber: orderType === "Dine-in" ? tableNumber : undefined,
      notes,
      subtotal,
      serviceCharge,
      tax,
      discount: validDiscount,
      total,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === "manager") {
      orders = await Order.find()
        .populate("user", "name email role")
        .populate("items.menuItem")
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: req.user.id })
        .populate("items.menuItem")
        .sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Manager access required",
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Preparing",
      "Ready",
      "Served",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const validTransitions = {
      Pending: ["Preparing", "Cancelled"],
      Preparing: ["Ready", "Cancelled"],
      Ready: ["Served", "Cancelled"],
      Served: [],
      Cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change order status from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email role")
      .populate("items.menuItem");

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};