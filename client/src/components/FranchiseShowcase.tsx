import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MapPin, DollarSign, MessageCircle, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InquiryModal from "@/components/InquiryModal";
import type { Franchise, Business } from "@shared/schema";

interface SearchFilters {
  category: string;
  country: string;
  state: string;
  priceRange: string;
}

interface FranchiseShowcaseProps {
  searchFilters?: SearchFilters;
  searchType?: "franchise" | "business";
}

export default function FranchiseShowcase({ searchFilters, searchType }: FranchiseShowcaseProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<Franchise | Business | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Build query key and URL based on whether we're searching or not
  const hasSearchFilters = searchFilters && (
    (searchFilters.category && searchFilters.category !== "All Business Categories") || 
    (searchFilters.country && searchFilters.country !== "Any Country") || 
    (searchFilters.state && searchFilters.state !== "Any State") || 
    (searchFilters.priceRange && searchFilters.priceRange !== "Price Range")
  );

  const { data: franchises, isLoading: franchisesLoading } = useQuery<Franchise[]>({
    queryKey: hasSearchFilters 
      ? ["/api/franchises/search", searchFilters]
      : ["/api/franchises"],
    queryFn: async () => {
      if (hasSearchFilters) {
        const params = new URLSearchParams();
        if (searchFilters!.category && searchFilters!.category !== "All Business Categories") {
          params.append('category', searchFilters!.category);
        }
        if (searchFilters!.country && searchFilters!.country !== "Any Country") {
          params.append('country', searchFilters!.country);
        }
        if (searchFilters!.state && searchFilters!.state !== "Any State") {
          params.append('state', searchFilters!.state);
        }
        if (searchFilters!.priceRange && searchFilters!.priceRange !== "Price Range") {
          params.append('priceRange', searchFilters!.priceRange);
        }
        
        const response = await fetch(`/api/franchises/search?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to search franchises');
        return response.json();
      } else {
        const response = await fetch('/api/franchises');
        if (!response.ok) throw new Error('Failed to fetch franchises');
        return response.json();
      }
    },
    enabled: !searchType || searchType === "franchise"
  });

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: hasSearchFilters 
      ? ["/api/businesses/search", searchFilters]
      : ["/api/businesses"],
    queryFn: async () => {
      if (hasSearchFilters) {
        const params = new URLSearchParams();
        if (searchFilters!.category && searchFilters!.category !== "All Business Categories") {
          params.append('category', searchFilters!.category);
        }
        if (searchFilters!.country && searchFilters!.country !== "Any Country") {
          params.append('country', searchFilters!.country);
        }
        if (searchFilters!.state && searchFilters!.state !== "Any State") {
          params.append('state', searchFilters!.state);
        }
        
        const response = await fetch(`/api/businesses/search?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to search businesses');
        return response.json();
      } else {
        const response = await fetch('/api/businesses');
        if (!response.ok) throw new Error('Failed to fetch businesses');
        return response.json();
      }
    },
    enabled: searchType === "business"
  });

  const isLoading = franchisesLoading || businessesLoading;
  const displayData = searchType === "business" ? businesses : franchises;

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 4));
  };

  const handleNextSlide = () => {
    if (displayData) {
      setCurrentSlide(prev => Math.min(displayData.length - 4, prev + 4));
    }
  };

  const handleFranchiseClick = (franchise: Franchise) => {
    setLocation(`/franchise/${franchise.id}`);
  };

  const handleBusinessClick = (business: Business) => {
    setLocation(`/business/${business.id}`);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Showcase <span className="text-[hsl(var(--b2b-blue))]">Franchises</span>
            </h3>
            <p className="text-gray-600">Loading franchise opportunities...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="franchise-card animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Showcase <span className="text-[hsl(var(--b2b-blue))]">
                {searchType === "business" ? "Businesses" : "Franchises"}
              </span>
            </h3>
            <p className="text-gray-600">
              No {searchType === "business" ? "business" : "franchise"} opportunities available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Showcase <span className="text-[hsl(var(--b2b-blue))]">
              {searchType === "business" ? "Businesses" : "Franchises"}
            </span>
          </h3>
          <p className="text-gray-600">* Click on the image to enquire</p>
        </div>

        {/* Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayData.slice(currentSlide, currentSlide + 8).map((item) => (
            <div 
              key={item.id} 
              className="franchise-card"
              onClick={() => {
                if (searchType === "business") {
                  handleBusinessClick(item as Business);
                } else {
                  handleFranchiseClick(item as Franchise);
                }
              }}
            >
              <img 
                src={item.imageUrl || (searchType === "business" 
                  ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
                  : "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250")} 
                alt={item.name} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = searchType === "business" 
                    ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
                    : "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
                }}
              />
              <div className="p-4">
                <h4 className="font-bold text-gray-800 text-center mb-1">{item.name}</h4>
                <p className="text-sm text-gray-600 text-center mb-2">{item.category}</p>
                
                {searchType === "business" && (item as Business).price && (
                  <div className="text-center">
                    <div className="investment-text investment-min">
                      ${(item as Business).price!.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Asking Price</p>
                  </div>
                )}
                
                {searchType === "franchise" && (item as Franchise).investmentMin && (item as Franchise).investmentMax && (
                  <div className="text-center">
                    <div className="investment-text investment-min">
                      ${(item as Franchise).investmentMin!.toLocaleString()}
                    </div>
                    <div className="investment-text investment-max">
                      ${(item as Franchise).investmentMax!.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Investment Range</p>
                  </div>
                )}
                
                {searchType === "franchise" && (item as Franchise).investmentRange && (
                  <p className="text-sm text-center text-[hsl(var(--b2b-blue))] font-medium mt-2">
                    {(item as Franchise).investmentRange}
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (searchType === "business") {
                        handleBusinessClick(item as Business);
                      } else {
                        handleFranchiseClick(item as Franchise);
                      }
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs b2b-button-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                      setIsInquiryModalOpen(true);
                    }}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Inquire
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation */}
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-gray-300 hover:bg-gray-400 rounded-full p-2 transition-colors disabled:opacity-50"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button 
            className="bg-gray-300 hover:bg-gray-400 rounded-full p-2 transition-colors disabled:opacity-50"
            onClick={handleNextSlide}
            disabled={!displayData || currentSlide >= displayData.length - 8}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        item={selectedItem}
        type={searchType || "franchise"}
      />
    </section>
  );
}
