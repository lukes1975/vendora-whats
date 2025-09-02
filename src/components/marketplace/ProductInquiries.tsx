import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Inquiry {
  id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  inquirer_id: string | null;
}

interface ProductInquiriesProps {
  productId: string;
  vendorId: string;
}

export const ProductInquiries = ({ productId, vendorId }: ProductInquiriesProps) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, [productId]);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('product_inquiries')
        .select('*')
        .eq('product_id', productId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to ask questions",
        variant: "destructive",
      });
      return;
    }

    if (!newQuestion.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your question",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('product_inquiries')
        .insert({
          product_id: productId,
          vendor_id: vendorId,
          inquirer_id: user.id,
          question: newQuestion.trim(),
          is_public: true
        });

      if (error) throw error;

      setNewQuestion('');
      await fetchInquiries();
      
      toast({
        title: "Question Submitted",
        description: "Your question has been sent to the vendor",
      });
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Error",
        description: "Failed to submit question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Product Q&A
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Product Q&A
          <Badge variant="secondary">
            {inquiries.length} Question{inquiries.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ask Question Form */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Have a question about this product?</h4>
          <div className="space-y-3">
            <Textarea
              placeholder="Ask the vendor anything about this product..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-[80px]"
              disabled={submitting}
            />
            <Button 
              onClick={handleSubmitQuestion}
              disabled={submitting || !newQuestion.trim()}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Sending...' : 'Ask Question'}
            </Button>
          </div>
        </div>

        {/* Existing Inquiries */}
        {inquiries.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Questions & Answers</h4>
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="border rounded-lg p-4 space-y-3">
                {/* Question */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarFallback className="text-xs">
                        Q
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Question
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {inquiry.question}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(inquiry.created_at).toLocaleDateString()} at{' '}
                        {new Date(inquiry.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                {inquiry.answer ? (
                  <div className="space-y-2 bg-primary/5 rounded-lg p-3 ml-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          V
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            Vendor Response
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Answered
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {inquiry.answer}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(inquiry.answered_at!).toLocaleDateString()} at{' '}
                          {new Date(inquiry.answered_at!).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ml-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Waiting for vendor response</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No questions yet. Be the first to ask!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
