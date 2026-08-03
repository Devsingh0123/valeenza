import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";

// Components
import HomeNav from "../components/home/HomeNav";
import BestSellers from "../components/home/BestSellers";
import CategorySection from "../components/home/CategorySection";
import FilterSidebar from "../components/features/FilterSidebar";
import HeroBanner from "../components/features/HeroBanner";
import Loader from "@/components/common/Loader";
import { addToCart, fetchCart } from "../redux/slices/cartSlice";
import {
  fetchAllProductCategories,
  fetchAllProducts,
} from "../redux/slices/productSlice";
import { openCartDrawer } from "@/redux/slices/uiSlice";
import AllCatogries from "@/components/home/AllCatogries";

// ----- Helper Functions (for new API structure) -----
const getProductPrice = (product) => Number(product?.after_price) || 0;
const getProductRating = (product) => Number(product?.rating_avg) || 0;
const getDiscountPercent = (product) => {
  const before = Number(product?.before_price) || 0;
  const after = Number(product?.after_price) || 0;
  if (before > after && after > 0) {
    return Math.round(((before - after) / before) * 100);
  }
  return 0;
};
const sortProducts = (products, sortType) => {
  if (!products || !sortType || sortType === "default") return products;

  const sorted = [...products];
  if (sortType === "price-asc") {
    sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
  } else if (sortType === "price-desc") {
    sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
  } else if (sortType === "rating") {
    sorted.sort((a, b) => getProductRating(b) - getProductRating(a));
  } else if (sortType === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
};

const filterProductsInCategory = (products, filters) => {
  if (!products || !products.length) return [];

  return products.filter((p) => {
    // Price filter
    if (filters.minPrice && getProductPrice(p) < Number(filters.minPrice))
      return false;
    if (filters.maxPrice && getProductPrice(p) > Number(filters.maxPrice))
      return false;

    // Rating filter
    if (filters.minRating && getProductRating(p) < Number(filters.minRating))
      return false;

    // Discount filter
    if (
      filters.minDiscount &&
      getDiscountPercent(p) < Number(filters.minDiscount)
    )
      return false;

    // Search filter
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase().trim();
      const productName = p.name?.toLowerCase() || "";

      if (!productName.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

//  Main Component ======================
const HomePage = () => {
  const dispatch = useDispatch();
  // const location = useLocation();
  // const navigate = useNavigate();
  const {
    items: products,
    productCategories,
    loading,
    error,
  } = useSelector((state) => state.product);

  // console.log(products);
  // console.log(productCategories);

  // Filtering & UI state
  const [filterCategory, setFilterCategory] = useState("all"); // selected in sidebar
  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    minDiscount: "",
    sort: "default",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth >= 768;
    return true;
  });

  // Refs & Scroll behaviour
  // const sectionRefs = useRef({});
  const [navbarHeight, setNavbarHeight] = useState(64);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  const groupedCategories = useMemo(() => {
    if (!productCategories.length) return [];
    return productCategories
      .map((cat) => ({
        id: String(cat.id),
        slug: cat.slug,
        label: cat.name,
      }))
      .sort((a, b) => {
        const countA = products.filter(
          (p) => p.category?.slug === a.slug,
        ).length;
        const countB = products.filter(
          (p) => p.category?.slug === b.slug,
        ).length;
        return countB - countA;
      });
  }, [productCategories, products]);

// ---------- add dataLayer for gtm tracking ----------
useEffect(() => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'viewHome',
    
  });

  console.log("viewHome datalayer", window.dataLayer);
}, []); 

  useEffect(() => {
    const measureNavbar = () => {
      const navbar = document.querySelector("nav");
      if (navbar) setNavbarHeight(navbar.offsetHeight);
    };
    measureNavbar();
    window.addEventListener("resize", measureNavbar);
    return () => window.removeEventListener("resize", measureNavbar);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = 10;
      if (currentScrollY < lastScrollY.current - threshold)
        setIsNavbarVisible(true);
      else if (
        currentScrollY > lastScrollY.current + threshold &&
        currentScrollY > navbarHeight
      )
        setIsNavbarVisible(false);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navbarHeight]);

// products fetch 
  useEffect(() => {
    if (!products.length) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, products.length]);

// Categories fetch 
useEffect(() => {

    
  if (productCategories.length === 0) {
   
    dispatch(fetchAllProductCategories());
  }
}, [dispatch, productCategories.length]);



  // ----- Memoized filtered products per category -----
  const categoryFilteredProducts = useMemo(() => {
    const result = {};
    groupedCategories.forEach((cat) => {
      const catProducts = products.filter((p) => p.category?.slug === cat.slug);
      // first filter then sort
      const filtered = filterProductsInCategory(catProducts, filters);
      result[cat.id] = sortProducts(filtered, filters.sort);
    });
    // "all" category ke liye bhi (optional)
    result.all = sortProducts(
      filterProductsInCategory(products, filters),
      filters.sort,
    );
    return result;
  }, [products, filters, filters.sort, groupedCategories]); // filters.sort dependency add 

  // Total filtered products count (sum over all categories)
  const totalFilteredProducts = useMemo(() => {
    return groupedCategories.reduce(
      (sum, cat) => sum + (categoryFilteredProducts[cat.id]?.length || 0),
      0,
    );
  }, [categoryFilteredProducts,products,groupedCategories]);

  // console.log("totalFilteredProducts",totalFilteredProducts)

  const handleAddToCart = async ({
    product_id,
    quantity,
    name,
    ratti,
    price,
    image,
    stockQty,
  }) => {
      if(stockQty < quantity) return toast.info(`${stockQty} stock avilable only `)
    try {
      await dispatch(
        addToCart({ product_id, quantity, name, ratti, price, image, stockAvilable: stockQty}),
      ).unwrap();
      toast.success(`${name} added to cart!`);
      dispatch(fetchCart());
      dispatch(openCartDrawer());
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    }
  };


  const clearFilters = () => {
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      minDiscount: "",
      sort: "default",
    });
    setFilterCategory("all");
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Early returns for loading / error / no products
  if (loading)
    return (
      <div className="text-center py-10">
        <Loader data="Loading products..." />
      </div>
    );
  if (error)
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (!products.length){
    // console.log(products)
    return <div className="text-center py-10">No products found</div>};

  // Sticky positioning calculations
  const homeNavTop = isNavbarVisible ? navbarHeight : 0;
  const sidebarTop = homeNavTop + 60 + 8 + 10; // approx HomeNav height

  return (
    <div className=" md:px-2 ">
      <AllCatogries />
      <HeroBanner />

      <div className="flex gap-3 sm:gap-4 md:gap-6 mt-4">
        <div className="flex-1 min-w-0">
          {/* Sticky navigation bar */}
          <div
            className="sticky z-20 bg-white/95 backdrop-blur-sm transition-all duration-300"
            style={{ top: homeNavTop }}
          >
            <HomeNav
              filters={filters}
              setFilters={setFilters}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={toggleSidebar}
              onClearFilters={clearFilters} // optional, if you want to clear from HomeNav
            />
          </div>

          <div className="flex gap-2 sm:gap-4 md:gap-6 mt-4 ">
            {/* Sidebar */}
            <aside
              className={`
                sticky transition-all duration-300 ease-in-out overflow-hidden self-start
                ${isSidebarOpen ? "w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] opacity-100" : "w-0 opacity-0"}
              `}
              style={{ top: sidebarTop }}
            >
              <div
                className="bg-white rounded-2xl border border-gray-200 w-full overflow-y-auto scrollbar-hide min-h-0"
                style={{ maxHeight: `calc(100vh - ${sidebarTop}px - 2rem)` }}
              >
                <FilterSidebar
                  selected={filterCategory}
                  filters={filters}
                  setFilters={setFilters}
                  onClearFilters={clearFilters}
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 overflow-x-hidden">
              <BestSellers onAddToCart={handleAddToCart}/>

              {/* <div className="flex items-center justify-between mt-2">
                <span className="text-xs sm:text-sm text-stone-500 font-semibold">
                  {totalFilteredProducts} product
                  {totalFilteredProducts !== 1 ? "s" : ""} found
                </span>
              </div> */}

              {/* Always render categories, even when filters are active */}
              <div className="space-y-4 mt-4">
                {groupedCategories.map((cat) => {
                  const catProducts = categoryFilteredProducts[cat.id] || [];
                  // if (catProducts.length === 0) return null;   // hide empty categories
                  return (
                    <CategorySection
                      key={cat.id}
                      category={cat}
                      products={catProducts}
                      onAddToCart={handleAddToCart}
                      // ref={(el) => (sectionRefs.current[cat.id] = el)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
