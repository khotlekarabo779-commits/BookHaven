
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [booksResponse, usersResponse, transactionsResponse] =
          await Promise.all([
            fetch("http://localhost:5000/books"),
            fetch("http://localhost:5000/users"),
            fetch("http://localhost:5000/transactions"),
          ]);

        if (
          !booksResponse.ok ||
          !usersResponse.ok ||
          !transactionsResponse.ok
        ) {
          throw new Error("Could not load dashboard data.");
        }

        const booksData = await booksResponse.json();
        const usersData = await usersResponse.json();
        const transactionsData = await transactionsResponse.json();

        setBooks(booksData);
        setUsers(usersData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Dashboard error:", error);
        alert("Could not load dashboard information. Please check the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalCopies = books.reduce(
    (total, book) => total + Number(book.quantity),
    0
  );

  const borrowedBooks = transactions.reduce((total, item) => {
    if (item.type === "Borrowed") {
      return total + Number(item.quantity);
    }

    if (item.type === "Returned") {
      return total - Number(item.quantity);
    }

    return total;
  }, 0);

  const lowStockBooks = books.filter(
    (book) => Number(book.quantity) < 2
  );

  const recentTransactions = transactions.slice(0, 4);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="dashboard">
      <section className="welcome-banner">
        <div>
          <p className="eyebrow">{today.toUpperCase()}</p>
          <h1>A world of stories awaits.</h1>
          <p>
            Welcome back! Here's what's happening in your library today.
          </p>
          <Link to="/books" className="welcome-button">
            Explore Books →
          </Link>
        </div>
        <div className="welcome-decoration">📚</div>
      </section>

      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR LIBRARY AT A GLANCE</p>
          <h2>Overview</h2>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <p>Total Book Titles</p>
          <h2>{loading ? "..." : books.length}</h2>
          <small>Registered titles</small>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✓</span>
          <p>Available Copies</p>
          <h2>{loading ? "..." : totalCopies}</h2>
          <small>Ready to borrow</small>
        </div>

        <div className="stat-card">
          <span className="stat-icon">♙</span>
          <p>Library Members</p>
          <h2>{loading ? "..." : users.length}</h2>
          <small>Registered members</small>
        </div>

        <div className="stat-card">
          <span className="stat-icon">↗</span>
          <p>Borrowed Books</p>
          <h2>{loading ? "..." : borrowedBooks}</h2>
          <small>Currently on loan</small>
        </div>
      </section>

      <section className="dashboard-bottom">
        <div className="dashboard-panel">
          <div className="panel-heading">
            <h3>Recent Activity</h3>
            <Link to="/transactions">View all</Link>
          </div>

          {loading ? (
            <p>Loading activity...</p>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((item) => (
              <div className="activity-row" key={item.id}>
                <span
                  className={
                    item.type === "Returned"
                      ? "activity-icon returned"
                      : "activity-icon"
                  }
                >
                  {item.type === "Returned" ? "↙" : "↗"}
                </span>

                <div>
                  <strong>
                    {item.type === "Returned" ? "Book returned" : "Book borrowed"}
                  </strong>
                  <p>
                    {item.book} · {item.member}
                  </p>
                </div>

                <small>{formatDate(item.transaction_date)}</small>
              </div>
            ))
          ) : (
            <p>No recent activity yet.</p>
          )}
        </div>

        <div className="dashboard-panel stock-panel">
          <div className="panel-heading">
            <h3>Low Stock Alert</h3>
            <span className="alert-count">
              {loading ? "..." : `${lowStockBooks.length} books`}
            </span>
          </div>

          {loading ? (
            <p>Loading stock...</p>
          ) : lowStockBooks.length > 0 ? (
            lowStockBooks.map((book) => (
              <div className="stock-item" key={book.id}>
                <div>
                  <strong>{book.title}</strong>
                  <p>{book.author}</p>
                </div>
                <span>
                  {book.quantity} left
                </span>
              </div>
            ))
          ) : (
            <p>All books have sufficient stock.</p>
          )}

          <Link to="/books" className="stock-link">
            Manage book stock →
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
