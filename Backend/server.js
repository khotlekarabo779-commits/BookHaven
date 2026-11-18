
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const db = require("./db");
const booksRoutes = require("./routes/books");
const usersRoutes = require("./routes/users");
const transactionsRoutes = require("./routes/transactions");
const loginRoutes = require("./routes/login");

app.use(cors());
app.use(express.json());

// Register API routes
app.use("/books", booksRoutes);
app.use("/users", usersRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/login", loginRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("BookHaven Backend is running!");
});

// Test database
app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
