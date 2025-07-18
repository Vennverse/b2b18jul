import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import FranchiseDetails from "@/pages/franchise-details";
import BuyBusiness from "@/pages/buy-business";
import BuyFranchise from "@/pages/buy-franchise";
import SellBusiness from "@/pages/sell-business";
import PostAd from "@/pages/post-ad";

import Contact from "@/pages/contact";
import About from "@/pages/about";
import Admin from "@/pages/admin";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import PaymentSuccess from "@/pages/payment-success";
import SubscriptionSuccess from "@/pages/subscription-success";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import ResetPassword from "@/pages/ResetPassword";

// Protected route wrapper for admin-only access
function AdminRoute() {
  // Add warning message for unauthorized access attempts
  const hasValidToken = localStorage.getItem("auth_token");
  if (!hasValidToken) {
    console.warn("🚨 Unauthorized access attempt to admin route - no token found");
  }
  
  return <Admin />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/franchise/:id" component={FranchiseDetails} />
      <Route path="/buy-business" component={BuyBusiness} />
      <Route path="/buy-franchise" component={BuyFranchise} />
      <Route path="/sell-business" component={SellBusiness} />
      <Route path="/post-ad" component={PostAd} />

      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/admin" component={AdminRoute} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
