import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      navigate('/auth');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create order
      const orderData = {
        user_id: user.id,
        total_amount: cartTotal,
        status: 'pending',
        payment_status: 'pending',
        shipping_address: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        billing_address: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        size: item.size,
        color: item.color
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      await clearCart();
      
      setOrderSuccess(true);
      setShowCheckout(false);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your order. We'll process it and send you updates via email.
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/')} className="w-full">
                  Continue Shopping
                </Button>
                <Button onClick={() => navigate('/admin')} variant="outline" className="w-full">
                  View Orders (Admin)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cartItems.length === 0 ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Add some products to get started</p>
              <Button onClick={() => navigate('/collection')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {item.product?.images && item.product.images.length > 0 && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product?.name || 'Product'}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.product?.name || 'Product'}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-bold text-boutique-teal">
                            ₹{(item.product?.price || 0).toLocaleString('en-IN')}
                          </span>
                          {item.size && (
                            <Badge variant="secondary">Size: {item.size}</Badge>
                          )}
                          {item.color && (
                            <Badge variant="secondary">Color: {item.color}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-right">
                      <span className="text-lg font-bold">
                        Subtotal: ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Proceed to Checkout
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Checkout</DialogTitle>
                        <DialogDescription>
                          Please provide your shipping details
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                              id="fullName"
                              value={formData.fullName}
                              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="address">Address *</Label>
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            value={formData.pincode}
                            onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Special instructions for delivery..."
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Amount</span>
                            <span className="font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            * Payment will be collected on delivery (Cash on Delivery)
                          </p>
                        </div>
                        
                        <Button 
                          onClick={handleCheckout} 
                          className="w-full" 
                          disabled={isCheckingOut}
                        >
                          {isCheckingOut ? 'Placing Order...' : 'Place Order (COD)'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/collection')}
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;