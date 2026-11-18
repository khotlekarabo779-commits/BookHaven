
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// Create a librarian login account
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password || password.length < 6) {
    return res.status(400).json({
      message: "Enter a username and a password of at least 6 characters."
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO login (user_id, username, password) VALUES (NULL, ?, ?)",
      [username.trim(), hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Could not create account. The username may already exist.",
            error: err.message
          });
        }

        res.status(201).json({
          message: "Librarian account created successfully!",
          id: result.insertId
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Account creation failed." });
  }
});

// Log in
router.post("/", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM login WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error." });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Incorrect username or password."
        });
      }

      const validPassword = await bcrypt.compare(
        password,
        results[0].password
      );

      if (!validPassword) {
        return res.status(401).json({
          message: "Incorrect username or password."
        });
      }

      res.json({ message: "Login successful!" });
    }
  );
});

module.exports = router;
