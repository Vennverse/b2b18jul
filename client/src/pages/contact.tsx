import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, MapPin, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Contact() {
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState("Contact Us");
  
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: ""
  });

  useEffect(() => {
    // Contact page title can be updated based on specific needs in the future
  }, []);

  const inquiryTypes = [
    "General Inquiry",
    "Franchise Opportunities",
    "Sell My Business",
    "Buy a Business",
    "Advertisement",
    "Technical Support",
    "Partnership",
    "Media & Press"
  ];

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us. We will respond within 24 hours.",
      });
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(contactForm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{pageTitle}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for any questions about buying, selling, or franchising your business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 flex items-center">
                <Send className="w-5 h-5 mr-2 text-[hsl(var(--b2b-blue))]" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inquiryType">Inquiry Type</Label>
                    <Select value={contactForm.inquiryType} onValueChange={(value) => setContactForm(prev => ({ ...prev, inquiryType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief subject of your inquiry"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full b2b-button-primary"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">


                <div className="flex items-start space-x-4">
                  <div className="bg-[hsl(var(--b2b-blue))] rounded-full p-3">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">btwobmarket@gmail.com</p>
                    <p className="text-sm text-gray-500">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[hsl(var(--b2b-blue))] rounded-full p-3">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Global Platform</h3>
                    <p className="text-gray-600">Serving businesses worldwide</p>
                    <p className="text-sm text-gray-500">International marketplace</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[hsl(var(--b2b-blue))] rounded-full p-3">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM EST</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Emergency Contact */}
            <div className="bg-[hsl(var(--b2b-orange))] rounded-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Urgent Business Matters?</h3>
              <p className="mb-4">For time-sensitive business transactions or urgent inquiries, contact us directly.</p>
              <Button className="bg-white text-[hsl(var(--b2b-orange))] hover:bg-gray-100">
                Priority Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}