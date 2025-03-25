import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from '../types';
import { useTheme, alpha } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import MobileStepper from '@mui/material/MobileStepper';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Inventory from '@mui/icons-material/Inventory';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ReorderIcon from '@mui/icons-material/Reorder';

// Currency options
const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
};

interface AddInventorySideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (itemData: Partial<InventoryItem>, mediaFiles: File[]) => void;
  onUpdate?: (itemData: Partial<InventoryItem>, mediaFiles: File[]) => void;
  editItem?: InventoryItem | null;
  categories?: string[];
  labels?: string[];
  paidToOptions?: string[];
  onAddCategory?: (category: string) => void;
  onRemoveCategory?: (category: string) => void;
  onAddLabel?: (label: string) => void;
  onRemoveLabel?: (label: string) => void;
  onAddPaidTo?: (paidTo: string) => void;
  onRemovePaidTo?: (paidTo: string) => void;
  currency?: string;
}

// Constants for inventory thresholds
const LOW_STOCK_THRESHOLD = 10;
const OUT_OF_STOCK_THRESHOLD = 0;

// Media file type for tracking file type and preview
interface MediaFile {
  file: File;
  type: 'image' | 'video';
  preview: string;
  id?: string; // Add optional id property for draggable identification
}

export function AddInventorySideSheet({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  editItem,
  categories = [],
  labels = [],
  paidToOptions = [],
  onAddCategory = () => {},
  onRemoveCategory = () => {},
  onAddLabel = () => {},
  onRemoveLabel = () => {},
  onAddPaidTo = () => {},
  onRemovePaidTo = () => {},
  currency = 'INR'
}: AddInventorySideSheetProps) {
  const theme = useTheme();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // Category management state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [localCategories, setLocalCategories] = useState<string[]>([]);

  // Get current currency symbol
  const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || CURRENCY_SYMBOLS.INR;

  // Calculate average profit based on price and cost price
  const avgProfit = useMemo(() => {
    if (!price || !costPrice) return 0;
    
    const priceNum = Number(price);
    const costPriceNum = Number(costPrice);
    
    if (isNaN(priceNum) || isNaN(costPriceNum)) return 0;
    
    return priceNum - costPriceNum;
  }, [price, costPrice]);

  // Calculate profit margin percentage
  const profitMarginPercentage = useMemo(() => {
    if (!price || !costPrice) return 0;
    
    const priceNum = Number(price);
    const costPriceNum = Number(costPrice);
    
    if (isNaN(priceNum) || isNaN(costPriceNum) || priceNum === 0) return 0;
    
    return ((priceNum - costPriceNum) / priceNum) * 100;
  }, [price, costPrice]);

  // Determine quantity status color
  const getQuantityColor = (qty: number) => {
    if (qty <= OUT_OF_STOCK_THRESHOLD) {
      return theme.palette.error.main;
    } else if (qty <= LOW_STOCK_THRESHOLD) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.success.main;
    }
  };

  // Get the current quantity status and color
  const qtyStatus = useMemo(() => {
    const qty = Number(quantity);
    if (isNaN(qty)) return { color: theme.palette.text.primary, label: '' };
    
    return {
      color: getQuantityColor(qty),
      label: qty <= OUT_OF_STOCK_THRESHOLD 
        ? 'Out of Stock' 
        : qty <= LOW_STOCK_THRESHOLD 
          ? 'Low Stock' 
          : 'In Stock'
    };
  }, [quantity, theme]);

  // Load item data when editing an existing item
  useEffect(() => {
    if (editItem) {
      setId(editItem.id?.toString() || '');
      setName(editItem.name || '');
      setDescription(editItem.description || '');
      setCategory(editItem.category || '');
      setPrice(editItem.price?.toString() || '');
      setCostPrice(editItem.cost_price?.toString() || '');
      setQuantity(editItem.quantity?.toString() || '');
      setIsEditing(true);
      
      // Load existing media if present
      if (editItem.image) {
        // Convert existing image URL to a media file entry
        fetch(editItem.image)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "existing-image.jpg", { type: "image/jpeg" });
            setMediaFiles([{
              file,
              type: 'image',
              preview: editItem.image || ''
            }]);
          })
          .catch(err => console.error("Failed to load existing image:", err));
      }
    } else {
      // Reset form when not editing
      setId('');
      setName('');
      setDescription('');
      setCategory('');
      setPrice('');
      setCostPrice('');
      setQuantity('');
      setMediaFiles([]);
      setActiveStep(0);
      setIsEditing(false);
    }
    setErrors({});
  }, [editItem, isOpen]);

  // Initialize local categories
  useEffect(() => {
    setLocalCategories([...categories]);
  }, [categories]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all media preview URLs when component unmounts
      mediaFiles.forEach(media => {
        if (media.preview) URL.revokeObjectURL(media.preview);
      });
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!category) newErrors.category = 'Category is required';
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (!costPrice) {
      newErrors.costPrice = 'Cost price is required';
    } else if (isNaN(Number(costPrice)) || Number(costPrice) < 0) {
      newErrors.costPrice = 'Please enter a valid cost price';
    }
    
    if (!quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(quantity)) || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const itemData = {
      ...(id && { id }),
      name,
      description,
      category,
      price: Number(price),
      cost_price: Number(costPrice),
      quantity: Number(quantity),
      status: Number(quantity) <= OUT_OF_STOCK_THRESHOLD 
        ? 'out of stock' as const
        : Number(quantity) <= LOW_STOCK_THRESHOLD 
          ? 'low stock' as const
          : 'active' as const,
      currency,
      // Save first media as main image for backward compatibility
      image: mediaFiles.length > 0 ? mediaFiles[0].preview : '',
      // Add all media files data as a new property
      media: mediaFiles.map(media => ({
        type: media.type,
        url: media.preview
      }))
    };
    
    if (isEditing && editItem && onUpdate) {
      onUpdate(itemData, mediaFiles.map(m => m.file));
    } else {
      onAdd(itemData, mediaFiles.map(m => m.file));
    }
    
    // Reset form
    setId('');
    setName('');
    setDescription('');
    setCategory('');
    setPrice('');
    setCostPrice('');
    setQuantity('');
    setMediaFiles([]);
    setActiveStep(0);
    setErrors({});
    onClose();
  };
  
  // Fix for drag and drop functionality in the thumbnail gallery
  const handleDragEnd = (result: any) => {
    // If dropped outside the list, do nothing
    if (!result.destination) {
      return;
    }

    // Ensure result contains valid source and destination indices
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Reorder the media files
    const reorderedMedia = [...mediaFiles];
    const [movedItem] = reorderedMedia.splice(sourceIndex, 1);
    reorderedMedia.splice(destinationIndex, 0, movedItem);

    // Update state with the new order
    setMediaFiles(reorderedMedia);
    
    // Update the active step to follow the dragged item
    setActiveStep(destinationIndex);
  };

  // Media handling function
  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      
      // Process each file and create media entries
      const newMediaFiles = files.map(file => {
        // Determine file type
        const isVideo = file.type.startsWith('video/');
        
        // Create preview URL
        const preview = URL.createObjectURL(file);
        
        // Add a unique ID for drag-drop operations
        return {
          file,
          type: isVideo ? 'video' : 'image',
          preview,
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        } as MediaFile & { id: string };
      });
      
      setMediaFiles(prev => [...prev, ...newMediaFiles]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prevFiles => {
      // Revoke the URL for the removed file
      if (prevFiles[index].preview) {
        URL.revokeObjectURL(prevFiles[index].preview);
      }
      
      // Create new array without the removed file
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      
      // Adjust active step if needed
      if (activeStep >= newFiles.length) {
        setActiveStep(Math.max(0, newFiles.length - 1));
      }
      
      return newFiles;
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  // Category management handlers
  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryToEdit('');
    setNewCategoryName('');
  };

  const handleAddNewCategory = () => {
    if (newCategoryName && !localCategories.includes(newCategoryName)) {
      const updatedCategories = [...localCategories, newCategoryName];
      setLocalCategories(updatedCategories);
      onAddCategory(newCategoryName);
      setNewCategoryName('');
    }
  };

  const handleEditCategory = (category: string) => {
    setCategoryToEdit(category);
    setNewCategoryName(category);
  };

  const handleUpdateCategory = () => {
    if (categoryToEdit && newCategoryName && categoryToEdit !== newCategoryName) {
      const updatedCategories = localCategories.map(cat => 
        cat === categoryToEdit ? newCategoryName : cat
      );
      
      setLocalCategories(updatedCategories);
      
      // Update the selected category if it was the one being edited
      if (category === categoryToEdit) {
        setCategory(newCategoryName);
      }
      
      // Call the onRemoveCategory for the old name and onAddCategory for the new name
      onRemoveCategory(categoryToEdit);
      onAddCategory(newCategoryName);
      
      setCategoryToEdit('');
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const updatedCategories = localCategories.filter(cat => cat !== categoryToDelete);
    setLocalCategories(updatedCategories);
    onRemoveCategory(categoryToDelete);
    
    // Clear the selected category if it was the one being deleted
    if (category === categoryToDelete) {
      setCategory('');
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        container={document.body}
        variant="temporary"
        sx={{
          position: 'fixed',
          zIndex: 9999,
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 480 },
            height: '100%',
            maxWidth: '100%',
            borderTopLeftRadius: { xs: 0, sm: '28px' },
            borderBottomLeftRadius: { xs: 0, sm: '28px' },
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'white',
            position: 'fixed',
            top: 0,
            right: 0
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }
        }}
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'var(--md-sys-color-surface)'
        }}>
          {/* Header */}
          <Box sx={{ 
            px: 3, 
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
                fontSize: '1.125rem'
              }}
            >
              {isEditing ? "Edit Item" : "Add Inventory Item"}
            </Typography>
            <IconButton 
              onClick={onClose}
              size="medium"
              sx={{ 
                color: 'var(--md-sys-color-on-surface-variant)',
                '&:hover': {
                  bgcolor: 'var(--md-sys-color-surface-container-high)'
                },
                p: 1,
                ml: 1
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box 
            component="form" 
            sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
              px: 3,
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'var(--md-sys-color-outline-variant)',
                borderRadius: 4,
                '&:hover': {
                  bgcolor: 'var(--md-sys-color-outline)',
                }
              }
            }}
          >
            {/* ID Field */}
            <TextField
              label="ID (Optional)"
              fullWidth
              value={id}
              onChange={(e) => setId(e.target.value)}
              variant="outlined"
              placeholder="Auto-generated if left empty"
              InputProps={{
                sx: { height: 48, borderRadius: '8px' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--md-sys-color-primary)',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'var(--md-sys-color-primary)'
                }
              }}
            />

            {/* Media Upload and Carousel */}
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                borderRadius: '12px',
                overflow: 'visible', // Allow content to properly flow without clipping
                border: '1px solid var(--md-sys-color-outline-variant)',
                bgcolor: 'var(--md-sys-color-surface)',
                position: 'relative', // Ensure proper stacking context
                zIndex: 0, // Base z-index for the carousel container
                mb: 2 // Add bottom margin to prevent overlap with form fields
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                width: '100%' // Ensure full width
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    color: 'var(--md-sys-color-on-surface)',
                    fontWeight: 500
                  }}
                >
                  <PhotoLibraryIcon fontSize="small" />
                  Product Media ({mediaFiles.length})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => document.getElementById('media-upload')?.click()}
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      color: 'var(--md-sys-color-primary)',
                      borderRadius: '20px',
                      padding: '4px 12px'
                    }}
                  >
                    Add Media
                  </Button>
                  <input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaSelect}
                    style={{ display: 'none' }}
                  />
                </Box>
              </Box>

              {mediaFiles.length > 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  width: '100%' // Ensure full width 
                }}>
                  <Box
                    sx={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--md-sys-color-outline-variant)',
                      mb: 2,
                      bgcolor: 'var(--md-sys-color-surface-container-lowest)',
                      maxHeight: '220px', // Set maximum height to prevent flex expansion
                      height: '220px' // Fixed height
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        zIndex: 2, 
                        bgcolor: 'rgba(0,0,0,0.5)', 
                        borderRadius: '50%' 
                      }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveMedia(activeStep)}
                          sx={{ color: '#fff' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <SwipeableViews
                        axis="x"
                        index={activeStep}
                        onChangeIndex={handleStepChange}
                        enableMouseEvents
                      >
                        {mediaFiles.map((media, index) => (
                          <Box key={index} sx={{ height: 220, position: 'relative' }}>
                            {media.type === 'image' ? (
                              <Box
                                component="img"
                                src={media.preview}
                                alt={`Product media ${index + 1}`}
                                sx={{
                                  width: '100%',
                                  height: 220,
                                  objectFit: 'contain',
                                  borderRadius: 0,
                                  display: 'block',
                                }}
                              />
                            ) : (
                              <Box
                                component="video"
                                src={media.preview}
                                controls
                                sx={{
                                  width: '100%',
                                  height: 220,
                                  objectFit: 'contain',
                                  display: 'block',
                                }}
                              />
                            )}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: '#fff',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              {media.type === 'image' ? (
                                <ImageIcon fontSize="small" />
                              ) : (
                                <VideoLibraryIcon fontSize="small" />
                              )}
                              <Typography variant="caption" sx={{ color: '#fff' }}>
                                {media.type === 'image' ? 'Image' : 'Video'} {index + 1} of {mediaFiles.length}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </SwipeableViews>
                      <MobileStepper
                        steps={mediaFiles.length}
                        position="static"
                        activeStep={activeStep}
                        sx={{ 
                          bgcolor: 'var(--md-sys-color-surface-container-low)',
                          padding: '8px 0',
                          borderTop: '1px solid var(--md-sys-color-outline-variant)'
                        }}
                        nextButton={
                          <Button
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === mediaFiles.length - 1}
                            sx={{ 
                              minWidth: 'auto', 
                              p: 0.5,
                              color: 'var(--md-sys-color-primary)'
                            }}
                          >
                            <KeyboardArrowRight />
                          </Button>
                        }
                        backButton={
                          <Button
                            size="small"
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            sx={{ 
                              minWidth: 'auto', 
                              p: 0.5,
                              color: 'var(--md-sys-color-primary)'
                            }}
                          >
                            <KeyboardArrowLeft />
                          </Button>
                        }
                      />
                    </Box>
                  </Box>

                  {/* Thumbnail gallery for multiple media items */}
                  {mediaFiles.length > 1 && (
                    <Box
                      sx={{ 
                        mb: 2,
                        padding: 2,
                        borderRadius: '8px',
                        bgcolor: 'var(--md-sys-color-surface-container-low)',
                        border: '1px solid var(--md-sys-color-outline-variant)'
                      }}
                    >
                      {/* Label for drag and drop functionality */}
                      <Typography 
                        variant="subtitle2" 
                        color="var(--md-sys-color-on-surface-variant)" 
                        align="center" 
                        sx={{ 
                          mb: 1.5, 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem'
                        }}
                      >
                        <DragIndicatorIcon fontSize="small" />
                        Drag thumbnails to reorder
                      </Typography>
                      
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="media-list" direction="horizontal">
                          {(provided) => (
                            <Box 
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              sx={{ 
                                display: 'flex',
                                overflowX: 'auto',
                                gap: 1.5,
                                pb: 1,
                                width: '100%',
                                minHeight: 65,
                                maxHeight: 65,
                                '&::-webkit-scrollbar': {
                                  height: 4,
                                },
                                '&::-webkit-scrollbar-track': {
                                  borderRadius: 2,
                                  bgcolor: 'var(--md-sys-color-surface-variant)',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  borderRadius: 2,
                                  bgcolor: 'var(--md-sys-color-primary-container)',
                                  '&:hover': {
                                    bgcolor: 'var(--md-sys-color-primary)',
                                  },
                                }
                              }}
                            >
                              {mediaFiles.map((media, index) => (
                                <Draggable 
                                  key={`media-${index}`} 
                                  draggableId={media.id || `media-${index}`}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      sx={{
                                        width: 60,
                                        height: 60,
                                        flexShrink: 0,
                                        position: 'relative',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: `2px solid ${index === activeStep 
                                          ? 'var(--md-sys-color-primary)' 
                                          : 'transparent'}`,
                                        transition: 'all 0.2s ease',
                                        opacity: snapshot.isDragging ? 0.6 : 1,
                                        '&:hover': {
                                          border: `2px solid var(--md-sys-color-primary)`,
                                          '& .drag-handle': {
                                            opacity: 1
                                          }
                                        }
                                      }}
                                    >
                                      {/* Handle for drag operations only */}
                                      <Box
                                        {...provided.dragHandleProps}
                                        className="drag-handle"
                                        sx={{
                                          position: 'absolute',
                                          bottom: 0,
                                          left: 0,
                                          width: '100%',
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          bgcolor: 'rgba(0,0,0,0.5)',
                                          color: '#fff',
                                          opacity: 0,
                                          transition: 'opacity 0.2s ease',
                                          height: '18px',
                                          zIndex: 2,
                                          cursor: 'grab',
                                          '&:active': {
                                            cursor: 'grabbing'
                                          }
                                        }}
                                        onClick={(e) => {
                                          // Prevent click from propagating to parent
                                          e.stopPropagation();
                                        }}
                                      >
                                        <DragIndicatorIcon fontSize="small" sx={{ fontSize: 16 }} />
                                      </Box>
                                      
                                      {/* Content - separate from drag handle to avoid interference */}
                                      <Box 
                                        onClick={() => setActiveStep(index)}
                                        sx={{
                                          width: '100%',
                                          height: 'calc(100% - 18px)', // Adjust height to account for drag handle
                                          position: 'relative',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        {media.type === 'image' ? (
                                          <Box
                                            component="img"
                                            src={media.preview}
                                            alt={`Thumbnail ${index + 1}`}
                                            sx={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover'
                                            }}
                                          />
                                        ) : (
                                          <Box
                                            sx={{
                                              width: '100%',
                                              height: '100%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              bgcolor: 'var(--md-sys-color-surface-variant)'
                                            }}
                                          >
                                            <VideoLibraryIcon sx={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
                                          </Box>
                                        )}
                                        <Box
                                          sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            bgcolor: index === activeStep 
                                              ? 'var(--md-sys-color-primary)' 
                                              : 'rgba(0,0,0,0.5)',
                                            color: index === activeStep 
                                              ? 'var(--md-sys-color-on-primary)'
                                              : '#fff',
                                            fontSize: '0.7rem',
                                            padding: '1px 0',
                                            textAlign: 'center',
                                            zIndex: 1
                                          }}
                                        >
                                          {index + 1}
                                        </Box>
                                      </Box>
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  onClick={() => document.getElementById('media-upload')?.click()}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    borderRadius: '12px',
                    borderWidth: 2,
                    borderColor: 'var(--md-sys-color-outline-variant)',
                    borderStyle: 'dashed',
                    bgcolor: 'var(--md-sys-color-surface-container-lowest)',
                    cursor: 'pointer',
                    minHeight: 140,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'var(--md-sys-color-primary)',
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      '& .upload-icon': {
                        color: 'var(--md-sys-color-primary)'
                      }
                    },
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 1.5
                  }}>
                    <PhotoLibraryIcon 
                      className="upload-icon"
                      sx={{ 
                        fontSize: 36, 
                        color: 'var(--md-sys-color-on-surface-variant)',
                        opacity: 0.8
                      }} 
                    />
                    <Typography 
                      variant="subtitle1" 
                      color="var(--md-sys-color-primary)"
                      align="center"
                      sx={{ fontWeight: 500 }}
                    >
                      Upload Images & Videos
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="var(--md-sys-color-on-surface-variant)"
                      align="center"
                    >
                      Drag & drop or click to browse
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Add a clear divider after the media section */}
            <Divider 
              sx={{ 
                width: '100%', 
                my: 3, // Increase margin to create better separation
                borderColor: 'var(--md-sys-color-outline-variant)'
              }} 
            />

            {/* Form fields section */}
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 3,
                borderRadius: '12px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                bgcolor: 'var(--md-sys-color-surface)',
                gap: 3,
                position: 'relative', // Ensure proper stacking context
                zIndex: 0 // Base z-index for the form container
              }}
            >
              <TextField
                label="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
                autoComplete="off"
                InputProps={{
                  sx: { 
                    height: 48, 
                    borderRadius: '8px',
                    fontSize: '1rem',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--md-sys-color-outline)'
                    },
                    '& input': {
                      height: '24px',
                      padding: '12px 14px',
                      boxSizing: 'border-box'
                    }
                  }
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: '0.875rem'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--md-sys-color-primary)',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--md-sys-color-primary)'
                  }
                }}
              />
              
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: '8px',
                    fontSize: '1rem',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--md-sys-color-outline)'
                    }
                  }
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: '0.875rem'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--md-sys-color-primary)',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--md-sys-color-primary)'
                  }
                }}
              />

              <FormControl 
                fullWidth 
                error={!!errors.category}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--md-sys-color-primary)',
                      borderWidth: 2
                    },
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      height: '24px', 
                      padding: '12px 14px'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--md-sys-color-primary)'
                  }
                }}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      elevation: 2,
                      sx: { 
                        maxHeight: 300, 
                        borderRadius: '12px',
                        mt: 1
                      }
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    // Ensure menu behaves properly
                    disablePortal: false,
                    disableScrollLock: false,
                    disableAutoFocusItem: true
                  }}
                >
                  {localCategories.map((cat) => (
                    <MenuItem 
                      key={cat} 
                      value={cat}
                    >
                      {cat}
                    </MenuItem>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <MenuItem
                    value="" // Set explicit empty value
                    onClick={(e) => {
                      // Completely stop menu interaction to handle our custom action
                      e.stopPropagation();
                      
                      // Close the menu properly first
                      const selectElement = document.getElementById('category-select');
                      if (selectElement) {
                        (selectElement as HTMLElement).blur();
                      }
                      
                      // Open modal with delay to ensure menu is fully closed
                      setTimeout(() => {
                        openCategoryModal();
                      }, 300);
                    }}
                    sx={{ 
                      color: 'var(--md-sys-color-primary)',
                      fontWeight: 500
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SettingsIcon fontSize="small" />
                      <Typography variant="body2">Manage Categories</Typography>
                    </Box>
                  </MenuItem>
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: 'var(--md-sys-color-on-surface)',
                    mb: 1.5,
                    fontWeight: 500
                  }}
                >
                  Pricing & Inventory
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Cost Price"
                      fullWidth
                      required
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      error={!!errors.costPrice}
                      helperText={errors.costPrice}
                      type="number"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {currency === 'INR' ? (
                              <CurrencyRupeeIcon fontSize="small" />
                            ) : (
                              currencySymbol
                            )}
                          </InputAdornment>
                        ),
                        sx: { height: 48 }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--md-sys-color-primary)',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'var(--md-sys-color-primary)'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Selling Price"
                      fullWidth
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      error={!!errors.price}
                      helperText={errors.price}
                      type="number"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {currency === 'INR' ? (
                              <CurrencyRupeeIcon fontSize="small" />
                            ) : (
                              currencySymbol
                            )}
                          </InputAdornment>
                        ),
                        sx: { height: 48 }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--md-sys-color-primary)',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'var(--md-sys-color-primary)'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Profit Information */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'var(--md-sys-color-surface-container-low)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      color: 'var(--md-sys-color-on-surface)',
                      fontWeight: 500
                    }}
                  >
                    <CalculateIcon fontSize="small" />
                    Profit Information
                  </Typography>
                  <Tooltip title="Calculated based on cost and selling prices">
                    <InfoOutlinedIcon 
                      fontSize="small" 
                      sx={{ color: 'var(--md-sys-color-on-surface-variant)' }} 
                    />
                  </Tooltip>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--md-sys-color-on-surface-variant)',
                        mb: 0.5 
                      }}
                    >
                      Profit per item:
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{
                        color: avgProfit > 0 
                          ? 'var(--md-sys-color-tertiary)' 
                          : 'var(--md-sys-color-error)',
                        fontWeight: 500
                      }}
                    >
                      {currency === 'INR' ? '₹' : currencySymbol}{avgProfit.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--md-sys-color-on-surface-variant)',
                        mb: 0.5 
                      }}
                    >
                      Profit margin:
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{
                        color: profitMarginPercentage > 0 
                          ? 'var(--md-sys-color-tertiary)' 
                          : 'var(--md-sys-color-error)',
                        fontWeight: 500
                      }}
                    >
                      {profitMarginPercentage.toFixed(2)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Quantity Field with Status Indicator */}
              <TextField
                label="QTY"
                fullWidth
                required
                value={quantity}
                onChange={(e) => {
                  // Only accept integer values
                  const value = e.target.value;
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    setQuantity(value);
                  }
                }}
                error={!!errors.quantity}
                helperText={errors.quantity}
                type="text" // Changed from number to text for better control
                variant="outlined"
                InputProps={{
                  inputProps: { 
                    min: 0,
                    inputMode: 'numeric',
                    pattern: '[0-9]*' 
                  },
                  endAdornment: Number(quantity) ? (
                    <InputAdornment position="end">
                      <Chip 
                        label={qtyStatus.label}
                        size="small"
                        sx={{ 
                          backgroundColor: Number(quantity) > 0
                            ? qtyStatus.color === '#1e8e3e' 
                              ? 'var(--md-sys-color-tertiary-container)'
                              : qtyStatus.color === '#f29900'
                                ? 'var(--md-sys-color-secondary-container)'
                                : 'var(--md-sys-color-error-container)'
                            : 'var(--md-sys-color-error-container)',
                          color: Number(quantity) > 0
                            ? qtyStatus.color === '#1e8e3e' 
                              ? 'var(--md-sys-color-on-tertiary-container)'
                              : qtyStatus.color === '#f29900'
                                ? 'var(--md-sys-color-on-secondary-container)'
                                : 'var(--md-sys-color-on-error-container)'
                            : 'var(--md-sys-color-on-error-container)',
                          fontWeight: 500,
                          borderRadius: '8px'
                        }}
                      />
                    </InputAdornment>
                  ) : null,
                  sx: { 
                    height: 48,
                    '& input': {
                      height: '24px',
                      padding: '12px 14px',
                      boxSizing: 'border-box'
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--md-sys-color-primary)',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--md-sys-color-primary)'
                  }
                }}
              />
            </Paper>
          </Box>

          {/* Footer */}
          <Box 
            sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'flex-end',
              borderTop: `1px solid var(--md-sys-color-outline-variant)`,
              gap: 2,
              bgcolor: 'var(--md-sys-color-surface-container-low)'
            }}
          >
            <Button 
              onClick={onClose} 
              variant="outlined"
              size="medium"
              sx={{ 
                fontWeight: 500,
                borderRadius: '20px',
                textTransform: 'none',
                px: 3,
                py: 1,
                height: 40,
                border: '1px solid var(--md-sys-color-outline)',
                color: 'var(--md-sys-color-primary)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: 'var(--md-sys-color-primary)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disableElevation
              size="medium"
              sx={{ 
                fontWeight: 500,
                borderRadius: '20px',
                textTransform: 'none',
                px: 3,
                py: 1,
                height: 40,
                bgcolor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                '&:hover': {
                  bgcolor: 'var(--md-sys-color-primary)',
                  opacity: 0.9
                }
              }}
            >
              {isEditing ? "Save Changes" : "Add Item"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Category Management Modal */}
      <Dialog 
        open={isCategoryModalOpen} 
        onClose={closeCategoryModal}
        fullWidth
        maxWidth="xs"
        container={document.body}
        sx={{
          position: 'fixed',
          zIndex: 10000,
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
            backgroundColor: 'white',
            overflow: 'hidden'
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            p: 3,
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'var(--md-sys-color-surface)'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500, 
              color: 'var(--md-sys-color-on-surface)',
              fontSize: '1.125rem'
            }}
          >
            Manage Categories
          </Typography>
          <IconButton 
            edge="end" 
            onClick={closeCategoryModal}
            sx={{ 
              color: 'var(--md-sys-color-on-surface-variant)',
              '&:hover': {
                bgcolor: 'var(--md-sys-color-surface-container)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: 'var(--md-sys-color-surface)' }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add new category..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              error={!!errors.category}
              helperText={errors.category}
              InputProps={{
                sx: { 
                  borderRadius: '8px',
                  height: 44
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--md-sys-color-primary)',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'var(--md-sys-color-primary)'
                }
              }}
            />
            <Button
              onClick={handleAddNewCategory}
              disabled={!newCategoryName.trim()}
              variant="contained"
              disableElevation
              sx={{
                minWidth: 'auto',
                height: 44,
                bgcolor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'var(--md-sys-color-primary)',
                  opacity: 0.9
                },
                '&.Mui-disabled': {
                  opacity: 0.6,
                  color: 'var(--md-sys-color-on-surface-variant)'
                }
              }}
            >
              <AddIcon />
            </Button>
          </Box>

          {categoryToEdit && (
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Update category name..."
                value={categoryToEdit}
                onChange={(e) => setCategoryToEdit(e.target.value)}
                InputProps={{
                  sx: { 
                    borderRadius: '8px',
                    height: 44
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--md-sys-color-primary)',
                      borderWidth: 2
                    }
                  }
                }}
              />
              <Button
                onClick={handleUpdateCategory}
                disabled={!categoryToEdit.trim()}
                variant="contained"
                color="primary"
                disableElevation
                sx={{
                  minWidth: 'auto',
                  height: 44,
                  bgcolor: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: 'var(--md-sys-color-primary)',
                    opacity: 0.9
                  }
                }}
              >
                <EditIcon />
              </Button>
            </Box>
          )}

          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1.5, 
              color: 'var(--md-sys-color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
                borderRadius: '50%',
                width: 24,
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              {localCategories.length}
            </Box>
            {localCategories.length === 1 ? 'category' : 'categories'}
          </Typography>

          <Paper
            elevation={0}
            sx={{ 
              border: '1px solid var(--md-sys-color-outline-variant)',
              borderRadius: '12px',
              bgcolor: 'var(--md-sys-color-surface-container-lowest)',
              mb: 2,
              overflow: 'hidden'
            }}
          >
            {localCategories.length === 0 ? (
              <Box
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <Typography 
                  variant="body2" 
                  color="var(--md-sys-color-on-surface-variant)"
                  align="center"
                >
                  No categories yet
                </Typography>
                <Typography
                  variant="caption"
                  color="var(--md-sys-color-on-surface-variant)"
                  align="center"
                >
                  Add a category to organize your inventory
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {localCategories.map((cat, index) => (
                  <ListItem 
                    key={cat}
                    sx={{ 
                      py: 2,
                      px: 2,
                      borderBottom: index !== localCategories.length - 1 
                        ? '1px solid var(--md-sys-color-outline-variant)' 
                        : 'none',
                      '&:hover': {
                        bgcolor: 'var(--md-sys-color-surface-container)'
                      }
                    }}
                  >
                    <ListItemText 
                      primary={cat} 
                      primaryTypographyProps={{
                        sx: { color: 'var(--md-sys-color-on-surface)' }
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleEditCategory(cat)}
                        size="small"
                        sx={{ 
                          color: 'var(--md-sys-color-on-surface-variant)',
                          p: 1,
                          '&:hover': {
                            bgcolor: 'var(--md-sys-color-surface-container-high)',
                            color: 'var(--md-sys-color-primary)'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteCategory(cat)}
                        size="small"
                        sx={{ 
                          color: 'var(--md-sys-color-on-surface-variant)',
                          p: 1,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            color: 'var(--md-sys-color-error)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          bgcolor: 'var(--md-sys-color-surface-container-low)',
          justifyContent: 'center' // Center the button
        }}>
          <Button 
            onClick={closeCategoryModal}
            variant="contained"
            disableElevation
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '20px',
              px: 4,
              py: 1,
              minWidth: 120,
              bgcolor: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              '&:hover': {
                bgcolor: 'var(--md-sys-color-primary)',
                opacity: 0.9
              }
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 