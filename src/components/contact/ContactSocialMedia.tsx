import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const ContactSocialMedia = () => {
  const socialMedia = [
    {
      name: 'WhatsApp',
      icon: 'fa-brands fa-whatsapp',
      url: 'http://wa.me/message/QYOISFIVI4JBB1',
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
    <section className="px-4 mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Follow Us on Social Media</h2>
      <Card className="neu-card max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm sm:text-base">
              Stay connected for the latest updates, fashion tips, and exclusive offers
            </p>
          </div>
          <div className="flex justify-center gap-6 sm:gap-8">
            {socialMedia.map((social) => (
              <HoverCard key={social.name}>
                <HoverCardTrigger asChild>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`neu-surface p-4 sm:p-6 rounded-xl transition-all duration-300 group hover:scale-110 ${social.bgHover} focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[56px] min-w-[56px] flex items-center justify-center`}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <i className={`${social.icon} text-2xl sm:text-3xl ${social.color} ${social.hoverColor} group-hover:scale-110 transition-all duration-300`}></i>
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
  );
};

export default ContactSocialMedia;