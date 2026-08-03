import React from "react";

const SectionHeading = ({ children }) => (
  <div className="flex items-center gap-3 mb-4.5">
    <div className="w-1 h-6 rounded-sm bg-gradient-to-b from-amber-600 to-amber-700" />
    <h2 className="m-0 text-xl font-extrabold text-stone-900 tracking-tight">
      {children}
    </h2>
  </div>
);

export default SectionHeading;