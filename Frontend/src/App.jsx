
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";
import Dashboard from "./Pages/Dashboard";
import Books from "./Pages/Books";
import Transactions from "./Pages/Transactions";
import Users from "./Pages/Users";
import Login from "./Pages/login";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    sessionStorage.getItem("bookhavenLoggedIn") === "true"
  );

  function handleLogin() {
    sessionStorage.setItem("bookhavenLoggedIn", "true");
    setLoggedIn(true);
  }

  return (
    <BrowserRouter>
      {!loggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Navbar />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/users" element={<Users />} />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
