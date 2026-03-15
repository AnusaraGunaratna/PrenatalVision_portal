import { FC, ReactNode } from 'react';

interface Props {
    value: ReactNode;
    label: string;
}

export const MetricItem: FC<Props> = ({ value, label }) => (
    <div className="metric-item">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
    </div>
);
