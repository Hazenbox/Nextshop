import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Minus, RefreshCw, Trash2 } from 'lucide-react';
import { ImageViewerProps } from '../types';

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  currentIndex,
  onClose,
  onDelete,
  onReplace,
  onNavigate
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const currentImage = images[currentIndex];

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') onNavigate(Math.max(0, currentIndex - 1));
    if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, currentIndex + 1));
    if (e.key === 'Escape') onClose();
    if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.25, 3));
    if (e.key === '-') setScale(s => Math.max(s - 0.25, 0.5));
    if (e.key === '0') resetView();
  }, [currentIndex, onNavigate, onClose, resetView, images.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    resetView();
  }, [currentIndex, resetView]);

  useEffect(() => {
    // Scroll the thumbnail into view when currentIndex changes
    if (thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      const delta = -Math.sign(e.deltaY) * 0.1;
      setScale(s => Math.max(0.5, Math.min(3, s + delta)));
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scale === 1) {
      setScale(2);
    } else {
      resetView();
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isBackground = target === viewerRef.current;
    const isImageContainer = target === imageContainerRef.current;
    
    if (isBackground || isImageContainer) {
      onClose();
    }
  };

  if (!images.length) return null;

  return (
    <div 
      ref={viewerRef} 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center cursor-pointer select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleBackgroundClick}
    >
      <div 
        className="absolute top-4 right-4 select-none"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
          title="Close (Esc)"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div 
        className="absolute top-4 left-4 flex items-center space-x-4 select-none"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setScale(s => Math.min(s + 0.25, 3))}
          className="text-white hover:text-gray-300 transition-colors"
          title="Zoom in (+)"
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
          className="text-white hover:text-gray-300 transition-colors"
          title="Zoom out (-)"
        >
          <Minus className="h-6 w-6" />
        </button>
        <button
          onClick={() => onReplace(currentImage.id)}
          className="text-white hover:text-gray-300 transition-colors"
          title="Replace image"
        >
          <RefreshCw className="h-6 w-6" />
        </button>
        <button
          onClick={() => onDelete(currentImage.id)}
          className="text-white hover:text-gray-300 transition-colors"
          title="Delete image"
        >
          <Trash2 className="h-6 w-6" />
        </button>
      </div>

      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors select-none"
          title="Previous image (←)"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors select-none"
          title="Next image (→)"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      <div 
        ref={imageContainerRef}
        className="relative w-[90vw] h-[calc(90vh-100px)] flex items-center justify-center select-none"
      >
        <img
          src={currentImage.url}
          alt={currentImage.description || ''}
          className={`max-w-full max-h-full object-contain select-none cursor-pointer ${
            isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s'
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          draggable={false}
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Thumbnails */}
      <div 
        ref={thumbnailsRef}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black bg-opacity-50 rounded-lg overflow-x-auto max-w-[90vw]"
        onClick={e => e.stopPropagation()}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onNavigate(index)}
            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
              index === currentIndex ? 'ring-2 ring-white scale-105' : 'opacity-50 hover:opacity-75'
            }`}
          >
            <img
              src={image.url}
              alt={image.description || `Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {scale !== 1 && (
        <div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white text-sm select-none"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={resetView}
            className="px-3 py-1 bg-black bg-opacity-50 rounded hover:bg-opacity-70 transition-colors"
            title="Reset zoom (0)"
          >
            Reset View
          </button>
        </div>
      )}
    </div>
  );
};