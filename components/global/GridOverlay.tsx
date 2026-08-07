'use client';

import { useEffect, useState } from 'react';

export default function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'KeyG') {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) return null;

  return (
    <div className="debug-grid-overlay" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className="debug-grid-col" />
      ))}
    </div>
  );
}