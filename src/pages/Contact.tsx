import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWithNavigation from '@/components/PageWithNavigation';
import SEOHead from '@/components/SEOHead';
import ContactHero from '@/components/contact/ContactHero';
import ContactMethods from '@/components/contact/ContactMethods';
import ContactUpdates from '@/components/contact/ContactUpdates';
import ContactStoreInfo from '@/components/contact/ContactStoreInfo';

const Contact = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="Contact Us - Get Help & Support"
        description="Get in touch with our support team. Live chat, phone, email support available 24/7."
        keywords="contact support, customer service, live chat, phone support, help center"
      />
      
      <div className="pb-20 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <ContactHero />
        
        {/* Primary Contact Methods - Priority for mobile */}
        <ContactMethods />
        
        {/* Stay Updated Section */}
        <ContactUpdates />
        
        {/* Store Information - Less priority on mobile */}
        <ContactStoreInfo />
      </div>
    </PageWithNavigation>
  );
};

export default Contact;