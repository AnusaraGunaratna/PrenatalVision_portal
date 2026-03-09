import { FC, useState, useEffect, useRef, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ImageLightbox } from "./ImageLightbox";

interface AdditionalDet {
  class_name: string;
  confidence: number;
  bbox: number[];
  source_model: string;
}

interface Props {
  enhancedImageSrc: string;
  detections: AdditionalDet[];
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

const Thumbnail: FC<{
  det: AdditionalDet;
  enhancedSrc: string;
  renderBox: (
    det: AdditionalDet,
    isThumbnail: boolean,
    containerEl?: HTMLElement | null,
  ) => ReactNode;
  onClick: () => void;
}> = ({ det, enhancedSrc, renderBox, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flow-gallery-item" onClick={onClick}>
      <div
        ref={containerRef}
        className="flow-gallery-img"
        style={{ position: "relative" }}
      >
        <img src={enhancedSrc} alt={det.class_name} />
        {mounted && renderBox(det, true, containerRef.current)}
      </div>
      <div className="flow-gallery-info">
        <strong>{det.class_name}</strong>
        <span className="flow-gallery-fullname">
          {STRUCTURE_NAMES[det.class_name] || det.class_name}
        </span>
      </div>
    </div>
  );
};

export const AdditionalDetectionGallery: FC<Props> = ({
  enhancedImageSrc,
  detections,
}) => {
  const [showGallery, setShowGallery] = useState(false);
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [lightboxDet, setLightboxDet] = useState<AdditionalDet | null>(null);

  useEffect(() => {
    if (!enhancedImageSrc) return;
    const img = new Image();
    img.onload = () => setImgDims({ w: img.width, h: img.height });
    img.src = enhancedImageSrc;
  }, [enhancedImageSrc]);

  const openLightbox = (det: AdditionalDet) => {
    setLightboxSrc(enhancedImageSrc);
    setLightboxAlt(
      `${det.class_name} — ${STRUCTURE_NAMES[det.class_name] || det.class_name}`,
    );
    setLightboxDet(det);
  };

  const renderDetectionBox = (
    det: AdditionalDet,
    isThumbnail: boolean,
    containerEl?: HTMLElement | null,
  ): ReactNode => {
    if (!imgDims.w || !imgDims.h) return null;
    const [x1, y1, x2, y2] = det.bbox;
    const color = DETECTION_COLORS[det.class_name] || "#00FF00";

    let offsetLeft = 0;
    let offsetTop = 0;
    let visibleW = 100;
    let visibleH = 100;

    if (isThumbnail && containerEl) {
      const cW = containerEl.clientWidth;
      const cH = containerEl.clientHeight;
      if (cW > 0 && cH > 0) {
        const imgAspect = imgDims.w / imgDims.h;
        const cAspect = cW / cH;
        if (imgAspect > cAspect) {
          const renderH = cW / imgAspect;
          offsetTop = ((cH - renderH) / 2 / cH) * 100;
          visibleH = (renderH / cH) * 100;
        } else {
          const renderW = cH * imgAspect;
          offsetLeft = ((cW - renderW) / 2 / cW) * 100;
          visibleW = (renderW / cW) * 100;
        }
      }
    }

    return (
      <div
        style={{
          position: "absolute",
          left: `${offsetLeft + (x1 / imgDims.w) * visibleW}%`,
          top: `${offsetTop + (y1 / imgDims.h) * visibleH}%`,
          width: `${((x2 - x1) / imgDims.w) * visibleW}%`,
          height: `${((y2 - y1) / imgDims.h) * visibleH}%`,
          border: `${isThumbnail ? 2 : 3}px solid ${color}`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: isThumbnail ? "-18px" : "-26px",
            left: isThumbnail ? "-2px" : "-3px",
            background: color,
            color: "#FFF",
            padding: isThumbnail ? "1px 3px" : "3px 7px",
            fontSize: isThumbnail ? "9px" : "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          {det.class_name}
        </div>
      </div>
    );
  };

  if (detections.length === 0) return null;

  return (
    <>
      <div className="additional-gallery-section">
        <button
          className="flow-individual-toggle"
          onClick={() => setShowGallery(!showGallery)}
        >
          {showGallery ? <EyeOff size={16} /> : <Eye size={16} />}
          {showGallery
            ? "Hide Individual Detections"
            : `Show Individual Detections (${detections.length})`}
        </button>

        {showGallery && (
          <div className="flow-gallery anim-slide-down">
            {detections.map((det, idx) => (
              <Thumbnail
                key={idx}
                det={det}
                enhancedSrc={enhancedImageSrc}
                renderBox={renderDetectionBox}
                onClick={() => openLightbox(det)}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          onClose={() => {
            setLightboxSrc(null);
            setLightboxDet(null);
          }}
          detectionOverlay={
            lightboxDet ? renderDetectionBox(lightboxDet, false) : undefined
          }
        />
      )}
    </>
  );
};
