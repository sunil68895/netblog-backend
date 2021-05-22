const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { MONGOURL } = require("./keys");
const PORT = 5000;

require("./models/user");
require("./models/post");

mongoose.connect(MONGOURL, {
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

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
