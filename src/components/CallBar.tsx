import { Phone } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const CallBar = () => {
  const { settings } = useSiteSettings();
  const phoneNumber = settings.call_bar_phone || '+234 905 777 5190';
  const phoneLink = `tel:${phoneNumber.replace(/\s/g, '')}`;

  return (
    <div className="neu-floating w-full px-4 py-2 backdrop-blur-sm border-t border-neu-border">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-neu-primary">
        <Phone size={14} className="text-neu-muted" />
        <span>CALL TO ORDER:</span>
        <a href={phoneLink} className="text-primary hover:text-primary/80 transition-colors font-semibold">
          {phoneNumber}
        </a>
      </div>
    </div>
  );
};

export default CallBar;