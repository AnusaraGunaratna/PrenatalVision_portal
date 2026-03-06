import { FC, useState, useEffect } from "react";
import { ArrowRight, Eye, EyeOff, ZoomIn } from "lucide-react";
import { GlassPanel } from "../../../libs/components/GlassPanel";
import { ImageLightbox } from "./ImageLightbox";

interface Detection {
  class_name: string;
  confidence: number;
  bbox: number[];
}

interface Props {
  originalBase64: string;
  enhancedBase64: string;
  annotatedBase64: string;
  bestModelName: string;
  detections: Detection[];
}

interface ActiveDetection {
  class_name: string;
  confidence: number;
  bbox: number[];
}

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

const DETECTION_COLORS: Record<string, string> = {
  NT: "#FF0000",
  NB: "#0000FF",
  H: "#00FF00",
  C: "#00FFFF",
  AB: "#FF00FF",
  MX: "#FFFF00",
  MDS: "#00FF80",
  MLS: "#0080FF",
  LV: "#FF8000",
  G: "#FF0080",
  B: "#8080FF",
  RBP: "#80FF80",
  DP: "#FF8080",
  NTAPS: "#80FFFF",
};

const ROMAN = ["I", "II", "III"];
const STEP_LABELS = [
  "Original Upload",
  "Enhanced Image",
  "All Detections Marked",
];

export const ImageAnalysisFlow: FC<Props> = ({
  originalBase64,
  enhancedBase64,
  annotatedBase64,
  detections,
}) => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [lightboxDetection, setLightboxDetection] = useState<ActiveDetection | null>(null);
  const [showIndividual, setShowIndividual] = useState(false);
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const images = [originalBase64, enhancedBase64, annotatedBase64];

  const openLightbox = (src: string, alt: string, detection?: ActiveDetection) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setLightboxDetection(detection || null);
  };

  useEffect(() => {
    if (!enhancedBase64) return;
    const img = new Image();
    img.onload = () => {
      setImgDims({ w: img.width, h: img.height });
    };
    img.src = enhancedBase64;
  }, [enhancedBase64]);

  const renderDetectionBox = (det: ActiveDetection, isThumbnail: boolean) => {
    if (!imgDims.w || !imgDims.h) return null;
    const [x1, y1, x2, y2] = det.bbox;
    const color = DETECTION_COLORS[det.class_name] || "#00FF00";

    return (
      <div
        style={{
          position: "absolute",
          left: `${(x1 / imgDims.w) * 100}%`,
          top: `${(y1 / imgDims.h) * 100}%`,
          width: `${((x2 - x1) / imgDims.w) * 100}%`,
          height: `${((y2 - y1) / imgDims.h) * 100}%`,
          border: `${isThumbnail ? 2 : 4}px solid ${color}`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: isThumbnail ? "-20px" : "-28px",
            left: isThumbnail ? "-2px" : "-4px",
            background: color,
            color: "#FFF",
            padding: isThumbnail ? "2px 4px" : "4px 8px",
            fontSize: isThumbnail ? "10px" : "14px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          {det.class_name} {(det.confidence * 100).toFixed(0)}%
        </div>
      </div>
    );
  };

  return (
    <>
      <GlassPanel className="analysis-flow-card">
        <div className="card-header">
          <h2>
            <ZoomIn size={20} /> Analysis Pipeline
          </h2>
          <p>Fetal structures detected using Enhanced YOLO11 architecture</p>
        </div>

        <div className="analysis-flow">
          {images.map((src, idx) => (
            <div key={idx} className="flow-step-wrapper">
              <div
                className="flow-step"
                onClick={() => openLightbox(src, STEP_LABELS[idx])}
              >
                <div className="flow-step-number">{ROMAN[idx]}</div>
                <div className="flow-step-img-wrapper">
                  <img src={src} alt={STEP_LABELS[idx]} />
                  <div className="flow-step-zoom">
                    <ZoomIn size={16} />
                  </div>
                </div>
                <span className="flow-step-label">{STEP_LABELS[idx]}</span>
              </div>
              {idx < images.length - 1 && (
                <div className="flow-arrow">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        {detections.length > 0 && (
          <div className="flow-individual-section">
            <button
              className="flow-individual-toggle"
              onClick={() => setShowIndividual(!showIndividual)}
            >
              {showIndividual ? <EyeOff size={16} /> : <Eye size={16} />}
              {showIndividual
                ? "Hide Individual Detections"
                : `Show Individual Detections (${detections.length})`}
            </button>

            {showIndividual && detections.length > 0 && (
              <div className="flow-gallery anim-slide-down">
                {detections.map((det, idx) => (
                  <div
                    key={idx}
                    className="flow-gallery-item"
                    onClick={() =>
                      openLightbox(
                        enhancedBase64,
                        `${det.class_name} — ${STRUCTURE_NAMES[det.class_name] || det.class_name}`,
                        det
                      )
                    }
                  >
                    <div className="flow-gallery-img" style={{ position: "relative" }}>
                      <img src={enhancedBase64} alt={det.class_name} />
                      {renderDetectionBox(det, true)}
                    </div>
                    <div className="flow-gallery-info">
                      <strong>{det.class_name}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassPanel>

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          onClose={() => {
            setLightboxSrc(null);
            setLightboxDetection(null);
          }}
          detectionOverlay={lightboxDetection ? renderDetectionBox(lightboxDetection, false) : undefined}
        />
      )}
    </>
  );
};
