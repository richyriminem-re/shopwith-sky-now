import { useEffect } from 'react';
import { Shield, ArrowLeft, FileText, Clock, Mail, Eye, Lock, Globe, Users, Settings } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import PageWithNavigation from '@/components/PageWithNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "December 2024";

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', icon: FileText },
    { id: 'information-collect', title: 'What We Collect', icon: Eye },
    { id: 'how-we-use', title: 'How We Use It', icon: Settings },
    { id: 'nigerian-protection', title: 'Nigerian Data Protection', icon: Shield },
    { id: 'contact', title: 'Contact Us', icon: Mail },
  ];

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="Privacy Policy - Shop With Sky | Your Data Protection Rights"
        description="Comprehensive privacy policy detailing how Shop With Sky collects, uses, and protects your personal information. Learn about your data rights and our security measures."
      />
      
      {/* Mobile-first responsive container */}
      <div className="min-h-screen bg-background pb-20 sm:pb-24">
        {/* Header with back button - Mobile optimized */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 py-4 sm:py-6">
              <BackButton fallback="/" hideText={true} />
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                    Privacy Policy
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Last updated: {lastUpdated}
                  </p>
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
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm sm:prose-base max-w-none">
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                      At Shop With Sky, we respect your privacy and are committed to protecting your personal information. 
                      This Privacy Policy explains how we collect, use, and protect your data when you shop with us 
                      through our website and WhatsApp ordering system.
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mt-4">
                      By using our services, you agree to the practices described in this policy.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* What We Collect */}
              <section id="information-collect" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      What We Collect
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      We collect basic information needed to process your orders and provide customer service:
                    </p>
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Personal Information</h4>
                      <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Name, phone number, and delivery address</li>
                        <li>WhatsApp contact information for order communication</li>
                        <li>Payment preferences (bank details for transfers, cash on delivery)</li>
                        <li>Order history and product preferences</li>
                      </ul>
                    </div>
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Website Usage</h4>
                      <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Products you view and add to cart</li>
                        <li>Device type and location (for shipping estimates)</li>
                        <li>Basic website analytics to improve our service</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* How We Use It */}
              <section id="how-we-use" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                      How We Use Your Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      We use your information solely to provide our services:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">WhatsApp Communication</h4>
                        <p className="text-xs text-muted-foreground">Order confirmation, payment details, and delivery updates</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Order Processing</h4>
                        <p className="text-xs text-muted-foreground">Processing payments and arranging delivery within Nigeria</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Customer Service</h4>
                        <p className="text-xs text-muted-foreground">Handling returns, exchanges, and customer inquiries</p>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Product Recommendations</h4>
                        <p className="text-xs text-muted-foreground">Suggesting items based on your shopping history</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                        <strong>Important:</strong> We never share your WhatsApp number or personal details with third parties 
                        except our trusted delivery partners within Nigeria.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Nigerian Data Protection */}
              <section id="nigerian-protection" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      Nigerian Data Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      As a Nigerian business, we comply with Nigeria's data protection laws and regulations:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Your Rights</h4>
                        <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Request access to your personal data</li>
                          <li>Correct inaccurate information</li>
                          <li>Delete your account and data</li>
                          <li>Opt out of marketing messages</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Data Security</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          We use secure servers, encrypted communications, and limit access to your data to authorized 
                          personnel only. Your payment information is processed through secure Nigerian banking partners.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Data Retention</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          We keep your order information for 2 years for warranty and customer service purposes. 
                          Marketing data is kept until you unsubscribe.
                        </p>
                      </div>
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
                      Contact Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm sm:text-base space-y-3 text-muted-foreground">
                      <p>For questions about your privacy or data, contact us:</p>
                      <div className="bg-accent/50 p-4 rounded-lg space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p><strong>WhatsApp Business:</strong></p>
                            <p>+234 800 SHOP SKY</p>
                          </div>
                          <div>
                            <p><strong>Privacy Email:</strong></p>
                            <p>privacy@shopwithsky.ng</p>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div>
                          <p><strong>Business Address:</strong></p>
                          <p>Shop With Sky Fashion Store<br />
                          Lagos, Nigeria</p>
                        </div>
                        <div className="text-xs text-muted-foreground mt-3">
                          <p>We respond to privacy requests within 30 days.</p>
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

export default Privacy;