import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const plans = [
  {
    id: 'test',
    name: 'Test',
    price: 1,
    description: 'Test package for demonstration purposes',
    features: [
      'Limited listing placement',
      'Basic support',
      'Test analytics',
      '1 business listing',
      'Standard review process'
    ],
    popular: false
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 100,
    description: 'Perfect for small businesses getting started',
    features: [
      'Standard listing placement',
      'Email customer support',
      'Basic analytics',
      'Up to 2 business listings',
      'Standard review process'
    ],
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 250,
    description: 'Most popular for growing businesses',
    features: [
      'Featured listing placement',
      'Priority customer support',
      'Advanced analytics dashboard',
      'Up to 5 business listings',
      'Custom branding options',
      'Priority review process'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 500,
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Premium',
      'Unlimited business listings',
      'Dedicated account manager',
      'Custom integration support',
      'White-label solutions',
      'API access',
      'Custom contracts available'
    ],
    popular: false
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect plan to showcase your business and connect with potential buyers worldwide
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={`/checkout?amount=${plan.price}&description=${encodeURIComponent(plan.name + ' Plan - B2B Market Subscription')}`}>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I change my plan later?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is there a setup fee?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    No, there are no setup fees. You only pay the monthly subscription fee for your chosen plan.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We accept all major credit cards, debit cards, and digital payment methods through our secure Stripe integration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
            <p className="text-gray-600 mb-6">
              For enterprise customers with specific requirements, we offer custom plans and dedicated support.
            </p>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}