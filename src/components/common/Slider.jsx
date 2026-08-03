import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Mousewheel } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Slider = ({ children, showBtn = true }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className="relative overflow-hidden">   {/*  extra overflow hide */}
      {showBtn && (
        <button
          ref={prevRef}
          className="absolute left-2  top-1/3 z-10 -translate-y-1/2 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-bold shadow-[inset_0_0_0_1.5px_#fcd34d] rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          <FaArrowLeft />
        </button>
      )}
      {showBtn && (
        <button
          ref={nextRef}
          className="absolute right-2  top-1/3 z-10 -translate-y-1/2 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-bold shadow-[inset_0_0_0_1.5px_#fcd34d] rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          <FaArrowRight />
        </button>
      )}

      <Swiper
        modules={[Navigation, Autoplay, Mousewheel]}
        spaceBetween={8}
        loop={true}
        slidesPerView={'auto'}               
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        mousewheel={{ forceToAxis: true }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
      >
        {children?.map((child, index) => (
          <SwiperSlide key={index} style={{ width: 'auto' }} className="flex-shrink-0">  
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;