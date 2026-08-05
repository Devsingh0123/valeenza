import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import BestSellers from "../components/home/BestSellers";
import CategorySection from "../components/home/CategorySection";
import FilterSidebar from "../components/home/FilterSidebar";
import HeroBanner from "../components/features/HeroBanner";
import Loader from "@/components/common/Loader";
import AllCatogries from "@/components/home/AllCatogries";
import { addToCart, fetchCart } from "../redux/slices/cartSlice";
import { openCartDrawer } from "@/redux/slices/uiSlice";
import { fetchAllProductCategories, fetchAllProducts } from "@/redux/slices/productSlice";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getProductPrice = (p) => Number(p?.after_price) || 0;
const getProductRating = (p) => Number(p?.rating_avg) || 0;

const getDiscountPercent = (p) => {
  const before = Number(p?.before_price) || 0;
  const after = Number(p?.after_price) || 0;
  return before > after && after > 0 ? Math.round(((before - after) / before) * 100) : 0;
};

// Filter logic based on active filters
const filterProducts = (products, filters) => {
  if (!products?.length) return [];
  return products.filter((p) => {
    if (filters.minPrice && getProductPrice(p) < Number(filters.minPrice)) return false;
    if (filters.maxPrice && getProductPrice(p) > Number(filters.maxPrice)) return false;
    if (filters.minRating && getProductRating(p) < Number(filters.minRating)) return false;
    if (filters.minDiscount && getDiscountPercent(p) < Number(filters.minDiscount)) return false;
    if (filters.search?.trim()) {
      if (!p.name?.toLowerCase().includes(filters.search.toLowerCase().trim())) return false;
    }
    return true;
  });
};

// Sorting logic synced with FilterSidebar
const sortProducts = (products, priceSort) => {
  if (!products?.length || !priceSort) return products;
  const sorted = [...products];
  if (priceSort === "asc") sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
  if (priceSort === "desc") sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
  return sorted;
};

const initialFilterState = {
  search: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  minDiscount: "",
  priceSort: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

const HomePage = () => {
  const dispatch = useDispatch();

  const { items: products = [], productCategories = [], loading, error } = useSelector(
    (state) => state.product
  );

  const [filters, setFilters] = useState(initialFilterState);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // GTM Tracking
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "viewHome" });
  }, []);

  // Fetch Products & Categories on Mount
  useEffect(() => {
    if (!products.length) dispatch(fetchAllProducts());
    if (!productCategories.length) dispatch(fetchAllProductCategories());
  }, [dispatch, products.length, productCategories.length]);

  // Sort category list by product count
  const groupedCategories = useMemo(() => {
    if (!productCategories.length) return [];
    return productCategories
      .map((cat) => ({ id: String(cat.id), slug: cat.slug, label: cat.name }))
      .sort((a, b) => {
        const countA = products.filter((p) => p.category?.slug === a.slug).length;
        const countB = products.filter((p) => p.category?.slug === b.slug).length;
        return countB - countA;
      });
  }, [productCategories, products]);

  // Compute filtered & sorted products for each category section
  const categoryFilteredProducts = useMemo(() => {
    const result = {};
    groupedCategories.forEach((cat) => {
      const catProducts = products.filter((p) => p.category?.slug === cat.slug);
      const filtered = filterProducts(catProducts, filters);
      result[cat.id] = sortProducts(filtered, filters.priceSort);
    });
    return result;
  }, [products, filters, groupedCategories]);

  // Add To Cart Handler
  const handleAddToCart = async ({ product_id, quantity, name, ratti, price, image, stockQty }) => {
    if (stockQty < quantity) {
      return toast.info(`${stockQty} stock available only`);
    }
    try {
      await dispatch(
        addToCart({ product_id, quantity, name, ratti, price, image, stockAvilable: stockQty })
      ).unwrap();
      toast.success(`${name} added to cart!`);
      dispatch(fetchCart());
      dispatch(openCartDrawer());
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    }
  };

  const clearFilters = () => setFilters(initialFilterState);

  const handleToggleSidebar = (val) => {
    setIsSidebarOpen((prev) => (typeof val === "boolean" ? val : !prev));
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader data="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 font-medium">
        Error loading products: {error}
      </div>
    );
  }

  return (
    <div className="md:px-2 pb-10">
      <AllCatogries />
      <HeroBanner />

      {/* Main Container: Sidebar + Product Grid */}
      <div className="flex items-start gap-4 mt-6 relative">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          onClearFilters={clearFilters}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          <BestSellers onAddToCart={handleAddToCart} />

          {groupedCategories.length > 0 ? (
            groupedCategories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                products={categoryFilteredProducts[cat.id] || []}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <div className="text-center py-10 text-slate-500">
              No product categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;