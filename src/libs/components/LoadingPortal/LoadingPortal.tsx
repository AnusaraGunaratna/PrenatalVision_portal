import { FC } from 'react';
import { Microscope } from 'lucide-react';

interface LoadingPortalProps {
    message?: string;
}

export const LoadingPortal: FC<LoadingPortalProps> = ({ message = "Loading..." }) => (
    <div className="loading-portal">
        <div className="pulse-ring anim-pulse">
            <Microscope size={40} style={{ color: 'var(--primary)' }} />
        </div>
        <p className="loading-text">{message}</p>
    </div>
);
