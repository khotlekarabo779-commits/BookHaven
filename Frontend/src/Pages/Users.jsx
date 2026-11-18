
import { useState, useEffect } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    membershipId: "",
    role: "Member",
  });

  // Load members from MySQL
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("http://localhost:5000/users");

        if (!response.ok) {
          throw new Error("Could not load members.");
        }

        const data = await response.json();

        const formattedUsers = data.map((user) => ({
          ...user,
          membershipId: user.membership_id,
        }));

        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error loading members:", error);
        alert("Could not connect to the members database.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      phone: "",
      membershipId: "",
      role: "Member",
    });

    setEditingId(null);
    setShowForm(false);
  }

  // Register or update a member
  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.membershipId.trim()
    ) {
      alert("Please complete all fields.");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/users/${editingId}`
        : "http://localhost:5000/users";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Could not save member.");
      }

      if (editingId) {
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === editingId
              ? { ...form, id: editingId }
              : user
          )
        );

        alert("Member updated successfully!");
      } else {
        const newUser = {
          ...form,
          id: result.id,
        };

        setUsers((currentUsers) => [newUser, ...currentUsers]);

        alert("Member registered successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving member:", error);
      alert(error.message);
    }
  }

  // Open the form to edit a member
  function editUser(user) {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      membershipId: user.membershipId,
      role: user.role,
    });

    setEditingId(user.id);
    setShowForm(true);
  }

  // Delete a member
  async function deleteUser(id) {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/users/${id}`,
          { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || result.error || "Could not delete member.");
        }

        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.id !== id)
        );

        alert("Member deleted successfully!");
      } catch (error) {
        console.error("Error deleting member:", error);
        alert(error.message);
      }
    }
  }

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.membershipId}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="users-page">
      <div className="users-heading">
        <div>
          <p className="eyebrow">MEMBER DIRECTORY</p>
          <h1>Library Members</h1>
          <p>Manage registered members and their accounts.</p>
        </div>

        <button
          className="add-book-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Member
        </button>
      </div>

      <div className="user-summary">
        <div>
          <span>Total Members</span>
          <strong>{users.length}</strong>
        </div>

        <div>
          <span>Librarians</span>
          <strong>
            {users.filter((user) => user.role === "Librarian").length}
          </strong>
        </div>

        <div>
          <span>Regular Members</span>
          <strong>
            {users.filter((user) => user.role === "Member").length}
          </strong>
        </div>
      </div>

      {showForm && (
        <form className="user-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Member" : "Register New Member"}</h2>

          <div className="user-form-grid">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <input
              name="membershipId"
              placeholder="Membership ID"
              value={form.membershipId}
              onChange={handleChange}
              required
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="Member">Member</option>
              <option value="Librarian">Librarian</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="add-book-btn">
              {editingId ? "Save Changes" : "Register Member"}
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
            <h2>Registered Members</h2>
            <p>All members in the library</p>
          </div>

          <input
            className="search-input"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-scroll">
          <table className="books-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>MEMBERSHIP ID</th>
                <th>ROLE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading members...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.membershipId}</td>
                    <td>{user.role}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => editUser(user)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;
