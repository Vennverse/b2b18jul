import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Mail, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Franchise } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FranchiseDetails() {
  const [, params] = useRoute("/franchise/:id");
  const franchiseId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    investmentCapacity: "",
    location: ""
  });

  const { data: franchise, isLoading } = useQuery<Franchise>({
    queryKey: ["/api/franchises", franchiseId],
    enabled: !!franchiseId,
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof inquiryForm) => {
      return apiRequest("POST", `/api/franchises/${franchiseId}/inquire`, { ...data, franchiseId });
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully",
        description: "We will contact you within 24 hours with more information.",
      });
      setInquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        investmentCapacity: "",
        location: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    inquiryMutation.mutate(inquiryForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Franchise Not Found</h1>
            <p className="text-gray-600">The franchise you're looking for doesn't exist.</p>
            <Button 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          Back to Franchises
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Franchise Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800">{franchise.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <img 
                  src={franchise.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"} 
                  alt={franchise.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Franchise</h3>
                  <p className="text-gray-600">{franchise.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-[hsl(var(--b2b-blue))]" />
                    <span>{franchise.country}, {franchise.state}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    <span>{franchise.priceRange}</span>
                  </div>
                </div>

                {franchise.investmentMin && franchise.investmentMax && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Investment Range</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-[hsl(var(--b2b-blue))] font-bold text-lg">
                        ${franchise.investmentMin.toLocaleString()}
                      </span>
                      <span className="text-gray-500">to</span>
                      <span className="text-green-600 font-bold text-lg">
                        ${franchise.investmentMax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Category</h4>
                  <span className="inline-block bg-[hsl(var(--b2b-blue))] text-white px-3 py-1 rounded-full text-sm">
                    {franchise.category}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inquiry Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Request Information</CardTitle>
                <p className="text-gray-600">Get detailed information about this franchise opportunity</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Preferred Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={inquiryForm.location}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State/Country"
                    />
                  </div>

                  <div>
                    <Label htmlFor="investment">Investment Capacity</Label>
                    <Input
                      id="investment"
                      type="text"
                      value={inquiryForm.investmentCapacity}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, investmentCapacity: e.target.value }))}
                      placeholder="e.g., $100K - $250K"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Message</Label>
                    <Textarea
                      id="message"
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell us about your interest in this franchise..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full b2b-button-primary"
                    disabled={inquiryMutation.isPending}
                  >
                    {inquiryMutation.isPending ? "Sending..." : "Send Inquiry"}
                  </Button>

                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-4">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      214-310-7674
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      btwobmarket@gmail.com
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}