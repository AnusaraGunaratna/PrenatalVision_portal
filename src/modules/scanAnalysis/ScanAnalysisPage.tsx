import { useState, useCallback } from "react";
import {
  Activity,
  ShieldCheck,
  Ruler,
  RefreshCw,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { useScanApi } from "../../libs/hooks/useScanApi";
import { Button } from "../../libs/components/Button";
import { GlassPanel } from "../../libs/components/GlassPanel";
import { Badge } from "../../libs/components/Badge";
import { MetricItem } from "../../libs/components/MetricItem";
import { UploadZone } from "../../libs/components/UploadZone";
import { ModeSelector } from "../../libs/components/ModeSelector";
import { LoadingPortal } from "../../libs/components/LoadingPortal";
import { ErrorBanner } from "../../libs/components/ErrorBanner";
import { FloatingActionButton } from "../../libs/components/FloatingActionButton";
import { AbbreviationsPanel } from "../../libs/components/AbbreviationsPanel";
import { ImageAnalysisFlow } from "./components/ImageAnalysisFlow";
import { ModelComparisonTable } from "./components/ModelComparisonTable";
import { SaveConfirmDialog } from "./components/SaveConfirmDialog";
import { useSaveScan } from "./hooks/useSaveScan";
import strings from "./strings.json";

type ScanMode = "CRL" | "NT" | "AUTO";

const STRUCTURE_NAMES: Record<string, string> = {
  MX: "Maxilla",
  MDS: "Mid-Diaphysis",
  MLS: "Mid-Lumbar Spine",
  LV: "Lateral Ventricle",
  H: "Head",
  G: "Gestational Sac",
  C: "Chorion",
  AB: "Abdominal Wall",
  B: "Buttocks",
  RBP: "Retrobulbar Periorbital",
  DP: "Diencephalic/Prosencephalic",
  NTAPS: "NT Alignment/Position",
  NB: "Nasal Bone",
  NT: "Nuchal Translucency",
  CRL: "Crown-Rump Length",
};

const getFullName = (abbrev: string): string =>
  STRUCTURE_NAMES[abbrev] || abbrev;

export const ScanAnalysisPage = () => {
  const { analyzeScan, isLoading, error, data, reset } = useScanApi();
  const { saveScan, isSaving, isSaved, resetSaveState } = useSaveScan();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>("CRL");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showAbbreviations, setShowAbbreviations] = useState(false);

  const toggleAbbreviations = useCallback(() => {
    setShowAbbreviations((prev) => !prev);
  }, []);

  const closeAbbreviations = useCallback(() => {
    setShowAbbreviations(false);
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    reset();
    resetSaveState();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    try {
      await analyzeScan(selectedFile, scanMode.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    if (data && !isSaved) {
      setShowSaveConfirm(true);
      return;
    }
    forceReset();
  };

  const forceReset = () => {
    setSelectedFile(null);
    setPreview(null);
    reset();
    resetSaveState();
    setShowSaveConfirm(false);
  };

  const handleSave = async () => {
    if (!data) return;

    const bestModel = data.models_comparison.find(
      (m) => m.model_name === data.best_model_name,
    );
    if (!bestModel) return;

    try {
      await saveScan({
        scan_type: data.scan_type,
        original_image_base64: data.original_image_base64,
        enhanced_image_base64: data.enhanced_image_base64,
        annotated_image_base64: bestModel.annotated_image_base64,
        best_model_name: data.best_model_name,
        best_model_measurements: data.best_model_measurements,
        detections: bestModel.detections,
        models_comparison: data.models_comparison.map((m) => ({
          model_name: m.model_name,
          detections: m.detections,
          measurements: m.measurements,
        })),
        additional_detections: data.additional_detections || [],
        additional_measurements: data.additional_measurements || {},
        additional_annotated_image_base64:
          data.additional_annotated_image_base64 || "",
        calibration_ratio: data.models_comparison[0]?.measurements?.length_mm
          ? undefined
          : null,
      });
    } catch (err) {
      console.error("Failed to save scan:", err);
    }
  };

  const bestModel = data?.models_comparison.find(
    (m) => m.model_name === data.best_model_name,
  );
  const bestAnnotatedImage = bestModel?.annotated_image_base64 || "";
  const combinedAnnotatedImage =
    data?.additional_annotated_image_base64 || bestAnnotatedImage;

  const allStructures = data
    ? [
        ...new Set(
          data.models_comparison.flatMap((m) =>
            m.detections.map((d) => d.class_name),
          ),
        ),
      ]
    : [];

  const measurements =
    data?.best_model_measurements || bestModel?.measurements || {};

  const MIN_DETECTIONS = 4;
  const insufficientDetections =
    data && bestModel ? bestModel.detections.length < MIN_DETECTIONS : false;

  return (
    <>
      {!data && !isLoading && (
        <div className="upload-container">
          <UploadZone onFileSelect={handleFileSelect} />

          {selectedFile && (
            <div className="scan-action-bar anim-slide-in">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="scan-action-preview"
                />
              )}
              <div className="scan-action-file-info">
                <h4 title={selectedFile.name}>{selectedFile.name}</h4>
                <p>{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>

              <div className="scan-action-divider" />

              <ModeSelector mode={scanMode} onModeChange={setScanMode} />

              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="analyze-btn"
              >
                <Activity size={20} />
                {strings["scan.button.analyze"]}
              </Button>
            </div>
          )}
        </div>
      )}

      {isLoading && <LoadingPortal />}

      {error && <ErrorBanner message={error} />}

      {data && !isLoading && insufficientDetections && (
        <div className="insufficient-quality anim-fade-in">
          <GlassPanel className="insufficient-quality-card">
            <AlertTriangle size={48} className="warning-icon" />
            <h2>{strings["scan.quality.title"]}</h2>
            <p>
              {strings["scan.quality.detectedPrefix"]}
              <strong>{bestModel?.detections.length ?? 0}</strong>
              {strings["scan.quality.detectedSuffix"]}
              <strong>{MIN_DETECTIONS}</strong>
              {strings["scan.quality.detectedEnd"]}
            </p>
            <p className="hint-text">{strings["scan.quality.hint"]}</p>
            <Button onClick={forceReset} className="retry-btn">
              <RefreshCw size={18} /> {strings["scan.quality.retry"]}
            </Button>
          </GlassPanel>
        </div>
      )}

      {data && !isLoading && !insufficientDetections && (
        <div className="results-container anim-fade-in">
          <GlassPanel className="stat-card summary-measurements-card">
            <div className="summary-measurements-header">
              <div className="summary-left">
                <h2>
                  <ShieldCheck size={20} /> Analysis Summary
                </h2>
                <div className="summary-status-row">
                  <Badge variant={data.scan_type === "crl" ? "crl" : "nt"}>
                    {data.scan_type === "crl"
                      ? "Crown-Rump Length View"
                      : "Nuchal Translucency View"}
                  </Badge>
                </div>
                <div className="metrics-grid">
                  <MetricItem value={allStructures.length} label="Structures" />
                  <MetricItem
                    value={bestModel?.detections.length ?? 0}
                    label="Detections"
                  />
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-right">
                <h2>
                  <Ruler size={20} /> Biometric Measurements
                </h2>
                <div className="measurements-list">
                  {(() => {
                    const rows: {
                      label: string;
                      value: string;
                      approx?: boolean;
                    }[] = [];

                    Object.entries(measurements).forEach(([key, m]) => {
                      if (key === "Head") {
                        if (m.BPD_mm)
                          rows.push({
                            label: "Biparietal Diameter",
                            value: `${m.BPD_mm} mm`,
                          });
                        if (m.HC_mm)
                          rows.push({
                            label: "Head Circumference",
                            value: `${m.HC_mm} mm`,
                          });
                      } else if (key === "Abdomen") {
                        if (m.circumference_mm)
                          rows.push({
                            label: "Abdominal Circumference",
                            value: `${m.circumference_mm} mm`,
                          });
                      } else {
                        let val = "";
                        if (m.thickness_mm) val = `${m.thickness_mm} mm`;
                        else if (m.length_mm) val = `${m.length_mm} mm`;
                        if (val) {
                          const displayName =
                            key === "NT"
                              ? `${getFullName(key)} (NT)`
                              : getFullName(key);
                          rows.push({
                            label: displayName,
                            value: val,
                            approx: m.approximate,
                          });
                        }
                      }
                    });

                    return rows.length > 0 ? (
                      rows.map((r) => (
                        <div key={r.label} className="measurement-item">
                          <div className="m-label">
                            <strong>{r.label}</strong>
                          </div>
                          <div className="m-value">
                            {r.value}
                            {r.approx && (
                              <span
                                className="m-approx"
                                title="Estimated from bounding box, not caliper-based"
                              >
                                ~ approx
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--fs-base)",
                        }}
                      >
                        No biometric measurements available.
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Image Analysis Pipeline */}
          {combinedAnnotatedImage && (
            <ImageAnalysisFlow
              originalBase64={data.original_image_base64}
              enhancedBase64={data.enhanced_image_base64}
              annotatedBase64={combinedAnnotatedImage}
              bestModelName={data.best_model_name}
              detections={bestModel?.detections || []}
              additionalDetections={data.additional_detections || []}
            />
          )}

          {/* Model Comparison Analytics */}
          <ModelComparisonTable
            modelsComparison={data.models_comparison}
            bestModelName={data.best_model_name}
          />
        </div>
      )}

      {(data || selectedFile) && !isLoading && (
        <FloatingActionButton
          variant="default"
          size="md"
          className="fab-pos-1"
          onClick={handleReset}
        >
          <RefreshCw size={16} />
          New Analysis
        </FloatingActionButton>
      )}

      {data && !isLoading && !insufficientDetections && (
        <>
          <FloatingActionButton
            variant="save"
            size="md"
            isActive={isSaved}
            className="fab-pos-2"
            onClick={handleSave}
            disabled={isSaving || isSaved}
          >
            <ShieldCheck size={16} />
            {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Scan"}
          </FloatingActionButton>

          <FloatingActionButton
            variant="success"
            size="md"
            className="fab-pos-3"
            onClick={toggleAbbreviations}
          >
            <BookOpen size={16} />
            Abbreviations
          </FloatingActionButton>

          <AbbreviationsPanel
            structures={STRUCTURE_NAMES}
            isOpen={showAbbreviations}
            onClose={closeAbbreviations}
          />
        </>
      )}

      {showSaveConfirm && (
        <SaveConfirmDialog
          isSaving={isSaving}
          onSaveAndContinue={async () => {
            await handleSave();
            forceReset();
          }}
          onDiscard={forceReset}
          onCancel={() => setShowSaveConfirm(false)}
        />
      )}
    </>
  );
};
