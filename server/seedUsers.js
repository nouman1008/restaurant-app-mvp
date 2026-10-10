const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const users = [
  {
    fullName: "Nouman Customer",
    email: "customer@restaurant.com",
    password: "Customer123",
    role: "customer"
  },
  {
    fullName: "Restaurant Manager",
    email: "manager@restaurant.com",
    password: "Manager123",
    role: "manager"
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const existingUser = await User.findOne({
        email: user.email
      });

      if (existingUser) {
        existingUser.fullName = user.fullName;
        existingUser.password = hashedPassword;
        existingUser.role = user.role;

        await existingUser.save();

        console.log(`User updated: ${user.email}`);
      } else {
        await User.create({
          fullName: user.fullName,
          email: user.email,
          password: hashedPassword,
          role: user.role
        });

        console.log(`User created: ${user.email}`);
      }
    }

    await mongoose.disconnect();

    console.log("User seeding completed");
  } catch (error) {
    console.error("User seeding failed:", error.message);
    process.exit(1);
  }
}

seedUsers();