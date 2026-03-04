import { FC } from 'react';

type BadgeVariant = 'crl' | 'nt' | 'unacceptable' | 'mode';

interface Props {
    variant: BadgeVariant;
    children: string;
}

export const Badge: FC<Props> = ({ variant, children }) => (
    <span className={`badge badge-${variant}`}>{children}</span>
);
