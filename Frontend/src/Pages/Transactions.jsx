
import { useState, useEffect } from "react";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    book_id: "",
    type: "Borrowed",
    quantity: "1",
  });

  // Load transactions, members and books from the database
  async function loadData() {
    try {
      const [transactionResponse, userResponse, bookResponse] =
        await Promise.all([
          fetch("http://localhost:5000/transactions"),
          fetch("http://localhost:5000/users"),
          fetch("http://localhost:5000/books"),
        ]);

      if (
        !transactionResponse.ok ||
        !userResponse.ok ||
        !bookResponse.ok
      ) {
        throw new Error("Could not load library records.");
      }

      const transactionData = await transactionResponse.json();
      const userData = await userResponse.json();
      const bookData = await bookResponse.json();

      setTransactions(transactionData);
      setUsers(userData);
      setBooks(bookData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Could not load transactions, members or books.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Handle form changes
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Save a borrowing or returning transaction
  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.user_id ||
      !form.book_id ||
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 1
    ) {
      alert("Please complete all fields correctly.");
      return;
    }

    const transactionData = {
      user_id: Number(form.user_id),
      book_id: Number(form.book_id),
      type: form.type,
      quantity: Number(form.quantity),
    };

    setSaving(true);

    try {
      const response = await fetch(
        "http://localhost:5000/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Transaction failed."
        );
      }

      alert(result.message);

      setForm({
        user_id: "",
        book_id: "",
        type: "Borrowed",
        quantity: "1",
      });

      // Refresh all information after a successful transaction
      await loadData();
    } catch (error) {
      console.error("Transaction error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  // Format transaction date
  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="transactions-page">
      <div className="transactions-heading">
        <div>
          <p className="eyebrow">LIBRARY RECORDS</p>
          <h1>Transactions</h1>
          <p>Manage borrowed and returned books.</p>
        </div>
      </div>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <h2>Record a Transaction</h2>

        <div className="transaction-fields">
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a Member</option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.membership_id})
              </option>
            ))}
          </select>

          <select
            name="book_id"
            value={form.book_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a Book</option>

            {books.map((book) => (
              <option
                key={book.id}
                value={book.id}
                disabled={
                  form.type === "Borrowed" &&
                  Number(book.quantity) < 1
                }
              >
                {book.title} ({book.quantity} available)
              </option>
            ))}
          </select>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Borrowed">Borrowed</option>
            <option value="Returned">Returned</option>
          </select>

          <input
            name="quantity"
            type="number"
            min="1"
            step="1"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <button
          className="add-book-btn"
          type="submit"
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save Transaction"}
        </button>

        {users.length === 0 && (
          <p>Please register a member before recording a transaction.</p>
        )}

        {books.length === 0 && (
          <p>Please add a book before recording a transaction.</p>
        )}
      </form>

      <div className="books-table-panel">
        <div className="table-heading">
          <div>
            <h2>Transaction History</h2>
            <p>Recent borrowing and return records</p>
          </div>
        </div>

        <div className="table-scroll">
          <table className="books-table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>BOOK</th>
                <th>TYPE</th>
                <th>QUANTITY</th>
                <th>DATE</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading transactions...</td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.member}</strong>
                    </td>

                    <td>{item.book}</td>

                    <td>
                      <span
                        className={
                          item.type === "Borrowed"
                            ? "low-stock"
                            : "in-stock"
                        }
                      >
                        {item.type}
                      </span>
                    </td>

                    <td>{item.quantity}</td>
                    <td>{formatDate(item.transaction_date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
