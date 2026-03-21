import { FC, useState } from "react";
import { BarChart3, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { ModelResult } from "../../../libs/hooks/useScanApi";
import { GlassPanel } from "../../../libs/components/GlassPanel";

interface Props {
  modelsComparison: ModelResult[];
  scanType: string;
}

const MODEL_BENCHMARKS: Record<string, Record<string, Record<string, string>>> = {
  crl: {
    "PV-Coord": { mAP50: "96.5%", "mAP50-95": "77.4%", Precision: "93.1%", Recall: "93.1%" },
    "PV-LDB": { mAP50: "96.1%", "mAP50-95": "77.5%", Precision: "92.4%", Recall: "93.8%" },
    "PV-Hybrid": { mAP50: "96.3%", "mAP50-95": "76.6%", Precision: "93.2%", Recall: "92.9%" },
    YOLO11: { mAP50: "96.4%", "mAP50-95": "78.8%", Precision: "94.3%", Recall: "92.2%" },
    YOLO8: { mAP50: "95.7%", "mAP50-95": "78.8%", Precision: "92.8%", Recall: "91.8%" },
  },
  nt: {
    "PV-Coord": { mAP50: "96.3%", "mAP50-95": "75.4%", Precision: "92.6%", Recall: "93.1%" },
    "PV-LDB": { mAP50: "96.0%", "mAP50-95": "75.4%", Precision: "90.2%", Recall: "94.1%" },
    "PV-Hybrid": { mAP50: "96.0%", "mAP50-95": "73.9%", Precision: "89.8%", Recall: "94.5%" },
    YOLO11: { mAP50: "95.7%", "mAP50-95": "76.1%", Precision: "92.4%", Recall: "92.2%" },
    YOLO8: { mAP50: "95.1%", "mAP50-95": "75.8%", Precision: "92.5%", Recall: "91.9%" },
  },
};

export const ModelComparisonTable: FC<Props> = ({
  modelsComparison,
  scanType,
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  const FIXED_ORDER = [
    "PV-Coord",
    "PV-LDB",
    "PV-Hybrid",
    "YOLO11",
    "YOLO8",
  ];
  const SPECIALIZED_MODELS = ["PV-Coord", "PV-LDB", "PV-Hybrid"];

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

  const modelNames = [...FIXED_ORDER].filter((name) =>
    modelsComparison.some((m) => m.model_name === name)
  );

  modelsComparison.forEach((m) => {
    if (!modelNames.includes(m.model_name)) {
      modelNames.push(m.model_name);
    }
  });

  const activeBenchmarks = MODEL_BENCHMARKS[scanType.toLowerCase()] || {};

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
          <div className="benchmark-dashboard">
            <button
              className="benchmark-toggle"
              onClick={() => setShowBenchmarks(!showBenchmarks)}
            >
              <div className="toggle-left">
                <ShieldCheck size={14} />
                <span>Model Benchmarks ({scanType.toUpperCase()})</span>
              </div>
              {showBenchmarks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showBenchmarks && (
              <div className="benchmark-details anim-slide-down">
                <table className="benchmark-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      {modelNames.map((name) => (
                        <th key={name}>{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["mAP50", "mAP50-95", "Precision", "Recall"].map((metric) => (
                      <tr key={metric}>
                        <td className="metric-name">{metric}</td>
                        {modelNames.map((name) => (
                          <td key={name}>
                            {activeBenchmarks[name]?.[metric] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="analytics-desc">
            Confidence levels across all model variants
          </p>

          <div className="structure-table-wrapper">
            <table className="structure-table">
              <thead>
                <tr>
                  <th>Structure</th>
                  {modelNames.map((name) => (
                    <th key={name}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(structureMap).map(([structName, confs]) => {
                  const maxConf = Math.max(...Object.values(confs));

                  return (
                    <tr key={structName}>
                      <td className="struct-name">{structName}</td>
                      {modelNames.map((name) => {
                        const conf = confs[name] || 0;
                        const isWinner =
                          SPECIALIZED_MODELS.includes(name) &&
                          conf === maxConf &&
                          conf > 0;

                        return (
                          <td key={name} className={isWinner ? "best-cell" : ""}>
                            {confs[name]
                              ? `${(confs[name] * 100).toFixed(0)}%`
                              : "-"}
                          </td>
                        );
                      })}
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
