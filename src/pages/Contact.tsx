import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "hello@friendsstore.com",
    description: "We'll respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+1 (555) 123-4567",
    description: "Mon-Fri, 9am-6pm EST",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "123 Green Street",
    description: "Brooklyn, NY 11201",
  },
];

const faqs = [
  {
    question: "How do I care for artificial plants?",
    answer: "Our artificial plants are low-maintenance! Simply dust them occasionally with a soft cloth or use a hairdryer on a cool setting. Avoid placing them in direct sunlight for extended periods to prevent fading.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unused items in their original packaging. If you're not completely satisfied, contact us for a full refund or exchange.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes! We ship to most countries worldwide. International shipping rates and delivery times vary by location. See our shipping page for details.",
  },
  {
    question: "Are your plants pet-safe?",
    answer: "Absolutely! Our artificial plants are made from non-toxic materials and are completely safe for pets and children. No more worrying about curious nibbles!",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const customUrl = import.meta.env.VITE_SEND_CONTACT_EMAIL_URL as string | undefined;
      let endpoint = customUrl;
      if (!endpoint) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
        if (!supabaseUrl) throw new Error("Missing Supabase URL environment variable");
        const functionsBase = supabaseUrl.replace(".supabase.co", ".functions.supabase.co");
        endpoint = `${functionsBase}/send-contact-email`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send message");

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast({
        title: "Failed to send message",
        description: err.message || String(err),
        variant: "destructive",
      });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="py-16 md:py-24 bg-hero-gradient">
          <div className="container px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center animate-fade-up">
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground">
                Have questions about our plants or your order? We'd love to hear from you. 
                Our team is here to help!
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 -mt-8">
          <div className="container px-4 md:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {contactInfo.map((item, index) => (
                <div 
                  key={item.title}
                  className="p-6 rounded-2xl bg-card shadow-card text-center animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-foreground font-medium">{item.detail}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & FAQ */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Form */}
              <div className="animate-fade-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Send a Message
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto" disabled={sending}>
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>

              {/* FAQ */}
              <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Frequently Asked
                  </h2>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div 
                      key={index}
                      className="p-5 rounded-xl bg-card shadow-soft"
                    >
                      <h3 className="font-display font-semibold text-foreground mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
