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
    { id: 'agreement', title: 'Agreement', icon: Scale },
    { id: 'whatsapp-ordering', title: 'WhatsApp Ordering', icon: ShoppingCart },
    { id: 'payment-delivery', title: 'Payment & Delivery', icon: CreditCard },
    { id: 'returns', title: 'Returns Policy', icon: RotateCcw },
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
              
              {/* Agreement */}
              <section id="agreement" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
                      Agreement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm sm:prose-base max-w-none">
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                      By using Shop With Sky's website and WhatsApp ordering service, you agree to these terms. 
                      If you don't agree, please don't use our services.
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mt-4">
                      We may update these terms occasionally. Continued use of our services means you accept any changes.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* WhatsApp Ordering */}
              <section id="whatsapp-ordering" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      WhatsApp Ordering Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Our unique WhatsApp ordering system works as follows:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">1. Browse & Add to Cart</h4>
                        <p className="text-xs text-muted-foreground">Browse our website and add items to your cart</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">2. WhatsApp Checkout</h4>
                        <p className="text-xs text-muted-foreground">Click "Order via WhatsApp" to be redirected to our WhatsApp Business</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">3. Order Confirmation</h4>
                        <p className="text-xs text-muted-foreground">Our team confirms your order, sizes, and delivery details</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">4. Payment & Delivery</h4>
                        <p className="text-xs text-muted-foreground">Choose payment method and receive your order</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> By using WhatsApp ordering, you agree to communicate with our business 
                        via WhatsApp for order-related matters.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Payment & Delivery */}
              <section id="payment-delivery" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      Payment & Delivery in Nigeria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Payment Options</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-accent/30 p-3 rounded-lg text-center">
                          <h5 className="font-medium text-sm">Bank Transfer</h5>
                          <p className="text-xs text-muted-foreground">Direct bank transfer</p>
                        </div>
                        <div className="bg-accent/30 p-3 rounded-lg text-center">
                          <h5 className="font-medium text-sm">Card Payment</h5>
                          <p className="text-xs text-muted-foreground">Debit/Credit cards</p>
                        </div>
                        <div className="bg-accent/30 p-3 rounded-lg text-center">
                          <h5 className="font-medium text-sm">Cash on Delivery</h5>
                          <p className="text-xs text-muted-foreground">Pay when you receive</p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Delivery Across Nigeria</h4>
                      <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                        <p>• <strong>Lagos & Abuja:</strong> 1-2 business days</p>
                        <p>• <strong>Major Cities:</strong> 2-4 business days (Port Harcourt, Kano, Ibadan, etc.)</p>
                        <p>• <strong>Other Locations:</strong> 3-7 business days</p>
                        <p>• <strong>Same-day Delivery:</strong> Available in Lagos Island, VI, and Ikoyi</p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                        <strong>Free Delivery:</strong> Orders over ₦15,000 qualify for free delivery within Lagos and Abuja.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Returns Policy */}
              <section id="returns" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                      7-Day Returns Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Simple Return Process</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Return unworn items with original tags within 7 days of delivery. 
                        Contact us via WhatsApp to initiate returns or size exchanges.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Free Exchanges</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Size exchanges in Lagos & Abuja</li>
                          <li>• We pick up and deliver new size</li>
                          <li>• Same item, different size only</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Return Shipping</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Lagos & Abuja: Free pickup</li>
                          <li>• Other locations: Customer pays return shipping</li>
                          <li>• Defective items: We cover all costs</li>
                        </ul>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      <p><strong>Non-returnable:</strong> Intimate wear, earrings, and personalized items.</p>
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
                    <div className="text-sm sm:text-base space-y-3 text-muted-foreground">
                      <p>For questions about these terms or our services, reach out to us:</p>
                      <div className="bg-accent/50 p-4 rounded-lg space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p><strong>WhatsApp Business:</strong></p>
                            <p>+234 800 SHOP SKY</p>
                          </div>
                          <div>
                            <p><strong>Customer Service:</strong></p>
                            <p>support@shopwithsky.ng</p>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div>
                          <p><strong>Business Address:</strong></p>
                          <p>Shop With Sky Fashion Store<br />
                          Lagos, Nigeria</p>
                        </div>
                        <div className="text-xs text-muted-foreground mt-3">
                          <p>Business Hours: Monday - Saturday, 9 AM - 6 PM (WAT)</p>
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