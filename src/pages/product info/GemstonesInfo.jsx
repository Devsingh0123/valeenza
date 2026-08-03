// src/pages/Gemstonesinfo.jsx
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts } from '@/redux/slices/productSlice';
import GemstoneInfoCard from '@/components/product info card/GemstoneInfoCard';
import Loader from '@/components/common/Loader';

const Gemstonesinfo = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.product);

  // Fetch products only once
  useEffect(() => {
    if (!items.length) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, items.length]);

  // Filter only gemstone products
  const gemstoneProducts = useMemo(() => {
    if (!items.length) return [];
    // Adjust the filter based on your actual category slug for gemstones
    return items.filter(
      (product) =>
        product.category?.slug === 'gemstones' ||
        product.category?.name?.toLowerCase() === 'gemstones'
    );
  }, [items]);

  // Transform product data to match GemstoneInfoCard props
  const gemstoneCardData = useMemo(() => {
    return gemstoneProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug, // ensure product has a slug field
      image: product.image || '/images/gemstones/placeholder.jpg',
      shortDesc: product.short_description || product.description?.substring(0, 80) + '...' || 'Natural gemstone',
    }));
  }, [gemstoneProducts]);

  if (loading) return <Loader data="Loading gemstones..." />;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-600 mb-2">
            Gemstones Info
          </h1>
          <div className="w-24 h-1 bg-orange-200 mx-auto rounded-full my-3"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore wide range of natural and treated gemstones.
          </p>
        </div>

        {/* Cards Grid */}
        {gemstoneCardData.length === 0 ? (
          <p className="text-center text-gray-500">No gemstones found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gemstoneCardData.map((gemstone) => (
              <GemstoneInfoCard key={gemstone.id} gemstone={gemstone} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gemstonesinfo;






















// // src/pages/Gemstonesinfo.jsx
// import React from "react";

// import GemstoneInfoCard from "@/components/product info card/GemstoneInfoCard";
// import { gemstonesCardInfoData } from "@/constants/product info data/gemstoneCardInfoData";

// const Gemstonesinfo = () => {
//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <h1 className="text-4xl md:text-5xl font-bold text-amber-600 mb-2">
//             Gemstones Info
//           </h1>
//           <div className="w-24 h-1 bg-orange-200 mx-auto rounded-full my-3"></div>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Explore wide range of natural and treated gemstones.
//           </p>
//         </div>

//         {/* Cards Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           {gemstonesCardInfoData.map((gemstone) => (
//             <GemstoneInfoCard key={gemstone.id} gemstone={gemstone} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Gemstonesinfo;