import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { Scan, FolderOpen, Settings } from 'lucide-react';
import strings from './NavigationBar.strings.json';

interface NavigationBarProps {
    userName: string;
}

export const NavigationBar: FC<NavigationBarProps> = ({ userName }) => {
    return (
        <nav className="nav-bar">
            <div className="nav-brand">
                <h1 className="nav-logo">{strings["nav.logo"]}</h1>
            </div>

            <div className="nav-links">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                >
                    <Scan size={16} />
                    {strings["nav.link.newScan"]}
                </NavLink>

                <NavLink
                    to="/saved-scans"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                >
                    <FolderOpen size={16} />
                    {strings["nav.link.savedScans"]}
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                >
                    <Settings size={16} />
                    {strings["nav.link.settings"]}
                </NavLink>
            </div>

            <div className="nav-user">
                <span className="nav-user-name">{userName}</span>
            </div>
        </nav>
    );
};
