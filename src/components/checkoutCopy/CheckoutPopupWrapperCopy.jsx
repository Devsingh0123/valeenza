import { useDispatch, useSelector } from "react-redux";
import CheckoutPopup from "@/components/checkout/CheckoutPopup";
import { closeCheckout } from "@/redux/slices/uiSlice";
// import { useEffect } from "react";

const CheckoutPopupWrapper = () => {
  const dispatch = useDispatch();

  const { isCheckoutOpen } = useSelector(
    (state) => state.ui
  );

  //   useEffect(() => {
  //   if (isCheckoutOpen) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "auto";
  //   }

  //   return () => {
  //     document.body.style.overflow = "auto";
  //   };
  // }, [isCheckoutOpen]);

  return (
    <CheckoutPopup
      isOpen={isCheckoutOpen}
      onClose={() => dispatch(closeCheckout())}
    />
  );
};

export default CheckoutPopupWrapper;