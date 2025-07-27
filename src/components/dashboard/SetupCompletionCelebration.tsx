import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Store, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Confetti from 'react-confetti';

interface SetupCompletionCelebrationProps {
  onDismiss: () => void;
  storeName?: string;
  storeSlug?: string;
}

const SetupCompletionCelebration: React.FC<SetupCompletionCelebrationProps> = ({
  onDismiss,
  storeName,
  storeSlug
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
      clearTimeout(timer);
    };
  }, []);

  const storeUrl = storeSlug 
    ? `https://vendora.business/${storeSlug}` 
    : `https://vendora.business/your-store`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.1}
          />
        )}
        
        <Card className="w-full max-w-md mx-4 border-0 shadow-2xl bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardContent className="p-8 text-center space-y-6">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold text-foreground">
                🎉 Setup Complete!
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Congratulations! Your store <strong className="text-foreground">{storeName || 'My Store'}</strong> is now ready to accept orders and delight customers.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={() => window.open(storeUrl, '_blank')}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                size="lg"
              >
                <Store className="mr-2 h-4 w-4" />
                View Your Live Store
              </Button>
              
              <Button
                onClick={onDismiss}
                variant="outline"
                className="w-full"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </motion.div>

            {/* Pro Tip */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="p-4 bg-muted/50 rounded-lg border"
            >
              <p className="text-sm text-muted-foreground">
                💡 <strong>Pro Tip:</strong> Share your store link on social media, WhatsApp, or add it to your email signature to start getting orders!
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default SetupCompletionCelebration;