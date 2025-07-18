import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Globe, TrendingUp, Award, Target, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import sarahGeorgeImage from "@assets/486035237_4592209034398804_6866392456188871337_n_1750192689489.jpg";
import johnThomasImage from "@assets/500257174_4654995984786775_4873222664145973918_n_1750192909652.jpg";

export default function About() {
  const stats = [
    { number: "", label: "Global Reach" },
    { number: "", label: "International Platform" },
    { number: "", label: "Business Marketplace" },
    { number: "", label: "Franchise Opportunities" }
  ];

  const team = [
    {
      name: "Sarah George",
      role: "CEO & Founder",
      description: "Leading B2B Market's mission to connect businesses globally",
      image: sarahGeorgeImage
    },
    {
      name: "Thomas Jacob",
      role: "President",
      description: "Driving strategic growth and business development initiatives",
      image: null
    },
    {
      name: "John Thomas",
      role: "CIO",
      description: "Overseeing technology infrastructure and digital innovation",
      image: null
    },
    {
      name: "Shubham Dubey",
      role: "CTO",
      description: "Leading technology innovation and engineering excellence",
      image: null
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Mission",
      description: "To create the world's most trusted platform for business transactions, connecting entrepreneurs globally."
    },
    {
      icon: Heart,
      title: "Vision",
      description: "A world where every business owner can easily find the right buyer, seller, or franchise partner."
    },
    {
      icon: Award,
      title: "Values",
      description: "Integrity, transparency, and excellence in every business relationship we facilitate."
    }
  ];

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

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About B2B Market</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            B2B Market has a large inventory of businesses and franchises for sale on an International Platform.
            A large Internet marketplace for our B2B Audience, B2B Market provides a platform for prospective franchise owners, 
            prospective buyers and sellers looking to buy and sell businesses, franchises and those looking to post ads to market their businesses.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-[hsl(var(--b2b-blue))] mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                B2B Market provides many offerings such as franchise opportunities, Businesses for sale and it provides 
                a platform for businesses and people to expand their operations globally at no additional cost.
              </p>
              <p>
                Bringing people and business together on an international platform, B2B Market has established itself 
                as a comprehensive marketplace serving a global B2B audience.
              </p>
              <p>
                Our platform connects prospective franchise owners with established franchise systems, enables business 
                buyers and sellers to find each other, and provides advertising opportunities for businesses looking 
                to market their services internationally.
              </p>
            </div>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Business meeting" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>

        {/* Mission, Vision, Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Mission, Vision & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="bg-[hsl(var(--b2b-blue))] rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-800">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[hsl(var(--b2b-orange))] rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Global Reach</h3>
              <p className="text-gray-600">The largest international network of business buyers and sellers</p>
            </div>
            <div className="text-center">
              <div className="bg-[hsl(var(--b2b-orange))] rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Expert Support</h3>
              <p className="text-gray-600">Dedicated team of business transaction specialists</p>
            </div>
            <div className="text-center">
              <div className="bg-[hsl(var(--b2b-orange))] rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Proven Results</h3>
              <p className="text-gray-600">Thousands of successful business transactions completed</p>
            </div>
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Meet Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: "center 30%",
                          transform: "scale(1.2)",
                          filter: "brightness(1.05)"
                        }}
                      />
                    ) : (
                      <div className="text-2xl font-bold text-gray-400">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg text-gray-800">{member.name}</CardTitle>
                  <p className="text-[hsl(var(--b2b-blue))] font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="bg-gradient-to-r from-[hsl(var(--b2b-blue))] to-[hsl(var(--b2b-blue-dark))] rounded-lg p-8 text-white mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Awards & Recognition</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="font-semibold mb-2">Best Business Platform 2023</h3>
              <p className="text-sm opacity-90">International Business Awards</p>
            </div>
            <div>
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="font-semibold mb-2">Top Franchise Platform</h3>
              <p className="text-sm opacity-90">Global Franchise Review</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🌟</div>
              <h3 className="font-semibold mb-2">Excellence in Service</h3>
              <p className="text-sm opacity-90">Customer Choice Awards</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-white rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Work With Us?</h2>
          <p className="text-xl text-gray-600 mb-6">
            Join thousands of successful business owners who trust B2B Market for their business transactions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="b2b-button-primary px-8 py-3">
              Start Selling
            </Button>
            <Button variant="outline" className="px-8 py-3">
              Browse Opportunities
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}