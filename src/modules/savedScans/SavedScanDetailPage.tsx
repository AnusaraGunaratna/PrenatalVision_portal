import { FC, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Ruler, BookOpen, FileText, RefreshCw } from "lucide-react";
import { useSavedScanDetail } from "./hooks/useSavedScans";
import { useScanApi } from "../../libs/hooks/useScanApi";
import { GlassPanel } from "../../libs/components/GlassPanel";
import { Badge } from "../../libs/components/Badge";
import { MetricItem } from "../../libs/components/MetricItem";
import { LoadingPortal } from "../../libs/components/LoadingPortal";
import { ErrorBanner } from "../../libs/components/ErrorBanner";
import { FloatingActionButton } from "../../libs/components/FloatingActionButton";
import { FABMobileMenu } from "../../libs/components/FloatingActionButton/FABMobileMenu";
import { AbbreviationsPanel } from "../../libs/components/AbbreviationsPanel";
import { ImageAnalysisFlow } from "../scanAnalysis/components/ImageAnalysisFlow";
import { ModelComparisonTable } from "../scanAnalysis/components/ModelComparisonTable";
import { getFullName } from "../../libs/constants/anatomy";
import strings from "./strings.json";

export const SavedScanDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useSavedScanDetail(id);
  const { downloadReport, isLoading: isDownloading } = useScanApi();
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
  const allStructures = [
    ...new Set((data.detections ?? []).map((d) => d.class_name)),
  ];

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

      <div className="results-container">
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
                  value={data.detections?.length ?? 0}
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

                  Object.entries(measurements).forEach(([key, value]) => {
                    const m = value as Record<string, unknown>;
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
                      else if (m.length_cm) val = `${m.length_cm} cm`;
                      else if (m.dimension_mm) val = String(m.dimension_mm);
                      if (val) {
                        const displayName =
                          key === "NT"
                            ? `${getFullName(key)} (NT)`
                            : getFullName(key);
                        rows.push({
                          label: displayName,
                          value: val,
                          approx: m.approximate as boolean | undefined,
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
                      {strings["savedScans.detail.noMeasurements"]}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Image Analysis Pipeline */}
        {data.annotated_image_url && (
          <ImageAnalysisFlow
            originalBase64={data.original_image_url}
            enhancedBase64={data.enhanced_image_url}
            annotatedBase64={data.annotated_image_url}
            detections={data.detections ?? []}
          />
        )}

        {/* Model Comparison Analytics */}
        {(data.models_comparison ?? []).length > 0 && (
          <ModelComparisonTable
            scanType={data.scan_type}
            modelsComparison={(data.models_comparison ?? []).map((m) => ({
              model_name: m.modelName,
              detections: m.detections ?? [],
              measurements: m.measurements as any,
              annotated_image_base64: "", 
            }))}
          />
        )}
      </div>

      <FABMobileMenu>
        <FloatingActionButton
          variant="success"
          size="md"
          className="fab-pos-3"
          onClick={toggleAbbreviations}
        >
          <BookOpen size={16} />
          Abbreviations
        </FloatingActionButton>

        <FloatingActionButton
          variant="default"
          size="md"
          className="fab-pos-2"
          onClick={() => id && downloadReport(id)}
          disabled={isDownloading}
        >
          <FileText size={16} />
          {isDownloading ? "Generating..." : "Generate PDF"}
        </FloatingActionButton>

        <FloatingActionButton
          variant="default"
          size="md"
          className="fab-pos-1"
          onClick={() => navigate("/")}
        >
          <RefreshCw size={16} />
          New Analysis
        </FloatingActionButton>
      </FABMobileMenu>

      <AbbreviationsPanel
        isOpen={showAbbreviations}
        onClose={closeAbbreviations}
      />
    </div>
  );
};
