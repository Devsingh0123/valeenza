import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductReviewsByCategory, submitReviewByCategory, clearReviewError } from '../../redux/slices/reviewSlice';
import { toast } from 'react-toastify';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import Slider from '../common/Slider';

const ProductReviews = ({ catId }) => {
  const dispatch = useDispatch();
  const { reviews, loading, error, submitLoading, submitError } = useSelector(
    (state) => state.review
  );
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    dispatch(fetchProductReviewsByCategory(catId));
  }, [dispatch, catId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearReviewError());
    }
  }, [error, dispatch]);

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!review.trim()) {
      toast.error('Please write a review');
      return;
    }
    try {
      await dispatch(submitReviewByCategory({ catId:catId, rating, review })).unwrap();
      toast.success('Review submitted!');
      setRating(0);
      setReview('');
      // Refetch the reviews to get the updated list
      dispatch(fetchProductReviewsByCategory(catId));
    } catch (err) {
      toast.error(err || 'Failed to submit review');
    dispatch(clearReviewError());
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>

      {/* Review Form */}
      {isLoggedIn && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review
              </label>
              <textarea
                rows="2"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-3 py-2 border focus:outline-none border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {submitLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        
        <div className=" items-start">
          <Slider slideCount={3} showBtn={false} >
          {reviews.map((review) => (
             <div key={review.id} className="w-[280px] sm:w-[300px] md:w-[320px] flex-shrink-0">
            <ReviewCard key={review.id} review={review}  />
            </div>
          ))}
         </Slider>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;