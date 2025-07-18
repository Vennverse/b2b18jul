import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import FranchiseShowcase from "@/components/FranchiseShowcase";
import Footer from "@/components/Footer";
import type { Advertisement } from "@shared/schema";

interface SearchFilters {
  category: string;
  country: string;
  state: string;
  priceRange: string;
}

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters | undefined>(undefined);
  const [searchType, setSearchType] = useState<"franchise" | "business">("franchise");

  const { data: advertisements = [], isLoading: adsLoading } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertisements'],
  });

  const handleSearch = (filters: SearchFilters, type: "franchise" | "business") => {
    setSearchFilters(filters);
    setSearchType(type);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSearch onSearch={handleSearch} />
      <FranchiseShowcase searchFilters={searchFilters} searchType={searchType} />
      
      {/* Advertisements Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Advertisements</h3>
            <p className="text-gray-600">* Click on the image to enquire</p>
          </div>

          {adsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[hsl(var(--b2b-blue))] border-t-transparent rounded-full"></div>
            </div>
          ) : advertisements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advertisements.map((ad) => (
                <div key={ad.id} className="relative group">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="w-full h-64 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => {
                      if (ad.targetUrl && ad.targetUrl !== '#') {
                        window.open(ad.targetUrl, '_blank');
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-end">
                    <div className="w-full p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h4 className="font-semibold text-lg">{ad.title}</h4>
                      {(ad as any).company && (
                        <p className="text-sm">{(ad as any).company}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No advertisements available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Watch Our Introduction</h3>
            <p className="text-lg text-gray-600">Learn how B2B Market connects businesses worldwide</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-xl">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/-R5zk0Tn_ho"
                title="B2B Market Introduction"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Sell Your Business Section */}
      <section className="py-16 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Sell Your Business Online</h3>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">Planning to sell your Business? Want Global Audience?</p>
                <p>Sell your Business at a Global Level, to a Global Audience & Gain Global Visibility</p>
                <p>Want Global Attention for your Business? You can now get it with B2B MARKET.</p>
              </div>
              <a href="/sell-business">
                <button className="b2b-button-primary mt-6 text-lg">
                  Get Started Now
                </button>
              </a>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Business consultation meeting" 
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
