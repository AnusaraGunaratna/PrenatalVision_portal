import { FC, useEffect, useCallback } from 'react';

interface Props {
    src: string;
    alt: string;
    onClose: () => void;
}

export const ImageLightbox: FC<Props> = ({ src, alt, onClose }) => {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                <img src={src} alt={alt} className="lightbox-img" />
                <span className="lightbox-caption">{alt}</span>
            </div>
            <button className="lightbox-close" onClick={onClose}>✕</button>
        </div>
    );
};
