
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">B</div>
        <div>
          <h2>BookHaven</h2>
          <span>LIBRARY SPACE</span>
        </div>
      </div>

      <p className="menu-label">MAIN MENU</p>

      <nav className="side-menu">
        <NavLink to="/" end>
          <span>⌂</span> Dashboard
        </NavLink>

        <NavLink to="/books">
          <span>▤</span> Books
        </NavLink>

        <NavLink to="/transactions">
          <span>⇄</span> Transactions
        </NavLink>

        <NavLink to="/users">
          <span>♙</span> Members
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span>✦</span>
          <p>A little reading goes a long way.</p>
        </div>
        <p>BOOKHAVEN © 2026</p>
      </div>
    </aside>
  );
}

export default Sidebar;
