import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Award } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-boutique-teal" />,
      title: "Handcrafted Excellence",
      description: "Each piece is meticulously crafted by skilled artisans, ensuring the highest quality and attention to detail."
    },
    {
      icon: <Heart className="h-8 w-8 text-boutique-teal" />,
      title: "Passion for Design",
      description: "Our collections reflect a deep passion for traditional aesthetics blended with contemporary fashion sensibilities."
    },
    {
      icon: <Award className="h-8 w-8 text-boutique-teal" />,
      title: "Award-Winning Quality",
      description: "Recognized for excellence in design and craftsmanship, we maintain the highest standards in every creation."
    }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-light text-boutique-teal-dark mb-6">
              Our Story
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Founded with a vision to celebrate the rich heritage of traditional craftsmanship, 
              our boutique has been a sanctuary for those who appreciate timeless elegance and 
              sophisticated design. Every piece in our collection tells a story of artisanal 
              excellence and cultural heritage.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="flex items-start space-x-4 p-6">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-card-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=600&fit=crop" 
                alt="Boutique Interior"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-boutique-gold rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-boutique-teal rounded-full opacity-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;