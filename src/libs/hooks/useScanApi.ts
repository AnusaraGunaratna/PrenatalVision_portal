import { useState, useCallback } from 'react';
import apiClient from '../services/api.client';

export interface Detection {
    class_name: string;
    confidence: number;
    bbox: number[];
    source_model: string;
}

export interface ScanResponse {
    scan_id: string;
    scan_type: string;
    original_image_base64: string;
    enhanced_image_base64: string;
    detections: Detection[];
    measurements: Record<string, BiometricMeasurement>;
    annotated_image_base64: string;
    models_comparison: ModelResult[];
    calibration_ratio: number;
    processed_at: string;
}

export interface ModelResult {
    model_name: string;
    detections: Detection[];
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

    const downloadReport = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response: any = await apiClient.get(`/saved-scans/${id}/report`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PrenatalVision_Report_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            setError(err.message || 'Failed to download report.');
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

    return { analyzeScan, downloadReport, isLoading, error, data, reset };
};
