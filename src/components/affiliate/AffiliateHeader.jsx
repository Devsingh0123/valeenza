import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const AffiliateHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 px-2">
       <div className="max-w-7xl mx-auto  py-4 flex justify-between items-center">
          <Link to="/">
            <img src={logo} alt="logo" className="h-6 sm:h-8" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="https://backend.astrotring.shop/"
              className="text-sm font-medium text-gray-700 hover:text-amber-600 transition"
            >
              Sign in
            </Link>
            <Link
              to="/become-an-affiliate/affiliate-signup"
              className="inline-flex items-center px-4 py-1.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition shadow-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
    </header>
  );
};

export default AffiliateHeader;