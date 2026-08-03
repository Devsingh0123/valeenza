import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchProductByIdorSlug,
  clearSelectedProduct,
  fetchAllProducts,
} from "../../redux/slices/productSlice";
import Loader from "@/components/common/Loader";
import StarRating from "@/components/common/StarRating";
import AccordionSection from "@/components/common/AccordionSection";
import ProductAccordionSections from "@/components/product/ProductAccordionSections";
import ProductReviews from "@/components/product/ProductReviews";
import ProductYouMayAlsoLike from "@/components/product/ProductYouMayAlsoLike";

// ---------- Helper ----------
const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";

// ---------- Main Component ----------
const ProductDetailsPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  // Local state
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // Redux state
  const { selectedProduct: product, items: allProducts, loading, error } = useSelector(
    (state) => state.product
  );

  // --- Fetch all products (for "You May Also Like") ---
  useEffect(() => {
    if (!allProducts.length) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, allProducts.length]);

  // --- Fetch current product ---
  useEffect(() => {
    if (slug) dispatch(fetchProductByIdorSlug({slug}));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, slug]);

  // --- Related products (same category) ---
  const suggestedProducts = useMemo(() => {
    if (!allProducts.length || !product) return [];
    const currentCategory = product?.category?.slug;
    return allProducts.filter(
      (p) => p.category?.slug === currentCategory && p.id !== product?.id
    );
  }, [allProducts, product]);

  if (loading) return <Loader data="Loading product..." />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  // --- Media: objects with url, type, and thumbnail ---
  let mediaItems = [];
  if (product?.images?.length) {
    product.images.forEach(item => {
      const url = item.image;
      const isVideo = url?.endsWith('.mp4') || url?.endsWith('.webm') || item.media_type === 'video';
      const thumbnail = item.thumbnail || (isVideo ? url.replace(/\.mp4$/, '.jpg') : null);
      mediaItems.push({
        url,
        type: isVideo ? 'video' : 'image',
        thumbnail,
      });
    });
  } else if (product?.image) {
    mediaItems.push({ url: product.image, type: 'image', thumbnail: null });
  }

  const totalMedia = mediaItems.length;

  // --- Specifications ---
  const buildSpecs = () => {
    const specs = [];
    if (product?.specifications && Array.isArray(product.specifications)) {
      product.specifications.forEach((spec) => {
        specs.push({ label: spec.title, value: spec.value });
      });
    }
    if (product?.origin) specs.push({ label: "Origin", value: product.origin });
    if (product?.planet) specs.push({ label: "Planet", value: product.planet });
    if (product?.purity) specs.push({ label: "Purity", value: product.purity });
    return specs;
  };
  const productSpecs = buildSpecs();

  // --- How to use (split by newline) ---
  const howToUseSteps = product?.how_to_use
    ? product.how_to_use.split("\n").filter((step) => step.trim() !== "")
    : [];

  // --- Benefits (split by newline) ---
  const benefitsParagraphs = product?.benefits
    ? product.benefits.split("\n").filter((p) => p.trim() !== "")
    : [];

  // --- FAQs ---
  const faqs = product?.faq && Array.isArray(product.faq) ? product.faq : [];

  // Handlers
  const handlePrevMedia = () => {
    setSelectedMediaIndex((prev) => (prev === 0 ? totalMedia - 1 : prev - 1));
  };
  const handleNextMedia = () => {
    setSelectedMediaIndex((prev) => (prev === totalMedia - 1 ? 0 : prev + 1));
  };

  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="flex mb-4 text-xs sm:text-sm text-gray-500">
          <ol className="flex items-center flex-wrap gap-1">
            <li>
              <a href="/" className="hover:text-amber-600 transition cursor-pointer">
                Home
              </a>
            </li>
            <li className="mx-1">/</li>
            <li className="text-amber-700 font-medium truncate max-w-[200px]">
              {product?.name}
            </li>
          </ol>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: MEDIA GALLERY */}
          <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            {/* Main Media */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg group">
              {mediaItems[selectedMediaIndex]?.type === 'video' ? (
                <video
                  src={mediaItems[selectedMediaIndex].url}
                  poster={mediaItems[selectedMediaIndex].thumbnail || undefined}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={mediaItems[selectedMediaIndex]?.url || fallbackImage}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              )}
              {totalMedia > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {totalMedia > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {mediaItems.map((item, idx) => {
                  const isVideo = item.type === 'video';
                  const thumbUrl = isVideo ? (item.thumbnail || item.url) : item.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedMediaIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                        selectedMediaIndex === idx
                          ? "border-amber-600 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {isVideo ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={thumbUrl}
                          alt={`thumb-${idx}`}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT INFO (without price, ratti, offers, cart, shipping) */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {product?.name}
              </h1>
              {/* <div className="flex items-center gap-3 mt-2">
                <StarRating value={parseFloat(product?.rating_avg) || 0} size={16} />
                <span className="text-sm text-gray-600">
                  {(parseFloat(product?.rating_avg) || 0).toFixed(1)} ({product?.rating_count || 0} reviews)
                </span>
              </div> */}
            </div>

            {/* Product Specifications */}
            {productSpecs.length > 0 && (
              <AccordionSection title="Product Specifications" icon={Settings} defaultOpen={true}>
                <div className="divide-y text-gray-200">
                  {productSpecs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[160px_10px_1fr] py-2 text-sm items-center"
                    >
                      <span className="text-gray-700 font-semibold">{spec.label}</span>
                      <span className="text-center text-gray-700">:</span>
                      <span className="text-gray-900 text-xs font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}

            {/* Accordion Sections – Product details (description, benefits, how to use) */}
            {(benefitsParagraphs.length > 0 || howToUseSteps.length > 0) && (
              <ProductAccordionSections
                description={product?.description}
                benefitsParagraphs={benefitsParagraphs}
                howToUseSteps={howToUseSteps}
              />
            )}
          </div>
        </div>

        {/* ---------- FULL WIDTH SECTIONS ---------- */}
        <div className="mt-12 space-y-10">
          {/* FAQ's */}
          {faqs.length > 0 && (
            <section className="bg-white py-6 rounded-xl border border-gray-100">
              <h1 className="text-3xl text-center font-semibold text-gray-800 mb-6">FAQs</h1>
              <div className="max-w-3xl mx-auto px-4 space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <span
                        className={`text-sm ${
                          openFaq === idx ? "text-amber-500 font-medium" : "text-gray-700"
                        }`}
                      >
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          openFaq === idx ? "rotate-180 text-amber-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <p className="text-sm text-gray-900">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* You May Also Like */}
          {suggestedProducts.length > 0 && <ProductYouMayAlsoLike products={suggestedProducts} />}

          {/* Product Reviews */}
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;




























// // src/pages/GemstoneDetail.jsx
// import React from "react";
// import { useParams, Link } from "react-router-dom";
// import { gemstoneDetailsInfoData } from "@/constants/product info data/gemstoneDetailsInfoData";
// import { div } from "framer-motion/client";

// const GemstoneDetail = () => {
//     const { name } = useParams();
//     const gem = gemstoneDetailsInfoData[name];

//     if (!gem) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
//                 <div className="text-center max-w-md">
//                     <h2 className="text-3xl font-bold text-gray-800">Gemstone not found</h2>
//                     <p className="text-gray-600 mt-2">The gemstone "{name}" data is coming soon.</p>
//                     <Link to="/gemstones" className="mt-6 inline-block bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition">
//                         ← Back to Gemstones
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     const renderPropertiesTable = (properties, title) => {
//         if (!properties) return null;
//         return (
//             <section className="my-10">
//                 <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-amber-500 pl-3 mb-5">{title}</h2>
//                 <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
//                     <table className="min-w-full divide-y divide-gray-200">
//                         <tbody className="divide-y divide-gray-100">
//                             {Object.entries(properties).map(([key, value]) => (
//                                 <tr key={key}>
//                                     <td className="px-4 py-3 text-sm font-semibold text-gray-700 w-1/3 capitalize">
//                                         {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
//                                     </td>
//                                     <td className="px-4 py-3 text-sm text-gray-600">{value}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </section>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 py-8 px-4">
//             <div className="max-w-6xl mx-auto">
//                 {/* Breadcrumb */}
//                 <div className="text-sm text-gray-500 mb-6">
//                     <Link to="/" className="hover:text-amber-600">Home</Link>
//                     <span className="mx-2">/</span>
//                     <Link to="/gemstones" className="hover:text-amber-600">Gemstones</Link>
//                     <span className="mx-2">/</span>
//                     <span className="text-gray-700">{gem.name}</span>
//                 </div>

//                 {/* Heading */}
//                 <div className="mb-10 flex flex-col items-center">
//                     <h1 className="text-4xl md:text-5xl font-bold text-amber-700">{gem.name}</h1>
//                     <p className="text-sm text-gray-600 mt-2">{gem.shortDesc}</p>
//                 </div>

//                 {/* Q&A Sections – each row: image floated right, text wraps around */}
//                 <div className="space-y-8">
//                     {gem.sections.map((section, idx) => (
//                         <div key={idx} className=" overflow-hidden">
//                             <div className="p-6">
//                                 {/* Image floated right */}
//                                 <div className="float-right ml-6 mb-4 w-[50%]">
//                                     <div className="bg-gray-100  p-3">
//                                         <img
//                                             src={section.image || "/images/gemstones/placeholder.jpg"}
//                                             alt={`${gem.name} - ${section.title}`}
//                                             className="w-full object-contain  "
//                                             style={{ maxHeight: '250px' }}
//                                         />
//                                         {section.imageCaption && section.imageDiscription && (
//                                             <div className="text-center mt-2">
//                                                 <span className="text-sm text-amber-500 italic">{section.imageCaption}</span>
//                                                 <span className="text-sm text-gray-500 italic ml-1">{section.imageDiscription}</span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                                 {/* Text content – will wrap around the floated image */}
//                                 <h3 className="text-xl font-bold text-amber-600 mb-3">{section.title}</h3>
//                                 <p className="text-gray-600 leading-relaxed">{section.content}</p>
//                                 <div className="clear-both"></div> {/* Clear float after content */}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Full width tables */}
//                 {renderPropertiesTable(gem.physicalProperties, `Physical Properties of ${gem.name}`)}
//                 {renderPropertiesTable(gem.opticalProperties, "Optical Properties")}

//                 {/* Birthstone, Zodiac, Anniversary info row */}
//                 {(gem.birthstone || gem.zodiac || gem.anniversary) && (
//                     <div className="my-10 bg-amber-50 p-5 rounded-xl flex flex-wrap justify-around text-center">
//                         {gem.birthstone && <div><span className="font-bold text-amber-800">Birthstone</span><br />{gem.birthstone}</div>}
//                         {gem.zodiac && <div><span className="font-bold text-amber-800">Zodiac</span><br />{gem.zodiac}</div>}
//                         {gem.anniversary && <div><span className="font-bold text-amber-800">Anniversary</span><br />{gem.anniversary}</div>}
//                     </div>
//                 )}

//                 {/* FAQ */}
//                 {gem.faq && gem.faq.length > 0 && (
//                     <section className="my-10">
//                         <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-amber-500 pl-3 mb-5">Frequently Asked Questions</h2>
//                         <div className="space-y-4">
//                             {gem.faq.map((item, idx) => (
//                                 <div key={idx} className="bg-gray-50 p-4 rounded-lg">
//                                     <p className="font-semibold text-gray-800">{item.q}</p>
//                                     <p className="text-gray-600 mt-1">✅ {item.a}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </section>
//                 )}

//                 {/* Trivia */}
//                 {gem.trivia && (
//                     <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded my-8 italic text-gray-700">
//                         <span className="font-bold text-amber-700">Trivia:</span> {gem.trivia}
//                     </div>
//                 )}

//                 {/* References */}
//                 {/* {gem.references && gem.references.length > 0 && (
//                     <div className="text-sm text-gray-500 mt-8 pt-4 border-t">
//                         <h3 className="font-semibold text-gray-600 mb-1">References</h3>
//                         <ul className="list-disc list-inside space-y-0.5">
//                             {gem.references.map((ref, idx) => (
//                                 <li key={idx}>{ref}</li>
//                             ))}
//                         </ul>
//                     </div>
//                 )} */}
//             </div>
//         </div>
//     );
// };

// export default GemstoneDetail;