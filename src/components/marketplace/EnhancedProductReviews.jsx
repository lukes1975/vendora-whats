import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  ThumbsUp, 
  Camera, 
  Shield, 
  Image as ImageIcon,
  MessageSquare,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const EnhancedProductReviews = ({ productId, productName = "this product" }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    reviewText: '',
    images: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_ratings')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (files) => {
    if (files) {
      const validFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
      );
      
      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid Files",
          description: "Only images under 5MB are allowed",
          variant: "destructive",
        });
      }
      
      setNewReview(prev => ({ 
        ...prev, 
        images: [...prev.images, ...validFiles].slice(0, 3) // Max 3 images
      }));
    }
  };

  const uploadImages = async (images) => {
    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `review-${productId}-${Date.now()}-${index}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, image);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (newReview.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let imageUrls = [];
      
      if (newReview.images.length > 0) {
        imageUrls = await uploadImages(newReview.images);
      }

      const { error } = await supabase
        .from('product_ratings')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating: newReview.rating,
          review_text: newReview.reviewText || null,
          review_images: imageUrls,
          is_verified_purchase: false, // TODO: Check if user actually purchased
          helpful_votes: 0
        });

      if (error) throw error;

      setNewReview({ rating: 0, reviewText: '', images: [] });
      setShowReviewModal(false);
      await fetchReviews();
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      // For simplicity, just increment the helpful votes 
      // In a real app, you'd track user votes to prevent duplicate voting
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      const { error } = await supabase
        .from('product_ratings')
        .update({ 
          helpful_votes: review.helpful_votes + 1 
        })
        .eq('id', reviewId);

      if (error) throw error;
      
      await fetchReviews();
      toast({
        title: "Vote Recorded",
        description: "Thanks for your feedback!",
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getFilteredReviews = () => {
    switch (filterBy) {
      case 'verified':
        return reviews.filter(r => r.is_verified_purchase);
      case 'with-photos':
        return reviews.filter(r => Array.isArray(r.review_images) && r.review_images.length > 0);
      default:
        return reviews;
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 
      : 0
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
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

  const filteredReviews = getFilteredReviews();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
            <Badge variant="secondary">
              {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          
          <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>Your Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          star <= newReview.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-muted-foreground hover:text-yellow-400'
                        }`}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <Label>Your Review (Optional)</Label>
                  <Textarea
                    placeholder={`Share your experience with ${productName}...`}
                    value={newReview.reviewText}
                    onChange={(e) => setNewReview(prev => ({ ...prev, reviewText: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Photos (Optional, max 3)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={newReview.images.length >= 3}
                      className="hidden"
                      id="review-images"
                    />
                    <Label 
                      htmlFor="review-images" 
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted"
                    >
                      <Camera className="h-4 w-4" />
                      Add Photos
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {newReview.images.length}/3
                    </span>
                  </div>
                  
                  {newReview.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {newReview.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => setNewReview(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || newReview.rating === 0}
                    className="flex-1"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {reviews.length > 0 && (
          <>
            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-3 text-sm">
                    <span className="w-8">{stars}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={filterBy === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('all')}
              >
                All Reviews ({reviews.length})
              </Button>
              <Button
                variant={filterBy === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('verified')}
              >
                <Shield className="h-3 w-3 mr-1" />
                Verified ({reviews.filter(r => r.is_verified_purchase).length})
              </Button>
              <Button
                variant={filterBy === 'with-photos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('with-photos')}
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                With Photos ({reviews.filter(r => Array.isArray(r.review_images) && r.review_images.length > 0).length})
              </Button>
            </div>
          </>
        )}

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {review.user_id ? 'U' : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        {review.is_verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {review.review_text && (
                  <p className="text-sm">{review.review_text}</p>
                )}

                {/* Review Images */}
                {Array.isArray(review.review_images) && review.review_images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {review.review_images.map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`Review ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-80"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                    ))}
                  </div>
                )}

                {/* Helpful Vote */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpfulVote(review.id)}
                    className="text-xs"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Helpful ({review.helpful_votes || 0})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No reviews match the current filter</p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to review this product!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedProductReviews;