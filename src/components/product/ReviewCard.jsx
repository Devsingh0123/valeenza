import React, { useState } from 'react';
import StarRating from '../common/StarRating';
import { User, Calendar } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 100;
  const reviewText = review.review?.trim() || '';
  const isLong = reviewText.length > MAX_LENGTH;
  let displayedText = reviewText;
  if (isLong && !isExpanded) {
    displayedText = reviewText.slice(0, MAX_LENGTH) + '...';
  }

  // console.log(review)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <User className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-medium text-gray-800">
            {review?.user?.name || 'Anonymous'}
          </span>
        </div>
        {/* <span className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {formatDate(review.created_at)}
        </span> */}
        <div className="flex text-xs items-center ">
        <StarRating value={review.rating} size={12} />
        <span className="text-xs text-gray-600 ml-1">{review.rating}/5</span>
      </div>
      </div>
      
      <div className="text-gray-700  text-sm flex-1">
        <p className="whitespace-pre-wrap break-words">{displayedText}</p>
        {isLong && (
          <button
            onClick={toggleExpand}
            className="mt-2 text-amber-600 hover:text-amber-700 text-sm font-medium focus:outline-none"
          >
            {isExpanded ? 'View Less' : 'View More'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;