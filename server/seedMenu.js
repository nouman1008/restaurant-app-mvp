const mongoose = require("mongoose");
require("dotenv").config();

const Menu = require("./models/Menu");

const menuItems = [
  {
    name: "Chicken Biryani",
    description: "Spicy and flavorful chicken biryani",
    price: 450,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c",
    isSpecial: true
  },
  {
    name: "Chicken Wings",
    description: "Crispy and delicious chicken wings",
    price: 650,
    category: "Appetizers",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2",
    isSpecial: true
  },
  {
    name: "Chicken Burger",
    description: "Juicy chicken burger with fresh vegetables",
    price: 550,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    isSpecial: false
  },
  {
    name: "French Fries",
    description: "Crispy golden french fries",
    price: 250,
    category: "Sides",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
    isSpecial: false
  },
  {
    name: "Chocolate Cake",
    description: "Rich and delicious chocolate cake",
    price: 350,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
    isSpecial: false
  }
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Menu.deleteMany();
    await Menu.insertMany(menuItems);

    console.log("Menu data inserted successfully");

    await mongoose.connection.close();
  })
  .catch((error) => {
    console.log("Error:", error.message);
  });