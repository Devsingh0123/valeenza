import { Link } from "react-router-dom";
import { Mail, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import logo from "../../assets/logo.png";
import { useSelector } from "react-redux";

const Footer = () => {
  const { productCategories } = useSelector((state) => state.product);

  const collectionCategories = productCategories
    .map((cat) => ({
      id: cat.id,
      label: cat.name,
      slug: cat.slug,
    }))
    .filter((cat) => cat.slug !== "all");

  const sectionTitleClass =
    "text-[#1E3354] font-semibold text-sm tracking-wide uppercase";

  const linkClass =
    "text-sm text-stone-600 hover:text-[#D63B3B] transition-colors duration-200";

  const socialLinks = [
    {
      Icon: Facebook,
      href: "https://www.facebook.com/profile.php?id=61589487082042",
    },
    {
      Icon: Instagram,
      href: "https://www.instagram.com/astrotring/",
    },
    {
      Icon: Twitter,
      href: "coming-soon",
    },
    {
      Icon: Youtube,
      href: "coming-soon",
    },
  ];

  return (
    <footer className="mt-12 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-stone-200">
          <div className="lg:col-span-4">
            <Link to="/">
              <img src={logo} alt="Valeenza" className="h-9 mb-5" />
            </Link>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm">
              Valeenza is your destination for curated, premium products —
              thoughtfully selected to elevate everyday living with quality,
              style, and trust.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            <div>
              <h2 className={sectionTitleClass}>Collections</h2>
              <ul className="mt-4 space-y-2.5">
                {collectionCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.slug}`} className={linkClass}>
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className={sectionTitleClass}>Explore</h2>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/gemstones" className={linkClass}>
                    About Gemstones
                  </Link>
                </li>
                <li>
                  <Link to="/" className={linkClass}>
                    Zodiac Signs
                  </Link>
                </li>
                <li>
                  <Link to="/" className={linkClass}>
                    Numerology
                  </Link>
                </li>
                <li>
                  <Link to="/" className={linkClass}>
                    Vastu Shastra
                  </Link>
                </li>
                <li>
                  <Link to="/" className={linkClass}>
                    Tarot
                  </Link>
                </li>
                <li>
                  <Link to="/" className={linkClass}>
                    Love Calculator
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={sectionTitleClass}>Policies</h2>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/privacy-policy" className={linkClass}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className={linkClass}>
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/return-and-refund-policy" className={linkClass}>
                    Return & Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/shipping-and-delivery-policy" className={linkClass}>
                   Return & Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className={linkClass}>
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/california-privacy-notice" className={linkClass}>
                    California Privacy Notice
                  </Link>
                </li>
                <li>
                  <Link to="/notice-at-collection" className={linkClass}>
                    Notice at Collection
                  </Link>
                </li>
                <li>
                  <Link to="/your-privacy-choices-do-not-sell-or-share" className={linkClass}>
                    Your Privacy Choices
                  </Link>
                </li>
                <li>
                  <Link to="/astrology-and-ai-disclaimer" className={linkClass}>
                   Astrology & AI Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/health-and-wellness-disclaimer" className={linkClass}>
                    Health & Wellness Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/digital-products-and-services-terms" className={linkClass}>
                    Digital Products & Services Terms
                  </Link>
                </li>
                <li>
                  <Link to="/legal-notice-contact-and-accessibility-statement" className={linkClass}>
                    Legal Notice, Contact & Accessibility Statement
                  </Link>
                </li>
              
              </ul>
            </div>

            <div>
              <h2 className={sectionTitleClass}>Affiliate</h2>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/become-an-affiliate" className={linkClass}>
                    Become an Affiliate
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
          <div>
            <h2 className={sectionTitleClass}>Contact</h2>
            <p className="text-sm text-stone-600 leading-relaxed mt-4 max-w-md">
              We are available 24×7 on chat support.{" "}
              <a
                href="https://wa.me/16263624253?text=Hi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D63B3B] hover:text-[#1E3354] font-medium transition-colors"
              >
                Start a chat
              </a>
            </p>

            <a
              href="mailto:care@valeenza.co"
              className="inline-flex items-center gap-3 mt-4 text-sm text-stone-600 hover:text-[#1E3354] transition-colors group"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 text-[#1E3354] group-hover:border-[#1E3354] group-hover:bg-stone-50 transition-colors">
                <Mail size={16} strokeWidth={1.75} />
              </span>
              care@valeenza.co
            </a>
          </div>

          <div className="md:text-right">
            <h2 className={`${sectionTitleClass} md:text-right`}>Follow Us</h2>
            <div className="flex gap-2 mt-4 md:justify-end">
              {socialLinks.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 text-[#1E3354] hover:bg-[#1E3354] hover:border-[#1E3354] hover:text-white transition-colors duration-200"
                >
                  <Icon size={16} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1E3354] text-white/90 text-center text-sm py-5 px-4">
        © {new Date().getFullYear()} Valeenza. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
