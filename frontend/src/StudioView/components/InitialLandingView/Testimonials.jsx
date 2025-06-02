import React from "react";
import { studioTailwindStyles } from "../../../utils/studioTailwindStyles";

import { Smile, Star, StarHalf } from "lucide-react";

const testimonials = {
  title: "What Our Clients Say",
  description:
    "Hear from homeowners who have transformed their spaces with Rufrent Studio.",
  items: [
    {
      name: "Emily Richardson",
      project: "Living Room & Kitchen Redesign",
      rating: 5,
      text: "Rufrent Studio transformed our outdated living space into a modern, functional area that perfectly reflects our style. Their attention to detail and ability to work within our budget was impressive. The team was professional from start to finish.",
    },
    {
      name: "Michael & Sarah Johnson",
      project: "Full Home Renovation",
      rating: 5,
      text: "We hired Rufrent for our complete home renovation and couldn't be happier with the results. They managed the entire process seamlessly, from design to execution. Their team was responsive, creative, and delivered exactly what we envisioned.",
    },
    {
      name: "Priya Mehta",
      project: "Master Bedroom & Pooja Room",
      rating: 4.5,
      text: "The team at Rufrent Studio understood our cultural preferences and created a beautiful pooja room that blends traditional elements with modern design. Our master bedroom is now a luxurious retreat. Their cultural sensitivity and design expertise made all the difference.",
    },
  ],
};

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-10 px-4 lg:px-6 bg-gray-50 w-full">
      <div className="container mx-auto px-4 lg:px-6 max-w-[1280px]">
        <div className="text-center mb-10">
          <h2
            className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-4`}
          >
            {testimonials.title}
          </h2>
          <p
            className={`${studioTailwindStyles.paragraph_2} text-gray-600 max-w-2xl mx-auto`}
          >
            {testimonials.description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.items.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:rotate-1 hover:-translate-y-[5px]"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E07A5F] flex items-center justify-center">
                  <Smile className="text-white w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h4
                    className={`${studioTailwindStyles.heading_3} text-[#1A1F3D] `}
                  >
                    {testimonial.name}
                  </h4>
                  <p
                    className={`${studioTailwindStyles.paragraph_2} text-gray-500 `}
                  >
                    {testimonial.project}
                  </p>
                </div>
              </div>
              <div className="mb-4 flex text-[#E07A5F]">
                {Array(Math.floor(testimonial.rating))
                  .fill()
                  .map((_, i) => (
                    <Star key={i} className="fill-[#E07A5F] h-4 w-4" />
                  ))}
                {testimonial.rating % 1 !== 0 && (
                  <StarHalf className="fill-[#E07A5F] h-4 w-4" />
                )}
              </div>
              <p
                className={`${studioTailwindStyles.paragraph_2} text-gray-600`}
              >
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
