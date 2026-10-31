import { useEffect, useRef, useState } from 'react';
import { cx } from './ui.jsx';

/* Fades its content up the first time it scrolls into view. `delay` (ms) staggers items in a group.
   With reduced motion, or without IntersectionObserver, content simply shows. */
export default function Reveal({ as: Tag = 'div', delay = 0, className, children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (visible || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Tag ref={ref} className={cx('reveal', visible && 'is-visible', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...props}>
      {children}
    </Tag>
  );
}
