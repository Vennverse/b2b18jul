import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import { Link } from "wouter";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = ({ planName, price }: { planName: string; price: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription-success`,
      },
    });

    if (error) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Successful",
        description: "Welcome to your new plan!",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Subscription...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscribe for ${price}/month
          </div>
        )}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [planName, setPlanName] = useState("");
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'basic';
    const customerEmail = urlParams.get('email') || '';
    const customerName = urlParams.get('name') || '';

    let planDetails: { name: string; price: number; features: string[]; priceId: string } = { 
      name: '', 
      price: 0, 
      features: [], 
      priceId: '' 
    };
    
    switch (plan) {
      case 'premium':
        planDetails.name = 'Premium';
        planDetails.price = 250;
        planDetails.features = [
          'Featured listing placement',
          'Priority customer support',
          'Advanced analytics dashboard',
          'Up to 5 business listings',
          'Custom branding options'
        ];
        planDetails.priceId = 'price_premium_monthly';
        break;
      case 'enterprise':
        planDetails.name = 'Enterprise';
        planDetails.price = 500;
        planDetails.features = [
          'Everything in Premium',
          'Unlimited business listings',
          'Dedicated account manager',
          'Custom integration support',
          'White-label solutions',
          'Priority review process'
        ];
        planDetails.priceId = 'price_enterprise_monthly';
        break;
      default:
        planDetails.name = 'Basic';
        planDetails.price = 100;
        planDetails.features = [
          'Standard listing placement',
          'Email customer support',
          'Basic analytics',
          'Up to 2 business listings',
          'Standard review process'
        ];
        planDetails.priceId = 'price_basic_monthly';
    }

    setPlanName(planDetails.name);
    setPrice(planDetails.price);
    setFeatures(planDetails.features);

    // Create subscription
    apiRequest("POST", "/api/create-subscription", { 
      priceId: planDetails.priceId,
      customerEmail: customerEmail || 'customer@example.com',
      customerName: customerName || 'Customer'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Failed to initialize subscription");
        setIsLoading(false);
      });
  }, []);

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Subscription Not Available</CardTitle>
            <CardDescription>
              Subscription service is currently unavailable. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Preparing subscription...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Subscription Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscribe to {planName}</h1>
          <p className="text-gray-600 mt-2">Start your subscription today</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{planName} Plan</CardTitle>
                  <Badge variant="secondary">${price}/month</Badge>
                </div>
                <CardDescription>
                  Everything you need to grow your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Secure payments powered by Stripe</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Cancel anytime. No setup fees.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Enter your payment details to start your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm planName={planName} price={price} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}