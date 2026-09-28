import React from "react";
import logo from "@/assets/logo.png"
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useSelector } from "react-redux";

/**
 * CheckoutHeader Component
 * Renders the top navigation bar, logo layout, and step progress banner.
 */
const CheckoutHeader = ({onBackClick}) => {
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const { selectedAddressId } = useSelector((state) => state.address);

  // Determine current step: 1 = Login, 2 = Address, 3 = Payment
  const currentStep = !isLoggedIn ? 1 : !selectedAddressId ? 2 : 3;

  const steps = [
    { number: 1, label: "Login" },
    { number: 2, label: "Address" },
    { number: 3, label: "Payment" },
  ];

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

      {/* Step Progress Banner */}
      <div className="w-full bg-gradient-to-r from-sky-500 to-sky-600 py-2.5 px-4 shadow-inner">
        <div className="flex items-center justify-center gap-1 sm:gap-2 max-w-xs mx-auto">
          {steps.map((step, idx) => {
            const isCompleted = step.number < currentStep;
            const isActive = step.number === currentStep;
            const isPending = step.number > currentStep;

            return (
              <React.Fragment key={step.number}>
                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold transition-all duration-300 ${
                      isCompleted
                        ? "bg-white text-sky-600"
                        : isActive
                          ? "bg-white text-sky-600 ring-2 ring-white/40 ring-offset-1 ring-offset-sky-500"
                          : "bg-sky-400/50 text-white/70"
                    }`}
                  >
                    {isCompleted ? "✓" : step.number}
                  </div>
                  <span
                    className={`text-[11px] font-bold tracking-wide transition-all duration-300 ${
                      isCompleted || isActive
                        ? "text-white"
                        : "text-white/50"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line between steps */}
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] min-w-[20px] max-w-[40px] rounded-full transition-all duration-300 ${
                      step.number < currentStep
                        ? "bg-white"
                        : "bg-white/30"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheckoutHeader;