import React from 'react';
import SEOHead from '@/components/SEOHead';

const AdminAnalytics: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Analytics Dashboard | Sky Shop Admin"
        description="Analytics dashboard coming soon"
      />
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Coming soon - under development</p>
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;