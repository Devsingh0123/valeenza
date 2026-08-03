import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingBag,
  User,
  UserCircle,
  ClipboardList,
  Wallet,
  Heart,
  MapPin,
  LogOut,
  ChevronDown,
  Search,
  Menu,
  X,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { logout, userLogout } from "../../redux/slices/userAuthSlice";
import { openCartDrawer, openLoginModal } from "../../redux/slices/uiSlice";
import { fetchAllProductCategories } from "../../redux/slices/productSlice";
import { toast } from "react-toastify";
import { fetchCart } from "@/redux/slices/cartSlice";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const searchInputRef = useRef(null);

  const { user, isLoggedIn } = useSelector((state) => state.userAuth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { productCategories } = useSelector((state) => state.product);

  // ── Effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (productCategories.length === 0) dispatch(fetchAllProductCategories());
  }, [dispatch, productCategories.length]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".user-menu")) setDropdownOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Close search on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (!e.target.closest(".search-zone")) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // Sync search query with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") ?? "");
  }, [location.search]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}` : "/");
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await dispatch(userLogout()).unwrap();
      toast.success("Logged out!!");
    } catch {
      dispatch(logout());
      toast.error("Logged out!!");
    }
    navigate("/");
  };

  // ── Style tokens ──────────────────────────────────────────────────────

  const iconBtn =
    "relative flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:bg-slate-100 transition-colors duration-200";

  const menuLink =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors";

  // ── JSX ───────────────────────────────────────────────────────────────

  return (
    <nav
      className={`sticky top-0 z-40 w-full bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-md border-b border-slate-200" : "border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main bar ── */}
        <div className="flex items-center h-16 lg:h-[68px] gap-3">

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`${iconBtn} lg:hidden`}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Valeenza" className="h-8 lg:h-9 w-auto" />
          </Link>

      

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop search — icon toggle with animated input */}
          <div className="hidden lg:flex items-center search-zone">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  key="search-form"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  onSubmit={handleSearch}
                  className="overflow-hidden mr-2"
                >
                  <input
                    ref={searchInputRef}
                    autoFocus
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                </motion.form>
              )}
            </AnimatePresence>

            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={iconBtn}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Cart */}
          <button
            onClick={() => dispatch(openCartDrawer())}
            className={iconBtn}
            aria-label="Open cart"
          >
            <ShoppingBag size={21} strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-sky-600 text-white text-[10px] font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account */}
          {isLoggedIn ? (
            <div className="relative user-menu">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
              >
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user?.name?.charAt(0).toUpperCase()}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
               
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50"
                  >
                    <div className="px-5 pb-3 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    <div className="px-2 py-1 space-y-0.5">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className={menuLink}>
                        <UserCircle size={16} /> My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setDropdownOpen(false)} className={menuLink}>
                        <ClipboardList size={16} /> My Orders
                      </Link>
                      <Link to="/wallet" onClick={() => setDropdownOpen(false)} className={menuLink}>
                        <Wallet size={16} /> My Wallet
                      </Link>
                      <Link to="/wishlist" onClick={() => setDropdownOpen(false)} className={menuLink}>
                        <Heart size={16} /> My Wishlist
                      </Link>
                      <Link to="/addresses" onClick={() => setDropdownOpen(false)} className={menuLink}>
                        <MapPin size={16} /> My Address
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 mx-2 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={() => dispatch(openLoginModal())}
                className="hidden sm:flex items-center gap-2 h-9 px-5 rounded-full text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 transition-colors"
              >
                <User size={16} /> Sign In
              </button>
              <button
                onClick={() => dispatch(openLoginModal())}
                className={`${iconBtn} sm:hidden`}
                aria-label="Sign in"
              >
                <User size={20} strokeWidth={1.6} />
              </button>
            </>
          )}
        </div>

        {/* ── Mobile search bar (always visible below top bar) ── */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-100 border border-transparent focus:border-sky-300 transition-all duration-200"
            />
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </form>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed top-0 left-0 z-50 h-screen w-[82%] max-w-xs bg-white shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <img src={logo} alt="Valeenza" className="h-7 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-4 py-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
                  Categories
                </p>
                <div className="space-y-0.5">
                 
                  {productCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600 rounded-lg transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
