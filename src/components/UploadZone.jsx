import { useRef, useState } from 'react';
import { Button, Icon, cx } from './ui.jsx';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
const MAX_BYTES = 15 * 1024 * 1024;

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function validateImage(file) {
  if (!file) return 'No file selected.';
  if (!ACCEPTED_TYPES.includes(file.type)) return 'That file type is not supported. Use a JPG, PNG or WEBP photo.';
  if (file.size > MAX_BYTES) return 'That photo is larger than 15 MB. Choose a smaller one.';
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
    <div className="grid gap-2">
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
        <figure className="overflow-hidden rounded-lg border border-line">
          <img className="block aspect-[4/3] max-h-[420px] w-full bg-navy object-contain" src={previewUrl} alt="Selected construction site" />
          <figcaption className="flex items-center justify-between gap-3 border-t border-line bg-paper-2 px-3 py-2">
            <span className="min-w-0 truncate text-[13px] text-muted" title={file?.name}>
              {file?.name} <span className="text-muted/80">({formatSize(file?.size || 0)})</span>
            </span>
            <span className="flex flex-none gap-1.5">
              <Button size="sm" onClick={pick} disabled={disabled}>
                Replace
              </Button>
              <Button size="sm" variant="danger" onClick={onRemove} disabled={disabled}>
                Remove
              </Button>
            </span>
          </figcaption>
        </figure>
      ) : (
        <div
          className={cx(
            'flex aspect-[4/3] max-h-80 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 text-center transition-colors outline-none max-sm:aspect-[4/3.2]',
            'hover:border-amber hover:bg-amber-soft/50 focus-visible:border-amber',
            dragging ? 'border-amber bg-amber-soft/60' : 'border-line bg-paper-2/60',
          )}
          role="button"
          tabIndex={0}
          aria-label="Choose a site photo"
          onClick={pick}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick())}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <span className="grid size-12 place-items-center rounded-full bg-navy text-amber">
            <Icon name="upload" className="size-5" />
          </span>
          <span className="text-[15px] font-medium text-heading">Drag a site photo here</span>
          <span className="text-[13px] text-muted">
            or <span className="font-medium text-heading underline decoration-amber underline-offset-4">choose a file</span>. JPG, PNG or WEBP, up to 15 MB.
          </span>
        </div>
      )}

      {error && (
        <p className="text-[13px] text-critical" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
