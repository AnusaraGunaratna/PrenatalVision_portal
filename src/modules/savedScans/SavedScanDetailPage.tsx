import { FC, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Ruler, List, BookOpen } from "lucide-react";
import { useSavedScanDetail } from "./hooks/useSavedScans";
import { GlassPanel } from "../../libs/components/GlassPanel";
import { Badge } from "../../libs/components/Badge";
import { LoadingPortal } from "../../libs/components/LoadingPortal";
import { ErrorBanner } from "../../libs/components/ErrorBanner";
import { FloatingActionButton } from "../../libs/components/FloatingActionButton";
import { AbbreviationsPanel } from "../../libs/components/AbbreviationsPanel";
import { ImageAnalysisFlow } from "../scanAnalysis/components/ImageAnalysisFlow";
import { ModelComparisonTable } from "../scanAnalysis/components/ModelComparisonTable";
import strings from "./strings.json";

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

export const SavedScanDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useSavedScanDetail(id);
  const [showAbbreviations, setShowAbbreviations] = useState(false);

  const toggleAbbreviations = useCallback(() => {
    setShowAbbreviations((prev) => !prev);
  }, []);

  const closeAbbreviations = useCallback(() => {
    setShowAbbreviations(false);
  }, []);

  if (isLoading) return <LoadingPortal />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  const formattedDate = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const measurements = data.measurements || {};
  const allStructures = [...new Set((data.detections ?? []).map((d) => d.class_name))];

  return (
    <div className="saved-detail-container">
      <button
        className="btn btn-secondary saved-detail-back"
        onClick={() => navigate("/saved-scans")}
      >
        <ArrowLeft size={16} />
        {strings["savedScans.detail.back"]}
      </button>

      <div className="saved-detail-header">
        <div>
          <h1>{strings["savedScans.detail.title"]}</h1>
          <p>
            {strings["savedScans.detail.scannedOn"]} {formattedDate}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Badge variant={data.scan_type === "crl" ? "crl" : "nt"}>
            {data.scan_type.toUpperCase()}
          </Badge>
          <span className="badge badge-nt">
            {data.detections?.length ?? 0} Detections
          </span>
        </div>
      </div>

      {/* Analysis Pipeline Images */}
      {data.annotated_image_url && (
        <ImageAnalysisFlow
          originalBase64={data.original_image_url}
          enhancedBase64={data.enhanced_image_url}
          annotatedBase64={data.annotated_image_url}
          detections={data.detections ?? []}
        />
      )}

      {/* Measurements */}
      <div className="results-header-grid">
        <GlassPanel className="stat-card">
          <h2>
            <Ruler size={20} /> {strings["savedScans.detail.measurements"]}
          </h2>
          <div className="measurements-list">
            {Object.keys(measurements).length > 0 ? (
              Object.entries(measurements).map(([key, value]) => {
                const v = value as Record<string, unknown>;
                let measureText = "";
                if (v.thickness_mm) measureText = `${v.thickness_mm} mm`;
                else if (v.length_mm) measureText = `${v.length_mm} mm`;
                else if (v.length_cm) measureText = `${v.length_cm} cm`;
                else if (v.dimension_mm) measureText = String(v.dimension_mm);
                else if (v.BPD_mm) measureText = `BPD: ${v.BPD_mm}mm`;
                if (v.HC_mm) measureText += ` HC: ${v.HC_mm}mm`;

                return (
                  <div key={key} className="measurement-item">
                    <div className="m-label">
                      <strong>{key}</strong>
                      <span className="m-fullname">({getFullName(key)})</span>
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
                {strings["savedScans.detail.noMeasurements"]}
              </p>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Detected Structures */}
      {allStructures.length > 0 && (
        <GlassPanel className="stat-card">
          <h2>
            <List size={20} /> {strings["savedScans.detail.structures"]}
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
                  <span className="block-name">{getFullName(structName)}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      )}

      {/* Model Comparison */}
      {(data.models_comparison ?? []).length > 0 && (
        <ModelComparisonTable
          modelsComparison={(data.models_comparison ?? []).map((m) => ({
            model_name: m.modelName,
            detections: m.detections,
            measurements: m.measurements,
            metrics: {
              detection_count: m.detectionCount,
              average_confidence: 0,
              highest_confidence: 0,
              lowest_confidence: 0,
              execution_time_ms: 0,
            },
            annotated_image_base64: "",
          }))}
        />
      )}

      <FloatingActionButton
        variant="success"
        size="md"
        className="fab-pos-1"
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
    </div>
  );
};
