import { FC, useState, useRef, useEffect } from "react";
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

interface IndividualImage {
  class_name: string;
  dataUrl: string;
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
  bestModelName,
  detections,
}) => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [showIndividual, setShowIndividual] = useState(false);
  const [individualImages, setIndividualImages] = useState<IndividualImage[]>(
    [],
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const images = [originalBase64, enhancedBase64, annotatedBase64];

  const openLightbox = (src: string, alt: string) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
  };

  useEffect(() => {
    if (!showIndividual || detections.length === 0) return;
    if (individualImages.length > 0) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const results: IndividualImage[] = [];

      for (const det of detections) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);

        const [x1, y1, x2, y2] = det.bbox;
        const color = DETECTION_COLORS[det.class_name] || "#00FF00";

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 14px sans-serif";
        const tm = ctx.measureText(label);
        const labelH = 22;
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1 - labelH - 2, tm.width + 8, labelH);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(label, x1 + 4, y1 - 6);

        results.push({
          class_name: det.class_name,
          dataUrl: canvas.toDataURL("image/png"),
        });
      }
      setIndividualImages(results);
    };
    img.src = enhancedBase64;
  }, [showIndividual, detections, enhancedBase64, individualImages.length]);

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

            {showIndividual && individualImages.length > 0 && (
              <div className="flow-gallery anim-slide-down">
                {individualImages.map((item, idx) => (
                  <div
                    key={idx}
                    className="flow-gallery-item"
                    onClick={() =>
                      openLightbox(
                        item.dataUrl,
                        `${item.class_name} — ${STRUCTURE_NAMES[item.class_name] || item.class_name}`,
                      )
                    }
                  >
                    <div className="flow-gallery-img">
                      <img src={item.dataUrl} alt={item.class_name} />
                    </div>
                    <div className="flow-gallery-info">
                      <strong>{item.class_name}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassPanel>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  );
};
