import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Receipt, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    description: '',
    paymentId: '',
    status: 'unknown'
  });
  const [isValidPayment, setIsValidPayment] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
    const paymentType = urlParams.get('type');
    
    // Validate that we have proper payment parameters
    if (!paymentIntent || !paymentIntentClientSecret) {
      setIsValidPayment(false);
      setPaymentDetails({
        amount: 'N/A',
        description: 'Invalid Payment',
        paymentId: 'N/A',
        status: 'invalid'
      });
      return;
    }
    
    // Extract payment details from URL or localStorage
    const amount = localStorage.getItem('payment_amount') || 'N/A';
    const description = localStorage.getItem('payment_description') || 'Service Payment';
    
    setIsValidPayment(true);
    setPaymentDetails({
      amount,
      description: paymentType === 'subscription' ? description.replace('Package', 'Subscription') : description,
      paymentId: paymentIntent,
      status: 'succeeded'
    });

    // Clear stored payment details
    localStorage.removeItem('payment_amount');
    localStorage.removeItem('payment_description');
  }, []);

  const downloadReceipt = () => {
    if (!isValidPayment) {
      toast({
        title: "Cannot Download Receipt",
        description: "No valid payment found",
        variant: "destructive",
      });
      return;
    }

    // Generate receipt content
    const receiptContent = `
B2B MARKET PAYMENT RECEIPT
========================

Payment ID: ${paymentDetails.paymentId}
Service: ${paymentDetails.description}
Amount: $${paymentDetails.amount}
Date: ${new Date().toLocaleDateString()}
Status: Payment Successful

Thank you for your business!

For questions, contact: btwobmarket@gmail.com
    `;

    // Create and download receipt
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${paymentDetails.paymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: "Your receipt has been saved to your downloads folder",
    });
  };

  if (!isValidPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Payment Failed</CardTitle>
            <CardDescription>
              No valid payment was detected. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-red-800">
                <strong>Payment Not Completed:</strong> We did not receive confirmation of your payment. 
                If you believe this is an error, please contact support.
              </p>
            </div>
            <Link href="/">
              <Button className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Service</span>
              <span className="font-medium">{paymentDetails.description}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold text-lg">${paymentDetails.amount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Payment ID</span>
              <span className="font-mono text-sm text-gray-500">
                {paymentDetails.paymentId.substring(0, 20)}...
              </span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong> You will receive a confirmation email shortly. 
              Our team will contact you within 24 hours to discuss your service details.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
            <Button variant="outline" className="w-full" size="lg" onClick={downloadReceipt}>
              <Receipt className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}