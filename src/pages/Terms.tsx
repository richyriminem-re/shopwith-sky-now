import { useEffect } from 'react';
import { FileText, ArrowLeft, Scale, ShoppingCart, CreditCard, Truck, RotateCcw, AlertTriangle, Clock, Mail } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import PageWithNavigation from '@/components/PageWithNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "December 2024";
  const effectiveDate = "January 1, 2025";

  const tableOfContents = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: Scale },
    { id: 'services', title: 'Description of Services', icon: ShoppingCart },
    { id: 'accounts', title: 'User Accounts', icon: FileText },
    { id: 'orders', title: 'Orders & Payments', icon: CreditCard },
    { id: 'shipping', title: 'Shipping & Delivery', icon: Truck },
    { id: 'returns', title: 'Returns & Refunds', icon: RotateCcw },
    { id: 'prohibited', title: 'Prohibited Activities', icon: AlertTriangle },
    { id: 'intellectual', title: 'Intellectual Property', icon: FileText },
    { id: 'limitation', title: 'Limitation of Liability', icon: Scale },
    { id: 'termination', title: 'Termination', icon: Clock },
    { id: 'contact', title: 'Contact Information', icon: Mail },
  ];

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="Terms of Service - Shop With Sky | Legal Terms & Conditions"
        description="Complete terms of service for Shop With Sky. Understand your rights and responsibilities when using our e-commerce platform and purchasing products."
      />
      
      {/* Mobile-first responsive container */}
      <div className="min-h-screen bg-background pb-20 sm:pb-24">
        {/* Header with back button - Mobile optimized */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 py-4 sm:py-6">
              <BackButton fallback="/" hideText={true} />
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                    Terms of Service
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Last updated: {lastUpdated}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Effective: {effectiveDate}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content with responsive layout */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Table of Contents - Mobile collapsible, desktop sidebar */}
            <aside className="lg:col-span-3">
              <Card className="sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav className="space-y-1">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                      >
                        <item.icon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* Main content */}
            <main className="lg:col-span-9 space-y-6 sm:space-y-8">
              
              {/* Acceptance of Terms */}
              <section id="acceptance" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
                      Acceptance of Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm sm:prose-base max-w-none">
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                      By accessing and using Shop With Sky's website and services, you accept and agree to be bound 
                      by these Terms of Service. If you do not agree to these terms, please do not use our services.
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mt-4">
                      These terms constitute a legally binding agreement between you and Shop With Sky. We may update 
                      these terms periodically, and your continued use of our services constitutes acceptance of any changes.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Description of Services */}
              <section id="services" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      Description of Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Shop With Sky operates an e-commerce platform offering fashion and lifestyle products. Our services include:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Product Sales</h4>
                        <p className="text-xs text-muted-foreground">Clothing, accessories, and lifestyle items</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Order Processing</h4>
                        <p className="text-xs text-muted-foreground">Secure payment and fulfillment services</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Customer Support</h4>
                        <p className="text-xs text-muted-foreground">Help with orders, returns, and inquiries</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Account Management</h4>
                        <p className="text-xs text-muted-foreground">User profiles, order history, and preferences</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* User Accounts */}
              <section id="accounts" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      User Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Account Registration</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        You must provide accurate and complete information when creating an account. 
                        You are responsible for maintaining the confidentiality of your account credentials.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Account Security</h4>
                      <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Use a strong, unique password</li>
                        <li>Do not share your account with others</li>
                        <li>Notify us immediately of any unauthorized access</li>
                        <li>Keep your contact information up to date</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Orders & Payments */}
              <section id="orders" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      Orders & Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Order Confirmation</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          All orders are subject to acceptance and inventory availability. 
                          We reserve the right to cancel orders for any reason.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Payment Terms</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Payment is due at the time of order. We accept major credit cards, 
                          debit cards, and other payment methods as displayed.
                        </p>
                      </div>
                    </div>
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Pricing</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        All prices are subject to change without notice. Taxes and shipping costs 
                        will be calculated at checkout based on your location.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Shipping & Delivery */}
              <section id="shipping" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                      Shipping & Delivery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
                      <p>• <strong>Processing Time:</strong> 1-2 business days for order processing</p>
                      <p>• <strong>Delivery Time:</strong> 3-7 business days depending on location and method</p>
                      <p>• <strong>Shipping Costs:</strong> Calculated based on weight, size, and destination</p>
                      <p>• <strong>International Shipping:</strong> Available to select countries with additional fees</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Returns & Refunds */}
              <section id="returns" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                      Returns & Refunds
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">30-Day Return Policy</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Items may be returned within 30 days of delivery in original condition 
                        with tags attached. Some exclusions apply.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Returnable Items</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Unworn clothing with tags</li>
                          <li>• Accessories in original packaging</li>
                          <li>• Shoes in original box</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Non-Returnable Items</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Intimate apparel</li>
                          <li>• Personalized items</li>
                          <li>• Final sale products</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Limitation of Liability */}
              <section id="limitation" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
                      Limitation of Liability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm sm:prose-base max-w-none">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Shop With Sky's liability is limited to the maximum extent permitted by law. We are not liable 
                      for any indirect, incidental, special, or consequential damages arising from your use of our services.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mt-4">
                      <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Important:</strong> Our maximum liability for any claim is limited to the amount 
                        you paid for the specific product or service that gave rise to the claim.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Contact Information */}
              <section id="contact" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm sm:text-base space-y-2 text-muted-foreground">
                      <p>For questions about these Terms of Service, contact us at:</p>
                      <div className="bg-accent/50 p-4 rounded-lg mt-3 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p><strong>Legal Department:</strong></p>
                            <p>legal@shopwithsky.com</p>
                          </div>
                          <div>
                            <p><strong>Customer Service:</strong></p>
                            <p>support@shopwithsky.com</p>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div>
                          <p><strong>Mailing Address:</strong></p>
                          <p>Shop With Sky Legal Department<br />
                          Lagos, Nigeria</p>
                          <p><strong>Phone:</strong> +234 801 234 5678</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </main>
          </div>
        </div>
      </div>
    </PageWithNavigation>
  );
};

export default Terms;