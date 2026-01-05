import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-building.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Estate Nest Capital modern construction project - luxury residential and commercial building development in Edmonton Alberta" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>
      
      <div className="relative container mx-auto px-6 py-20 pt-32">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-16">
            {/* Main Hero Content */}
            <div className="space-y-8 float-animation text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-white">Building</span>
                <br />
                <span className="gradient-text">Community</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed">
                Edmonton-rooted development and construction firm creating lasting value through strategic projects.
              </p>
            </div>

            {/* Secondary Messages */}
            <div className="grid md:grid-cols-2 gap-12 mt-20">
              <Link to="/investor-relations" className="block">
                <div className="space-y-4 group hover:scale-105 transition-transform duration-500 p-8 rounded-2xl hover:bg-white/10 backdrop-blur-sm cursor-pointer">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    <span className="gradient-text-alt">Investment</span>
                    <span className="text-white"> Excellence</span>
                  </h2>
                  <p className="text-lg text-white/90 group-hover:text-white transition-colors">
                    Strategic real estate investments focused on long-term value creation and sustainable growth.
                  </p>
                </div>
              </Link>
              
              <Link to="/investor-relations" className="block">
                <div className="space-y-4 group hover:scale-105 transition-transform duration-500 p-8 rounded-2xl hover:bg-white/10 backdrop-blur-sm cursor-pointer">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    <span className="gradient-text-alt">Capital</span>
                    <span className="text-white"> Solutions</span>
                  </h2>
                  <p className="text-lg text-white/90 group-hover:text-white transition-colors">
                    Comprehensive financial strategies tailored to maximize your real estate portfolio potential.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient overlay for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
};

export {HeroSection};