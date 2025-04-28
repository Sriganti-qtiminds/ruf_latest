import Navbar from "../../../components/CommonViews/Navbar";

import HeroSection from "./InitialHeroView";
import AboutSection from "./InitialAboutView";
import BrokerageView from "./BrokerageView";
import WcuSection from "./InitialWcuView";
import ServicesSection from "./ServicesView";
import RRPackagesSection from "./PackageSectionView";
import TestimonialsSection from "./TestimonialsView";
import FooterSection from "./InitialFooterView";

import CommunityCarousel from "./CommunityCarousel";

const InitialLandingPage = () => {
  return (
    <>
      {/* Initial Header */}
      <Navbar />
      {/* Hero Search Section*/}
      <HeroSection />
      {/* <!-- About Us Section --> */}
      <AboutSection />
      {/* <RRPackagesSection /> */}
      <CommunityCarousel />
      {/* <!-- Why Choose Us Section --> */}
      <WcuSection />

      {/* <BrokerageView /> */}

      {/* <!-- Package Section --> */}
      {/* <ServicesSection /> */}
      {/* <!-- Testimonials Section --> */}
      <TestimonialsSection />
      {/* <!-- Footer Section --> */}
      <FooterSection />
    </>
  );
};

export default InitialLandingPage;
