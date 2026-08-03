import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "./redux/slices/userAuthSlice";
// import Loader from "./components/common/Loader";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
// import CategoryPage from "./pages/CategoryPage";
// import ProfilePage from "./pages/ProfilePage";

// import AddressesPage from "./pages/AddressesPage";
// import MyOrderDetailsPage from "./pages/MyOrderDetailsPage";
// import MyOrdersPage from "./pages/MyOrdersPage";
// import WalletPage from "./pages/WalletPage";
// import OrderSuccessPage from "./pages/OrderSuccessPage";
// import WishlistPage from "./pages/WishlistPage";
// import Gemstonesinfo from "./pages/product info/GemstonesInfo";
// import GemstoneDetails from "./pages/product info/GemstoneDetails";
// import TrackMyOrderPage from "./pages/TrackMyOrderPage";
// import ComingSoon from "./components/common/ComingSoon";
import GoogleTagManager from "./components/common/GoogleTagManager";
// import OrderInvoice from "./pages/OrderInvoice";
// import BecomeAnAffiliate from "./components/affiliate/BecomeAnAffiliate";
// import AffiliateSignup from "./components/affiliate/AffiliateSignup";
// import AffiliateLayout from "./components/layout/affiliatelayout/AffiliateLayout";

// Lazy load all pages

const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
// const CartPage = lazy(() => import("./pages/CartPage"));
const DisclaimerPage = lazy(() => import("./pages/legal/DisclaimerPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/legal/PrivacyPolicyPage"));
const RefundPolicyPage = lazy(() => import("./pages/legal/RefundPolicyPage"));
const ShippingPolicyPage = lazy(
  () => import("./pages/legal/ShippingPolicyPage"),
);
const TermsAndConditionsPage = lazy(
  () => import("./pages/legal/TermsAndConditionsPage"),
);
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AddressesPage = lazy(() => import("./pages/AddressesPage"));
const MyOrderDetailsPage = lazy(() => import("./pages/MyOrderDetailsPage"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const Gemstonesinfo = lazy(() => import("./pages/product info/GemstonesInfo"));
const GemstoneDetails = lazy(
  () => import("./pages/product info/GemstoneDetails"),
);
const TrackMyOrderPage = lazy(() => import("./pages/TrackMyOrderPage"));
const ComingSoon = lazy(() => import("./components/common/ComingSoon"));

// lazy load for affiliate layout (other seperate layout )
const BecomeAnAffiliate = lazy(
  () => import("./components/affiliate/BecomeAnAffiliate"),
);
const AffiliateSignup = lazy(
  () => import("./components/affiliate/AffiliateSignup"),
);
const AffiliateLayout = lazy(
  () => import("./components/layout/affiliatelayout/AffiliateLayout"),
);
// const OrderInvoice = lazy(() => import("./pages/OrderInvoice"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));

function App() {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (token && !user) {
      dispatch(userProfile());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [path]);
  return (
    <>
      <GoogleTagManager />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />

          {/* Policies and T&C */}
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route
            path="/terms-conditions"
            element={<TermsAndConditionsPage />}
          />
          {/* product catogaries page */}
          <Route path="/category/:slug" element={<CategoryPage />} />

          {/* product info */}

          <Route path="/gemstones" element={<Gemstonesinfo />} />
          {/* <Route path="/gemstones/:name" element={<GemstoneDetails />} /> */}
          <Route path="/gemstones/:slug" element={<GemstoneDetails />} />

          {/* comming soon route */}
          <Route path="/coming-soon" element={<ComingSoon />} />
          {/* user details */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* ordersuccess */}
          <Route path="/order-success" element={<OrderSuccessPage />} />
          {/* my order page */}
          <Route path="/orders" element={<MyOrdersPage />} />
          {/* order details page */}
          <Route path="/orders/:id" element={<MyOrderDetailsPage />} />
          {/* track my order page */}
          <Route path="/track-order/:orderId?" element={<TrackMyOrderPage />} />
          <Route path="/track-order/" element={<TrackMyOrderPage />} />
          {/* user wallet */}
          <Route path="/wallet" element={<WalletPage />} />
          {/* wishlist */}
          <Route path="/wishlist" element={<WishlistPage />} />
          {/* address */}
          <Route path="/addresses" element={<AddressesPage />} />
        </Route>

        {/* =============================================================== */}

        {/* now cart is not used the cart page showing in the drawer not on route */}
        {/* <Route path="/cart" element={<CartPage />} /> */}

        {/* not in use the invoice will download directely from now */}
        {/* <Route path="/invoice" element={<OrderInvoice />} /> */}

        {/* Affiliate routes – separate layout with new childrens */}
        <Route path="/become-an-affiliate" element={<AffiliateLayout />}>
          <Route index element={<BecomeAnAffiliate />} />
          <Route path="affiliate-signup" element={<AffiliateSignup />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
