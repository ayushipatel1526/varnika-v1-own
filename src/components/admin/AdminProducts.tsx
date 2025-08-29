import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Upload, Camera, Crop } from 'lucide-react';
import { toast } from 'sonner';
import { ImageCropper } from '@/components/ImageCropper';
import { uploadImageToStorage, deleteImageFromStorage, validateImageFile, createImagePreview } from '@/utils/imageUtils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  stock_quantity: number;
  images: string[];
  sizes: string[];
  colors: string[];
  is_featured: boolean;
  is_active: boolean;
}

interface AdminProductsProps {
  onStatsUpdate: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ onStatsUpdate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    stock_quantity: 0,
    images: [],
    sizes: [],
    colors: [],
    is_featured: false,
    is_active: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperIndex, setCropperIndex] = useState<number | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast.error('Name and category are required');
      return;
    }
    
    try {
      setUploadingImages(true);
      
      // Upload new images first
      const uploadedImageUrls: string[] = [];
      for (const file of imageFiles) {
        const imageUrl = await uploadImageToStorage(file, file.name);
        uploadedImageUrls.push(imageUrl);
      }

      const allImages = [...uploadedImageUrls, ...(formData.images || [])];
      
      const productData = {
        name: formData.name,
        description: formData.description || '',
        category: formData.category,
        subcategory: formData.subcategory || null,
        brand: formData.brand || null,
        sku: formData.sku || null,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        stock_quantity: Number(formData.stock_quantity),
        images: allImages,
        sizes: Array.isArray(formData.sizes) ? formData.sizes : [],
        colors: Array.isArray(formData.colors) ? formData.colors : [],
        is_featured: formData.is_featured || false,
        is_active: formData.is_active !== false,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product added successfully');
      }

      await fetchProducts();
      onStatsUpdate();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product deleted successfully');
      await fetchProducts();
      onStatsUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      category: '',
      subcategory: '',
      brand: '',
      sku: '',
      stock_quantity: 0,
      images: [],
      sizes: [],
      colors: [],
      is_featured: false,
      is_active: true,
    });
    setEditingProduct(null);
    setIsAddingProduct(false);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsAddingProduct(true);
  };

  const handleArrayInput = (field: 'images' | 'sizes' | 'colors', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        continue;
      }

      validFiles.push(file);
      const preview = await createImagePreview(file);
      previews.push(preview);
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const handleCropImage = (index: number) => {
    const preview = imagePreviews[index] || (formData.images && formData.images[index]);
    if (preview) {
      setCropperImage(preview);
      setCropperIndex(index);
      setIsCropperOpen(true);
    }
  };

  const handleCropSave = async (croppedBlob: Blob) => {
    if (cropperIndex === null) return;

    try {
      const file = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const preview = await createImagePreview(file);

      if (cropperIndex < imageFiles.length) {
        // Update existing uploaded file
        const newFiles = [...imageFiles];
        newFiles[cropperIndex] = file;
        setImageFiles(newFiles);

        const newPreviews = [...imagePreviews];
        newPreviews[cropperIndex] = preview;
        setImagePreviews(newPreviews);
      } else {
        // Update existing product image - upload immediately
        setUploadingImages(true);
        const imageUrl = await uploadImageToStorage(croppedBlob, 'edited-image.jpg');
        
        const newImages = [...(formData.images || [])];
        const imageIndex = cropperIndex - imageFiles.length;
        
        // Delete old image
        if (newImages[imageIndex]) {
          await deleteImageFromStorage(newImages[imageIndex]);
        }
        
        newImages[imageIndex] = imageUrl;
        setFormData(prev => ({ ...prev, images: newImages }));
        setUploadingImages(false);
      }
    } catch (error) {
      console.error('Error saving cropped image:', error);
      toast.error('Failed to save edited image');
      setUploadingImages(false);
    }
  };

  const removeImage = async (index: number) => {
    if (index < imageFiles.length) {
      // Remove from uploaded files
      const newFiles = [...imageFiles];
      newFiles.splice(index, 1);
      setImageFiles(newFiles);

      const newPreviews = [...imagePreviews];
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    } else {
      // Remove from existing images
      const imageIndex = index - imageFiles.length;
      const imageToDelete = formData.images?.[imageIndex];
      
      if (imageToDelete) {
        await deleteImageFromStorage(imageToDelete);
      }
      
      const newImages = [...(formData.images || [])];
      newImages.splice(imageIndex, 1);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddingProduct(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                Fill in the product details below.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Original Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock Quantity</label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Subcategory</label>
                  <Input
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <Input
                    value={formData.brand || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={formData.sku || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Product Images</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                  </div>
                </div>

                {/* Display uploaded and existing images */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* New uploaded images */}
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCropImage(index)}
                        >
                          <Crop className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Existing product images */}
                  {formData.images?.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCropImage(imageFiles.length + index)}
                          disabled={uploadingImages}
                        >
                          <Crop className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(imageFiles.length + index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fallback manual URL input */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Or add image URLs manually</label>
                  <Textarea
                    value={formData.images?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('images', e.target.value)}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sizes (comma-separated)</label>
                  <Input
                    value={formData.sizes?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('sizes', e.target.value)}
                    placeholder="XS, S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Colors (comma-separated)</label>
                  <Input
                    value={formData.colors?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('colors', e.target.value)}
                    placeholder="Black, White, Red, Blue"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  />
                  <span className="text-sm">Featured Product</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadingImages}>
                  <Save className="h-4 w-4 mr-2" />
                  {uploadingImages ? 'Uploading...' : editingProduct ? 'Update' : 'Create'} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Cropper */}
      {cropperImage && (
        <ImageCropper
          src={cropperImage}
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setCropperImage(null);
            setCropperIndex(null);
          }}
          onSave={handleCropSave}
          aspectRatio={1}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.original_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {product.is_featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                  {!product.is_active && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                  <Badge variant="outline">Stock: {product.stock_quantity}</Badge>
                </div>
                
                {product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};