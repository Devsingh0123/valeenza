import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Circle } from 'lucide-react';

const promoSlides = [
  {
    id: 1,
    text: "For Every Woman Who Deserves More",
    path: "/",
  },
  {
    id: 2,
    text: "Special Introductory Deals to Begin Your Astro Journey",
    path: "/",
  },
  {
    id: 3,
    text: "Begin Your Astro Journey with Exclusive Introductory Offers",
    path: "/",
  },
];

const TopPromoSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % promoSlides.length);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promoSlides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  };

  return (
    <div className="w-full bg-amber-900  text-white">
      <div className=" mx-auto px-4 py-1">
        <div className="flex items-center justify-between gap-4">
          {/* left arrow */}
          <button
            onClick={goToPrev}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>

          {/* slide content with sliding animation */}
          <div
            className="flex-1 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {promoSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className="w-full flex-shrink-0 flex items-center justify-center gap-2"
                >
                  {/* Text */}
                  <a 
                   href={slide.path}
                  className="font-medium text-xs tracking-wide text-center relative inline-block
             after:content-[''] after:absolute after:left-0 after:bottom-[-0px] after:w-0 after:h-[1px] after:bg-amber-200
             hover:after:w-full after:transition-all after:duration-700 ease-in-out hover:text-amber-200">
                    {slide.text}
                  </a>
                  {/* Dot */}
                  <Circle className="w-1 h-1 fill-amber-400 text-amber-400 flex-shrink-0 animate-pulse hidden sm:inline " />
                  {/* Shop Now Button */}
                  <a
                    href={slide.path}
                    className="group flex items-center gap-1 text-yellow-400 py-1.5 text-xs font-semibold transition-all duration-300 flex-shrink-0 cursor-pointer  "
                  >
                    <span className='hidden sm:inline'>Shop Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rotate-315 hidden sm:inline" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* right arrow */}
          <button
            onClick={goToNext}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopPromoSlider;