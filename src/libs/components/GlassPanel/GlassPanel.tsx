import { FC, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    className?: string;
    as?: 'div' | 'section';
    onClick?: (e: React.MouseEvent) => void;
}

export const GlassPanel: FC<Props> = ({ children, className = '', as: Tag = 'div', onClick }) => (
    <Tag className={`glass-panel ${className}`} onClick={onClick}>{children}</Tag>
);
