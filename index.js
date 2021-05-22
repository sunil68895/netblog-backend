const express = require("express");
const app = express();
const env=require('dotenv')
const mongoose = require("mongoose");
env.config();
require("./models/user");
require("./models/post");

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("connected to database");
});

mongoose.connection.on("error", (err) => {
  console.log("err connecting", err);
});

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
