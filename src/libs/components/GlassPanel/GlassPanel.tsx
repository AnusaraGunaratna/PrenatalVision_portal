import { FC, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    className?: string;
    as?: 'div' | 'section';
}

export const GlassPanel: FC<Props> = ({ children, className = '', as: Tag = 'div' }) => (
    <Tag className={`glass-panel ${className}`}>{children}</Tag>
);
