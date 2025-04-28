import ContentOverlay from "./InitialContentOverlay";

const HeroSection = () => {
  return (
    <div className="flex justify-center">
      <section
        id="home"
        className="relative text-center bg-cover bg-center bg-no-repeat md:w-[calc(100vw-100px)] md:rounded-b-3xl"
        style={{ backgroundImage: "url('/HERO.png')" }}
      >
        <div className="relative bg-opacity-50 flex flex-col items-center">
          <ContentOverlay />
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
