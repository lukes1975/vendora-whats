import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeatureSuggestionModal } from "./FeatureSuggestionModal";

export const UpcomingFeatures = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const comingThisMonth = [
    "AI Order Assistant for WhatsApp – Smart agent that takes orders conversationally.",
    "Product Variants (Size, Color, etc.) – Add multiple options under one product.",
    "Store Analytics Dashboard – See views, orders, revenue, and product performance.",
    "WhatsApp Catalog Auto-Sync – Auto-update your WhatsApp Business catalog from your Vendora store.",
    "Custom Store URL (Subdomain) – Your own branded store like: peckycakes.vendora.business"
  ];

  const comingSoon = [
    "Drag-and-Drop Store Designer – Edit your storefront without code, like Shopify.",
    "Automated WhatsApp Promo Messages – Schedule product drops, offers, and updates.",
    "Customer CRM Dashboard – View customer chats, orders, and lifetime value in one place.",
    "Smart Product Import – Upload products from PDF, Instagram, Google Sheets, or WhatsApp.",
    "Store Subscription Plans – Unlock more storage, analytics, AI, and more.",
    "WhatsApp Inbox – Central inbox to manage all customer conversations directly from Vendora.",
    "Abandoned Cart Recovery via WhatsApp – Auto-ping customers who didn't complete checkout."
  ];

  const inRnD = [
    "Specialized Store AI Bot (per vendor) – Personalized bot that knows your catalog, prices, and policy.",
    "AI Marketing Script Generator – One-click ads, captions, promos tailored to your products.",
    "Vendor Mobile App (Android/iOS) – Full store management from your phone.",
    "Voice Commerce on WhatsApp – Let customers speak to place or check orders.",
    "Multi-language Support – Auto-translate store content and WhatsApp replies.",
    "AI Assistant for Store Owners – Edit products, settings, generate reports with a chat prompt.",
    "Broadcast Segmentation & Targeting – Send messages to groups based on behavior or tags.",
    "Role-Based Team Access – Add staff with specific permissions (sales, fulfillment, etc.)",
    "Store Copy Templates – Auto-generate product descriptions, store headlines, taglines.",
    "QR Code Store Access – Let users scan and start shopping/chatting instantly.",
    "Live Inventory Alerts – Notify you and customers when stock is low or out.",
    "Paystack + Flutterwave Integration – Accept payments seamlessly in NGN & USD.",
    "Vendor Store Verification Badge – Earn trust with a verified vendor mark.",
    "AI-Powered Product Tagging & Categorization – Auto-tag products for better discovery."
  ];

  const futureAddOns = [
    "Affiliate & Referral System – Reward users who refer buyers to your store.",
    "Digital Products Support – Sell eBooks, courses, or downloads.",
    "Multi-Currency Pricing – Display prices based on customer's location.",
    "AI-Powered Business Coach (chat format) – Get smart suggestions to grow revenue, retention, and brand.",
    "Integrations with Facebook/Instagram Shops – Unified product sync and marketing.",
    "Store-to-Store Wholesale Network – Let vendors sell to other vendors within Vendora."
  ];

  const FeatureList = ({ items }: { items: string[] }) => (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-muted-foreground leading-relaxed">
          • {item}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <Card className="w-full">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity">
              <CardTitle className="text-lg font-semibold">
                🚀 Upcoming Features
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Coming This Month */}
              <div>
                <h3 className="font-bold text-base mb-3">🔥 Coming This Month</h3>
                <FeatureList items={comingThisMonth} />
              </div>

              {/* Coming Soon */}
              <div>
                <h3 className="font-bold text-base mb-3">🔜 Coming Soon</h3>
                <FeatureList items={comingSoon} />
              </div>

              {/* In Research & Development */}
              <div>
                <h3 className="font-bold text-base mb-3">🧠 In Research & Development</h3>
                <FeatureList items={inRnD} />
              </div>

              {/* Possible Future Add-ons */}
              <div>
                <h3 className="font-bold text-base mb-3">💡 Possible Future Add-ons</h3>
                <FeatureList items={futureAddOns} />
              </div>

              {/* Suggest Feature Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  variant="outline" 
                  className="w-full sm:w-auto"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  💬 Suggest a Feature
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <FeatureSuggestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};