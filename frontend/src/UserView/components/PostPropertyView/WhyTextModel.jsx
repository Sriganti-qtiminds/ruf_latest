import tailwindStyles from "../../../utils/tailwindStyles";

const TextModel = () => {
  const benefits = [
    {
      title: "Zero Brokerage ",
      description: "Flat owners list for free, no hidden charges.",
    },
    // {
    //   title: "One-Time Deep Cleaning",
    //   description: "Get your property freshened up.",
    // },
    // {
    //   title: "Professional Photoshoot",
    //   description: "High-quality images to attract tenants.",
    // },
    {
      title: "Rental Agreement Assistance",
      description: "Hassle-free documentation support.",
    },
    {
      title: "Confidentiality Guaranteed",
      description: "Your details stay private.",
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-yellow-600 to-yellow-100  rounded-2xl shadow-lg p-4  flex flex-col md:gap-4 border-t-4 border border-[#001433] hover:shadow-xl transition-shadow duration-300">
      <h2
        className={`${tailwindStyles.heading_2} text-center flex flex-col items-center`}
      >
        Complimentary Benefits
        <span className={`${tailwindStyles.paragraph_b}`}>
          (Post Deal Closure)
        </span>
      </h2>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-to-br from-[#001433] to-[#001433] flex-shrink-0 mt-1"></span>

            <span className={`${tailwindStyles.paragraph_b}`}>
              {benefit.title}
            </span>
          </li>
        ))}
      </ul>

      {/* <div className="flex justify-end">
        <i className={`${tailwindStyles.paragraph_less}`}>
          * For Flat Owners Only
        </i>
      </div> */}
    </div>
  );
};

export default TextModel;
