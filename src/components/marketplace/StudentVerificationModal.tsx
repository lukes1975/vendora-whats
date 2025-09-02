import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Mail, IdCard, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StudentVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationComplete: () => void;
}

const FUOYE_DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electrical/Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Architecture',
  'Economics',
  'Accounting',
  'Business Administration',
  'Mass Communication',
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Microbiology',
  'Biochemistry',
  'Medicine & Surgery',
  'Pharmacy',
  'Nursing',
  'Public Health',
  'Law',
  'Political Science',
  'History',
  'Geography'
];

export const StudentVerificationModal = ({ 
  open, 
  onOpenChange, 
  onVerificationComplete 
}: StudentVerificationModalProps) => {
  const [formData, setFormData] = useState({
    universityEmail: '',
    studentId: '',
    department: '',
    levelOfStudy: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate FUOYE email
    if (!formData.universityEmail.endsWith('@fuoye.edu.ng') && 
        !formData.universityEmail.endsWith('@student.fuoye.edu.ng')) {
      toast({
        title: "Invalid Email",
        description: "Please use your official FUOYE email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error } = await supabase
        .from('student_verifications_enhanced')
        .insert({
          user_id: user.id,
          university_email: formData.universityEmail,
          student_id: formData.studentId,
          department: formData.department,
          level_of_study: formData.levelOfStudy,
          verification_code: verificationCode,
          verification_status: 'pending'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Submitted",
            description: "You have already submitted a verification request",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // TODO: Send verification email with code
      // For now, we'll just submit for manual review

      onVerificationComplete();
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Verify FUOYE Student Status
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="universityEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              FUOYE Email Address
            </Label>
            <Input
              id="universityEmail"
              type="email"
              placeholder="yourname@fuoye.edu.ng"
              value={formData.universityEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, universityEmail: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use your official FUOYE email address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId" className="flex items-center gap-2">
              <IdCard className="h-4 w-4" />
              Student ID / Matric Number
            </Label>
            <Input
              id="studentId"
              placeholder="e.g., 20/2345"
              value={formData.studentId}
              onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Department
            </Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {FUOYE_DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Level of Study</Label>
            <Select 
              value={formData.levelOfStudy} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, levelOfStudy: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 Level</SelectItem>
                <SelectItem value="200">200 Level</SelectItem>
                <SelectItem value="300">300 Level</SelectItem>
                <SelectItem value="400">400 Level</SelectItem>
                <SelectItem value="500">500 Level</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-1">Verification Process:</p>
            <ul className="space-y-1 text-xs">
              <li>• Your details will be verified against FUOYE records</li>
              <li>• Verification typically takes 1-2 business days</li>
              <li>• You'll receive email confirmation once verified</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};