import React from "react";
import { useNavigate } from "react-router-dom";


function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleGetStarted = () => navigate("/register");
  const handleSignIn = () => navigate("/login");
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="overflow-x-hidden">
      <title>Scene Weaver</title>
      {/* Responsive Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-[#fffff0] z-50 transition-all duration-300 shadow-md">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/sw-logo.png" alt="Logo" className="h-10 md:h-12" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="#homepage"
              className="text-[#343434] px-3 hover:bg-gray-300 py-2 rounded"
            >
              Home
            </a>
            <a
              href="#feature"
              className="text-[#343434] px-3 hover:bg-gray-300 py-2 rounded"
            >
              Feature
            </a>
            <a
              href="#collection"
              className="text-[#343434] px-3 hover:bg-gray-300 py-2 rounded"
            >
              Collection
            </a>
            <a
              href="#contact"
              className="text-[#343434] px-3 hover:bg-gray-300 py-2 rounded"
            >
              Contact
            </a>
            <span className="text-[#343434]">|</span>
            <button
              onClick={handleSignIn}
              className="text-[#343434] px-3 py-2 font-bold hover:bg-gray-300 rounded"
            >
              Sign in
            </button>
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#343434] focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#fffff0] py-2 px-4">
            <a
              href="#homepage"
              className="block text-[#343434] py-2 hover:bg-gray-300 rounded"
            >
              Home
            </a>
            <a
              href="#feature"
              className="block text-[#343434] py-2 hover:bg-gray-300 rounded"
            >
              Feature
            </a>
            <a
              href="#collection"
              className="block text-[#343434] py-2 hover:bg-gray-300 rounded"
            >
              Collection
            </a>
            <a
              href="#contact"
              className="block text-[#343434] py-2 hover:bg-gray-300 rounded"
            >
              Contact
            </a>
            <div className="flex space-x-4 mt-2">
              <button
                onClick={handleSignIn}
                className="text-[#343434] px-3 py-2 font-bold hover:bg-gray-300 rounded"
              >
                Sign in
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Homepage */}
      <section
        id="homepage"
        className="relative min-h-screen text-white flex flex-col items-center justify-center bg-[#343434] pt-16 md:pt-0 overflow-hidden"
      >
        {/* Background Image Container - Now properly contained within section */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://sceneweaver.s3.ap-southeast-2.amazonaws.com/assets/landing/storyboarding.jpg"
            alt="Background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 md:px-0 max-w-2xl">
          <h1 className="text-9xl mb-6">Create endless storyboards</h1>
          <p className="mb-6 text-sm md:text-base">
            Visualize your stories, start simple.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-bold hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Feature Section */}
      <section
        id="feature"
        className="scroll-mt-16 py-16 bg-[#343434] text-white flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-10">Feature</h1>
        <div className="w-full px-4 md:w-[75rem] bg-gray-100 rounded-lg overflow-hidden relative shadow-2xl">
          <div className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar aspect-[4/3] md:aspect-[16/11]">
            {["tti.png", "multi-output.png", "editable.png"].map(
              (img, index) => (
                <img
                  key={index}
                  src="https://sceneweaver.s3.ap-southeast-2.amazonaws.com/assets/106539031_p0_master1200.jpg"
                  alt={`slide${index}`}
                  className="flex-shrink-0 w-full h-full object-cover snap-start"
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section
        id="collection"
        className="scroll-mt-16 py-16 bg-[#343434] text-white flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-10">Collection</h1>
        <div className="w-full px-4 md:w-[75rem] bg-gray-100 rounded-lg overflow-hidden relative shadow-2xl">
          <div className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar aspect-[4/3] md:aspect-[16/11]">
            {["sample1.jpg", "sample2.jpg", "sample3.jpg"].map((img, index) => (
              <img
                key={index}
                src={`./images/${img}`}
                alt={`collection${index}`}
                className="flex-shrink-0 w-full h-full object-cover snap-start"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="scroll-mt-16 py-16 bg-[#343434] text-white flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-10">Meet the Devs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4 md:w-4/5">
          {[
            {
              name: "Carlos, Christian Dave",
              role: "Project Manager and Backend Lead",
            },
            { name: "Guelas, Sean Marion", role: "Documentation Specialist" },
            {
              name: "Mergano, Rafael Andrew",
              role: "Full-Stack Support Developer",
            },
            { name: "Yapan, Von Emil", role: "Frontend Lead" },
          ].map((dev, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-gray-100 h-48 w-full flex items-center justify-center overflow-hidden mb-3 rounded-lg">
                <img
                  src="./images/profile.jpg"
                  alt={dev.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-semibold text-center">{dev.name}</h2>
              <p className="text-sm text-center">{dev.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scroll Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          var prevScrollpos = window.pageYOffset;
          window.onscroll = function () {
            var currentScrollPos = window.pageYOffset;
            if (window.innerWidth > 768) { // Only apply to desktop
              document.querySelector("nav").style.top = prevScrollpos > currentScrollPos ? "0" : "-50px";
            }
            prevScrollpos = currentScrollPos;
          };`,
        }}
      />
    </div>
  );
}

export default Landing;
