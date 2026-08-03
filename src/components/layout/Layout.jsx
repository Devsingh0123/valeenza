// components/layout/Layout.jsx 
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import UserLogin from "../auth/UserLogin"; 
// import TopPromoSlider from "../common/TopPromoSlider";
import WhatsAppButton from "../common/WhatsAppButton";
import CartDrawer from "../cart/CartDrawer";
// import CheckoutPopupWrapper from "../checkout/CheckoutPopupWrapper";
import { Suspense } from "react";
import Loader from "../common/Loader";
import CheckoutPopup from "../checkout/CheckoutPopup";


const Layout = () => {


  return (
    <div className="min-h-screen bg-stone-50">
      {/* <TopPromoSlider />  */}
      <Navbar />
      <main className="mx-auto">
        <Suspense fallback={<Loader data="Loading..." />}>
        <Outlet />
         </Suspense>
      </main>
      <Footer />
      <UserLogin />
      <CartDrawer />
      {/* <CheckoutPopupWrapper />  */}

      <CheckoutPopup 
     
      />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;