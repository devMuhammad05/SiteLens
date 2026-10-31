import { useRef, useState } from 'react';
import { Icon, cx } from './ui.jsx';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
const MAX_BYTES = 15 * 1024 * 1024;

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function validateImage(file) {
  if (!file) return 'No file selected.';
  if (!ACCEPTED_TYPES.includes(file.type)) return `${file.name} is not a JPG, PNG or WEBP photo.`;
  if (file.size > MAX_BYTES) return `${file.name} is larger than 15 MB.`;
  return null;
}

/* Photo picker for up to `max` photos of one area.
   photos: [{ id, file, url }]. onAdd(files) receives the chosen files; onRemove(id) removes one. */
export default function UploadZone({ photos, max, onAdd, onRemove, error, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const full = photos.length >= max;

  const pick = () => !disabled && !full && inputRef.current?.click();

  const dropProps = {
    onDragOver: (e) => {
      e.preventDefault();
      if (!disabled && !full) setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e) => {
      e.preventDefault();
      setDragging(false);
      if (!disabled && !full) onAdd([...e.dataTransfer.files]);
    },
  };

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        hidden
        onChange={(e) => {
          onAdd([...e.target.files]);
          e.target.value = '';
        }}
      />

      {photos.length === 0 ? (
        <div
          className={cx(
            'flex aspect-[4/3] max-h-80 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 text-center transition-colors outline-none max-sm:aspect-[4/3.2]',
            'hover:border-amber hover:bg-amber-soft/50 focus-visible:border-amber',
            dragging ? 'border-amber bg-amber-soft/60' : 'border-line bg-paper-2/60',
          )}
          role="button"
          tabIndex={0}
          aria-label={`Choose up to ${max} site photos`}
          onClick={pick}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick())}
          {...dropProps}
        >
          <span className="grid size-12 place-items-center rounded-full bg-navy text-amber">
            <Icon name="upload" className="size-5" />
          </span>
          <span className="text-[15px] font-medium text-heading">Drag site photos here</span>
          <span className="text-[13px] text-muted">
            or <span className="font-medium text-heading underline decoration-amber underline-offset-4">choose files</span>. Up to {max}{' '}
            photos of the same area. JPG, PNG or WEBP, up to 15 MB each.
          </span>
        </div>
      ) : (
        <div className={cx('grid grid-cols-2 gap-2.5 rounded-lg', dragging && 'ring-2 ring-amber')} {...dropProps}>
          {photos.map((p, i) => (
            <figure key={p.id} className="relative overflow-hidden rounded-lg border border-line bg-navy">
              <img src={p.url} alt={`Site photo ${i + 1}`} className="block aspect-[4/3] w-full object-cover" />
              <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-md bg-[#0f172a]/80 text-[12px] font-semibold text-white">
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                disabled={disabled}
                className="absolute top-2 right-2 grid size-7 cursor-pointer place-items-center rounded-md bg-[#0f172a]/80 text-white hover:bg-critical disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove photo ${i + 1}`}
                title="Remove photo"
              >
                <Icon name="close" className="size-3.5" />
              </button>
              <figcaption className="truncate bg-paper-2 px-2 py-1 text-[11.5px] text-muted" title={p.file.name}>
                {formatSize(p.file.size)}
              </figcaption>
            </figure>
          ))}
          {!full && (
            <button
              type="button"
              onClick={pick}
              disabled={disabled}
              className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line text-[13px] text-muted hover:border-amber hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="plus" className="size-5" />
              Add photo
              <span className="text-[11.5px]">
                {photos.length} of {max}
              </span>
            </button>
          )}
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
