import { useState, useCallback } from 'react';
import apiClient from '../../../libs/services/api.client';

interface SaveScanState {
    isSaving: boolean;
    isSaved: boolean;
    saveError: string | null;
    savedId: string | null;
}

export const useSaveScan = () => {
    const [state, setState] = useState<SaveScanState>({
        isSaving: false,
        isSaved: false,
        saveError: null,
        savedId: null,
    });

    const saveScan = useCallback(async (scanData: Record<string, unknown>) => {
        setState({ isSaving: true, isSaved: false, saveError: null, savedId: null });
        try {
            const response: any = await apiClient.post('/saved-scans', scanData);
            const id = response.data.id;
            setState({ isSaving: false, isSaved: true, saveError: null, savedId: id });
            return id;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save scan';
            setState({ isSaving: false, isSaved: false, saveError: message, savedId: null });
            throw err;
        }
    }, []);

    const resetSaveState = useCallback(() => {
        setState({ isSaving: false, isSaved: false, saveError: null, savedId: null });
    }, []);

    return { ...state, saveScan, resetSaveState };
};
