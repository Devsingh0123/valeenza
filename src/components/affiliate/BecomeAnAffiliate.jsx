// src/pages/BecomeAnAffiliate.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle } from "lucide-react";
import affiliateHeroImage from "@/assets/affiliate/affiliateHeroImage.webp";
import testimo1 from "@/assets/affiliate/testimo1.webp";
import testimo2 from "@/assets/affiliate/testimo2.webp";
import testimo3 from "@/assets/affiliate/testimo3.webp";
import AccordionSection from "@/components/common/AccordionSection";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const BecomeAnAffiliate = () => {
  const testimonials = [
    {
      image: testimo1,
      quote:
        "Astrology is like gravity. You don’t have to believe in it for it to be working in your life.",
    },
    {
      image: testimo2,
      quote:
        "The Stars are a long way off, and their words get somewhat dulled in the message.",
    },
    {
      image: testimo3,
      quote:
        "Those who think only in straight lines cannot see around a curve.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto my-4 ">
        <img
          src={affiliateHeroImage}
          alt="Affiliate Hero"
          className="w-full h-[200px] md:h-[300px] object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl md:text-5xl font-bold text-white mb-4">
            Recommend Products.
            <br />
            <span className="text-amber-500">Earn Advertising Fees.</span>
          </h1>
          <p className="text-white text-sm md:text-lg  mb-4">
            Join Astrotring Affiliate Program, the  spiritual
            product affiliate networks.
          </p>
          <Link
            to="/become-an-affiliate/affiliate-signup"
            className="inline-flex items-center px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition"
          >
            Sign up <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* steps */}
      <div className="max-w-7xl mx-auto mt-12 md:mt-10 px-4">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Astrotring Associates - Astrotring's affiliate marketing program
          </h1>
          <p className="text-gray-900 text-md leading-relaxed mb-10">
            Welcome to the Astrotring's affiliate marketing program. The Astrotring Affiliate Program helps content creators,
            publishers and bloggers monetize their traffic. With many
            spiritual and wellness products available, affiliates use easy
            link-building tools to direct their audience to their
            recommendations, and earn from qualifying purchases.
          </p>
        </div>

        {/* Steps in three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="text-center ">
            <div className="w-8 h-8 bg-amber-600 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-4 ">
              Sign up
            </h3>
            <p className="text-gray-900 ">
              Join creators, publishers and bloggers who
              are earning with the Astrotring Affiliate Program.
            </p>
          </div>
          <div className="text-center ">
            <div className="w-8 h-8 bg-amber-600 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-4 ">
              Recommend
            </h3>
            <p className="text-gray-900">
              Share products with your audience. We have customized
              linking tools for publishers, individual bloggers and social
              media influencers.
            </p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-amber-600 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-4">
              Earn
            </h3>
            <p className="text-gray-900">
              Earn up to 20% in affiliate fees from qualifying purchases and
              programs. Our competitive conversion rates help maximize earnings.
            </p>
          </div>
        </div>
      </div>

      {/* testimonials */}
      <div className=" max-w-7xl mx-auto py-10">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 1000, disableOnInteraction: false,pauseOnMouseEnter: true, }}
          pagination={{ clickable: true, dynamicBullets: false }}
          navigation={false}
          className="relative h-[400px] md:h-[500px] custom-swiper-pagination"
        >
          {testimonials.map((testimonial, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="relative w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${testimonial.image})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
                  <p className="text-lg md:text-2xl  max-w-3xl mb-4">
                    “{testimonial.quote}”
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* FAQ Section using AccordionSection */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <AccordionSection
            title="How does the Associates Program work?"
            icon={HelpCircle}
          >
            <p className="text-gray-600 ">
              You can share products and available programs on Astrotring with
              your audience through customized linking tools and earn money on
              qualifying purchases and customer actions like signing up for a
              free trial program.
            </p>
          </AccordionSection>

          <AccordionSection
            title="How do I qualify for this program?"
            icon={HelpCircle}
          >
            <p className="text-gray-600">
              Bloggers, publishers and content creators with a qualifying
              website can participate in this program.
            </p>
          </AccordionSection>

          <AccordionSection
            title="How do I earn in this program?"
            icon={HelpCircle}
          >
            <p className="text-gray-600">
              You earn from qualifying purchases through the traffic you drive
              to Astrotring. Advertising fees for qualifying purchases differ
              based on product category.
            </p>
          </AccordionSection>

          <AccordionSection
            title="How do I sign up to the program?"
            icon={HelpCircle}
          >
            <p className="text-gray-600">
              Sign up to the program here. We will review your application and
              approve it if you meet the qualifying criteria.
            </p>
          </AccordionSection>
        </div>
      </div>

    </div>
  );
};

export default BecomeAnAffiliate;
