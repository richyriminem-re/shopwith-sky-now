import React from 'react';
import { Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const ContactMethods = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: 'WhatsApp Call',
      description: 'Call us directly on WhatsApp',
      availability: 'Mon-Sat 8AM-7PM, Sun 12PM-5PM',
      action: 'Call Now',
      highlight: true,
      contact: '+234 811 269 8594',
      onClick: () => window.open('https://wa.me/2348112698594', '_blank')
    }
  ];

  return (
    <section className="px-4 mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-6">Get in Touch via WhatsApp</h2>
      <div className="flex justify-center max-w-md mx-auto">
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
  );
};

export default ContactMethods;