import { useState } from "react";
import {
  Activity,
  ShieldCheck,
  Ruler,
  Info,
  RefreshCw,
  List,
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
import { StepVisualizer } from "./components/StepVisualizer";
import { ModelComparisonTable } from "./components/ModelComparisonTable";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>("CRL");

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    reset();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    try {
      const scanType = scanMode === "AUTO" ? "crl" : scanMode.toLowerCase();
      await analyzeScan(selectedFile, scanType);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    reset();
  };

  // Derive best model data
  const bestModel = data?.models_comparison.find(
    (m) => m.model_name === data.best_model_name,
  );
  const bestAnnotatedImage = bestModel?.annotated_image_base64 || "";

  // Collect all unique structure names from detections
  const allStructures = data
    ? [
        ...new Set(
          data.models_comparison.flatMap((m) =>
            m.detections.map((d) => d.class_name),
          ),
        ),
      ]
    : [];

  // Build measurements display
  const measurements =
    data?.best_model_measurements || bestModel?.measurements || {};

  return (
    <>
      <header className="header">
        <h1>PrenatalVision</h1>
        <p>{strings["scan.subtitle"]}</p>
      </header>

      {/* ── Upload State ── */}
      {!data && !isLoading && (
        <div className="upload-container">
          <ModeSelector mode={scanMode} onModeChange={setScanMode} />

          <UploadZone onFileSelect={handleFileSelect} />

          {selectedFile && (
            <GlassPanel className="preview-card anim-slide-in">
              {preview && (
                <img src={preview} alt="Preview" className="preview-img" />
              )}
              <div className="preview-info">
                <h4>{selectedFile.name}</h4>
                <p>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                <Button onClick={handleAnalyze} disabled={isLoading}>
                  <Activity size={20} />
                  {strings["scan.button.analyze"]}
                </Button>
              </div>
            </GlassPanel>
          )}
        </div>
      )}

      {isLoading && <LoadingPortal />}

      {error && <ErrorBanner message={error} />}

      {data && !isLoading && (
        <div className="results-container anim-fade-in">
          <div className="results-header-grid">
            <GlassPanel className="stat-card">
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
                <MetricItem
                  value={data.models_comparison.reduce(
                    (sum, m) => sum + m.detections.length,
                    0,
                  )}
                  label="Total Detections"
                />
                <MetricItem
                  value={allStructures.length}
                  label="Unique Structures"
                />
                <MetricItem
                  value={data.models_comparison.length}
                  label="Models Compared"
                />
              </div>
            </GlassPanel>

            <GlassPanel className="stat-card">
              <h2>
                <Ruler size={20} /> Biometric Measurements
              </h2>
              <div className="measurements-list">
                {Object.keys(measurements).length > 0 ? (
                  Object.entries(measurements).map(([key, value]) => {
                    let measureText = "";
                    if (value.thickness_mm)
                      measureText = `${value.thickness_mm} mm`;
                    else if (value.length_mm)
                      measureText = `${value.length_mm} mm`;
                    else if (value.length_cm)
                      measureText = `${value.length_cm} cm`;
                    else if (value.dimension_mm)
                      measureText = value.dimension_mm;
                    else if (value.BPD_mm)
                      measureText = `BPD: ${value.BPD_mm}mm`;
                    if (value.HC_mm) measureText += ` HC: ${value.HC_mm}mm`;

                    return (
                      <div key={key} className="measurement-item">
                        <div className="m-label">
                          <strong>{key}</strong>
                          <span className="m-fullname">
                            ({getFullName(key)})
                          </span>
                        </div>
                        <div className="m-value">{measureText || "-"}</div>
                      </div>
                    );
                  })
                ) : (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "var(--fs-base)",
                    }}
                  >
                    No biometric measurements available.
                  </p>
                )}
              </div>
            </GlassPanel>
          </div>

          {allStructures.length > 0 && (
            <GlassPanel className="stat-card">
              <h2>
                <List size={20} /> Detected Anatomical Structures
              </h2>
              <div className="block-table">
                <div className="block-table-header">
                  <span>Code</span>
                  <span>Structure Name</span>
                </div>
                <div className="block-table-body">
                  {allStructures.map((structName) => (
                    <div key={structName} className="block-table-row">
                      <span className="block-code">{structName}</span>
                      <span className="block-name">
                        {getFullName(structName)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Annotated Image Visualizer */}
          {bestAnnotatedImage && (
            <StepVisualizer
              bestModelName={data.best_model_name}
              detectedBase64={bestAnnotatedImage}
            />
          )}

          {/* Model Comparison Analytics */}
          <ModelComparisonTable
            modelsComparison={data.models_comparison}
            bestModelName={data.best_model_name}
          />

          {/* Footer */}
          <div className="system-info-footer">
            <div className="system-tag">
              <Info size={14} />
              {data.scan_type.toUpperCase()} Analysis Complete — Best Model:{" "}
              {data.best_model_name}
            </div>
          </div>
        </div>
      )}

      {(data || selectedFile) && !isLoading && (
        <button className="floating-reset" onClick={handleReset}>
          <RefreshCw size={20} />
          New Analysis
        </button>
      )}
    </>
  );
};
