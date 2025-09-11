import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import PageWithNavigation from '@/components/PageWithNavigation';

const Help = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top navigation and fill out the required information including your email and password."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also check your order status in the 'Orders' section of your account."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unworn items with original tags. Returns are free and can be initiated from your account or by contacting support."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-7 business days. Express shipping (1-3 days) and overnight options are available for an additional fee."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 50 countries worldwide. International shipping times vary by location but typically take 7-14 business days."
    },
    {
      question: "How do I change or cancel my order?",
      answer: "Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team for assistance."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and Shop Pay for your convenience."
    },
    {
      question: "How do I use a promo code?",
      answer: "Enter your promo code in the 'Discount Code' field during checkout before completing your purchase."
    }
  ];

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="Frequently Asked Questions (FAQ)"
        description="Find answers to common questions about orders, shipping, returns, and more."
        keywords="FAQ, frequently asked questions, help, support, orders, shipping, returns"
      />
      
      <div className="pb-20 pb-safe min-h-screen">
        {/* Header */}
        <header className="neu-surface mx-3 sm:mx-4 lg:mx-6 mt-2 sm:mt-4 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <HelpCircle size={20} className="text-primary flex-shrink-0 mt-0.5 sm:w-6 sm:h-6 sm:mt-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground line-clamp-2">
                Frequently Asked Questions
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Find answers to common questions about our products and services
          </p>
        </header>

        {/* FAQ Accordion */}
        <div className="px-3 sm:px-4 lg:px-6 max-w-4xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="neu-surface mb-3 sm:mb-4 rounded-xl border-0">
                <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 text-left hover:no-underline text-sm sm:text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Quick Actions */}
        <div className="px-3 sm:px-4 lg:px-6 mt-6 sm:mt-8 lg:mt-10 max-w-lg mx-auto">
          <div className="neu-surface p-4 sm:p-6 lg:p-8 rounded-xl text-center">
            <h3 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base lg:text-lg">
              Can't find what you're looking for?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              Our support team is ready to help you with any specific questions
            </p>
            <Button 
              onClick={() => navigate('/contact')}
              className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-xl min-h-[44px] transition-all hover:transform hover:scale-105 w-full sm:w-auto"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </PageWithNavigation>
  );
};

export default Help;