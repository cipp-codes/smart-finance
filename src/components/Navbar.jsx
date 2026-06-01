import { Link } from "react-router-dom";
import { useState } from "react";

import { HiOutlineBars3 } from "react-icons/hi2";
import { HiOutlineXMark } from "react-icons/hi2";
import { Wallet } from "lucide-react";

import "../styles/navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <Wallet size={28} />
        </div>

        <h1>Smart Finance</h1>
      </div>

      {/* BURGER */}

      <button className="menu-btn" onClick={() => setOpen(!open)}>
        {open ? <HiOutlineXMark /> : <HiOutlineBars3 />}
      </button>

      {/* MENU */}

      <ul className={open ? "nav-links active" : "nav-links"}>
        <li>
          <Link to="/">Dashboard</Link>
        </li>

        <li>
          <Link to="/transactions">Transactions</Link>
        </li>

        <li>
          <Link to="/goals">Goals</Link>
        </li>

        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
