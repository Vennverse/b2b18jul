import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, MessageSquare, User, Plus, Eye, Edit, Trash2 } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const { data: userBusinesses, isLoading: businessesLoading } = useQuery({
    queryKey: ["/api/user/businesses"],
    enabled: isAuthenticated,
  });

  const { data: userAdvertisements, isLoading: adsLoading } = useQuery({
    queryKey: ["/api/user/advertisements"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">You need to sign in to access your dashboard.</p>
            <Button onClick={() => window.location.href = "/"}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600">Manage your business listings and advertisements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Building className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">My Businesses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userBusinesses?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <MessageSquare className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">My Advertisements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userAdvertisements?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <User className="h-8 w-8 text-purple-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <p className="text-2xl font-bold text-gray-900">Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="businesses">My Businesses</TabsTrigger>
            <TabsTrigger value="advertisements">My Advertisements</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Business Listings</h2>
              <Button asChild>
                <a href="/sell-business">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Business
                </a>
              </Button>
            </div>

            {businessesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : userBusinesses && userBusinesses.length > 0 ? (
              <div className="grid gap-6">
                {userBusinesses.map((business: any) => (
                  <Card key={business.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{business.name}</h3>
                          <p className="text-gray-600 mb-2">{business.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{business.category}</span>
                            <span>•</span>
                            <span>{business.country}</span>
                            {business.price && (
                              <>
                                <span>•</span>
                                <span className="font-medium">${business.price.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                            {business.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No businesses listed yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by listing your first business for sale.
                  </p>
                  <Button asChild>
                    <a href="/sell-business">List Your Business</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advertisements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Advertisement Campaigns</h2>
              <Button asChild>
                <a href="/post-ad">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Ad
                </a>
              </Button>
            </div>

            {adsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : userAdvertisements && userAdvertisements.length > 0 ? (
              <div className="grid gap-6">
                {userAdvertisements.map((ad: any) => (
                  <Card key={ad.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{ad.title}</h3>
                          <p className="text-gray-600 mb-2">{ad.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{ad.package}</span>
                            <span>•</span>
                            <span>{ad.company}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                            {ad.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No advertisements yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first advertisement to promote your business.
                  </p>
                  <Button asChild>
                    <a href="/post-ad">Create Advertisement</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}