import { FC, useState } from 'react';
import { Trash2, Clock, Brain } from 'lucide-react';
import { SavedScanSummary } from '../hooks/useSavedScans';
import { Badge } from '../../../libs/components/Badge';
import strings from '../strings.json';

interface SavedScanCardProps {
    scan: SavedScanSummary;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
}

export const SavedScanCard: FC<SavedScanCardProps> = ({ scan, onView, onDelete }) => {
    const [isConfirming, setIsConfirming] = useState(false);

    const formattedDate = new Date(scan.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isConfirming) {
            onDelete(scan.id);
            setIsConfirming(false);
        } else {
            setIsConfirming(true);
        }
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirming(false);
    };

    return (
        <div className="saved-scan-card glass-panel" onClick={() => onView(scan.id)}>
            <div className="saved-scan-thumbnail">
                <img src={scan.thumbnail_url} alt={`${scan.scan_type} scan`} />
            </div>

            <div className="saved-scan-info">
                <div className="saved-scan-header">
                    <Badge variant={scan.scan_type === 'crl' ? 'crl' : 'nt'}>
                        {scan.scan_type.toUpperCase()}
                    </Badge>
                    <span className="saved-scan-detections">
                        {scan.detection_count} {strings["savedScans.card.detections"]}
                    </span>
                </div>

                <div className="saved-scan-meta">
                    <span className="saved-scan-model">
                        <Brain size={12} />
                        {scan.best_model_name}
                    </span>
                    <span className="saved-scan-date">
                        <Clock size={12} />
                        {formattedDate}
                    </span>
                </div>
            </div>

            <div className="saved-scan-actions" onClick={e => e.stopPropagation()}>
                {isConfirming ? (
                    <div className="delete-confirm-row">
                        <button className="btn-delete-confirm" onClick={handleDeleteClick}>
                            {strings["savedScans.card.delete"]}
                        </button>
                        <button className="btn-delete-cancel" onClick={handleCancelDelete}>
                            ✕
                        </button>
                    </div>
                ) : (
                    <button className="btn-icon-delete" onClick={handleDeleteClick} title={strings["savedScans.card.delete"]}>
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};
