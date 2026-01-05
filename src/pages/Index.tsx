import Header from "@/components/Header";
import {HeroSection} from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import AboutUs from "@/components/AboutUs";
import ProjectManagement from "@/components/ProjectManagement";

import AppointmentSection from "@/components/AppointmentSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutUs />
      <ContentSection />
      <ProjectManagement />
      <AppointmentSection />
      <Footer />
    </div>
  );
};

export {Index};
