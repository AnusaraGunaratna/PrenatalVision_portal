import { FC } from 'react';
import { Zap } from 'lucide-react';

type ScanMode = 'CRL' | 'NT' | 'AUTO';

interface Props {
    mode: ScanMode;
    onModeChange: (mode: ScanMode) => void;
}

const MODE_HINTS: Record<ScanMode, string> = {
    AUTO: 'Automatically detect the view type',
    CRL: 'Analyze as Crown-Rump Length view',
    NT: 'Analyze as Nuchal Translucency view',
};

export const ModeSelector: FC<Props> = ({ mode, onModeChange }) => (
    <div className="mode-selector">
        <div className="mode-buttons">
            <button
                className={`mode-btn ${mode === 'CRL' ? 'active' : ''}`}
                onClick={() => onModeChange('CRL')}
            >
                CRL View
            </button>
            <button
                className={`mode-btn ${mode === 'NT' ? 'active' : ''}`}
                onClick={() => onModeChange('NT')}
            >
                NT View
            </button>
            <button
                className={`mode-btn mode-auto ${mode === 'AUTO' ? 'active' : ''}`}
                onClick={() => onModeChange('AUTO')}
            >
                <Zap size={14} /> AUTO
            </button>
        </div>
        <p className="mode-hint">{MODE_HINTS[mode]}</p>
    </div>
);
