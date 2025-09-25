import React from 'react';
import { MessageCircle } from 'lucide-react';

const ContactHero = () => {
  return (
    <section className="neu-surface mx-4 mt-4 mb-0">
      <div className="p-6 sm:p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 neu-surface rounded-xl mb-4">
            <MessageCircle size={24} className="text-primary sm:size-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            We're Here to Help
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Have questions? Need support? Our dedicated team is ready to assist you.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;