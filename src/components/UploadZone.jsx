import { useRef, useState } from 'react';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
const MAX_BYTES = 15 * 1024 * 1024;

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function validateImage(file) {
  if (!file) return 'No file selected.';
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Unsupported format. Use JPG, JPEG, PNG or WEBP.';
  if (file.size > MAX_BYTES) return 'Image is larger than 15 MB.';
  return null;
}

export default function UploadZone({ file, previewUrl, onFile, onRemove, error, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleFiles = (files) => {
    if (files && files[0]) onFile(files[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="upload">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {previewUrl ? (
        <div className="preview">
          <img src={previewUrl} alt="Selected construction site" />
          <div className="preview-bar">
            <span className="file-name" title={file?.name}>
              {file?.name} · {formatSize(file?.size || 0)}
            </span>
            <div className="preview-actions">
              <button type="button" className="btn ghost" onClick={pick} disabled={disabled}>
                Replace
              </button>
              <button type="button" className="btn ghost danger" onClick={onRemove} disabled={disabled}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone${dragging ? ' dragging' : ''}`}
          role="button"
          tabIndex={0}
          onClick={pick}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M12 4v12M7 9l5-5 5 5"
            />
          </svg>
          <p className="drop-title">Drop a site photo here</p>
          <p className="muted">or click to browse · JPG, JPEG, PNG, WEBP</p>
        </div>
      )}

      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
