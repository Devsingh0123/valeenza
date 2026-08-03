import { Outlet } from "react-router-dom";
import AffiliateFooter from "@/components/affiliate/AffiliateFooter";
import AffiliateHeader from "@/components/affiliate/AffiliateHeader";
import { Suspense } from "react";
import Loader from "@/components/common/Loader";


const AffiliateLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <AffiliateHeader />
      <main className="">
        <Suspense fallback={<Loader data="Loading..." />}>
        <Outlet />
        </Suspense>
      </main>
      <AffiliateFooter />
    </div>
  );
};

export default AffiliateLayout;