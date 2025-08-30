import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import emailjs from '@emailjs/browser';

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        {
          to_email: 'ayushipatel1526@gmail.com',
          from_name: `${formData.firstName} ${formData.lastName}`,
          from_email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      toast({
        title: "Message Sent!",
        description: "Your message has been sent successfully. We'll get back to you soon!",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-boutique-cream to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-boutique-teal-dark mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visit our boutique or reach out to us for personalized styling consultations and custom orders
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-boutique-teal mb-6">Visit Our Boutique</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-boutique-teal mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-card-foreground">Location</h4>
                      <p className="text-muted-foreground">
                        36, Shivdhara Soc,Kankrol Road<br />
                        Near Shourabh Sanskar School<br />
                        Himmatnagar, Gujarat 383001
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-boutique-teal mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-card-foreground">Phone</h4>
                      <p className="text-muted-foreground">+91 9875284297</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-boutique-teal mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-card-foreground">Email</h4>
                      <p className="text-muted-foreground">ayushipatel1526@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-boutique-teal mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-card-foreground">Store Hours</h4>
                      <p className="text-muted-foreground">
                        Monday - Saturday: 10:00 AM - 7:00 PM<br />
                        Sunday: Closed 
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-boutique-teal mb-6">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-card-foreground mb-2 block">
                      First Name *
                    </label>
                    <Input 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Your first name"
                      className="border-boutique-teal/20 focus:border-boutique-teal"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-card-foreground mb-2 block">
                      Last Name
                    </label>
                    <Input 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Your last name"
                      className="border-boutique-teal/20 focus:border-boutique-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Email *
                  </label>
                  <Input 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="border-boutique-teal/20 focus:border-boutique-teal"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Phone Number
                  </label>
                  <Input 
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="border-boutique-teal/20 focus:border-boutique-teal"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Message *
                  </label>
                  <Textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your requirements or questions..."
                    rows={4}
                    className="border-boutique-teal/20 focus:border-boutique-teal"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-boutique-teal hover:bg-boutique-teal-dark"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;