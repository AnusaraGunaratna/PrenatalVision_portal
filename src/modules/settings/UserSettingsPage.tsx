import { FC } from 'react';
import { User, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../../libs/context/AuthContext';
import { GlassPanel } from '../../libs/components/GlassPanel';
import strings from './strings.json';

export const UserSettingsPage: FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>{strings["settings.title"]}</h1>
                <p>{strings["settings.subtitle"]}</p>
            </div>

            <GlassPanel className="settings-card">
                <div className="settings-avatar">
                    <User size={40} />
                </div>

                <div className="settings-info">
                    <div className="settings-row">
                        <User size={16} className="settings-icon" />
                        <div>
                            <span className="settings-label">{strings["settings.label.name"]}</span>
                            <span className="settings-value">{user?.fullName || '-'}</span>
                        </div>
                    </div>

                    <div className="settings-row">
                        <Mail size={16} className="settings-icon" />
                        <div>
                            <span className="settings-label">{strings["settings.label.email"]}</span>
                            <span className="settings-value">{user?.email || '-'}</span>
                        </div>
                    </div>
                </div>

                <button className="btn btn-danger settings-logout" onClick={logout}>
                    <LogOut size={16} />
                    {strings["settings.button.logout"]}
                </button>
            </GlassPanel>
        </div>
    );
};
