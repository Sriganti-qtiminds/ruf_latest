import React from "react";
import { studioTailwindStyles } from "../../../utils/studioTailwindStyles";

const timeline = {
  title: "Our Design Process",
  description:
    "Discover the journey of transforming your space with our step-by-step design process, tailored to your needs.",
  items: [
    {
      week: "Week 1",
      title: "Initial Consultation",
      description:
        "We meet to discuss your vision, preferences, and budget to create a personalized design plan.",
      image: "Studio/DP_img_1.jpg",
    },
    {
      week: "Week 2-3",
      title: "Concept Development",
      description:
        "Our team crafts detailed design concepts, including mood boards and 3D renderings, for your approval.",
      image: "Studio/DP_img_2.jpg",
    },
    {
      week: "Week 4-5",
      title: "Material Selection",
      description:
        "We source high-quality materials and furnishings that align with your style and budget.",
      image: "Studio/DP_img_3.jpg",
    },
    {
      week: "Week 6-8",
      title: "Implementation",
      description:
        "Our skilled team brings the design to life, ensuring every detail is executed to perfection.",
      image: "Studio/DP_img_4.jpg",
    },
  ],
};

const Timeline = () => {
  return (
    <section id="timeline" className="py-10 px-4 lg:px-6 bg-white w-full">
      <div className="container mx-auto px-4 lg:px-6 max-w-[1280px]">
        <div className="text-center mb-16">
          <h2
            className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-4`}
          >
            {timeline.title}
          </h2>
          <p
            className={`${studioTailwindStyles.paragraph_2} text-gray-600 max-w-2xl mx-auto`}
          >
            {timeline.description}
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 -top-12 md:top-0 -translate-x-1/2 h-full w-1 bg-[#E07A5F]"></div>
          <div className="relative flex flex-col gap-20 z-10">
            {timeline.items.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center md:items-stretch relative"
                >
                  {/* Timeline Dot */}
                  <div className="absolute hidden md:block left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-4 border-[#E07A5F] rounded-full z-10 md:top-1/2 md:-translate-y-1/2"></div>
                  <div className="absolute flex md:hidden left-1/2 -top-12 -translate-x-1/2 w-5 h-5 bg-white border-4 border-[#E07A5F] rounded-full z-10 md:top-1/2 md:-translate-y-1/2"></div>
                  {/* Left Side (Desktop: Alternates, Mobile: Image) */}
                  <div className="md:w-1/2 flex justify-end md:pr-6 mb-10 md:mb-0 w-full">
                    <div className="w-full md:max-w-sm">
                      {isEven ? (
                        <div className="hidden md:block bg-white p-6 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-right transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
                          <div
                            className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-1 `}
                          >
                            {item.week}
                          </div>
                          <h4
                            className={`${studioTailwindStyles.heading_3} text-gray-800`}
                          >
                            {item.title}
                          </h4>
                          <p
                            className={`${studioTailwindStyles.paragraph_2} text-gray-600 mt-2`}
                          >
                            {item.description}
                          </p>
                        </div>
                      ) : (
                        <img
                          src={item.image}
                          alt={item.week}
                          className="hidden md:block w-52 h-40 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] object-cover transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] mx-auto"
                        />
                      )}
                      {/* Mobile: Always show image */}
                      <img
                        src={item.image}
                        alt={item.week}
                        className="md:hidden w-full h-40 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] object-cover transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] mb-4"
                      />
                    </div>
                  </div>
                  {/* Right Side (Desktop: Alternates, Mobile: Text) */}
                  <div className="md:w-1/2 flex justify-start md:pl-6 mt-6 md:mt-0 w-full">
                    <div className="w-full md:max-w-sm">
                      {isEven ? (
                        <img
                          src={item.image}
                          alt={item.week}
                          className="hidden md:block w-52 h-40 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] object-cover transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] mx-auto"
                        />
                      ) : (
                        <div className="hidden md:block bg-white p-6 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-left transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
                          <div
                            className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-1 `}
                          >
                            {item.week}
                          </div>
                          <h4
                            className={`${studioTailwindStyles.heading_3} text-gray-800`}
                          >
                            {item.title}
                          </h4>
                          <p
                            className={`${studioTailwindStyles.paragraph_2} text-gray-600 mt-2`}
                          >
                            {item.description}
                          </p>
                        </div>
                      )}
                      {/* Mobile: Always show text */}
                      <div className="md:hidden bg-white p-6 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-left transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
                        <div
                          className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-1 `}
                        >
                          {item.week}
                        </div>
                        <h4
                          className={`${studioTailwindStyles.heading_3} text-gray-800`}
                        >
                          {item.title}
                        </h4>
                        <p
                          className={`${studioTailwindStyles.paragraph_2} text-gray-600 mt-2`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
