import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, DollarSign, MessageCircle, Eye } from "lucide-react";
import { useLocation } from "wouter";
import InquiryModal from "@/components/InquiryModal";
import type { Franchise } from "@shared/schema";

export default function BuyFranchise() {
  const [searchTerm, setSearchTerm] = useState("");
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    async function fetchFranchises() {
      try {
        const response = await fetch('/api/franchises');
        const data = await response.json();
        setFranchises(data);
      } catch (error) {
        console.error('Error fetching franchises:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFranchises();
  }, []);

  const filteredFranchises = franchises.filter((franchise) => {
    if (!searchTerm) return true;
    return franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (franchise.description && franchise.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(var(--b2b-blue))] to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Buy a Franchise
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Discover profitable franchise opportunities worldwide
            </p>
            <p className="text-lg opacity-80">
              Find established franchise systems with proven business models
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Input
              placeholder="Search franchises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Franchise Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Available Franchises ({filteredFranchises.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading franchises...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFranchises.map((franchise) => (
                <Card key={franchise.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-orange-100 overflow-hidden">
                    <img 
                      src={franchise.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"} 
                      alt={franchise.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
                      }}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{franchise.name}</CardTitle>
                    <CardDescription className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {franchise.country}{franchise.state ? `, ${franchise.state}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {franchise.description || 'No description available'}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Investment:</span>
                        <span className="font-semibold text-[hsl(var(--b2b-blue))]">
                          {franchise.investmentMin && franchise.investmentMax 
                            ? `$${franchise.investmentMin.toLocaleString()} - $${franchise.investmentMax.toLocaleString()}`
                            : 'Contact for details'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="font-semibold">
                          {franchise.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Contact:</span>
                        <span className="font-semibold text-sm">
                          {franchise.contactEmail || 'Available on inquiry'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-[hsl(var(--b2b-blue))] hover:bg-blue-600"
                        onClick={() => setLocation(`/franchise/${franchise.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedFranchise(franchise);
                          setIsInquiryModalOpen(true);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Inquire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredFranchises.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No franchises found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or browse all available franchises.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        item={selectedFranchise}
        type="franchise"
      />
    </div>
  );
}