
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all transactions
router.get("/", (req, res) => {
  const sql = `
    SELECT
      transactions.id,
      users.name AS member,
      books.title AS book,
      transactions.type,
      transactions.quantity,
      transactions.transaction_date
    FROM transactions
    JOIN users ON transactions.user_id = users.id
    JOIN books ON transactions.book_id = books.id
    ORDER BY transactions.transaction_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

// Add a borrowing or returning transaction
router.post("/", (req, res) => {
  const { user_id, book_id, type, quantity } = req.body;

  if (
    !user_id ||
    !book_id ||
    !["Borrowed", "Returned"].includes(type) ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 1
  ) {
    return res.status(400).json({
      message: "Please provide valid transaction details."
    });
  }

  const amount = Number(quantity);

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.query(
      "SELECT quantity FROM books WHERE id = ? FOR UPDATE",
      [book_id],
      (err, results) => {
        if (err || results.length === 0) {
          return db.rollback(() => {
            res.status(err ? 500 : 404).json({
              message: err ? err.message : "Book not found."
            });
          });
        }

        const currentStock = Number(results[0].quantity);

        if (type === "Borrowed" && currentStock < amount) {
          return db.rollback(() => {
            res.status(400).json({
              message: "Not enough books available."
            });
          });
        }

        const newStock =
          type === "Borrowed"
            ? currentStock - amount
            : currentStock + amount;

        db.query(
          "UPDATE books SET quantity = ? WHERE id = ?",
          [newStock, book_id],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: err.message });
              });
            }

            db.query(
              `INSERT INTO transactions
               (user_id, book_id, type, quantity)
               VALUES (?, ?, ?, ?)`,
              [user_id, book_id, type, amount],
              (err, result) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: err.message });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ error: err.message });
                    });
                  }

                  res.status(201).json({
                    message: "Transaction completed successfully.",
                    id: result.insertId,
                    updatedStock: newStock
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;
