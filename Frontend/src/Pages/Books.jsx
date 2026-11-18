
import { useState, useEffect } from "react";

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    quantity: "",
  });

  // Load books from the MySQL database
  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch("http://localhost:5000/books");

        if (!response.ok) {
          throw new Error("Could not load books.");
        }

        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Error loading books:", error);
        alert("Could not connect to the books database.");
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  // Handle form input changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Add or update a book in the database
  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.genre.trim() ||
      !form.isbn.trim() ||
      form.quantity === "" ||
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 0
    ) {
      alert("Please complete all fields with valid values.");
      return;
    }

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim(),
      isbn: form.isbn.trim(),
      quantity: Number(form.quantity),
    };

    try {
      const url = editingId
        ? `http://localhost:5000/books/${editingId}`
        : "http://localhost:5000/books";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Could not save book.");
      }

      if (editingId) {
        setBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.id === editingId
              ? { ...bookData, id: editingId }
              : book
          )
        );

        alert("Book updated successfully!");
      } else {
        setBooks((currentBooks) => [
          ...currentBooks,
          { ...bookData, id: result.id },
        ]);

        alert("Book added successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving book:", error);
      alert(error.message);
    }
  }

  // Reset the form
  function resetForm() {
    setForm({
      title: "",
      author: "",
      genre: "",
      isbn: "",
      quantity: "",
    });

    setEditingId(null);
    setShowForm(false);
  }

  // Open the form to edit a book
  function editBook(book) {
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn || "",
      quantity: String(book.quantity),
    });

    setEditingId(book.id);
    setShowForm(true);
  }

  // Delete a book from the database
  async function deleteBook(id) {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/books/${id}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || result.error || "Could not delete book.");
        }

        setBooks((currentBooks) =>
          currentBooks.filter((book) => book.id !== id)
        );

        alert("Book deleted successfully!");
      } catch (error) {
        console.error("Error deleting book:", error);
        alert(error.message);
      }
    }
  }

  // Search books
  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.isbn}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="books-page">
      <div className="books-heading">
        <div>
          <p className="eyebrow">YOUR COLLECTION</p>
          <h1>Book Management</h1>
          <p>Manage your library collection and keep track of stock.</p>
        </div>

        <button
          className="add-book-btn"
          onClick={() => setShowForm(true)}
        >
          + Add New Book
        </button>
      </div>

      <div className="book-summary">
        <div>
          <span>Total Titles</span>
          <strong>{books.length}</strong>
        </div>

        <div>
          <span>Total Copies</span>
          <strong>
            {books.reduce(
              (total, book) => total + Number(book.quantity),
              0
            )}
          </strong>
        </div>

        <div>
          <span>Low Stock</span>
          <strong>
            {books.filter((book) => Number(book.quantity) < 2).length}
          </strong>
        </div>
      </div>

      {showForm && (
        <form className="book-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Book" : "Add a New Book"}</h2>

          <div className="form-grid">
            <input
              name="title"
              placeholder="Book Title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <input
              name="author"
              placeholder="Author"
              value={form.author}
              onChange={handleChange}
              required
            />

            <input
              name="genre"
              placeholder="Genre"
              value={form.genre}
              onChange={handleChange}
              required
            />

            <input
              name="isbn"
              placeholder="ISBN"
              value={form.isbn}
              onChange={handleChange}
              required
            />

            <input
              name="quantity"
              type="number"
              min="0"
              step="1"
              placeholder="Initial Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="add-book-btn">
              {editingId ? "Save Changes" : "Add Book"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="books-table-panel">
        <div className="table-heading">
          <div>
            <h2>Library Collection</h2>
            <p>All books registered in your library</p>
          </div>

          <input
            className="search-input"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-scroll">
          <table className="books-table">
            <thead>
              <tr>
                <th>BOOK TITLE</th>
                <th>AUTHOR</th>
                <th>GENRE</th>
                <th>ISBN</th>
                <th>STOCK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading books...</td>
                </tr>
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <strong>{book.title}</strong>
                    </td>

                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn}</td>

                    <td>
                      <span
                        className={
                          Number(book.quantity) < 2
                            ? "low-stock"
                            : "in-stock"
                        }
                      >
                        {book.quantity} copies
                      </span>
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => editBook(book)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteBook(book.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No books found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Books;
