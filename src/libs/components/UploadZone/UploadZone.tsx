import { FC, useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

interface Props {
    onFileSelect: (file: File) => void;
    acceptedFormats?: string;
}

export const UploadZone: FC<Props> = ({
    onFileSelect,
    acceptedFormats = 'image/*',
}) => {
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className={`glass-panel upload-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats}
                onChange={handleInputChange}
            />
            <div className="upload-icon-wrapper">
                <Upload size={32} />
            </div>
            <h3>Upload Ultrasound Image</h3>
            <p>Drag and drop or click to browse</p>
            <p className="upload-hint">Supports JPG & PNG formats</p>
        </div>
    );
};
