import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="shop" className="py-20 bg-gradient-to-b from-background to-boutique-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-boutique-teal-dark mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked pieces that embody the essence of traditional craftsmanship with modern aesthetics
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading featured products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No featured products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card">
                <div className="relative overflow-hidden">
                  {product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-80 bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-sm">No Image Available</p>
                      </div>
                    </div>
                  )}
                  <Badge 
                    className="absolute top-4 left-4 bg-boutique-teal text-white"
                    variant="secondary"
                  >
                    Featured
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2 text-card-foreground group-hover:text-boutique-teal transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-semibold text-boutique-teal">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.original_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <Button 
                    className="w-full bg-boutique-teal hover:bg-boutique-teal-dark transition-colors"
                    variant="default"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate('/collection')}
            className="border-boutique-teal text-boutique-teal hover:bg-boutique-teal hover:text-white px-8"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;