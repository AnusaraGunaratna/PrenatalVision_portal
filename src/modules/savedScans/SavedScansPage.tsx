import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { useSavedScans } from './hooks/useSavedScans';
import { SavedScanCard } from './components/SavedScanCard';
import { GlassPanel } from '../../libs/components/GlassPanel';
import { LoadingPortal } from '../../libs/components/LoadingPortal';
import { ErrorBanner } from '../../libs/components/ErrorBanner';
import strings from './strings.json';

export const SavedScansPage: FC = () => {
    const { scans, isLoading, error, deleteScan } = useSavedScans();
    const navigate = useNavigate();

    const handleView = (id: string) => {
        navigate(`/saved-scans/${id}`);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteScan(id);
        } catch {
            /////
        }
    };

    if (isLoading) return <LoadingPortal />;

    return (
        <div className="saved-scans-container">
            <div className="saved-scans-header">
                <h1>{strings["savedScans.title"]}</h1>
                <p>{strings["savedScans.subtitle"]}</p>
            </div>

            {error && <ErrorBanner message={error} />}

            {scans.length === 0 && !error ? (
                <GlassPanel className="saved-scans-empty">
                    <FolderOpen size={48} className="empty-icon" />
                    <h3>{strings["savedScans.empty.title"]}</h3>
                    <p>{strings["savedScans.empty.message"]}</p>
                </GlassPanel>
            ) : (
                <div className="saved-scans-grid">
                    {scans.map(scan => (
                        <SavedScanCard
                            key={scan.id}
                            scan={scan}
                            onView={handleView}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
