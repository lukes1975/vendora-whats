import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Shield, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StudentVerificationModal } from './StudentVerificationModal';

interface VerificationStatus {
  id: string;
  verification_status: string;
  university_email: string;
  student_id: string;
  department?: string;
  level_of_study?: string;
}

const StudentVerificationBanner = () => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
    
    // Check if banner was dismissed
    const isDismissed = localStorage.getItem('verification_banner_dismissed');
    setDismissed(isDismissed === 'true');
  }, [user]);

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_verifications_enhanced')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setVerificationStatus(data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('verification_banner_dismissed', 'true');
  };

  const handleVerificationComplete = () => {
    fetchVerificationStatus();
    setShowModal(false);
    toast({
      title: "Verification Submitted",
      description: "Your student verification has been submitted for review",
    });
  };

  // Don't show if dismissed or user is not logged in
  if (dismissed || !user) {
    return null;
  }

  // Show verification status if user has submitted verification
  if (verificationStatus) {
    const statusConfig = {
      pending: {
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        title: 'Verification Pending',
        description: 'Your FUOYE student verification is being reviewed. This may take 1-2 business days.'
      },
      verified: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        title: 'Verified FUOYE Student',
        description: 'You are verified as a FUOYE student. Enjoy exclusive marketplace access!'
      },
      rejected: {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        title: 'Verification Failed',
        description: 'Your verification was rejected. Please check your details and try again.'
      }
    };

    const config = statusConfig[verificationStatus.verification_status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <Alert className={`mb-6 ${config.bgColor} relative`}>
        <IconComponent className={`h-4 w-4 ${config.color}`} />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-semibold">{config.title}</span>
            <p className="text-sm mt-1">{config.description}</p>
            {verificationStatus.verification_status === 'verified' && (
              <Badge variant="secondary" className="mt-2">
                <GraduationCap className="h-3 w-3 mr-1" />
                {verificationStatus.department} • Level {verificationStatus.level_of_study}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {verificationStatus.verification_status === 'rejected' && (
              <Button 
                size="sm" 
                onClick={() => setShowModal(true)}
                variant="outline"
              >
                Retry Verification
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show verification prompt for unverified users
  return (
    <>
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 relative">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  Verify Your FUOYE Student Status
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Secure
                  </Badge>
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Get verified to access exclusive student deals and trusted vendor network
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Verify Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StudentVerificationModal
        open={showModal}
        onOpenChange={setShowModal}
        onVerificationComplete={handleVerificationComplete}
      />
    </>
  );
};

export default StudentVerificationBanner;