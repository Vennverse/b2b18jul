import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PostAd() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [adForm, setAdForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    contactEmail: "",
    contactPhone: "",
    company: "",
    budget: "",
    package: ""
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Making API request with data:", data);
      try {
        const response = await apiRequest("POST", "/api/advertisements", data);
        console.log("API response:", response);
        const result = await response.json();
        console.log("Parsed response:", result);
        return result;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Success callback triggered with:", data);
      
      // Get package pricing
      const packagePricing = {
        'test': 1,
        'basic': 100,
        'premium': 250,
        'enterprise': 500
      };
      
      const amount = packagePricing[adForm.package as keyof typeof packagePricing] || 100;
      const description = `${adForm.package.charAt(0).toUpperCase() + adForm.package.slice(1)} Advertisement Package`;
      
      toast({
        title: "Advertisement Submitted Successfully",
        description: "Redirecting to secure payment to activate your ad.",
      });
      
      // Redirect to checkout with payment details
      setTimeout(() => {
        setLocation(`/checkout?amount=${amount}&description=${encodeURIComponent(description)}`);
      }, 1500);
    },
    onError: (error) => {
      console.error("Error callback triggered:", error);
      toast({
        title: "Error",
        description: "Failed to submit advertisement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started", adForm);
    
    if (!adForm.title || !adForm.contactEmail || !adForm.package) {
      console.log("Validation failed:", { 
        title: adForm.title, 
        contactEmail: adForm.contactEmail, 
        package: adForm.package 
      });
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including advertisement package selection.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = {
      title: adForm.title,
      imageUrl: adForm.imageUrl || "https://images.unsplash.com/photo-1557838923-2985c318be48?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      targetUrl: adForm.targetUrl || "#",
      isActive: false,
      status: "pending",
      paymentStatus: "unpaid",
      package: adForm.package,
      company: adForm.company,
      contactEmail: adForm.contactEmail,
      contactPhone: adForm.contactPhone,
      budget: adForm.budget,
      description: adForm.description
    };
    
    console.log("Submitting form data:", formData);
    submitMutation.mutate(formData);
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

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Post Your Advertisement</h1>
            <p className="text-gray-600">Promote your business to our global audience of entrepreneurs and business buyers</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-[hsl(var(--b2b-blue))]" />
                Advertisement Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Advertisement Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={adForm.title}
                    onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter compelling advertisement title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={adForm.description}
                    onChange={(e) => setAdForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product, service, or business opportunity..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Advertisement Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={adForm.imageUrl}
                    onChange={(e) => setAdForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/ad-image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 400x250 pixels</p>
                </div>

                <div>
                  <Label htmlFor="targetUrl">Target URL</Label>
                  <Input
                    id="targetUrl"
                    type="url"
                    value={adForm.targetUrl}
                    onChange={(e) => setAdForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                    placeholder="https://your-website.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Where users will be directed when they click your ad</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        type="text"
                        value={adForm.company}
                        onChange={(e) => setAdForm(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={adForm.contactEmail}
                        onChange={(e) => setAdForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="contact@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={adForm.contactPhone}
                        onChange={(e) => setAdForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget">Monthly Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={adForm.budget}
                        onChange={(e) => setAdForm(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="500"
                        min="100"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">Select Advertisement Package *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <label className={`cursor-pointer ${adForm.package === 'test' ? 'ring-2 ring-[hsl(var(--b2b-blue))]' : ''}`}>
                      <input
                        type="radio"
                        name="package"
                        value="test"
                        checked={adForm.package === 'test'}
                        onChange={(e) => setAdForm(prev => ({ ...prev, package: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="bg-white p-4 rounded border hover:border-[hsl(var(--b2b-blue))] transition-colors">
                        <h4 className="font-semibold text-gray-800">Test</h4>
                        <p className="text-2xl font-bold text-[hsl(var(--b2b-blue))] mb-2">$1/month</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Test display</li>
                          <li>• 100 impressions</li>
                          <li>• Basic analytics</li>
                        </ul>
                      </div>
                    </label>
                    <label className={`cursor-pointer ${adForm.package === 'basic' ? 'ring-2 ring-[hsl(var(--b2b-blue))]' : ''}`}>
                      <input
                        type="radio"
                        name="package"
                        value="basic"
                        checked={adForm.package === 'basic'}
                        onChange={(e) => setAdForm(prev => ({ ...prev, package: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="bg-white p-4 rounded border hover:border-[hsl(var(--b2b-blue))] transition-colors">
                        <h4 className="font-semibold text-gray-800">Basic</h4>
                        <p className="text-2xl font-bold text-[hsl(var(--b2b-blue))] mb-2">$100/month</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Homepage display</li>
                          <li>• 1,000 impressions</li>
                          <li>• Basic analytics</li>
                        </ul>
                      </div>
                    </label>
                    <label className={`cursor-pointer ${adForm.package === 'premium' ? 'ring-2 ring-[hsl(var(--b2b-blue))]' : ''}`}>
                      <input
                        type="radio"
                        name="package"
                        value="premium"
                        checked={adForm.package === 'premium'}
                        onChange={(e) => setAdForm(prev => ({ ...prev, package: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="bg-white p-4 rounded border border-[hsl(var(--b2b-blue))] hover:border-[hsl(var(--b2b-blue))] transition-colors">
                        <h4 className="font-semibold text-gray-800">Premium</h4>
                        <p className="text-2xl font-bold text-[hsl(var(--b2b-blue))] mb-2">$250/month</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Featured placement</li>
                          <li>• 5,000 impressions</li>
                          <li>• Advanced analytics</li>
                          <li>• Email support</li>
                        </ul>
                      </div>
                    </label>
                    <label className={`cursor-pointer ${adForm.package === 'enterprise' ? 'ring-2 ring-[hsl(var(--b2b-blue))]' : ''}`}>
                      <input
                        type="radio"
                        name="package"
                        value="enterprise"
                        checked={adForm.package === 'enterprise'}
                        onChange={(e) => setAdForm(prev => ({ ...prev, package: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="bg-white p-4 rounded border hover:border-[hsl(var(--b2b-blue))] transition-colors">
                        <h4 className="font-semibold text-gray-800">Enterprise</h4>
                        <p className="text-2xl font-bold text-[hsl(var(--b2b-blue))] mb-2">$500/month</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Premium placement</li>
                          <li>• 15,000 impressions</li>
                          <li>• Full analytics suite</li>
                          <li>• Priority support</li>
                        </ul>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    className="b2b-button-primary px-12 py-3 text-lg"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Advertisement"}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>By submitting this form, you agree to our advertising terms and conditions.</p>
                  <p>Your advertisement will be published immediately after submission.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}