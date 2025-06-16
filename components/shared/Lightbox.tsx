import { useState } from 'react';

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function Lightbox({
  images,
  initialIndex = 0,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <button
        className="absolute top-5 right-5 text-white text-3xl"
        onClick={onClose}
      >
        &times;
      </button>
      <button
        className="absolute left-5 text-white text-3xl"
        onClick={handlePrev}
      >
        &#8249;
      </button>
      <div className="relative max-w-4xl max-h-[90vh]">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-auto object-contain"
        />
      </div>
      <button
        className="absolute right-5 text-white text-3xl"
        onClick={handleNext}
      >
        &#8250;
      </button>
    </div>
  );
}