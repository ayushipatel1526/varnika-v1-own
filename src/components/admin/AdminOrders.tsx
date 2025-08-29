import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
  order_items?: {
    id: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
    product: {
      name: string;
      images: string[];
    };
  }[];
}

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!inner (full_name, email),
          order_items (
            *,
            product:products (name, images)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order status updated');
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Orders</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(-8)}
                  </CardTitle>
                  <CardDescription>
                    {order.profiles?.full_name} ({order.profiles?.email})
                  </CardDescription>
                  <CardDescription>
                    {new Date(order.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                          Order #{order.id.slice(-8)}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrder && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Customer Info</h4>
                              <p>{selectedOrder.profiles?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedOrder.profiles?.email}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Order Status</h4>
                              <Select
                                value={selectedOrder.status}
                                onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <div className="text-sm text-muted-foreground">
                              {selectedOrder.shipping_address && (
                                <div>
                                  <p>{selectedOrder.shipping_address.street}</p>
                                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                                  <p>{selectedOrder.shipping_address.country}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Order Items</h4>
                            <div className="space-y-2">
                              {selectedOrder.order_items?.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 p-2 border rounded-lg">
                                  <img
                                    src={item.product.images[0] || '/placeholder.svg'}
                                    alt={item.product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity}
                                      {item.size && ` • Size: ${item.size}`}
                                      {item.color && ` • Color: ${item.color}`}
                                    </p>
                                  </div>
                                  <p className="font-medium">₹{item.price.toLocaleString('en-IN')}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Total</span>
                              <span className="text-xl font-bold">₹{selectedOrder.total_amount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">₹{order.total_amount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.order_items?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {order.payment_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      )}
    </div>
  );
};