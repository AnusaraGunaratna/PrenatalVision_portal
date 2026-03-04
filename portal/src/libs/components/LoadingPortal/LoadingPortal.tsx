import { FC } from 'react';
import { Microscope } from 'lucide-react';

export const LoadingPortal: FC = () => (
    <div className="loading-portal">
        <div className="pulse-ring anim-pulse">
            <Microscope size={40} style={{ color: 'var(--primary)' }} />
        </div>
        <p className="loading-text">Analyzing ultrasound image...</p>
    </div>
);
