import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, LogOut, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import { useProduct } from "@/hooks/useProducts";
import { useProductMutations } from "@/hooks/useProductMutations";
import { categories } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id!);
  const { updateProduct } = useProductMutations();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category: categories[1],
    rating: "4.5",
    in_stock: true,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        original_price: product.original_price?.toString() || "",
        category: product.category,
        rating: product.rating.toString(),
        in_stock: product.in_stock,
      });
      setTags(product.tags);
      setFeatures(product.features);
      setImages(product.images);
    }
  }, [product]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProduct.mutate({
      id: id!,
      data: {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        original_price: formData.original_price ? parseInt(formData.original_price) : undefined,
        category: formData.category,
        rating: parseFloat(formData.rating),
        tags,
        features,
        in_stock: formData.in_stock,
        images,
      },
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImages([...images, ...uploadedUrls]);
      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <ProtectedAdminRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ProtectedAdminRoute>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/kirtanuk/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Edit Product
              </h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="container px-4 md:px-8 py-8 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Basic Information
              </h2>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating *</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stock Status</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="in_stock"
                    checked={formData.in_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, in_stock: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="in_stock" className="cursor-pointer">
                    In Stock
                  </Label>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Tags & Features
              </h2>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="space-y-2 mt-2">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <span className="text-sm">{feature}</span>
                      <button type="button" onClick={() => removeFeature(index)}>
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Images</h2>

              <div className="space-y-2">
                <Label>Upload Images</Label>
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="file-upload"
                    className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Choose files to upload</span>
                      </>
                    )}
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload images directly to storage. Supports multiple files.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Or Add Image URLs</Label>
                <div className="flex gap-2">
                  <Input
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                  />
                  <Button type="button" onClick={addImage} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alternatively, add external image URLs.
                </p>
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  <Label>Preview ({images.length} image{images.length !== 1 ? 's' : ''})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? "Updating..." : "Update Product"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/kirtanuk/products">Cancel</Link>
              </Button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminProductEdit;
