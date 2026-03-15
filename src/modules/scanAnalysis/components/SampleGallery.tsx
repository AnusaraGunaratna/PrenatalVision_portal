import { FC, useEffect, useState } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";

interface SampleImage {
  id: string;
  name: string;
  fileName: string;
  url: string;
  type: "crl" | "nt";
}

interface Props {
  onSelect: (url: string, fileName: string, type: "crl" | "nt") => void;
  isLoading: boolean;
}

export const SampleGallery: FC<Props> = ({ onSelect, isLoading }) => {
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch("/assets/samples/manifest.json");
        const data = await response.json();
        setSamples(data.samples || []);
      } catch (err) {
        console.error("Failed to load sample manifest:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchManifest();
  }, []);

  if (isFetching) {
    return (
      <div className="sample-gallery-container anim-fade-in flex-center" style={{ minHeight: '150px' }}>
        <Loader2 className="anim-spin" size={24} />
      </div>
    );
  }

  if (samples.length === 0) {
    return null;
  }
  return (
    <div className="sample-gallery-container anim-fade-in">
      <div className="sample-gallery-header">
        <ImageIcon size={16} />
        <span>Quick Test Samples</span>
      </div>

      <div className="sample-grid">
        <div className="sample-category">
          <span className="category-label">CRL Views</span>
          <div className="thumbnails">
            {samples.filter((s: SampleImage) => s.type === "crl").map((sample: SampleImage) => (
              <button
                key={sample.id}
                className="sample-item"
                onClick={() => onSelect(sample.url, sample.fileName, sample.type)}
                disabled={isLoading}
              >
                <div className="sample-preview">
                  <img src={sample.url} alt={sample.name} />
                  <div className="sample-overlay">
                    <span>Select</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="sample-divider" />

        <div className="sample-category">
          <span className="category-label">NT Views</span>
          <div className="thumbnails">
            {samples.filter((s: SampleImage) => s.type === "nt").map((sample: SampleImage) => (
              <button
                key={sample.id}
                className="sample-item"
                onClick={() => onSelect(sample.url, sample.fileName, sample.type)}
                disabled={isLoading}
              >
                <div className="sample-preview">
                  <img src={sample.url} alt={sample.name} />
                  <div className="sample-overlay">
                    <span>Select</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
