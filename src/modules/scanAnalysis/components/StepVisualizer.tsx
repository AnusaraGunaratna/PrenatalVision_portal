import { FC, useState } from 'react';
import { Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { GlassPanel } from '../../../libs/components/GlassPanel';
import { Button } from '../../../libs/components/Button';

interface AnnotatedImage {
  detection_id?: number;
  class_name?: string;
  image_base64: string;
}

interface Props {
  bestModelName: string;
  detectedBase64: string;
  annotatedImages?: AnnotatedImage[];
}

export const StepVisualizer: FC<Props> = ({
  bestModelName,
  detectedBase64,
  annotatedImages = [],
}) => {
  const [showIndividual, setShowIndividual] = useState(false);

  return (
    <GlassPanel className="visual-main-card">
      <div className="card-header">
        <div className="card-header-row">
          <div>
            <h2>
              <ImageIcon size={20} /> Annotated Ultrasound
            </h2>
            <p>AI-detected structures highlighted — {bestModelName}</p>
          </div>
          {annotatedImages.length > 0 && (
            <Button
              variant="toggle"
              onClick={() => setShowIndividual(!showIndividual)}
            >
              {showIndividual ? <EyeOff size={16} /> : <Eye size={16} />}
              {showIndividual ? 'Combined View' : 'Individual Detections'}
            </Button>
          )}
        </div>
      </div>

      {!showIndividual && detectedBase64 && (
        <div className="main-image-wrapper">
          <img src={detectedBase64} alt="Annotated ultrasound" />
        </div>
      )}

      {showIndividual && annotatedImages.length > 0 && (
        <div className="gallery">
          {annotatedImages.map((img, idx) => (
            <div key={img.detection_id ?? idx} className="gallery-item">
              <div className="gallery-img-container">
                <img src={img.image_base64} alt={img.class_name || 'Detection'} />
              </div>
              <div className="gallery-label">
                <strong>{img.class_name || `Detection ${idx + 1}`}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
};
