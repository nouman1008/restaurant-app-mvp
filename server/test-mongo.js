require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MONGO TEST SUCCESS");
    process.exit(0);
  })
  .catch((err) => {
    console.error("MONGO TEST FAILED:");
    console.error(err);
    process.exit(1);
  });