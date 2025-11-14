import React from 'react';

export default function Navbar() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Height of navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="shadow-sm fixed top-0 w-full bg-white z-10">
      <div className="mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/src/assets/logo.png" 
              alt="EMEXA Logo" 
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-10">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-gray-900 text-base font-normal transition-colors cursor-pointer bg-transparent border-none"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-gray-900 text-base font-normal transition-colors cursor-pointer bg-transparent border-none"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-gray-900 text-base font-normal transition-colors cursor-pointer bg-transparent border-none"
              >
                Testimonials
              </button>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-lg text-base font-medium transition-colors shadow-sm">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}