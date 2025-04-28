import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { services } from "./models/servicesModel";
import tailwindStyles from "../../../utils/tailwindStyles";

const ServicesSection = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const itemsPerView = isMobile ? 1 : 4; // Mobile/Tablets: Scroll, Desktop: Show 4 items
  const totalItems = services.length;

  useEffect(() => {
    const updateView = () => {
      setIsMobile(window.innerWidth < 1024);
      setCurrentIndex(0); // Reset index on resize
    };
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalItems - itemsPerView) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };
  return (
    <section
      id="rr-package"
      className="pb-10 px-6 md:px-20 bg-[#e7eff7] relative"
    >
      <div className="mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className={`${tailwindStyles.heading_2} `}>Paid Services</h2>
          <p className={`${tailwindStyles.paragraph}`}>Comming Soon ...</p>
        </div>
        {/* Mobile: Scrollable, Desktop: Fixed */}
        <div
          className={`w-full ${
            isMobile
              ? "overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              : "relative overflow-hidden"
          }`}
          ref={scrollContainerRef}
        >
          <div
            className={`flex gap-4 ${isMobile ? "w-[310px] md:w-[590px]" : "w-[calc(100%-90px)]"} transition-transform duration-500 ease-in-out`}
            style={{
              transform: isMobile
                ? "none"
                : `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
            }}
          >
            {services.map((item, index) => (
              <div
                key={index}
                className="min-h-32 flex-shrink-0 snap-start w-[60%] md:w-[40%] lg:w-1/4 bg-white rounded-xl p-4 flex flex-col items-center justify-start text-center transition duration-300 ease-in-out hover:shadow-xl hover:border hover:border-[#ffc107]"
              >
                <div className="w-12 h-12 rounded-full mb-2">
                  <img
                    src={item.imgSrc}
                    alt={item.imgAlt}
                    className="object-cover"
                  />
                </div>
                <h3 className={`${tailwindStyles.heading_3}`}>{item.title}</h3>
                <p
                  className={`${tailwindStyles.paragraph} px-2`}
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Show Chevron buttons only on Laptop/Desktop */}
      {!isMobile && (
        <>
          {/* Left Arrow */}
          <button
            className={`absolute top-[60%] border-2 border-[#001433] left-10 transform -translate-y-1/2 bg-white p-1 rounded-full shadow-md hover:bg-gray-200 ${currentIndex === 0 ? "hidden" : "block"}`}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {/* Right Arrow */}
          <button
            className={`absolute top-[60%] border-2 border-[#001433] right-10 transform -translate-y-1/2 bg-white p-1 rounded-full shadow-md hover:bg-gray-200 ${currentIndex >= totalItems - itemsPerView ? "hidden" : "block"}`}
            onClick={handleNext}
            disabled={currentIndex >= totalItems - itemsPerView}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
};

export default ServicesSection;
