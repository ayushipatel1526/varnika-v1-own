import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-boutique-cream to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-boutique-teal animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-boutique-gold animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo prominently displayed */}
          <div className="mb-8">
            <img 
              src="/assets/logo.png" 
              alt="Varnika Boutique Logo" 
              className="mx-auto h-32 w-auto"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-light text-boutique-teal-dark mb-6 tracking-wide">
            Elegance Redefined
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover curated collections that celebrate timeless beauty and contemporary style. 
            Each piece tells a story of craftsmanship and sophistication.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/collection')}
              className="bg-gradient-to-r from-boutique-teal to-boutique-teal-light hover:from-boutique-teal-dark hover:to-boutique-teal text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Explore Collection
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/collection')}
              className="border-boutique-teal text-boutique-teal hover:bg-boutique-teal hover:text-white text-lg px-8 py-6 transition-all duration-300"
            >
              View Catalog
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;