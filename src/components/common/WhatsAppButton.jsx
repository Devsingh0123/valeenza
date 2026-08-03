import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocation, useMatch } from "react-router-dom";
import { useSelector } from "react-redux";

const WhatsAppButton = () => {
  const isHomepage = useMatch("/");

  const { isLoginModalOpen, isCartDrawerOpen, isCheckoutOpen} = useSelector((state)=>state.ui)

  // Agar home page hai to button mat dikhao
  if (!isHomepage || isLoginModalOpen || isCartDrawerOpen || isCheckoutOpen)
    return null;
  return (
    <a
      href="https://wa.me/919485628238?text=Hi"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      {/* Button with floating animation */}
      <div className="bg-green-600 hover:bg-green-700 text-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-float">
        <FaWhatsapp className="h-6 w-6 sm:w-9 sm:h-9 " />
      </div>
    </a>
  );
};

export default WhatsAppButton;
