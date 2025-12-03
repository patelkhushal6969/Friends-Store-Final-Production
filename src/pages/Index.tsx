import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import heroImage from "@/assets/hero-plants.jpg";

const features = [
  {
    icon: Leaf,
    title: "Forever Green",
    description: "Our plants stay vibrant year-round without any watering or sunlight needed.",
  },
  {
    icon: Sparkles,
    title: "Lifelike Quality",
    description: "Crafted with premium materials for an authentic, natural appearance.",
  },
  {
    icon: Heart,
    title: "Eco-Friendly",
    description: "Sustainable materials and responsible packaging for guilt-free greenery.",
  },
];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-hero-gradient">
          <div className="container px-4 md:px-8 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="animate-fade-up">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Leaf className="h-4 w-4" />
                  Artificial Plant Décor
                </span>
                
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6">
                  Bring Nature Home,{" "}
                  <span className="text-primary">Forever</span>
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  Discover our curated collection of premium artificial plants. 
                  Beautiful, maintenance-free greenery that transforms any space 
                  into a peaceful sanctuary.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/products">
                      Shop Collection
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/about">Our Story</Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 mt-12 pt-8 border-t border-border">
                  <div>
                    <p className="font-display text-3xl font-semibold text-foreground">500+</p>
                    <p className="text-sm text-muted-foreground">Happy Customers</p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <p className="font-display text-3xl font-semibold text-foreground">50+</p>
                    <p className="text-sm text-muted-foreground">Plant Varieties</p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <p className="font-display text-3xl font-semibold text-foreground">4.9</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative animate-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                  <img
                    src={heroImage}
                    alt="Beautiful artificial plants collection"
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* Floating decoration */}
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-accent/20 animate-float" />
                <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-leaf/20 animate-float-delayed" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Why Choose Friends Store?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're passionate about bringing the beauty of nature into your home 
                without the hassle of maintenance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="text-center p-8 rounded-2xl bg-card shadow-soft hover-lift animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
                  Featured Plants
                </h2>
                <p className="text-muted-foreground">
                  Our most loved artificial plants, handpicked for you.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/products">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {isLoading ? (
                <p className="col-span-4 text-center text-muted-foreground">Loading...</p>
              ) : (
                featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Ready to Transform Your Space?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join thousands of happy customers who have brought everlasting 
              greenery into their homes and offices.
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link to="/products">
                Explore Collection
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
