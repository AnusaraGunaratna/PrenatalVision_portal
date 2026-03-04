import { FC } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    message: string;
}

export const ErrorBanner: FC<Props> = ({ message }) => (
    <div className="error-banner">
        <AlertCircle size={20} />
        <p>{message}</p>
    </div>
);
