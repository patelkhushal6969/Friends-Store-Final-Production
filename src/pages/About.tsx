import { Link } from "react-router-dom";
import { Leaf, Heart, Award, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Heart,
    title: "Passion for Plants",
    description: "Every piece in our collection is chosen with care and an eye for bringing natural beauty indoors.",
  },
  {
    icon: Award,
    title: "Quality First",
    description: "We source only the finest materials to ensure our artificial plants look incredibly lifelike.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We're here to help you find the perfect plants for your space.",
  },
  {
    icon: Leaf,
    title: "Sustainable Choices",
    description: "We're committed to eco-friendly packaging and responsible sourcing practices.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="py-16 md:py-24 bg-hero-gradient">
          <div className="container px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Leaf className="h-4 w-4" />
                Our Story
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
                Bringing Nature Indoors, One Plant at a Time
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Friends Store was born from a simple belief: everyone deserves to enjoy 
                the beauty and calm that plants bring, regardless of their green thumb skills 
                or living conditions.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="animate-fade-up">
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
                  Our Journey
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    What started as a small passion project in 2019 has grown into a beloved 
                    destination for plant enthusiasts across the country. We noticed that many 
                    people loved the idea of plants but struggled with the maintenance, 
                    low-light apartments, or busy lifestyles.
                  </p>
                  <p>
                    That's when we decided to curate a collection of premium artificial plants 
                    that look so real, your guests will want to water them. Each piece is 
                    carefully selected for its lifelike appearance, quality materials, and 
                    timeless design.
                  </p>
                  <p>
                    Today, Friends Store is home to over 50 varieties of artificial plants, 
                    from statement fiddle leaf figs to delicate eucalyptus arrangements. We're 
                    proud to have helped thousands of customers transform their spaces into 
                    green sanctuaries.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
                <div className="aspect-[4/5] rounded-2xl bg-card shadow-card overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-br from-leaf/20 to-primary/20 flex items-center justify-center">
                    <Leaf className="h-16 w-16 text-primary/40" />
                  </div>
                </div>
                <div className="aspect-[4/5] rounded-2xl bg-card shadow-card overflow-hidden mt-8">
                  <div className="h-full w-full bg-gradient-to-br from-accent/20 to-leaf/20 flex items-center justify-center">
                    <Heart className="h-16 w-16 text-accent/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                What We Stand For
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our values guide everything we do, from product selection to customer service.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div 
                  key={value.title}
                  className="p-6 rounded-2xl bg-card shadow-soft hover-lift animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Ready to Explore?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Browse our collection and find the perfect artificial plants for your home or office.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/products">Shop Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
