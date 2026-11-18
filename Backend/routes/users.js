
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all users
router.get("/", (req, res) => {
  db.query("SELECT * FROM users ORDER BY id DESC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

// Add a user
router.post("/", (req, res) => {
  const { name, email, phone, membershipId, role } = req.body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() ||
      !membershipId?.trim() || !["Member", "Librarian"].includes(role)) {
    return res.status(400).json({
      message: "Please provide all valid member details."
    });
  }

  const sql = `
    INSERT INTO users (name, email, phone, membership_id, role)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name.trim(), email.trim(), phone.trim(), membershipId.trim(), role],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Member registered successfully.",
        id: result.insertId
      });
    }
  );
});

// Update a user
router.put("/:id", (req, res) => {
  const { name, email, phone, membershipId, role } = req.body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() ||
      !membershipId?.trim() || !["Member", "Librarian"].includes(role)) {
    return res.status(400).json({
      message: "Please provide all valid member details."
    });
  }

  const sql = `
    UPDATE users
    SET name = ?, email = ?, phone = ?, membership_id = ?, role = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name.trim(), email.trim(), phone.trim(), membershipId.trim(), role, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Member not found." });
      }

      res.json({ message: "Member updated successfully." });
    }
  );
});

// Delete a user
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Could not delete this member. They may have transaction records.",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Member not found." });
    }

    res.json({ message: "Member deleted successfully." });
  });
});

module.exports = router;
