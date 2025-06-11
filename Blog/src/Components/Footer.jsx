import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 text-gray-300 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        {/* Brand / About */}
        <div>
          <h2 className="text-2xl font-extrabold text-indigo-500 mb-4 tracking-wide">
            BlogPen
          </h2>
          <p className="text-sm leading-relaxed text-gray-400">
            A creative platform to share your thoughts, ideas, and stories with
            the world.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-5 tracking-wide">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            {[
              { href: "/", label: "Home" },
              { href: "/blogs", label: "Blogs" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  className="relative inline-block hover:text-indigo-400 transition-colors duration-300"
                >
                  {label}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-indigo-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-5 tracking-wide">
            Resources
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            {[
              { href: "#", label: "Privacy Policy" },
              { href: "#", label: "Terms of Service" },
              { href: "#", label: "Support" },
            ].map(({ href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  className="relative inline-block hover:text-indigo-400 transition-colors duration-300"
                >
                  {label}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-indigo-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-5 tracking-wide">
            Follow Us
          </h3>
          <div className="flex space-x-6 text-gray-400">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map(
              (Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label="Social link"
                  className="hover:text-indigo-400 transition-colors duration-300 text-xl"
                >
                  <Icon />
                </a>
              )
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-14 pt-7 text-center text-sm text-gray-500 tracking-wide">
        &copy; {new Date().getFullYear()} BlogPen. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
