import { FC, useEffect } from "react";
import { X } from "lucide-react";
import strings from "./AbbreviationsPanel.strings.json";

interface AbbreviationsPanelProps {
  structures: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
}

export const AbbreviationsPanel: FC<AbbreviationsPanelProps> = ({
  structures,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`abbrev-side-panel anim-slide-in`}>
      <div className="abbrev-header">
        <h3>{strings["abbreviations.title"]}</h3>
        <button
          className="abbrev-close-btn"
          onClick={onClose}
          aria-label={strings["abbreviations.close"]}
        >
          <X size={16} />
        </button>
      </div>
      <div className="abbrev-body">
        <div className="abbrev-table-header">
          <span>{strings["abbreviations.header.code"]}</span>
          <span>{strings["abbreviations.header.name"]}</span>
        </div>
        <div className="abbrev-table-body">
          {Object.entries(structures).map(([code, name]) => (
            <div key={code} className="abbrev-row">
              <span className="abbrev-code">{code}</span>
              <span className="abbrev-name">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
