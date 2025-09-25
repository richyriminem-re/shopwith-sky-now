import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContactStoreInfo = () => {
  return (
    <section className="px-4 mb-8">
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MapPin size={20} className="text-primary" />
            Visit Our Store
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="neu-surface p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Address</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Shop With Sky<br />
                      Akogun Street, Olodi Apapa<br />
                      Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="neu-surface p-4 sm:p-5 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:items-start">
                    <Clock size={24} className="text-primary flex-shrink-0" />
                    <h4 className="font-medium text-foreground text-base sm:text-lg sm:hidden">Store Hours</h4>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-3 text-lg hidden sm:block">Store Hours</h4>
                    <div className="text-muted-foreground space-y-3">
                      <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-2 p-2 sm:p-0 bg-background/50 sm:bg-transparent rounded-lg sm:rounded-none">
                        <span className="text-sm sm:text-base font-medium xs:font-normal">Monday - Saturday:</span>
                        <span className="text-sm sm:text-base font-semibold">08:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-2 p-2 sm:p-0 bg-background/50 sm:bg-transparent rounded-lg sm:rounded-none">
                        <span className="text-sm sm:text-base font-medium xs:font-normal">Sunday:</span>
                        <span className="text-sm sm:text-base font-semibold">12:00 PM - 5:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="neu-surface rounded-xl p-6 min-h-[200px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="neu-surface p-4 rounded-full w-fit mx-auto mb-4">
                  <MapPin size={32} className="text-primary opacity-60" />
                </div>
                <p className="text-sm">Interactive Map Coming Soon</p>
                <p className="text-xs mt-1 opacity-60">We're working on adding directions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ContactStoreInfo;