import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, User, Mail, MessageSquare } from "lucide-react";
import type { Franchise, Business } from "@shared/schema";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Franchise | Business | null;
  type: "franchise" | "business";
}

export default function InquiryModal({ isOpen, onClose, item, type }: InquiryModalProps) {
  const { toast } = useToast();
  
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = type === "franchise" 
        ? `/api/franchises/${item?.id}/inquire`
        : `/api/businesses/${item?.id}/inquire`;
      return apiRequest("POST", endpoint, { ...data, phone: null });
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully",
        description: "Thank you for your interest. We will contact you within 24 hours.",
      });
      setInquiryForm({ name: "", email: "", message: "" });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(inquiryForm);
  };

  const getDefaultMessage = () => {
    if (type === "franchise") {
      return `Hi, I'm interested in learning more about the ${item?.name} franchise opportunity. Could you please provide me with more details about investment requirements, territory availability, and the application process? Thank you.`;
    } else {
      return `Hi, I'm interested in the ${item?.name} business listing. Could you please provide me with more details about the business, financial information, and the next steps in the purchase process? Thank you.`;
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-800 flex items-center">
            <Send className="w-5 h-5 mr-2 text-[hsl(var(--b2b-blue))]" />
            Inquire About {item.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="inquiry-name" className="flex items-center text-sm font-medium">
              <User className="w-4 h-4 mr-2" />
              Full Name *
            </Label>
            <Input
              id="inquiry-name"
              type="text"
              value={inquiryForm.name}
              onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="inquiry-email" className="flex items-center text-sm font-medium">
              <Mail className="w-4 h-4 mr-2" />
              Email Address *
            </Label>
            <Input
              id="inquiry-email"
              type="email"
              value={inquiryForm.email}
              onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div>
            <Label htmlFor="inquiry-message" className="flex items-center text-sm font-medium">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message *
            </Label>
            <Textarea
              id="inquiry-message"
              value={inquiryForm.message}
              onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder={getDefaultMessage()}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 b2b-button-primary"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Sending..." : "Send Inquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}