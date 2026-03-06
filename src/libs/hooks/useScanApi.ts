import { useState, useCallback } from 'react';
import apiClient from '../services/api.client';

export interface ScanResponse {
    scan_id: string;
    scan_type: string;
    original_image_base64: string;
    enhanced_image_base64: string;
    models_comparison: ModelResult[];
    best_model_name: string;
    best_model_measurements: Record<string, BiometricMeasurement>;
}

export interface ModelResult {
    model_name: string;
    detections: any[];
    measurements: Record<string, BiometricMeasurement>;
    annotated_image_base64: string;
}

export interface BiometricMeasurement {
    dimension_mm?: string;
    thickness_mm?: number;
    length_cm?: number;
    length_mm?: number;
    distance_px?: number;
    BPD_mm?: number;
    HC_mm?: number;
    circumference_mm?: number;
    confidence?: number;
    approximate?: boolean;
}

export const useScanApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ScanResponse | null>(null);

    const analyzeScan = useCallback(async (file: File, scanType: string, gaWeeks?: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('scan_type', scanType);
            if (gaWeeks) {
                formData.append('ga_weeks', gaWeeks.toString());
            }

            const response: any = await apiClient.post('/scans/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setData(response.data);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'An error occurred during analysis.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return { analyzeScan, isLoading, error, data, reset };
};
