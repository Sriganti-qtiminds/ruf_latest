import tailwindStyles from "../../../utils/tailwindStyles";

const testimonialData = [
  {
    quote:
      "Rufrent helped me find the perfect rental in no time. Highly recommend!",
    name: "Pavan",
    image:
      "https://rufrents3.s3.ap-south-1.amazonaws.com/icons/testimonials/pavan.jpg",
  },
  {
    quote:
      "Professional and efficient services. I couldn't be happier with my experience.",
    name: "Ishitha",
    image:
      "https://rufrents3.s3.ap-south-1.amazonaws.com/icons/testimonials/sonali.jpg",
  },
  {
    quote:
      "The best rental service provider! Made my property listing easy and stress-free.",
    name: "Asif",
    image:
      "https://rufrents3.s3.ap-south-1.amazonaws.com/icons/testimonials/gurmeet.jpg",
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="pb-10 px-6 md:px-20 bg-[#e7eff7]">
    <h2 className={`${tailwindStyles.heading_2} mb-6`}>Testimonials</h2>
    <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonialData.map((testimonials, index) => (
        <div
          key={index}
          className="bg-gray-100 p-6 rounded-lg shadow-md text-center"
        >
          <p className={`${tailwindStyles.paragraph} italic`}>
            {testimonials.quote}
          </p>
          <div className="flex items-center justify-center mt-4">
            <img
              src={testimonials.image}
              alt={`user ${index}`}
              className="w-12 h-12 rounded-full mr-2"
            />
            <p className={`${tailwindStyles.paragraph_b}`}>
              {testimonials.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TestimonialsSection;
