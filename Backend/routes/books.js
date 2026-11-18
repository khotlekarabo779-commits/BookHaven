
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all books
router.get("/", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a book
router.post("/", (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;

  if (!title || !author || quantity < 0) {
    return res.status(400).json({ message: "Invalid book details" });
  }

  const sql = `INSERT INTO books (title, author, genre, isbn, quantity)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [title, author, genre, isbn || null, quantity], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Book added successfully", id: result.insertId });
  });
});

// Update a book
router.put("/:id", (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;

  const sql = `UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=?
               WHERE id=?`;

  db.query(sql, [title, author, genre, isbn || null, quantity, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.affectedRows) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book updated successfully" });
  });
});

// Delete a book
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM books WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.affectedRows) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  });
});

module.exports = router;
