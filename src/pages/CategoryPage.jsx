import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../redux/slices/productSlice";
import { addToCart, fetchCart } from "../redux/slices/cartSlice";
import Loader from "@/components/common/Loader";
import ProductCard from "@/components/product/ProductCard";
import { toast } from "react-toastify";
import { categoryStaticData } from "../constants/categoryStaticData";
import AccordionSection from "@/components/common/AccordionSection";
import { openCartDrawer } from "@/redux/slices/uiSlice";

/* ---------- MAIN ---------- */
const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const { items, loading, error } = useSelector((s) => s.product);

  useEffect(() => {
    if (!items.length) dispatch(fetchAllProducts());
  }, [dispatch, items.length]);

  const products = useMemo(() => {
  if (!items.length) return [];
  let filtered = slug === "all" ? items : items.filter((p) => p.category?.slug === slug);
  return [...filtered].sort((a, b) => {
    // Extract numeric prefix from name (if any)
    const aNum = parseInt(a.name, 10);
    const bNum = parseInt(b.name, 10);
    // If both have a numeric prefix, sort numerically
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
      // If numbers equal, sort by the rest of the string
      const aRest = a.name.replace(/^\d+/, '');
      const bRest = b.name.replace(/^\d+/, '');
      return aRest.localeCompare(bRest);
    }
    // Otherwise, fallback to normal string comparison
    return a.name.localeCompare(b.name);
  });
}, [items, slug]);

  const data = categoryStaticData[slug] || categoryStaticData.default;



const handleAddToCart = async ({ product_id, quantity, name, ratti,price ,image,stockQty }) => {
  // console.log(stockQty, quantity)
  if(stockQty < quantity) return toast.info(`${stockQty} stock avilable only `)
  try {
    await dispatch(addToCart({ product_id, quantity, name, ratti,price ,image })).unwrap();
    toast.success(`${name} added to cart!`);
    dispatch(fetchCart());
    dispatch(openCartDrawer())
  } catch (err) {
    toast.error(err || 'Failed to add to cart');
  }
};

// console.log(products)

// ---------- add dataLayer for gtm tracking ----------
useEffect(() => {
  if (products.length === 0) return;

  const firstThree = products.slice(0, 3);
  const categoryId = firstThree[0]?.category_id || '';
  const items = firstThree.map(product => ({
    item_id: String(product.id),
    item_name: product.name || '',
    price: Number(product.after_price || product.price || 0),
    item_category: product.category?.name || slug || ''
  }));

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "viewList", 
    ecommerce: {
     
      category: categoryId ,
      items: items,
      page_number: "1"
    }
  });

  console.log("viewList datalayer", window.dataLayer);
}, [products, slug]);


  if (loading) return <Loader data="Loading..." />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- HEADER ---------- */}
      <div className="border-b border-gray-300 flex items-center justify-center">
        <div className="max-w-full mx-auto px-4 pb-4">
          <h1 className="text-2xl sm:text-5xl font-bold text-gray-900 capitalize uppercase text-center ">
            {slug.split("-").join("   ")}
          </h1>
          <p className="text-gray-500  text-sm text-center">
            Discover authentic & high-quality items
          </p>
        </div>
      </div>

      {/* ---------- PRODUCTS & INFO SECTIONS (full width) ---------- */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        {products.length === 0 ? (
          <p className="text-center font-bold text-3xl  text-orange-700">Comming Soon...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Info Sections (About, Benefits, Quality & Price) */}
        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-2xl font-medium mb-2">About</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{data.about}</p>
          </div>
          <div>
            <h2 className="text-2xl font-medium mb-2">Benefits</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{data.benefits}</p>
          </div>
          <div>
            <h2 className="text-2xl font-medium mb-2">Quality & Price</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{data.qualityPrice}</p>
          </div>
        </div>
      </div>

      {/* ---------- FAQ SECTION (centered & narrow) ---------- */}
      <div className="bg-white">
      {data.faqs?.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-medium mb-10 text-center">FAQs</h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <AccordionSection key={i} title={faq.q}>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </AccordionSection>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CategoryPage;