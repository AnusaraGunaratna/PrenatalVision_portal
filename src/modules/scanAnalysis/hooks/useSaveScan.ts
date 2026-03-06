import { useState, useCallback } from 'react';
import apiClient from '../../../libs/services/api.client';

interface SaveScanState {
    isSaving: boolean;
    isSaved: boolean;
    saveError: string | null;
}

export const useSaveScan = () => {
    const [state, setState] = useState<SaveScanState>({
        isSaving: false,
        isSaved: false,
        saveError: null,
    });

    const saveScan = useCallback(async (scanData: Record<string, unknown>) => {
        setState({ isSaving: true, isSaved: false, saveError: null });
        try {
            await apiClient.post('/saved-scans', scanData);
            setState({ isSaving: false, isSaved: true, saveError: null });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save scan';
            setState({ isSaving: false, isSaved: false, saveError: message });
            throw err;
        }
    }, []);

    const resetSaveState = useCallback(() => {
        setState({ isSaving: false, isSaved: false, saveError: null });
    }, []);

    return { ...state, saveScan, resetSaveState };
};
