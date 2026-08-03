import { useState } from "react";
import { ChevronDown } from "lucide-react";

const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 ${isOpen ? "text-amber-500" : "text-gray-400"}`} />}
          <span className={`font-semibold text-sm ${isOpen ? "text-amber-600" : "text-gray-600"}`}>
            {title}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-all duration-300 ${isOpen ? "rotate-180 text-amber-500" : "text-gray-400"}`} />
      </button>
      {isOpen && <div className="px-5 py-4">{children}</div>}
    </div>
  );
};

export default AccordionSection;