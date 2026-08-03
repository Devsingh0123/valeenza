import { useState, useMemo } from "react";
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const getProductPrice = (p) => Number(p?.after_price) || 0;
const getProductRating = (p) => Number(p?.rating_avg) || 0;
const getDiscountPercent = (p) => {
  const before = Number(p?.before_price) || 0;
  const after = Number(p?.after_price) || 0;
  return before > after && after > 0 ? Math.round(((before - after) / before) * 100) : 0;
};

const sortProducts = (products, sortType) => {
  if (!products || !sortType || sortType === "default") return products;
  const sorted = [...products];
  if (sortType === "price-asc") sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
  else if (sortType === "price-desc") sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
  else if (sortType === "rating") sorted.sort((a, b) => getProductRating(b) - getProductRating(a));
  else if (sortType === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
};

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

// ── Component ─────────────────────────────────────────────────────────────────

const HomePage = () => {
  const dispatch = useDispatch();

  const { items: products, productCategories, loading, error } = useSelector(
    (state) => state.product
  );

  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    minDiscount: "",
    sort: "default",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  // GTM tracking
  useState(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "viewHome" });
  }, []);

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

  const categoryFilteredProducts = useMemo(() => {
    const result = {};
    groupedCategories.forEach((cat) => {
      const catProducts = products.filter((p) => p.category?.slug === cat.slug);
      result[cat.id] = sortProducts(filterProducts(catProducts, filters), filters.sort);
    });
    result.all = sortProducts(filterProducts(products, filters), filters.sort);
    return result;
  }, [products, filters, groupedCategories]);

  const handleAddToCart = async ({ product_id, quantity, name, ratti, price, image, stockQty }) => {
    if (stockQty < quantity) return toast.info(`${stockQty} stock available only`);
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

  const clearFilters = () =>
    setFilters({ search: "", minPrice: "", maxPrice: "", minRating: "", minDiscount: "", sort: "default" });

  // ── Early returns ─────────────────────────────────────────────────────────

  if (loading) return <div className="text-center py-10"><Loader data="Loading products..." /></div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (!products.length) return <div className="text-center py-10">No products found</div>;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="md:px-2">
      <AllCatogries />
      <HeroBanner />

      <div className="flex items-start gap-4 mt-6">
        {/* Filter sidebar (owns its own toggle button) */}
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          onClearFilters={clearFilters}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />

        {/* Product content — grows to fill remaining space */}
        <div className="flex-1 min-w-0">
          <BestSellers onAddToCart={handleAddToCart} />

          <div className="space-y-4 mt-4">
            {groupedCategories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                products={categoryFilteredProducts[cat.id] || []}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
