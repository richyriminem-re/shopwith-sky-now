import { MessageCircle, Phone, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const WhatsAppBusinessInfo = () => {
  const { settings } = useSiteSettings();
  const whatsappNumber = settings.whatsapp_business_number || "2348112698594";
  
  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '12:00 PM - 5:00 PM' }
  ];

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Hello! I'd like to know more about your products and services.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:+${whatsappNumber}`, '_self');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[#25D366]" />
          WhatsApp Business
        </CardTitle>
        <CardDescription>
          Get instant support and place orders directly through WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleWhatsAppContact}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] text-white rounded-lg hover:bg-[#25D366]/90 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </button>
          <button
            onClick={handleCall}
            className="px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Phone className="h-4 w-4" />
          </button>
        </div>

        {/* Business Hours */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Business Hours
          </div>
          {businessHours.map((schedule, index) => (
            <div key={index} className="flex justify-between text-sm text-muted-foreground">
              <span>{schedule.day}</span>
              <span>{schedule.hours}</span>
            </div>
          ))}
        </div>

        {/* Quick Services */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Services</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• Product inquiries</div>
            <div>• Order tracking</div>
            <div>• Size & color availability</div>
            <div>• Bulk order discounts</div>
            <div>• Custom requests</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Lagos, Nigeria</div>
            <div className="text-muted-foreground">Nationwide delivery available</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};