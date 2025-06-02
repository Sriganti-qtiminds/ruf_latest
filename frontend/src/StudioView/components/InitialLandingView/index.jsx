import Footer from "./Footer";
import Hero from "./HeroView";
import Rooms from "./Rooms";
import Testimonials from "./Testimonials";
import Timeline from "./Timeline";

const StudioLandingView = () => {
  return (
    <div className="bg-white flex flex-col items-center">
      <Hero />
      <Rooms />

      <Timeline />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default StudioLandingView;
