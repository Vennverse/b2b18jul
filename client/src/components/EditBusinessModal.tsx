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
import type { Business } from "@shared/schema";

const editBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  yearEstablished: z.string().optional(),
  employees: z.string().optional(),
  revenue: z.string().optional(),
  reason: z.string().optional(),
  assets: z.string().optional(),
});

type EditBusinessForm = z.infer<typeof editBusinessSchema>;

interface EditBusinessModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  "Technology",
  "Food & Beverage", 
  "Retail",
  "Health & Fitness",
  "Education",
  "Automotive",
  "Real Estate",
  "Manufacturing",
  "Services",
  "Entertainment",
  "Other"
];

const countries = ["USA", "Australia", "India", "UK", "Europe"];

export function EditBusinessModal({ business, isOpen, onClose }: EditBusinessModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditBusinessForm>({
    resolver: zodResolver(editBusinessSchema),
    defaultValues: {
      name: business.name,
      description: business.description || "",
      category: business.category,
      country: business.country,
      state: business.state || "",
      price: business.price || undefined,
      imageUrl: business.imageUrl || "",
      contactEmail: business.contactEmail || "",
      yearEstablished: business.yearEstablished || "",
      employees: business.employees || "",
      revenue: business.revenue || "",
      reason: business.reason || "",
      assets: business.assets || "",
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: EditBusinessForm) => {
      return apiRequest(`/api/businesses/${business.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Success",
        description: "Your business listing has been updated successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Update business error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update business listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditBusinessForm) => {
    updateBusinessMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Business Listing</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter business name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your business..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select
                value={form.watch("country")}
                onValueChange={(value) => form.setValue("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.country && (
                <p className="text-sm text-red-500">{form.formState.errors.country.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State/Region</Label>
              <Input
                id="state"
                {...form.register("state")}
                placeholder="Enter state or region"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Asking Price ($)</Label>
              <Input
                id="price"
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                placeholder="Enter asking price"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>

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
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
              placeholder="Enter image URL"
            />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yearEstablished">Year Established</Label>
              <Input
                id="yearEstablished"
                {...form.register("yearEstablished")}
                placeholder="e.g., 2020"
              />
            </div>

            <div>
              <Label htmlFor="employees">Number of Employees</Label>
              <Input
                id="employees"
                {...form.register("employees")}
                placeholder="e.g., 1-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="revenue">Annual Revenue</Label>
              <Input
                id="revenue"
                {...form.register("revenue")}
                placeholder="e.g., $100K-$500K"
              />
            </div>

            <div>
              <Label htmlFor="assets">Assets Included</Label>
              <Input
                id="assets"
                {...form.register("assets")}
                placeholder="Equipment, inventory, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Selling</Label>
            <Textarea
              id="reason"
              {...form.register("reason")}
              placeholder="Brief explanation..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateBusinessMutation.isPending}>
              {updateBusinessMutation.isPending ? "Updating..." : "Update Business"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}