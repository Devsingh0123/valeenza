// import { useDispatch, useSelector } from "react-redux";
// import CartPage from "@/pages/CartPage";
// import { closeCartDrawer } from "@/redux/slices/uiSlice";
// // import { useEffect } from "react";


// const CartDrawer = () => {
//   const dispatch = useDispatch();

//   const { isCartDrawerOpen } = useSelector(
//     (state) => state.ui
//   );

//   if (!isCartDrawerOpen) return null;
//   //   useEffect(() => {
//   //   if (isCartDrawerOpen) {
//   //     document.body.style.overflow = "hidden";
//   //   } else {
//   //     document.body.style.overflow = "auto";
//   //   }

//   //   return () => {
//   //     document.body.style.overflow = "auto";
//   //   };
//   // }, [isCartDrawerOpen]);

//   return (
//     <>
//        {/* Overlay */}
//       <div
//         onClick={() => dispatch(closeCartDrawer())}
//         className="fixed inset-0 bg-black/40 z-40"
//       />
//       {/* Drawer */}
//       <div className="fixed top-0 right-0 h-screen w-full sm:w-[60%] bg-white z-50 overflow-y-auto shadow-2xl">
//         <CartPage />
//       </div>
//     </>
//   );
// };

// export default CartDrawer;


import { useDispatch, useSelector } from "react-redux";
import CartPage from "@/pages/CartPage";
import { closeCartDrawer } from "@/redux/slices/uiSlice";
import { useEffect } from "react";

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { isCartDrawerOpen } = useSelector((state) => state.ui);

  // बैकग्राउंड स्क्रॉल लॉक करने के लिए
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => dispatch(closeCartDrawer())}
        className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-[1px]"
      />
      {/* Drawer Container */}
      <div className="fixed top-0 right-0 h-screen w-[90%] sm:w-[50%] md:w-[50%] lg:w-[33%] bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in transition-transform duration-300 ease-in-out">
        <CartPage />
      </div>
    </>
  );
};

export default CartDrawer;