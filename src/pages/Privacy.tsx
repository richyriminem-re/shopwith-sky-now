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
    { id: 'information-collect', title: 'Information We Collect', icon: Eye },
    { id: 'how-we-use', title: 'How We Use Information', icon: Settings },
    { id: 'information-sharing', title: 'Information Sharing', icon: Users },
    { id: 'payment-security', title: 'Payment Security', icon: Lock },
    { id: 'cookies', title: 'Cookies & Tracking', icon: Globe },
    { id: 'data-retention', title: 'Data Retention', icon: Clock },
    { id: 'your-rights', title: 'Your Rights & Choices', icon: Settings },
    { id: 'children-privacy', title: 'Children\'s Privacy', icon: Shield },
    { id: 'data-security', title: 'Data Security', icon: Lock },
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
                      At Shop With Sky, your privacy and trust mean everything to us. We are committed to protecting 
                      your personal data and being transparent about how we use it. This Privacy Policy explains what 
                      information we collect, how we use it, and the steps we take to keep it safe when you shop with us.
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mt-4">
                      By using our website, mobile app, or related services, you agree to the practices described in this policy.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Information We Collect */}
              <section id="information-collect" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      Information We Collect
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      We may collect the following information when you interact with our platform:
                    </p>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Personal Information</h4>
                      <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Name, email address, and phone number</li>
                        <li>Shipping and billing addresses</li>
                        <li>Payment information (processed securely by third-party providers)</li>
                        <li>Account credentials and shopping preferences</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-2">Usage Information</h4>
                      <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Browsing history and product interactions</li>
                        <li>Search queries and wishlists</li>
                        <li>Device and technical information</li>
                        <li>Location data (if you allow it)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* How We Use Information */}
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
                      We use your information to make your shopping experience seamless, secure, and personalized:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Order Processing</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          To confirm, process, and deliver your purchases
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Payments</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          To securely handle transactions (via trusted third-party providers)
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Customer Support</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          To respond to your requests and provide assistance
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Personalization</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          To recommend products you may like
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Communication</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          To send order updates, promotions, and newsletters (you can opt out anytime)
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Security & Fraud Prevention</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          To detect and prevent suspicious or fraudulent activity
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Information Sharing */}
              <section id="information-sharing" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      Information Sharing & Disclosure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm sm:prose-base max-w-none">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      We respect your privacy and do not sell or rent your personal information. However, we may share 
                      your data in limited circumstances:
                    </p>
                    <ul className="text-xs sm:text-sm text-muted-foreground mt-3 space-y-1">
                      <li>• With service providers such as payment processors, shipping partners, and IT support who help us run our business</li>
                      <li>• When required by law, regulation, or legal process</li>
                      <li>• During business transfers, such as a merger or acquisition</li>
                      <li>• With your explicit consent</li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* Payment Security */}
              <section id="payment-security" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Payment Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm sm:prose-base max-w-none">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Your payment details are not stored by Shop With Sky. All transactions are securely processed by 
                      trusted payment providers who comply with industry standards such as PCI-DSS (Payment Card Industry 
                      Data Security Standard).
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                      Cookies & Tracking Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      We use cookies and similar technologies to improve your shopping experience. This includes:
                    </p>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <p>• Keeping items in your cart</p>
                      <p>• Analyzing site performance and usage</p>
                      <p>• Personalizing product recommendations</p>
                      <p>• Showing relevant ads</p>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      You can control cookies through your browser settings, but disabling them may affect site functionality.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Data Retention */}
              <section id="data-retention" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Data Retention
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      We keep your personal data only for as long as necessary:
                    </p>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <p>• Order and transaction records are retained to meet legal, tax, and accounting obligations</p>
                      <p>• Account information is kept while your account is active</p>
                      <p>• Marketing data is kept until you unsubscribe or request deletion</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Data Security */}
              <section id="data-security" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Data Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm sm:prose-base max-w-none">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      We use industry-standard security practices to protect your data, including SSL encryption, secure 
                      servers, and regular audits. However, no online transmission or storage method is 100% secure.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Your Rights */}
              <section id="your-rights" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                      Your Rights & Choices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Depending on your location, you may have the following rights:
                    </p>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
                      <p>• <strong>Access:</strong> Request a copy of your personal data</p>
                      <p>• <strong>Correction:</strong> Update inaccurate or incomplete information</p>
                      <p>• <strong>Deletion:</strong> Ask us to delete your personal data (except where required by law)</p>
                      <p>• <strong>Portability:</strong> Receive your data in a portable format</p>
                      <p>• <strong>Opt-out:</strong> Unsubscribe from promotional communications anytime</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Children's Privacy */}
              <section id="children-privacy" className="scroll-mt-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      Children's Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm sm:prose-base max-w-none">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Shop With Sky is not directed at children under 13 (or under 16 in some regions). We do not knowingly 
                      collect personal data from children. If we become aware that we have done so, we will delete it immediately.
                    </p>
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
                    <div className="text-sm sm:text-base space-y-2 text-muted-foreground">
                      <p>If you have any questions about this Privacy Policy or your data, please contact us:</p>
                      <div className="bg-accent/50 p-3 rounded-lg mt-3">
                        <p>📧 <strong>Email:</strong> privacy@shopwithsky.com</p>
                        <p>📍 <strong>Address:</strong> Lagos, Nigeria</p>
                        <p>📞 <strong>Phone:</strong> +234 801 234 5678</p>
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