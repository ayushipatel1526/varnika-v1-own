import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-boutique-teal-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <img 
              src="/assets/logo.png" 
              alt="Varnika Boutique Logo" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-white/80 mb-4 max-w-md">
              Where tradition meets contemporary elegance. Discover our curated collections 
              that celebrate the artistry of fine craftsmanship.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61579997941792" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6 text-white/60 hover:text-white cursor-pointer transition-colors" />
              </a>
              <a href="https://www.instagram.com/varnika_designer_studio/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6 text-white/60 hover:text-white cursor-pointer transition-colors" />
              </a>
              <Twitter className="h-6 w-6 text-white/60 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-white/80 hover:text-white transition-colors">Home</a></li>
              <li><a href="#shop" className="text-white/80 hover:text-white transition-colors">Shop</a></li>
              <li><a href="#about" className="text-white/80 hover:text-white transition-colors">About</a></li>
              <li><a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Sarees</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Lehengas</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Kurtas</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Accessories</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60">
            © 2025 Varnika Designer Studio. All rights reserved. Crafted with excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;