import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWithNavigation from '@/components/PageWithNavigation';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import SEOHead from '@/components/SEOHead';

const Contact = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      action: 'Start Chat',
      highlight: true,
      contact: 'chat@shopfashion.com',
      onClick: () => window.open('mailto:chat@shopfashion.com', '_blank')
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      availability: 'Mon-Fri 8AM-8PM EST',
      action: 'Call Now',
      highlight: false,
      contact: '+234 811 269 8594',
      onClick: () => window.open('tel:+2348112698594', '_self')
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed questions',
      availability: 'Response within 4 hours',
      action: 'Send Email',
      highlight: false,
      contact: 'modupeolaceline@gmail.com',
      onClick: () => window.open('mailto:modupeolaceline@gmail.com', '_blank')
    }
  ];

  const socialMedia = [
    {
      name: 'WhatsApp',
      icon: 'fa-brands fa-whatsapp',
      url: '#',
      color: 'text-[#25D366]',
      hoverColor: 'hover:text-[#128C7E]',
      bgHover: 'hover:bg-[#25D366]/10'
    },
    {
      name: 'Instagram',
      icon: 'fa-brands fa-instagram',
      url: 'https://instagram.com/sho.pwithsky',
      color: 'text-[#E4405F]',
      hoverColor: 'hover:text-[#C13584]',
      bgHover: 'hover:bg-[#E4405F]/10'
    },
    {
      name: 'TikTok',
      icon: 'fa-brands fa-tiktok',
      url: 'https://tiktok.com/@shopwithsky3',
      color: 'text-foreground',
      hoverColor: 'hover:text-foreground',
      bgHover: 'hover:bg-foreground/10'
    }
  ];

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="Contact Us - Get Help & Support"
        description="Get in touch with our support team. Live chat, phone, email support available 24/7."
        keywords="contact support, customer service, live chat, phone support, help center"
      />
      
      <div className="pb-20">
        {/* Hero Section */}
        <section className="neu-surface mx-4 mt-4 mb-6">
          <div className="p-4 sm:p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 neu-surface rounded-xl mb-3">
                <MessageCircle size={20} className="text-primary sm:size-6" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                We're Here to Help
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto">
                Have questions? Need support? Our dedicated team is ready to assist you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="px-4 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method) => (
              <Card 
                key={method.title} 
                className={`neu-card cursor-pointer transition-all duration-300 hover:scale-[1.02] ${method.highlight ? 'ring-2 ring-primary/20' : ''}`}
                onClick={method.onClick}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`neu-surface p-3 rounded-xl mx-auto w-fit mb-4 transition-colors ${method.highlight ? 'bg-primary/10' : ''}`}>
                      <method.icon size={24} className={method.highlight ? 'text-primary' : 'text-foreground'} />
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <h3 className="font-semibold text-foreground">{method.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {method.description}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                      <Clock size={12} />
                      <span>{method.availability}</span>
                    </div>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <p className="text-xs text-muted-foreground/70 mb-4 font-mono cursor-help hover:text-muted-foreground transition-colors">
                          {method.contact}
                        </p>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-fit">
                        <p className="text-sm">Click to {method.action.toLowerCase()}</p>
                      </HoverCardContent>
                    </HoverCard>
                    <Button 
                      size="sm" 
                      variant="default"
                      className="w-full transition-all hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        method.onClick();
                      }}
                    >
                      {method.action}
                    </Button>
                    {method.highlight && (
                      <div className="mt-3">
                        <Badge variant="secondary">Recommended</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Media */}
        <section className="px-4 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Connect with Us</h2>
          <Card className="neu-card">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground">
                  Follow us on social media for the latest updates, fashion tips, and exclusive offers
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {socialMedia.map((social) => (
                  <HoverCard key={social.name}>
                    <HoverCardTrigger asChild>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`neu-surface p-6 rounded-xl transition-all duration-300 group hover:scale-110 ${social.bgHover} focus:outline-none focus:ring-2 focus:ring-primary/20`}
                        aria-label={`Follow us on ${social.name}`}
                      >
                        <i className={`${social.icon} text-3xl ${social.color} ${social.hoverColor} group-hover:scale-110 transition-all duration-300`}></i>
                      </a>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-fit">
                      <div className="text-center">
                        <p className="font-medium">{social.name}</p>
                        <p className="text-sm text-muted-foreground">Follow us for updates</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Store Information */}
        <section className="px-4 mb-8">
          <Card className="neu-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MapPin size={20} className="text-primary" />
                Visit Our Store
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="neu-surface p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Address</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          Shop With Sky<br />
                          Akogun Street, Olodi Apapa<br />
                          Lagos, Nigeria
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="neu-surface p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock size={20} className="text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Store Hours</h4>
                        <div className="text-muted-foreground space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span className="text-sm sm:text-base">Monday - Saturday:</span>
                            <span className="text-sm sm:text-base font-medium">10:00 AM - 8:00 PM</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span className="text-sm sm:text-base">Sunday:</span>
                            <span className="text-sm sm:text-base font-medium">12:00 PM - 6:00 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="neu-surface rounded-xl p-6 min-h-[200px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="neu-surface p-4 rounded-full w-fit mx-auto mb-4">
                      <MapPin size={32} className="text-primary opacity-60" />
                    </div>
                    <p className="text-sm">Interactive Map Coming Soon</p>
                    <p className="text-xs mt-1 opacity-60">We're working on adding directions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageWithNavigation>
  );
};

export default Contact;