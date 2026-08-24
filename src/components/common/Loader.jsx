import React from "react";
import logo from "/favicon.jpg";

const Loader = ({ data }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        {/* Logo with spinning rings */}
        <div className="relative">
          {/* Outer Ring */}
        
          
          {/* ring */}
          <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-b-0 border-transparent border-t-sky-400 border-b-sky-400 border-r-sky-400 animate-spin"></div>
          
          {/* Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={logo} 
              alt="Veelnza Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-gray-600 text-sm font-medium">{data || "Loading..."}</p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;