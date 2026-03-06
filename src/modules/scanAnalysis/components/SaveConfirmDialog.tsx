import { FC } from 'react';
import { GlassPanel } from '../../../libs/components/GlassPanel';
import strings from './SaveConfirmDialog.strings.json';

interface SaveConfirmDialogProps {
    onSaveAndContinue: () => void;
    onDiscard: () => void;
    onCancel: () => void;
    isSaving: boolean;
}

export const SaveConfirmDialog: FC<SaveConfirmDialogProps> = ({
    onSaveAndContinue,
    onDiscard,
    onCancel,
    isSaving,
}) => {
    return (
        <div className="dialog-overlay" onClick={onCancel}>
            <GlassPanel
                className="dialog-card anim-slide-in"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <h3 className="dialog-title">{strings["dialog.title"]}</h3>
                <p className="dialog-message">{strings["dialog.message"]}</p>

                <div className="dialog-actions">
                    <button
                        className="btn btn-primary"
                        onClick={onSaveAndContinue}
                        disabled={isSaving}
                    >
                        {isSaving ? strings["dialog.button.saving"] : strings["dialog.button.save"]}
                    </button>
                    <button className="btn btn-secondary" onClick={onDiscard}>
                        {strings["dialog.button.discard"]}
                    </button>
                    <button className="btn btn-secondary" onClick={onCancel}>
                        {strings["dialog.button.cancel"]}
                    </button>
                </div>
            </GlassPanel>
        </div>
    );
};
