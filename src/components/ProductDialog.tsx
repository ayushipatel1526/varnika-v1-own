import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
}

interface ProductDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
    onClose();
  };

  const canAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) return false;
    if (product.colors.length > 0 && !selectedColor) return false;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={product.images[currentImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              <DialogDescription className="text-base">
                {product.description}
              </DialogDescription>
            </DialogHeader>

            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              {product.original_price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                  <Badge variant="destructive">
                    {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 border rounded-md">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {product.stock_quantity} items in stock
              </p>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart - ₹{(product.price * quantity).toLocaleString('en-IN')}
            </Button>

            {!canAddToCart() && (
              <p className="text-sm text-destructive">
                Please select all required options before adding to cart.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};