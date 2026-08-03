import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../redux/slices/cartSlice";
import {
  Settings,
  ShoppingCart,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
  Award,
  ChevronDown,
  BadgePercent,
} from "lucide-react";
import { toast } from "react-toastify";
import { addToCart } from "../redux/slices/cartSlice";
import {
  fetchProductByIdorSlug,
  clearSelectedProduct,
  fetchAllProducts,
} from "../redux/slices/productSlice";
import Loader from "@/components/common/Loader";
import StarRating from "@/components/common/StarRating";
import { openCartDrawer, openLoginModal } from "@/redux/slices/uiSlice";

// Extracted components
import ProductYouMayAlsoLike from "@/components/product/ProductYouMayAlsoLike";
import ProductOffers from "@/components/product/ProductOffers";
import AccordionSection from "@/components/common/AccordionSection";
import ProductAccordionSections from "@/components/product/ProductAccordionSections";
// import { fallbackOffers } from "../constants/productStaticData";
import { fetchCoupons } from "@/redux/slices/couponSlice";
import ProductReviews from "@/components/product/ProductReviews";
// wishlists
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../redux/slices/wishlistSlice";

// ---------- Helper Functions ----------
const getStockStatus = (status, qty) => {
  if (!status && !qty)
    return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
  if (status === "few_left")
    return {
      text: "Only Few Left!",
      color: "text-orange-600",
      bg: "bg-orange-50",
    };
  if (qty > 0)
    return { text: "In Stock", color: "text-green-600", bg: "bg-green-50" };
  return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
};

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";

