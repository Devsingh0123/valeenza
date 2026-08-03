import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ShoppingBag,
  User,
  UserCircle,
  ClipboardList,
  Wallet,
  Heart,
  MapPin,
  Home,
  LogOut,
  ChevronDown,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { logout, userLogout } from "../../redux/slices/userAuthSlice";
import { openCartDrawer, openLoginModal } from "../../redux/slices/uiSlice";
import { toast } from "react-toastify";
import { fetchCart } from "@/redux/slices/cartSlice";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoggedIn } = useSelector((state) => state.userAuth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = 10;
      if (currentScrollY > lastScrollY.current + threshold) {
        setIsNavHidden(true);
      } else if (currentScrollY < lastScrollY.current - threshold) {
        setIsNavHidden(false);
      }
      setScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".user-menu")) setDropdownOpen(false);
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

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

  const iconButtonClass =
    "relative flex items-center justify-center w-10 h-10 rounded-full text-[#1E3354] hover:bg-stone-100 transition-colors duration-200";

  const menuLinkClass =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:text-[#1E3354] hover:bg-stone-50 transition-colors";

  return (
    <nav
      className={`sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/70 transition-all duration-300 ${
        scrolled ? "shadow-sm" : ""
      } ${isNavHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          <Link to="/" className="shrink-0">
            <img
              src={logo}
              alt="Valeenza"
              className="h-7 sm:h-8 lg:h-9 w-auto"
            />
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => dispatch(openCartDrawer())}
              className={iconButtonClass}
              aria-label="Open cart"
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#D63B3B] text-white text-[10px] font-semibold rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full p-0.5 hover:bg-stone-100 transition-colors focus:outline-none cursor-pointer"
                  aria-label="Account menu"
                  aria-expanded={dropdownOpen}
                >
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user?.name?.charAt(0).toUpperCase()}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-stone-200 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1E3354] text-white flex items-center justify-center font-medium text-sm sm:text-base">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className={`hidden sm:block text-stone-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-stone-200/80 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-sm font-semibold text-[#1E3354] truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className={menuLinkClass}
                      >
                        <UserCircle size={16} strokeWidth={1.75} /> My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className={menuLinkClass}
                      >
                        <ClipboardList size={16} strokeWidth={1.75} /> My Orders
                      </Link>
                      <Link
                        to="/wallet"
                        onClick={() => setDropdownOpen(false)}
                        className={menuLinkClass}
                      >
                        <Wallet size={16} strokeWidth={1.75} /> My Wallet
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className={menuLinkClass}
                      >
                        <Heart size={16} strokeWidth={1.75} /> My Wishlist
                      </Link>
                      <Link
                        to="/addresses"
                        onClick={() => setDropdownOpen(false)}
                        className={menuLinkClass}
                      >
                        <MapPin size={16} strokeWidth={1.75} /> My Address
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setDropdownOpen(false)}
                        className={menuLinkClass}
                      >
                        <Home size={16} strokeWidth={1.75} /> Back to Home
                      </Link>
                    </div>

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#D63B3B] hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <LogOut size={16} strokeWidth={1.75} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => dispatch(openLoginModal())}
                className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full text-sm font-medium text-[#1E3354] border border-stone-200 hover:border-[#1E3354] hover:bg-stone-50 transition-all duration-200"
              >
                <User size={18} strokeWidth={1.75} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
