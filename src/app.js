const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes/index");
const connectDB = require("./config/database");
const authRoutes =require("./routes/authRoutes")
const userProfileRoutes = require("./routes/userProfileRoutes");
const youtubeRoutes = require("./routes/youtubeRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiPrefix = process.env.API_PREFIX || "/api";
const apiVersion = process.env.API_VERSION || "v1";


// Routes
app.use(`${apiPrefix}/${apiVersion}/auth`, authRoutes);
app.use(`${apiPrefix}/${apiVersion}/user`, userProfileRoutes);
app.use(`${apiPrefix}/${apiVersion}/youtube`, youtubeRoutes);
app.use("/", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});

module.exports = app;
