import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Heart, Check, Truck, RotateCcw, Shield, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProduct, useProducts } from "@/hooks/useProducts";
 
import { useState } from "react";

// Helper function to get image path
const getImagePath = (imageName: string) => {
  try {
    if (imageName.startsWith('http')) return imageName;
    return new URL(`/src/assets/${imageName}`, import.meta.url).href;
  } catch {
    return imageName;
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading: isLoadingProduct } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  
  const relatedProducts = allProducts
    .filter((p) => p.id !== id && p.category === product?.category)
    .slice(0, 3);

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const previousImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-16 text-center">
          <h1 className="font-display text-2xl text-foreground mb-4">Product not found</h1>
          <Button variant="outline" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8 md:py-12">
        <div className="container px-4 md:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Product Section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
            {/* Image Carousel */}
            <div className="animate-fade-up">
              <div className="relative rounded-3xl overflow-hidden bg-card shadow-card group">
                <img
                  src={getImagePath(product.images[currentImageIndex])}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-auto object-cover"
                />
                {hasDiscount && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 text-sm font-medium rounded-full bg-accent text-accent-foreground">
                    Sale
                  </span>
                )}
                
                {/* Navigation Arrows - Only show if multiple images */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "w-8 bg-primary"
                              : "w-2 bg-background/60 hover:bg-background/80"
                          }`}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery - Only show if multiple images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-muted"
                      }`}
                    >
                      <img
                        src={getImagePath(image)}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-accent text-accent"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  For reviews, go through our socials.
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                {product.name}
              </h1>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-display text-3xl font-semibold text-foreground">
                  ₹{product.price}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.original_price}
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="font-display font-semibold text-foreground mb-3">Features</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-leaf" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link to={`/purchase/${product.id}`} className="flex-1">
                  <Button variant="hero" size="lg" className="w-full">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Buy Now
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-accent text-accent" : ""}`} />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck className="h-5 w-5 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-5 w-5 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">30-Day Returns</p>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">2-Year Warranty</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews removed */}
          <section className="mt-8">
            <p className="text-sm text-muted-foreground">
              For reviews, go through our socials.
            </p>
          </section>

          {relatedProducts.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-8">
                You May Also Like
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {relatedProducts.map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
