
function Navbar() {
  return (
    <header className="topbar">
      <div>
        <p className="topbar-label">YOUR READING COMMUNITY</p>
        <h3>Library Management</h3>
      </div>

      <div className="topbar-right">
        <div className="online-status">
          <span></span> System Online
        </div>

        <div className="admin-profile">
          <div className="avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>Library Admin</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
