import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Settings, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function SubscriptionSuccess() {
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    planName: '',
    amount: '',
    subscriptionId: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionId = urlParams.get('subscription_id');
    
    // Extract subscription details from URL or localStorage
    const planName = localStorage.getItem('subscription_plan') || 'Basic';
    const amount = localStorage.getItem('subscription_amount') || 'N/A';
    
    setSubscriptionDetails({
      planName,
      amount,
      subscriptionId: subscriptionId || 'N/A'
    });

    // Clear stored subscription details
    localStorage.removeItem('subscription_plan');
    localStorage.removeItem('subscription_amount');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Welcome to B2B Market!</CardTitle>
          <CardDescription>
            Your subscription has been activated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium">{subscriptionDetails.planName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Monthly Fee</span>
              <span className="font-bold text-lg">${subscriptionDetails.amount}/month</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Subscription ID</span>
              <span className="font-mono text-sm text-gray-500">
                {subscriptionDetails.subscriptionId.substring(0, 20)}...
              </span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong> You now have access to all {subscriptionDetails.planName} features. 
              Check your email for setup instructions and our team will reach out to help you get started.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Your Benefits Include:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Priority listing placement</li>
              <li>• Advanced analytics dashboard</li>
              <li>• Dedicated customer support</li>
              <li>• Custom branding options</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" className="flex-1" size="lg">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}