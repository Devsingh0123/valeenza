import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "../../redux/slices/bannerSlice";
import { Link } from "react-router-dom";

const HeroBanner = () => {
  const dispatch = useDispatch();
  const { banners, loading, error } = useSelector((state) => state.banner);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch banners on mount
  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Sort banners by sort_order
  const sortedBanners = [...banners].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  // Auto-slide only for images (exactly like Banner component)

  useEffect(() => {
    if (banners.length === 0) return;
    const currentItem = sortedBanners[currentIndex];
    if (!currentItem) return;

    if (currentItem.media_type === "image") {
      const duration = (currentItem.display_duration || 3) * 1000;
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sortedBanners.length);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, sortedBanners, banners.length]);

  // Loading and error states with fixed heights (as per original HeroBanner)
  if (loading)
    return (
      <div className="w-full h-[180px] md:h-[220px] lg:h-[260px] bg-gray-200 animate-pulse rounded-[18px]" />
    );
  if (error)
    return (
      <div className="w-full h-[180px] md:h-[220px] lg:h-[260px] bg-red-100 rounded-[18px] flex items-center justify-center text-red-600">
        Banner load failed
      </div>
    );
  if (!banners.length) return null;

  return (
    <div className=" relative w-full h-full md:h-[72vh] mx-auto overflow-hidden border border-white rounded-sm">
      {sortedBanners.length > 0 && (
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {sortedBanners.map((item) => (
            <div key={item.id} className="w-full h-full flex-shrink-0">
              {item.media_type === "video" ? (
                <video
                  src={item?.desktop_media}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                  onEnded={() =>
                    setCurrentIndex((prev) => (prev + 1) % sortedBanners.length)
                  }
                />
              ) : (
                <Link to={item?.url}>
                  {/* Desktop Image – hidden on mobile */}
                  <img
                    src={item?.desktop_media}
                    alt={`Banner ${item.id}`}
                    className="w-full h-full object-cover hidden sm:block"
                  />
                  {/* Mobile Image – shown only on mobile */}
                  {item.mobile_media && (
                    <img
                      src={item?.mobile_media}
                      alt={`Banner ${item.id} mobile`}
                      className="w-full h-full object-cover block sm:hidden"
                    />
                  )}

                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {sortedBanners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10 ">
          {sortedBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded transition-all duration-300 ${
                index === currentIndex
                  ? "bg-amber-500 scale-110 shadow-md"
                  : "bg-white/50 hover:bg-white/70"
              } cursor-pointer`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
