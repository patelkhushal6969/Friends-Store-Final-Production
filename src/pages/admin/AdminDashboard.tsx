import { Link } from "react-router-dom";
import { Package, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container px-4 md:px-8 py-4 flex items-center justify-between">
            <h1 className="font-display text-xl font-semibold text-foreground">
              Admin Panel
            </h1>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="container px-4 md:px-8 py-8">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your product catalog
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {products.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-leaf/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-leaf" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {products.filter((p) => p.in_stock).length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {products.filter((p) => !p.in_stock).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button asChild>
              <Link to="/kirtanuk/products">
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Link>
            </Button>
            <Button asChild>
              <Link to="/kirtanuk/orders">
                <Package className="h-4 w-4 mr-2" />
                Manage Orders
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/kirtanuk/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminDashboard;
