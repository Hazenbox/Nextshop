import React, { useState, useEffect } from 'react';
import { Image } from '../types';
import { Share2, RefreshCw, Trash2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { inventoryStorage } from '../lib/inventory';

interface ImageGridProps {
  images: Image[];
  onImageClick: (images: Image[], index: number) => void;
  onUpload: () => void;
  onDelete: (id: string) => void;
  onReplace: (id: string) => void;
}

interface ImageGroup {
  images: Image[];
  currentIndex: number;
  inventoryItem?: any;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  onImageClick, 
  onUpload,
  onDelete,
  onReplace
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [imageGroups, setImageGroups] = useState<Record<string, ImageGroup>>({});

  useEffect(() => {
    // Group images by inventory item
    const groups: Record<string, ImageGroup> = {};
    const processedImages = new Set<string>();
    
    // First, group images that are part of inventory items
    images.forEach(image => {
      const items = inventoryStorage.getItemsByImageId(image.id);
      if (items && items.length > 0) {
        const item = items[0];
        if (!groups[item.id]) {
          // Create a new group for this inventory item
          groups[item.id] = {
            images: item.image_ids
              .map(id => images.find(img => img.id === id))
              .filter(Boolean) as Image[],
            currentIndex: 0,
            inventoryItem: item
          };
          // Mark all images in this group as processed
          item.image_ids.forEach(id => processedImages.add(id));
        }
      }
    });

    // Then handle remaining images that aren't part of any inventory item
    images.forEach(image => {
      if (!processedImages.has(image.id)) {
        groups[image.id] = {
          images: [image],
          currentIndex: 0
        };
      }
    });

    setImageGroups(groups);
  }, [images]);

  const handleShare = async (e: React.MouseEvent, image: Image) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.description || 'Shared Image',
          text: 'Check out this image!',
          url: image.url
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(image.url)}`, '_blank');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const handleSlideChange = (groupId: string, direction: 'prev' | 'next', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setImageGroups(prev => {
      const group = prev[groupId];
      if (!group) return prev;

      const newIndex = direction === 'prev'
        ? (group.currentIndex - 1 + group.images.length) % group.images.length
        : (group.currentIndex + 1) % group.images.length;

      return {
        ...prev,
        [groupId]: {
          ...group,
          currentIndex: newIndex
        }
      };
    });
  };

  return (
    <div className="p-4">
      <button
        onClick={onUpload}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Upload Images
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};