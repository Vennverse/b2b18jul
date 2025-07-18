import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ amount, description }: { amount: number; description: string }) => {
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

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?type=subscription`,
      },
      redirect: 'if_required',
    });

    if (error) {
      // Payment failed or was cancelled
      toast({
        title: "Payment Failed",
        description: error.message || "Payment was not completed",
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, redirect manually
      window.location.href = `${window.location.origin}/payment-success?payment_intent=${paymentIntent.id}&payment_intent_client_secret=${paymentIntent.client_secret}&type=subscription`;
    } else {
      // Payment requires additional action or is processing
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed. Please wait...",
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
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pay ${amount}
          </div>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get payment details from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const paymentAmount = parseFloat(urlParams.get('amount') || '0');
    const paymentDescription = urlParams.get('description') || 'B2B Market Service';

    if (paymentAmount < 1) {
      setError("Invalid payment amount");
      setIsLoading(false);
      return;
    }

    setAmount(paymentAmount);
    setDescription(paymentDescription);

    // Store payment details for success page
    localStorage.setItem('payment_amount', paymentAmount.toString());
    localStorage.setItem('payment_description', paymentDescription);

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: paymentAmount,
      description: paymentDescription 
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
        setError("Failed to initialize payment");
        setIsLoading(false);
      });
  }, []);

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Not Available</CardTitle>
            <CardDescription>
              Payment processing is currently unavailable. Please try again later.
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
              <p className="text-gray-600">Preparing payment...</p>
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
            <CardTitle className="text-red-600">Payment Error</CardTitle>
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
          <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your payment securely</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium">{description}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${amount}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Secure payment powered by Stripe</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter your payment information below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm amount={amount} description={description} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}