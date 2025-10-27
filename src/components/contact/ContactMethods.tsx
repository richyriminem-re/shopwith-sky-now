import React from 'react';
import { Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const ContactMethods = () => {
  const { settings } = useSiteSettings();
  const whatsappNumber = settings.whatsapp_business_number || "2348112698594";
  
  const contactMethods = [
    {
      icon: Phone,
      title: settings.contact_whatsapp_title || 'Connect on WhatsApp',
      description: settings.contact_whatsapp_description || 'Message or Call us directly on WhatsApp',
      availability: settings.contact_whatsapp_availability || '⏰ Mon-Sat 8AM-7PM, Sun 12PM-5PM',
      action: settings.contact_whatsapp_action || '💬 Connect on WhatsApp',
      highlight: true,
      contact: settings.contact_whatsapp_contact || '📞 +234 811 269 8594',
      onClick: () => window.open(`https://wa.me/${whatsappNumber}`, '_blank')
    }
  ];

  return (
    <section className="px-4 mb-0">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-6 text-center">Get in Touch</h2>
      <div className="flex justify-center max-w-md mx-auto">
        {contactMethods.map((method) => (
          <Card 
            key={method.title} 
            className={`neu-card cursor-pointer transition-all duration-300 hover:scale-[1.02] ${method.highlight ? 'ring-2 ring-primary/20' : ''}`}
            onClick={method.onClick}
          >
            <CardContent className="p-6 sm:p-8">
              <div className="text-center">
                <div className={`neu-surface p-4 rounded-xl mx-auto w-fit mb-4 transition-colors ${method.highlight ? 'bg-primary/10' : ''}`}>
                  <method.icon size={28} className={method.highlight ? 'text-primary' : 'text-foreground'} />
                </div>
                <div className="flex items-center justify-center mb-3">
                  <h3 className="font-semibold text-foreground text-lg">{method.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {method.description}
                </p>
                <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-muted-foreground mb-4">
                  <Clock size={14} />
                  <span>{method.availability}</span>
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <p className="text-sm text-muted-foreground/70 mb-5 font-mono cursor-help hover:text-muted-foreground transition-colors">
                      {method.contact}
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-fit">
                    <p className="text-sm">Click to {method.action.toLowerCase()}</p>
                  </HoverCardContent>
                </HoverCard>
                <Button 
                  size="lg" 
                  variant="default"
                  className="w-full transition-all hover:scale-105 min-h-[48px] text-base font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    method.onClick();
                  }}
                >
                  {method.action}
                </Button>
                {method.highlight && (
                  <div className="mt-4">
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ContactMethods;