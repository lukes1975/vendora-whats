import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import ProInterestModal from '@/components/dashboard/ProInterestModal';

interface PricingPlan {
  title: string;
  badge: string;
  badgeVariant: 'default' | 'secondary';
  price: string;
  period: string;
  discount?: string;
  features: string[];
  isActive: boolean;
}

const Pricing = () => {
  const plans: PricingPlan[] = [
    {
      title: 'Free (Early Access)',
      badge: 'Active Now',
      badgeVariant: 'default' as const,
      price: '₦0',
      period: 'mo',
      features: [
        'limited products',
        'Branded storefront',
        'WhatsApp order links',
        'Store analytics'
      ],
      isActive: true
    },
    {
      title: 'Starter Plan',
      badge: 'Coming Soon',
      badgeVariant: 'secondary' as const,
      price: '₦3,000',
      period: 'mo',
      discount: '15% off annual billing',
      features: [
        'Unlimited products',
        'Custom theme color/logo',
        'Smart inventory tracking',
        'WhatsApp automation',
        'Advanced analytics'
      ],
      isActive: false
    },
    {
      title: 'Pro Plan',
      badge: 'Coming Soon',
      badgeVariant: 'secondary' as const,
      price: '₦7,500',
      period: 'mo',
      discount: '15% off annual billing',
      features: [
        'Everything in Starter',
        'White-labeled solution',
        'Bulk messaging',
        'Priority support',
        'API integrations'
      ],
      isActive: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Simple, Fair Pricing for Growing Sellers
            </h1>
            <p className="text-gray-600">
              Choose the perfect plan for your business needs
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-2">
                  <Badge variant={plan.badgeVariant}>
                    {plan.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold">
                  {plan.title}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.period}</span>
                  {plan.discount && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      {plan.discount}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.isActive ? 'default' : 'outline'}
                  disabled={!plan.isActive}
                >
                  {plan.isActive ? 'Current Plan' : 'Coming Soon'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pro Interest Collection */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mx-auto max-w-3xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Want to be first in line for Pro features?
            </h3>
            <p className="text-gray-600 mb-6">
              Get notified as soon as advanced features like custom branding, inventory tracking, and WhatsApp automation become available.
            </p>
            <ProInterestModal>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Early Access to Pro
              </Button>
            </ProInterestModal>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-6 mx-auto max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎉 You're currently on the Early Access plan
            </h3>
            <p className="text-gray-600">
              Enjoy Pro features for free while we're in Early Access. 
              Paid upgrades coming soon with even more powerful features!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
