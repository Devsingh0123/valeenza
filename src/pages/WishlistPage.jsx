import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlist, fetchWishlist } from '../redux/slices/wishlistSlice';
import { toast } from 'react-toastify';
import { FaHeart, FaTrash } from 'react-icons/fa';
import Loader from '@/components/common/Loader';
import StarRating from '@/components/common/StarRating';
import { Heart } from 'lucide-react';

const WishlistCard = ({ product, onRemove }) => {
  const afterPrice = Number(product?.after_price) || 0;
  const beforePrice = Number(product?.before_price) || 0;
  const ratingValue = Number(product?.rating_avg) || 0;
  const imageUrl = product?.image || product?.images?.[0]?.image || '';

  const discountPercent = beforePrice > afterPrice && afterPrice > 0
    ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-sm md:rounded-xl border border-gray-100 transition-all duration-250 flex flex-col hover:shadow-xl hover:-translate-y-0.5 shadow-md w-full" title={product.name}>
      <Link to={`/product/${product?.slug}`} className="block">
        <div className="relative bg-stone-50 overflow-hidden aspect-square">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full rounded-t-sm md:rounded-t-xl object-cover transition-transform duration-350 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";
            }}
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2">
              <span className="bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-md shadow-md text-[10px] px-2 py-0.5">
                {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>
        <div className="p-2">
          <div className='flex justify-between'>
            <div>
              <h3 className="text-xs text-overflow: ellipsis;  font-bold text-stone-800 leading-snug line-clamp-2 mb-1">
                {product.name}
              </h3>
              {/* <div className="flex items-center gap-1 mb-1">
                <StarRating value={ratingValue} size={10} />
                <span className="text-[10px]  text-stone-500 font-semibold">
                  {ratingValue.toFixed(1)}
                </span>
              </div> */}
            </div>
            <button
              onClick={() => onRemove(product.id, product.name)}
              className="w-10 h-10 flex items-center justify-center  text-red-600 border border-red-200 rounded-4xl p-1 hover:bg-red-50 transition cursor-pointer"
            >
              <Heart
                className="fill-red-500 text-red-500"
              />
            </button>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div className='flex justify-center items-center gap-2'>
              <div className="text-sm  font-extrabold text-stone-900">
                ₹{afterPrice.toLocaleString()}
              </div>
              {beforePrice > afterPrice && (
                <div className="text-[10px]  text-stone-400 line-through">
                  ₹{beforePrice.toLocaleString()}
                </div>
              )}
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
};

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading, error } = useSelector((state) => state.wishlist);
  const { isLoggedIn } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRemove = async (productId, productName) => {
    try {
      await dispatch(removeFromWishlist({ product_id: productId })).unwrap();
      toast.warn(`${productName} removed from wishlist`);
    } catch (err) {
      toast.error(err || 'Failed to remove from wishlist');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Please log in</h2>
          <p className="text-gray-500 mt-2">Log in to view your wishlist.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader data="Loading wishlist..." />;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Your wishlist is empty</h2>
          <p className="text-gray-500 mt-2">Start adding products you love!</p>
          <Link to="/" className="inline-block mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlistItems.map((product) => (
            <WishlistCard
              key={product.id}
              product={product}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;