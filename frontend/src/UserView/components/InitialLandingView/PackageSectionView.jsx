import { rrPackage } from "./models/rrPackage";

import tailwindStyles from "../../../utils/tailwindStyles";

const RRPackagesSection = () => {
  return (
    <section id="rr-packages" className="pb-10 px-6 md:px-20 bg-white ">
      <div className="flex flex-col items-center justify-center mb-6">
        <h3 className={`${tailwindStyles.heading_2} pl-4`}>
          {rrPackage.title} <span className="font-extralight text-md">*</span>
        </h3>

        {/* Price Section */}
        <p className={`${tailwindStyles.paragraph} text-center`}>
          {rrPackage.price}
        </p>
      </div>

      {/* Single Full-Width Package with modern styling */}
      <div
        className={`w-full mx-auto ${rrPackage.theme.cardBg} px-4 pt-4 md:px-8 md:pt-8 rounded-2xl shadow-lg border-2 border-[#ffc107] transition-all duration-300 hover:shadow-xl`}
      >
        {/* Benefits in 2 Columns on Medium Screens, 3 Columns on Large Screens */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {rrPackage.benefits.map((benefit, idx) => {
            return (
              <li
                key={idx}
                // className="flex flex-col items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:shadow-md"
                className="flex flex-col items-center text-center p-4 bg-white rounded-xl backdrop-blur-sm hover:border hover:border-[#ffc107] transition-all duration-300 hover:shadow-md"
              >
                {/* <BenefitIcon className={`w-10 h-10 mb-2`} /> */}
                <div className="w-12 h-12  flex items-center justify-center mb-2">
                  <img
                    src={benefit.icon}
                    alt={benefit.heading}
                    className="object-cover"
                  />
                </div>
                <h4 className={`${tailwindStyles.heading_3}`}>
                  {benefit.heading}
                </h4>

                <p className={`${tailwindStyles.paragraph} text-gray-300 px-6`}>
                  {benefit.paragraph}
                </p>
              </li>
            );
          })}
        </ul>
        <p className={`${tailwindStyles.paragraph} my-4 text-start`}>
          <i>* Exclusive One-Time Claim Per Rented Property</i>
        </p>
      </div>
    </section>
  );
};

export default RRPackagesSection;
