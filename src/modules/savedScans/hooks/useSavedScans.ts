import { useState, useCallback, useEffect } from 'react';
import apiClient from '../../../libs/services/api.client';

export interface SavedScanSummary {
    id: string;
    scan_type: string;
    thumbnail_url: string;
    best_model_name: string;
    detection_count: number;
    created_at: string;
}

export interface SavedScanDetailData {
    id: string;
    scan_type: string;
    original_image_url: string;
    enhanced_image_url: string;
    annotated_image_url: string;
    best_model_name: string;
    measurements: Record<string, Record<string, unknown>>;
    detections: Array<{
        class_name: string;
        confidence: number;
        bbox: number[];
    }>;
    models_comparison: Array<{
        modelName: string;
        detectionCount: number;
        measurements: Record<string, Record<string, unknown>>;
        detections: Array<{
            class_name: string;
            confidence: number;
            bbox: number[];
        }>;
    }>;
    calibration_ratio: number;
    additional_detections?: Array<{
        class_name: string;
        confidence: number;
        bbox: number[];
        source_model: string;
    }>;
    additional_measurements?: Record<string, Record<string, unknown>>;
    additional_annotated_image_url?: string;
    created_at: string;
}

export const useSavedScans = () => {
    const [scans, setScans] = useState<SavedScanSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchScans = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response: Record<string, unknown> = await apiClient.get('/saved-scans');
            setScans((response as { data: SavedScanSummary[] }).data || []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load saved scans';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteScan = useCallback(async (id: string) => {
        try {
            await apiClient.delete(`/saved-scans/${id}`);
            setScans(prev => prev.filter(s => s.id !== id));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete scan';
            setError(message);
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchScans();
    }, [fetchScans]);

    return { scans, isLoading, error, deleteScan, refetch: fetchScans };
};

export const useSavedScanDetail = (id: string | undefined) => {
    const [data, setData] = useState<SavedScanDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response: Record<string, unknown> = await apiClient.get(`/saved-scans/${id}`);
                setData((response as { data: SavedScanDetailData }).data || null);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to load scan details';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return { data, isLoading, error };
};