// ---------- Main Component ----------
const ProductDetailsPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  // Local state
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedRatti, setSelectedRatti] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [pincode, setPincode] = useState("");
  const buttonSectionRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const navigate = useNavigate();

  // Redux state
  const {
    selectedProduct: product,
    items: allProducts,
    loading,
    error,
  } = useSelector((state) => state.product);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const { list: coupons, loading: couponsLoading } = useSelector(
    (state) => state.coupon,
  );
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // --- Coupons (static fallback if no coupons) ---
  const offers = useMemo(() => {
    if (coupons.length > 0) {
      return coupons.map((coupon) => ({
        title: coupon.label,
        description: `Min order ₹${parseFloat(coupon.min_amount).toLocaleString()}`,
        price:
          coupon.discount_type === "percentage"
            ? `${coupon.discount_value}% OFF`
            : `₹${parseFloat(coupon.discount_value).toLocaleString()} OFF`,
        code: coupon.code,
        type: "discount",
      }));
    }
    return [];
  }, [coupons]);

  // --- Fetch all products (for "You May Also Like") ---
  useEffect(() => {
    if (!allProducts.length) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, allProducts.length]);

  //Fetch current product
  useEffect(() => {
    if (slug) dispatch(fetchProductByIdorSlug({ slug }));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, slug]);
  // wishlist
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  // --- Set default Ratti when product loads ---
  useEffect(() => {
    if (product?.ratti_options?.length > 0) {
      setSelectedRatti(product.ratti_options[0].ratti);
    } else {
      setSelectedRatti(null); // fallback only for ratti (UI control)
    }
  }, [product]);

  // --- Fetch coupons ---
  useEffect(() => {
    if (!coupons.length && !couponsLoading) {
      dispatch(fetchCoupons());
    }
  }, [dispatch]);

  // add IntersectionObserver for bottom add to cart and buy now sticky button
  useEffect(() => {
    if (!buttonSectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -80px 0px" }, // thoda pehle trigger kare
    );
    observer.observe(buttonSectionRef.current);
    return () => observer.disconnect();
  }, [product]);

  // add IntersectionObserver for bottom add to cart and buy now sticky button to prevent footer section
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    footerObserver.observe(footer);
    return () => footerObserver.disconnect();
  }, []);

  // ---------- add dataLayer for gtm tracking ----------
  useEffect(() => {
    if (product?.id) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "viewItem",
        ecommerce: {
          items: [
            {
              item_id: String(product.id),
              item_name: product.name || "",
              price: Number(product.after_price),
            },
          ],
        },
      });
      console.log("viewItem datalayer", window.dataLayer);
    }
  }, [product]);

  // --- Related products (only from API, no fallback) ---
  const suggestedProducts = useMemo(() => {
    if (!allProducts.length || !product) return [];
    const currentCategory = product?.category?.slug;
    return allProducts.filter(
      (p) => p.category?.slug === currentCategory && p.id !== product?.id,
    );
  }, [allProducts, product]);
  const isInWishlist = useMemo(() => {
    return wishlistItems.some((item) => item.id === product?.id);
  }, [wishlistItems, product?.id]);

  // console.log('Wishlist items:', wishlistItems);
  // console.log('Current product id:', product?.id);
  // console.log('Is in wishlist?', isInWishlist);

  if (loading) return <Loader data="Loading product..." />;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product)
    return <div className="text-center py-10">Product not found</div>;

  // ----- Data Extraction from API -----
  const baseAfterPrice = Number(product?.after_price) || 0;
  const baseBeforePrice = Number(product?.before_price) || 0;

  const rattiOptions = product?.ratti_options || [];
  const selectedRattiObj = rattiOptions.find(
    (opt) => opt.ratti === selectedRatti,
  );

  const displayAfterPrice = selectedRattiObj
    ? Number(selectedRattiObj.ratti_afterPrice) || 0
    : baseAfterPrice;
  const displayBeforePrice = selectedRattiObj
    ? Number(selectedRattiObj.ratti_beforePrice) || 0
    : baseBeforePrice;

  const discountPercent =
    displayBeforePrice > displayAfterPrice && displayAfterPrice > 0
      ? Math.round(
          ((displayBeforePrice - displayAfterPrice) / displayBeforePrice) * 100,
        )
      : 0;
  const discountText = discountPercent > 0 ? `${discountPercent}% OFF` : null;

  const ratingValue = parseFloat(product?.rating_avg) || 0;
  const reviewsCount = product?.rating_count || 0;

  // --- Media: objects with url, type, and thumbnail ---
  let mediaItems = [];
  if (product?.image) {
    const url = product.image;
    mediaItems.push({
      url,
    });
  }
  if (product?.images?.length) {
    product.images.forEach((item) => {
      const url = item.image;
      const isVideo =
        url?.endsWith(".mp4") ||
        url?.endsWith(".webm") ||
        item.media_type === "video";
      // Try to get a thumbnail: if the API provides a thumbnail field, use it; else replace .mp4 with .jpg
      const thumbnail =
        item.thumbnail || (isVideo ? url.replace(/\.mp4$/, ".jpg") : null);
      mediaItems.push({
        url,
        type: isVideo ? "video" : "image",
        thumbnail,
      });
    });
  }
  const mediaList = mediaItems.map((m) => m.url);
  const totalMedia = mediaList.length;

  const stockStatus = getStockStatus(product?.stock_status, product?.stock_qty);

  // --- Specifications: only from API fields, no fallback ---
  const buildSpecs = () => {
    const specs = [];
    if (product?.specifications && Array.isArray(product.specifications)) {
      product.specifications.forEach((spec) => {
        specs.push({ label: spec.title, value: spec.value });
      });
    }
    if (product?.weight)
      specs.push({ label: "Weight", value: product.weight + " gm" });
    // if (product?.length && product?.breadth && product?.height) specs.push({ label: "Dimension", value: `${Math.round(product.length)} X ${Math.round(product?.breadth)} X ${Math.round(product?.height)}` });
    if (product?.length)
      specs.push({ label: "Length", value: product.length + " cm" });
    if (product?.breadth)
      specs.push({ label: "Breadth", value: product.breadth + " cm" });
    if (product?.height)
      specs.push({ label: "Height", value: product.height + " cm" });
    if (product?.origin) specs.push({ label: "Origin", value: product.origin });
    if (product?.planet) specs.push({ label: "Planet", value: product.planet });
    if (product?.purity) specs.push({ label: "Purity", value: product.purity });
    return specs;
  };
  const productSpecs = buildSpecs();

  // --- How to use – only if provided ---
  const howToUseSteps = product?.how_to_use
    ? product.how_to_use.split("\n").filter((step) => step.trim() !== "")
    : [];

  // --- Benefits – only if provided ---
  const benefitsParagraphs = product?.benefits
    ? product.benefits.split("\n").filter((p) => p.trim() !== "")
    : [];

  // --- FAQs – only if provided ---
  const faqs = product?.faq && Array.isArray(product.faq) ? product.faq : [];

  // --- Certificates – only if provided ---
  const certificates =
    product?.lab_certificates && Array.isArray(product.lab_certificates)
      ? product.lab_certificates.map((cert, idx) => ({
          id: idx,
          image: cert.image || cert,
        }))
      : [];

  // Payment methods (static)
  const paymentMethods = [
    { src: "/payments/upi.png", name: "UPI" },
    { src: "/payments/gpay.png", name: "Google Pay" },
    { src: "/payments/phonepe.png", name: "PhonePe" },
    { src: "/payments/paytm.png", name: "Paytm" },
    { src: "/payments/visa.png", name: "Visa" },
    { src: "/payments/mastercard.png", name: "Mastercard" },
    { src: "/payments/rupay.png", name: "RuPay" },
  ];

  // Handlers
  const handlePrevMedia = () => {
    setSelectedMediaIndex((prev) => (prev === 0 ? totalMedia - 1 : prev - 1));
  };
  const handleNextMedia = () => {
    setSelectedMediaIndex((prev) => (prev === totalMedia - 1 ? 0 : prev + 1));
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (product?.stock_qty < quantity)
      return toast.info(`${product?.stock_qty} stock avilable only `);
    try {
      await dispatch(
        addToCart({
          product_id: product.id,
          quantity,
          ratti: selectedRatti,
          name: product.name,
          price: displayAfterPrice,
          image: product.image,
          stockAvilable:product?.stock_qty
        }),
      ).unwrap();
      toast.success(`${product?.name} added to cart!`);
      dispatch(fetchCart());
      // dispatch(openCartDrawer());
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (product?.stock_qty < quantity)
      return toast.info(`${product?.stock_qty} stock avilable only `);
    try {
      await dispatch(
        addToCart({
          product_id: product.id,
          quantity,
          ratti: selectedRatti,
          name: product.name,
          price: displayAfterPrice,
          image: product?.image,
          stockAvilable:product?.stock_qty
        }),
      ).unwrap();
      toast.success(`${product?.name} added to cart!`);
      dispatch(fetchCart());
      dispatch(openCartDrawer()); // redirect to cart page
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    }
  };

  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const checkPincode = () => {
    if (pincode.length === 6) {
      toast.success("Delivery available in 5-7 days");
    } else {
      toast.error("Please enter a valid 6-digit pincode");
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      toast.warning("Please login to add to wishlist");
      dispatch(openLoginModal());
      return;
    }
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist({ product_id: product.id })).unwrap();
        toast.info("Removed from wishlist");
      } else {
        await dispatch(addToWishlist({ product_id: product.id })).unwrap();
        toast.success("Added to wishlist");
      }
      // Refetch to keep UI in sync (optimistic update would be better but simpler)
      dispatch(fetchWishlist());
    } catch (err) {
      toast.error(err || "Failed to update wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="flex mb-4 text-xs sm:text-sm text-gray-500">
          <ol className="flex items-center flex-wrap gap-1">
            <li>
              <a
                href="/"
                className="hover:text-amber-600 transition cursor-pointer"
              >
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN: MEDIA GALLERY */}
          <div className="space-y-4 lg:sticky lg:top-16 lg:self-start">
            {/* Main Media */}
            <div className="relative aspect-square bg-white rounded-sm md:rounded-xl overflow-hidden border border-gray-200 shadow-lg group">
              {mediaItems[selectedMediaIndex]?.type === "video" ? (
                <video
                  src={mediaItems[selectedMediaIndex].url}
                  poster={mediaItems[selectedMediaIndex].thumbnail || undefined}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback: hide video and maybe show image placeholder
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <Link to={mediaItems[selectedMediaIndex]?.url || fallbackImage}>
                <img
                  src={mediaItems[selectedMediaIndex]?.url || fallbackImage}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                </Link>
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
              {discountText && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                  {discountText}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {totalMedia >= 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {mediaItems.map((item, idx) => {
                  const isVideo = item.type === "video";
                  const thumbUrl = isVideo
                    ? item.thumbnail || item.url
                    : item.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedMediaIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-sm md:rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
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

          {/* RIGHT COLUMN: PRODUCT INFO */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {product?.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {/* <StarRating value={ratingValue} size={16} />
                <span className="text-sm text-gray-600">
                  {ratingValue.toFixed(1)} ({reviewsCount} reviews)
                </span> */}

                <div className="flex items-center gap-1 text-green-600">
                 <BadgePercent size={20} className="font-bold animate-spin"/>
                  <span className="text-lg font-semibold">Best price</span>
                  <span className="font-semibold text-xl">
                    ₹{displayAfterPrice.toLocaleString()}
                  </span>
                </div>
                <span className="text-lg text-gray-400">|</span>
                <span className={`text-lg font-medium ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-gray-900">
                ₹{displayAfterPrice.toLocaleString()}
              </span>
              {displayBeforePrice > displayAfterPrice && (
                <span className="text-xl text-gray-400 line-through">
                  ₹{displayBeforePrice.toLocaleString()}
                </span>
              )}
              {discountText && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  {discountText}
                </span>
              )}
            </div>

            {/* Offers Section */}
            {offers.length > 0 && <ProductOffers offers={offers} />}

            {/* Ratti Selector */}
            {rattiOptions.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Ratti
                </label>
                <div className="flex flex-wrap gap-2">
                  {rattiOptions.map((opt) => (
                    <button
                      key={opt.ratti}
                      onClick={() => setSelectedRatti(opt.ratti)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        selectedRatti === opt.ratti
                          ? "border-amber-600 bg-amber-50 text-amber-700"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {opt.ratti}
                    </button>
                  ))}
                </div>
                {selectedRattiObj && (
                  <p className="text-xs text-gray-500 mt-2">
                    Price: ₹{selectedRattiObj.ratti_afterPrice} (MRP: ₹
                    {selectedRattiObj.ratti_beforePrice}) for {selectedRatti}{" "}
                    Ratti
                  </p>
                )}
              </div>
            )}

            {/* Shipping Info Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-500" />
                <div className="text-xs">
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-gray-500">on ₹799+</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-gray-500" />
                <div className="text-xs">
                  <p className="font-semibold">7-Day Returns</p>
                  <p className="text-gray-500">easy policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500" />
                <div className="text-xs">
                  <p className="font-semibold">Secure</p>
                  <p className="text-gray-500">payments</p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div
              ref={buttonSectionRef}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#E17100] hover:bg-[#b05800] text-black py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-5 h-5 text-black" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white/85 py-3 px-4  rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag className="w-5 h-5" /> Buy Now
              </button>
              {/* add to wishlist */}
              <button
                onClick={handleWishlistToggle}
                className="flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition gap-2"
              >
                <Heart
                  className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-red-600"}`}
                />
                <span className="sm:hidden">Wishlist</span>
              </button>
            </div>
            {/* Payment Options */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg  font-semibold text-gray-900">
                Payment Options
              </h3>
              <p className="text-xs text-gray-400 mb-2">
                100% secure payments. All major methods accepted
              </p>
              <div className="grid grid-cols-7  md:grid-cols-7 ">
                {paymentMethods.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center h-10 w-10   bg-gray-50 border border-gray-200 rounded-full p-2 hover:shadow-md transition"
                  >
                    <img
                      src={item.src}
                      alt={item.name}
                      className="max-h-7 object-cover"
                      onError={handleImageError}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Product Specifications */}
            {productSpecs.length > 0 && (
              <AccordionSection
                title="Product Specifications"
                icon={Settings}
                defaultOpen={true}
              >
                <div className="divide-y text-gray-200">
                  {productSpecs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[160px_10px_1fr] py-2 text-sm items-center"
                    >
                      <span className="text-gray-700 font-semibold">
                        {spec.label}
                      </span>
                      <span className="text-center text-gray-700">:</span>
                      <span className="text-gray-900 text-xs font-medium">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}

            {/* Shipping Details */}
            {/* <section className="bg-[#efe3d3] rounded-xl p-4 sm:p-5">
              <p className="text-sm text-gray-600">Prepaid orders are delivered on priority.</p>
              <p className="text-sm font-semibold text-gray-900 mb-3">
                {product?.shipping_info || "Most orders are delivered in 7 - 10 days."}
              </p>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 text-gray-500 flex-1">
                  <MapPin className="w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter your pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full py-2 text-sm outline-none"
                  />
                </div>
                <button
                  onClick={checkPincode}
                  className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 hover:bg-black transition cursor-pointer"
                >
                  Check
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 text-black" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">100% Cashback</p>
                    <p className="text-xs text-gray-600">on all prepaid orders (TnC)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-black" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">FREE Shipping</p>
                    <p className="text-xs text-gray-600">on all orders</p>
                  </div>
                </div>
              </div>
            </section> */}

            {/* Accordion Sections – Product details */}
            {(benefitsParagraphs.length > 0 ||
              howToUseSteps.length > 0 ||
              product?.description) && (
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
          {/* Certificates Section */}
          {certificates.length > 0 && (
            <section className="bg-white py-6 rounded-xl border border-gray-100">
              <h1 className="text-3xl text-center font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-amber-500" /> Our Certificates
              </h1>
              <p className="text-sm text-gray-500 text-center mb-8 max-w-2xl mx-auto">
                Every product comes with authentic lab certificates to guarantee
                purity and origin.
              </p>
              <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="group">
                    <div className="w-full aspect-[4/3] flex items-center justify-center rounded-xl p-4">
                      <img
                        src={cert.image}
                        alt={cert.name}
                        className="w-full h-full object-contain"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ's */}
          {faqs.length > 0 && (
            <section className="bg-white py-6 rounded-xl border border-gray-100">
              <h1 className="text-3xl text-center font-semibold text-gray-800 mb-6">
                FAQs
              </h1>
              <div className="max-w-3xl mx-auto px-4 space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <span
                        className={`text-sm ${
                          openFaq === idx
                            ? "text-amber-500 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          openFaq === idx
                            ? "rotate-180 text-amber-500"
                            : "text-gray-400"
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
          {suggestedProducts.length > 0 && (
            
            <ProductYouMayAlsoLike products={suggestedProducts} />
          )}
          {/* product reviews */}
          <ProductReviews catId={product.category_id} />
        </div>
      </div>

      {showStickyBar && (
        <div className="fixed  bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2  ">
            <img
              src={product.image}
              alt="image"
              className="w-10 h-10 rounded-md hidden sm:block"
            />
            {/* Product info - mobile me left align, desktop me flex row */}

            <div className="flex-1 flex flex-row items-center gap-2 ">
              <div className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 ">
                {product?.name}
              </div>
              <div className="flex items-center md:gap-2">
                <span className="text-amber-600 font-bold text-lg md:text-xl">
                  ₹{displayAfterPrice.toLocaleString()}
                </span>
                {displayBeforePrice > displayAfterPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    ₹{displayBeforePrice.toLocaleString()}
                  </span>
                )}
                {discountText && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    {discountText}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 md:flex-none bg-[#E17100] hover:bg-[#b05800] text-black py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-4 h-4 text-black" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag className="w-4 h-4" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
