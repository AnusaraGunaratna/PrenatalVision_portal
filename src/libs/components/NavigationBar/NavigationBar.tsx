import { FC, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { Scan, FolderOpen, Settings, Menu, X } from "lucide-react";
import strings from "./NavigationBar.strings.json";

interface NavigationBarProps {
  userName: string;
}

export const NavigationBar: FC<NavigationBarProps> = ({ userName }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <img
          src="/logo.png"
          alt="PrenatalVision Logo"
          className="nav-brand-logo"
        />
        <h1 className="nav-logo">{strings["nav.logo"]}</h1>
      </div>

      <div className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link-active" : ""}`
          }
        >
          <Scan size={16} />
          {strings["nav.link.newScan"]}
        </NavLink>

        <NavLink
          to="/saved-scans"
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link-active" : ""}`
          }
        >
          <FolderOpen size={16} />
          {strings["nav.link.savedScans"]}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link-active" : ""}`
          }
        >
          <Settings size={16} />
          {strings["nav.link.settings"]}
        </NavLink>
      </div>

      <div className="nav-right">
        <span className="nav-user-name">{userName}</span>

        <button
          className="nav-hamburger"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile-menu anim-slide-down">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-mobile-link ${isActive ? "nav-mobile-link-active" : ""}`
            }
            onClick={closeMenu}
          >
            <Scan size={18} />
            {strings["nav.link.newScan"]}
          </NavLink>

          <NavLink
            to="/saved-scans"
            className={({ isActive }) =>
              `nav-mobile-link ${isActive ? "nav-mobile-link-active" : ""}`
            }
            onClick={closeMenu}
          >
            <FolderOpen size={18} />
            {strings["nav.link.savedScans"]}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-mobile-link ${isActive ? "nav-mobile-link-active" : ""}`
            }
            onClick={closeMenu}
          >
            <Settings size={18} />
            {strings["nav.link.settings"]}
          </NavLink>
        </div>
      )}
    </nav>
  );
};
