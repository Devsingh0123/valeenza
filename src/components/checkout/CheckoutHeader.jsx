import React from "react";
import logo from "@/assets/logo.png"
import { ArrowLeft, ChevronLeft } from "lucide-react";

/**
 * CheckoutHeader Component
 * Renders the top navigation bar, logo layout, and discount status banner
 * matching the visual interface from image_7a088a.jpg.
 */
const CheckoutHeader = ({onBackClick}) => {
  return (
    <div className="flex flex-col w-full shrink-0 bg-white">
      {/* Top Navigation Strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        
        {/* Left Side: Back/Chevron Action Button */}
        <button
          onClick={onBackClick}
          className=" text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none cursor-pointer"
          aria-label="Go back"
        >
          
          <ChevronLeft size={16} strokeWidth={3}  />
        </button>

        {/* Center Logo */}
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center">
            
            <img src={logo} alt="Logo" className="h-8" />
          </div>
        </div>

        {/* Right Side: Spacer block to perfectly balance center alignment for the logo */}
        <div className="w-8" aria-hidden="true"> </div>
      </div>

      {/* Under-Header Promo Banner Strip */}
      <div className="w-full bg-amber-500 py-1.5 px-4 text-center shadow-inner">
        <p className="text-[11px] font-bold text-white tracking-wider">
          Login To Unlock Discount
        </p>
      </div>
    </div>
  );
};

export default CheckoutHeader;