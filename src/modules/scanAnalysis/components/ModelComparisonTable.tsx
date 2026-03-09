import { FC, useState } from "react";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { ModelResult } from "../../../libs/hooks/useScanApi";
import { GlassPanel } from "../../../libs/components/GlassPanel";

interface Props {
  modelsComparison: ModelResult[];
}

export const ModelComparisonTable: FC<Props> = ({
  modelsComparison,
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  if (modelsComparison.length === 0) return null;

  // Building a structure comparison map: structure -> { modelName -> confidence }
  const structureMap: Record<string, Record<string, number>> = {};
  modelsComparison.forEach((model) => {
    (model.detections ?? []).forEach((det) => {
      const name = det.class_name;
      if (!structureMap[name]) structureMap[name] = {};
      const existing = structureMap[name][model.model_name];
      if (!existing || det.confidence > existing) {
        structureMap[name][model.model_name] = det.confidence;
      }
    });
  });

  const modelNames = modelsComparison.map((m) => m.model_name);

  return (
    <GlassPanel className="analytics-panel">
      <button
        className="analytics-toggle"
        onClick={() => setShowAnalytics(!showAnalytics)}
      >
        <BarChart3 size={18} />
        Model Analytics
        {showAnalytics ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {showAnalytics && (
        <div className="analytics-content anim-slide-down">
          <p className="analytics-desc">
            Comparison of detection results across all model variants
          </p>

          <div className="structure-table-wrapper">
            <table className="structure-table">
              <thead>
                <tr>
                  <th>Structure</th>
                  {modelNames.map((name) => (
                    <th key={name}>{name}</th>
                  ))}
                  <th>Best</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(structureMap).map(([structName, confs]) => {
                  let bestModel = "";
                  let bestConf = 0;
                  Object.entries(confs).forEach(([model, conf]) => {
                    if (conf > bestConf) {
                      bestConf = conf;
                      bestModel = model;
                    }
                  });

                  return (
                    <tr key={structName}>
                      <td className="struct-name">{structName}</td>
                      {modelNames.map((name) => (
                        <td
                          key={name}
                          className={bestModel === name ? "best-cell" : ""}
                        >
                          {confs[name]
                            ? `${(confs[name] * 100).toFixed(0)}%`
                            : "-"}
                        </td>
                      ))}
                      <td className="best-model-cell">{bestModel || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="model-summary">
            {modelsComparison.map((model) => (
              <span key={model.model_name}>
                {model.model_name}: {model.detections.length} detections
              </span>
            ))}
          </div>
        </div>
      )}
    </GlassPanel>
  );
};
