import { Phone } from 'lucide-react';

const CallBar = () => {
  return (
    <div className="neu-floating w-full px-4 py-2 backdrop-blur-sm border-t border-neu-border">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-neu-primary">
        <Phone size={14} className="text-neu-muted" />
        <span>CALL TO ORDER:</span>
        <a 
          href="tel:09057775190" 
          className="text-primary hover:text-primary/80 transition-colors font-semibold"
        >
          09057775190
        </a>
      </div>
    </div>
  );
};

export default CallBar;