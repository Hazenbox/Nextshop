import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, AlertCircle, Loader } from 'lucide-react';
import { nanoid } from 'nanoid';
import { InventoryItem, Image } from '../types';
import { CategoryManager } from './CategoryManager';
import { Notification } from './Notification';
import { imageStorage } from '../lib/storage';
import { DeleteConfirmModal } from './DeleteConfirmModal';

const formStyles = {
  input: "w-full h-9 px-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent",
  label: "block text-xs font-medium text-gray-700 mb-1.5",
  inputWithIcon: "w-full h-9 pl-7 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  textarea: "w-full h-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent resize-none",
  currencySymbol: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs",
  button: {
    primary: "h-9 px-4 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500 transition-colors",
    secondary: "h-9 px-4 text-xs font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
  }
};

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>, imageFiles: File[]) => void;
  categories: string[];
  labels: string[];
  paidToOptions: string[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
  onAddPaidTo: (paidTo: string) => void;
  onRemovePaidTo: (paidTo: string) => void;
  editItem?: InventoryItem | null;
}

interface ImagePreview {
  file?: File;
  preview: string;
  hash: string;
  isDuplicate?: boolean;
  type: 'image' | 'video';
  url?: string;
  loading?: boolean;
  error?: string;
  id?: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  labels,
  paidToOptions,
  onAddCategory,
  onRemoveCategory,
  onAddLabel,
  onRemoveLabel,
  onAddPaidTo,
  onRemovePaidTo,
  editItem
}) => {
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showPaidToModal, setShowPaidToModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    product_id: '',
    title: '',
    description: '',
    category: '',
    label: '',
    sale_status: 'available',
    purchase_price: 0,
    listed_price: 0,
    sold_at: 0,
    delivery_charges: 0,
    sale_type: 'online',
    paid_to: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: ''
  });

  useEffect(() => {
    const loadExistingImages = async () => {
      if (editItem && editItem.image_ids.length > 0) {
        try {
          const existingImages = await imageStorage.getImages(editItem.board_id);
          const itemImages = existingImages.filter(img => editItem.image_ids.includes(img.id));
          
          const imagePreviews: ImagePreview[] = itemImages.map(img => ({
            preview: img.url,
            hash: nanoid(),
            type: 'image',
            url: img.url,
            id: img.id
          }));

          setImages(imagePreviews);
        } catch (error) {
          console.error('Error loading existing images:', error);
        }
      }
    };

    if (isOpen && editItem) {
      loadExistingImages();
      setFormData(editItem);
      setShowAdvancedFields(true);
    }
  }, [isOpen, editItem]);

  useEffect(() => {
    if (!isOpen) {
      setImages([]);
      setFormData({
        product_id: '',
        title: '',
        description: '',
        category: '',
        label: '',
        sale_status: 'available',
        purchase_price: 0,
        listed_price: 0,
        sold_at: 0,
        delivery_charges: 0,
        sale_type: 'online',
        paid_to: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: ''
      });
      setShowAdvancedFields(false);
    }
  }, [isOpen]);

  const [profit, setProfit] = useState<number>(0);

  useEffect(() => {
    const newProfit = formData.sold_at && formData.purchase_price !== undefined && formData.delivery_charges !== undefined
      ? formData.sold_at - formData.purchase_price - formData.delivery_charges
      : 0;
    setProfit(newProfit);
  }, [formData.sold_at, formData.purchase_price, formData.delivery_charges]);

  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.url && !image.id) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

  const calculateImageHash = (file: File): string => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const hash = calculateImageHash(file);
      const isDuplicate = images.some(img => img.hash === hash);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      
      const placeholder: ImagePreview = {
        file,
        preview: '',
        hash,
        isDuplicate,
        type,
        loading: true
      };
      
      setImages(prev => [...prev, placeholder]);
      
      try {
        const reader = new FileReader();
        
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            setImages(prev => prev.map(img => 
              img.hash === hash ? {
                ...img,
                preview: reader.result as string,
                loading: false
              } : img
            ));
            resolve(null);
          };
          
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error('Error processing file:', error);
        setImages(prev => prev.map(img => 
          img.hash === hash ? {
            ...img,
            loading: false,
            error: 'Failed to load file'
          } : img
        ));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageToDelete(index);
  };

  const confirmImageDelete = () => {
    if (imageToDelete === null) return;

    const image = images[imageToDelete];
    if (image.url && !image.id) {
      URL.revokeObjectURL(image.url);
    }
    setImages(prev => prev.filter((_, i) => i !== imageToDelete));
    setImageToDelete(null);
  };

  const handleRemoveDuplicates = () => {
    setImages(prev => prev.filter(img => !img.isDuplicate));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 && !editItem) return;

    const newItem = {
      ...formData,
      board_id: editItem?.board_id || '',
      image_ids: editItem ? editItem.image_ids : [],
      profit
    } as Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>;

    const newImageFiles = images
      .filter(img => img.file)
      .map(img => img.file!)
      .filter(Boolean);

    onAdd(newItem, newImageFiles);
    handleClose();
  };

  const handleClose = () => {
    setImages([]);
    setFormData({
      product_id: '',
      title: '',
      description: '',
      category: '',
      label: '',
      sale_status: 'available',
      purchase_price: 0,
      listed_price: 0,
      sold_at: 0,
      delivery_charges: 0,
      sale_type: 'online',
      paid_to: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: ''
    });
    onClose();
  };

  const handleCategoryChange = (value: string) => {
    if (value === '__new__') {
      setShowCategoryModal(true);
    } else {
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleLabelChange = (value: string) => {
    if (value === '__new__') {
      setShowLabelModal(true);
    } else {
      setFormData(prev => ({ ...prev, label: value }));
    }
  };

  const handlePaidToChange = (value: string) => {
    if (value === '__new__') {
      setShowPaidToModal(true);
    } else {
      setFormData(prev => ({ ...prev, paid_to: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof InventoryItem) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? 0 : parseFloat(value)
    }));
  };

  if (!isOpen) return null;

  const hasDuplicates = images.some(img => img.isDuplicate);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl transform transition-transform duration-300">
        <div className="h-full flex flex-col">
          <div className="flex-none px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {editItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-1 hover:bg-gray-50 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className={formStyles.label}>
                    Title
                    <span className="text-gray-400 font-normal ml-1">(Required)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter product title"
                    className={formStyles.input}
                    required
                  />
                </div>

                <div>
                  <label className={formStyles.label}>
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter product description"
                    className={formStyles.textarea}
                  />
                </div>
              </div>

              <div>
                <label className={formStyles.label}>
                  Media
                  <span className="text-gray-400 font-normal ml-1">(Required)</span>
                </label>
                {hasDuplicates && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-yellow-700">Duplicate files detected</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDuplicates}
                      className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Remove duplicates
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((file, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className={`w-full h-full rounded-lg overflow-hidden ring-1 ${
                        file.isDuplicate ? 'ring-yellow-300' : 'ring-gray-200'
                      }`}>
                        {file.loading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Loader className="h-6 w-6 text-gray-400 animate-spin" />
                          </div>
                        ) : file.error ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-4">
                            <AlertCircle className="h-6 w-6 text-red-400 mb-2" />
                            <p className="text-xs text-red-600 text-center">{file.error}</p>
                          </div>
                        ) : (
                          <img
                            src={file.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {file.isDuplicate && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-100 rounded text-xs text-yellow-700">
                          Duplicate
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="h-5 w-5 text-gray-400" />
                    <p className="mt-1 text-xs text-gray-500">Add Images</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={formStyles.label}>Product ID</label>
                  <input
                    type="text"
                    value={formData.product_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                    placeholder="Enter product ID"
                    className={formStyles.input}
                  />
                </div>

                <div>
                  <label className={formStyles.label}>Category</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={formStyles.input}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__new__" className="text-primary-600 font-medium">+ Add New Category</option>
                  </select>
                </div>

                <div>
                  <label className={formStyles.label}>Label</label>
                  <select
                    value={formData.label || ''}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    className={formStyles.input}
                  >
                    <option value="">Select label</option>
                    {labels.map(label => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                    <option value="__new__" className="text-primary-600 font-medium">+ Add New Label</option>
                  </select>
                </div>

                <div>
                  <label className={formStyles.label}>Purchase Price</label>
                  <div className="relative">
                    <span className={formStyles.currencySymbol}>₹</span>
                    <input
                      type="number"
                      value={formData.purchase_price || ''}
                      onChange={(e) => handleNumberChange(e, 'purchase_price')}
                      className={formStyles.inputWithIcon}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>
                </div>

                <div>
                  <label className={formStyles.label}>Listed Price</label>
                  <div className="relative">
                    <span className={formStyles.currencySymbol}>₹</span>
                    <input
                      type="number"
                      value={formData.listed_price || ''}
                      onChange={(e) => handleNumberChange(e, 'listed_price')}
                      className={formStyles.inputWithIcon}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  {!showAdvancedFields ? (
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFields(true)}
                      className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      + Show more fields
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFields(false)}
                      className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      - Show less
                    </button>
                  )}
                </div>

                {showAdvancedFields && (
                  <>
                    <div>
                      <label className={formStyles.label}>Sold At</label>
                      <div className="relative">
                        <span className={formStyles.currencySymbol}>₹</span>
                        <input
                          type="number"
                          value={formData.sold_at || ''}
                          onChange={(e) => handleNumberChange(e, 'sold_at')}
                          className={formStyles.inputWithIcon}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={formStyles.label}>Delivery Charges</label>
                      <div className="relative">
                        <span className={formStyles.currencySymbol}>₹</span>
                        <input
                          type="number"
                          value={formData.delivery_charges || ''}
                          onChange={(e) => handleNumberChange(e, 'delivery_charges')}
                          className={formStyles.inputWithIcon}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={formStyles.label}>Profit</label>
                      <div className="relative">
                        <span className={formStyles.currencySymbol}>₹</span>
                        <input
                          type="number"
                          value={profit}
                          disabled
                          className={`${formStyles.inputWithIcon} bg-gray-50 text-gray-500 cursor-not-allowed`}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={formStyles.label}>Sale Type</label>
                      <select
                        value={formData.sale_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, sale_type: e.target.value as 'online' | 'offline' }))}
                        className={formStyles.input}
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>

                    <div>
                      <label className={formStyles.label}>Paid To</label>
                      <select
                        value={formData.paid_to || ''}
                        onChange={(e) => handlePaidToChange(e.target.value)}
                        className={formStyles.input}
                      >
                        <option value="">Select recipient</option>
                        {paidToOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                        <option value="__new__" className="text-primary-600 font-medium">+ Add New Recipient</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex-none px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className={formStyles.button.secondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={images.length === 0 && !editItem}
                  className={formStyles.button.primary}
                >
                  {editItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={imageToDelete !== null}
        onClose={() => setImageToDelete(null)}
        onConfirm={confirmImageDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
      />

      <CategoryManager
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        onAddCategory={onAddCategory}
        onRemoveCategory={onRemoveCategory}
        title="Manage Categories"
        addLabel="Add new category"
        searchPlaceholder="Search categories..."
      />

      <CategoryManager
        isOpen={showLabelModal}
        onClose={() => setShowLabelModal(false)}
        categories={labels}
        onAddCategory={onAddLabel}
        onRemoveCategory={onRemoveLabel}
        title="Manage Labels"
        addLabel="Add new label"
        searchPlaceholder="Search labels..."
      />

      <CategoryManager
        isOpen={showPaidToModal}
        onClose={() => setShowPaidToModal(false)}
        categories={paidToOptions}
        onAddCategory={onAddPaidTo}
        onRemoveCategory={onRemovePaidTo}
        title="Manage Recipients"
        addLabel="Add new recipient"
        searchPlaceholder="Search recipients..."
      />
    </div>
  );
};