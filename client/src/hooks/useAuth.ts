import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 0, // Always fetch fresh data
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;
      
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        return response.json();
      } catch (error) {
        localStorage.removeItem("auth_token");
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("auth_token", data.token);
      
      // Update auth query cache
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      // Invalidate all queries to refresh with new auth state
      queryClient.invalidateQueries();
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName || data.user.email}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: { 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("auth_token", data.token);
      
      // Immediately set user data
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      // Force a fresh fetch to ensure state consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }, 100);
      
      toast({
        title: "Registration Successful",
        description: `Welcome to B2B Market, ${data.user.firstName}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem("auth_token");
      
      // Clear all query cache
      queryClient.clear();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    },
    onError: () => {
      // Even if the server request fails, clear local state
      localStorage.removeItem("auth_token");
      queryClient.clear();
    },
  });
}

// Helper function to get auth token
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}