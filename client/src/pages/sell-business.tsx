import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building, DollarSign, MapPin, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SellBusiness() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [businessForm, setBusinessForm] = useState({
    name: "",
    description: "",
    category: "",
    country: "",
    state: "",
    price: "",
    contactEmail: "",
    contactPhone: "",
    yearEstablished: "",
    employees: "",
    revenue: "",
    reason: "",
    assets: "",
    imageUrl: "",
    package: ""
  });

  const businessCategories = [
    "Automotive",
    "Building, Storage & Decorating",
    "Child Education and Development",
    "Coffee",
    "Computer Technology",
    "Convenience Stores",
    "Direct Marketing",
    "Food-Beverage Related Businesses",
    "Health, Beauty & Nutrition",
    "Real Estate",
    "Repair & Restoration",
    "Retail",
    "Manufacturing",
    "Services",
    "Other"
  ];

  const countries = [
    "USA",
    "Australia", 
    "India",
    "UK",
    "Europe"
  ];

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Making API request with data:", data);
      try {
        const response = await apiRequest("POST", "/api/businesses", data);
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
        'basic': 150,
        'premium': 300,
        'enterprise': 500
      };
      
      const amount = packagePricing[businessForm.package as keyof typeof packagePricing] || 100;
      const description = `${businessForm.package.charAt(0).toUpperCase() + businessForm.package.slice(1)} Business Listing Package`;
      
      toast({
        title: "Business Listed Successfully",
        description: "Redirecting to secure payment to activate your listing.",
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
        description: "Failed to submit business listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started", businessForm);
    
    if (!businessForm.name || !businessForm.description || !businessForm.category || !businessForm.contactEmail || !businessForm.package) {
      console.log("Validation failed:", { 
        name: businessForm.name, 
        description: businessForm.description,
        category: businessForm.category,
        contactEmail: businessForm.contactEmail, 
        package: businessForm.package 
      });
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including listing package selection.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = {
      name: businessForm.name,
      description: businessForm.description,
      category: businessForm.category,
      country: businessForm.country,
      state: businessForm.state,
      price: businessForm.price ? parseInt(businessForm.price) : null,
      contactEmail: businessForm.contactEmail,
      imageUrl: businessForm.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      isActive: false,
      status: "pending",
      paymentStatus: "unpaid",
      package: businessForm.package,
      yearEstablished: businessForm.yearEstablished,
      employees: businessForm.employees,
      revenue: businessForm.revenue,
      reason: businessForm.reason,
      assets: businessForm.assets
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sell Your Business</h1>
            <p className="text-gray-600">List your business on our global marketplace and reach potential buyers worldwide</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 flex items-center">
                <Building className="w-5 h-5 mr-2 text-[hsl(var(--b2b-blue))]" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={businessForm.name}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter business name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={businessForm.category} onValueChange={(value) => setBusinessForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    value={businessForm.description}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your business, what it does, its unique selling points..."
                    rows={4}
                    required
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={businessForm.country} onValueChange={(value) => setBusinessForm(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      type="text"
                      value={businessForm.state}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Enter state or province"
                    />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Asking Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={businessForm.price}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="250000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="revenue">Annual Revenue ($)</Label>
                      <Input
                        id="revenue"
                        type="text"
                        value={businessForm.revenue}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, revenue: e.target.value }))}
                        placeholder="500000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="yearEstablished">Year Established</Label>
                      <Input
                        id="yearEstablished"
                        type="number"
                        value={businessForm.yearEstablished}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, yearEstablished: e.target.value }))}
                        placeholder="2015"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employees">Number of Employees</Label>
                    <Input
                      id="employees"
                      type="number"
                      value={businessForm.employees}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, employees: e.target.value }))}
                      placeholder="10"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Business Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={businessForm.imageUrl}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/business-photo.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Selling</Label>
                  <Textarea
                    id="reason"
                    value={businessForm.reason}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Retirement, relocation, new opportunities..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="assets">Key Assets Included</Label>
                  <Textarea
                    id="assets"
                    value={businessForm.assets}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, assets: e.target.value }))}
                    placeholder="Equipment, inventory, customer database, brand, real estate..."
                    rows={3}
                  />
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={businessForm.contactEmail}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="owner@business.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={businessForm.contactPhone}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Listing Package Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">Select Listing Package *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <label className={`cursor-pointer ${businessForm.package === 'test' ? 'ring-2 ring-[hsl(var(--b2b-blue))]' : ''}`}>
                      <input
                        type="radio"
                        name="package"
                        value="test"
                        checked={businessForm.package === 'test'}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, package: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="bg-white p-4 rounded border hover:border-[hsl(var(--b2b-blue))] transition-colors">
                        <h4 className="font-semibold text-gray-800">Test Listing</h4>
                        <p className="text-2xl font-bold text-[hsl(var(--b2b-blue))] mb-2">$1/month</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Test placement</li>
                          <li>• Limited visibility</li>
                          <li>• Basic features</li>
                        </ul>
                      </div>
                    </label>
                    <label className={`cursor-pointer ${businessForm.package === 'basic' ? 'ring-2 ring-[hsl(var(--b2b-blue))]' : ''}`}>
                      <input
                        type="radio"
                        name="package"
                        value="basic"
                        checked={businessForm.package === 'basic'}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, package: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="bg-white p-4 rounded border hover:border-[hsl(var(--b2b-blue))] transition-colors">
                        <h4 className="font-semibold text-gray-800">Basic Listing</h4>
                        <p className="text-2xl font-bold text-[hsl(var(--b2b-blue))] mb-2">$150/month</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Standard listing display</li>
                          <li>• Basic search visibility</li>
                          <li>• Contact form inquiries</li>
                        </ul>
                      </div>
                    </label>
                    <label className={`cursor-pointer ${businessForm.package === 'premium' ? 'ring-2 ring-[hsl(var(--b2b-blue))]' : ''}`}>
                      <input
                        type="radio"
                        name="package"
                        value="premium"
                        checked={businessForm.package === 'premium'}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, package: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="bg-white p-4 rounded border border-[hsl(var(--b2b-blue))] hover:border-[hsl(var(--b2b-blue))] transition-colors">
                        <h4 className="font-semibold text-gray-800">Premium Listing</h4>
                        <p className="text-2xl font-bold text-[hsl(var(--b2b-blue))] mb-2">$300/month</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Featured listing placement</li>
                          <li>• Enhanced search visibility</li>
                          <li>• Priority support</li>
                          <li>• Detailed analytics</li>
                        </ul>
                      </div>
                    </label>
                    <label className={`cursor-pointer ${businessForm.package === 'enterprise' ? 'ring-2 ring-[hsl(var(--b2b-blue))]' : ''}`}>
                      <input
                        type="radio"
                        name="package"
                        value="enterprise"
                        checked={businessForm.package === 'enterprise'}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, package: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="bg-white p-4 rounded border hover:border-[hsl(var(--b2b-blue))] transition-colors">
                        <h4 className="font-semibold text-gray-800">Enterprise Listing</h4>
                        <p className="text-2xl font-bold text-[hsl(var(--b2b-blue))] mb-2">$500/month</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Top listing placement</li>
                          <li>• Maximum exposure</li>
                          <li>• Dedicated account manager</li>
                          <li>• Full marketing support</li>
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
                    {submitMutation.isPending ? "Submitting..." : "List My Business"}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>By submitting this form, you agree to our terms of service and privacy policy.</p>
                  <p>Your listing will be reviewed and activated once approved by our team.</p>
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