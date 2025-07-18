import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Advertisement } from "@shared/schema";

const editAdvertisementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL"),
  targetUrl: z.string().url("Invalid target URL").optional().or(z.literal("")),
  company: z.string().min(1, "Company name is required").optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  budget: z.string().optional(),
});

type EditAdvertisementForm = z.infer<typeof editAdvertisementSchema>;

interface EditAdvertisementModalProps {
  advertisement: Advertisement;
  isOpen: boolean;
  onClose: () => void;
}

const packageOptions = [
  { value: "basic", label: "Basic Package ($150/month)" },
  { value: "premium", label: "Premium Package ($300/month)" },
  { value: "enterprise", label: "Enterprise Package ($500/month)" },
];

export function EditAdvertisementModal({ advertisement, isOpen, onClose }: EditAdvertisementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditAdvertisementForm>({
    resolver: zodResolver(editAdvertisementSchema),
    defaultValues: {
      title: advertisement.title,
      description: advertisement.description || "",
      imageUrl: advertisement.imageUrl,
      targetUrl: advertisement.targetUrl || "",
      company: advertisement.company || "",
      contactEmail: advertisement.contactEmail || "",
      contactPhone: advertisement.contactPhone || "",
      budget: advertisement.budget || "",
    },
  });

  const updateAdvertisementMutation = useMutation({
    mutationFn: async (data: EditAdvertisementForm) => {
      return apiRequest(`/api/advertisements/${advertisement.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/advertisements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
      toast({
        title: "Success",
        description: "Your advertisement has been updated successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Update advertisement error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update advertisement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditAdvertisementForm) => {
    updateAdvertisementMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Advertisement</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Advertisement Title *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter advertisement title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your advertisement..."
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              {...form.register("company")}
              placeholder="Enter company name"
            />
            {form.formState.errors.company && (
              <p className="text-sm text-red-500">{form.formState.errors.company.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL *</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
              placeholder="Enter image URL"
            />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="targetUrl">Target URL</Label>
            <Input
              id="targetUrl"
              {...form.register("targetUrl")}
              placeholder="Where should the ad link to?"
            />
            {form.formState.errors.targetUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.targetUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...form.register("contactEmail")}
                placeholder="Enter contact email"
              />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-red-500">{form.formState.errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                {...form.register("contactPhone")}
                placeholder="Enter contact phone"
              />
              {form.formState.errors.contactPhone && (
                <p className="text-sm text-red-500">{form.formState.errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Monthly Budget</Label>
            <Input
              id="budget"
              {...form.register("budget")}
              placeholder="e.g., $1000-$5000"
            />
            {form.formState.errors.budget && (
              <p className="text-sm text-red-500">{form.formState.errors.budget.message}</p>
            )}
          </div>

          {/* Show current package (read-only) */}
          <div>
            <Label>Current Package</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              {packageOptions.find(pkg => pkg.value === advertisement.package)?.label || 
               `${advertisement.package || 'No package selected'}`}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Package changes require contacting support
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateAdvertisementMutation.isPending}>
              {updateAdvertisementMutation.isPending ? "Updating..." : "Update Advertisement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}