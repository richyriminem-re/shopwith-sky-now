import React from 'react';
import { MessageCircle } from 'lucide-react';

const ContactHero = () => {
  return (
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
  );
};

export default ContactHero;