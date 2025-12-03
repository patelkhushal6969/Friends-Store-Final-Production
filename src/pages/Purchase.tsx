import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Camera, CreditCard, CheckCircle, Leaf } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/useProducts";

const WHATSAPP_LINK = "https://WA.me/917383800245";

const Purchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
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

  const productImage = product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg";

  const whatsappMessage = encodeURIComponent(
    `Hi! I would like to purchase:\n\n🌿 ${product.name}\n💰 Price: ₹${product.price}\n\nPlease share the payment details.`
  );

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
            <Link to={`/products/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Purchase</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Side - WhatsApp Contact */}
            <div className="animate-fade-up">
              <div className="bg-card rounded-3xl p-8 shadow-card">
                {/* Product Summary */}
                <div className="flex gap-4 mb-8 pb-8 border-b border-border">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {product.name}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">{product.category}</p>
                    <p className="font-display text-2xl font-semibold text-primary mt-2">
                      ₹{product.price}
                    </p>
                  </div>
                </div>

                {/* WhatsApp Contact */}
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/10 mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-[#25D366]" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Contact Us on WhatsApp
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Click below to chat with us and complete your purchase
                  </p>
                  <a
                    href={`${WHATSAPP_LINK}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="hero" size="xl" className="w-full bg-[#25D366] hover:bg-[#22c55e]">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - Steps */}
            <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-8">
                How to Buy
              </h2>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-semibold">
                      1
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Click WhatsApp Link
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      Click the WhatsApp button to start a chat with our store. A pre-filled message with your product details will be ready.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-semibold">
                      2
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Share Product Details
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      Send the plant info or take a screenshot from the store page of the product you want to buy. Include quantity if ordering multiple.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-semibold">
                      3
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Make Payment
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      We'll share our payment QR code. Scan and pay the amount securely via UPI, GPay, PhonePe, or bank transfer.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-semibold">
                      4
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Order Confirmed
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      Once payment is confirmed, your order is placed! You'll receive shipping updates and tracking information on the same WhatsApp chat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Leaf className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">Friends Store Promise</h4>
                    <p className="text-sm text-muted-foreground">
                      Quality products • Safe payment • Fast delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Purchase;
