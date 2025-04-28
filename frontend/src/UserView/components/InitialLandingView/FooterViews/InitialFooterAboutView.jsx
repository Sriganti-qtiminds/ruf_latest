import React from "react";
//import Navbar from "../../../../components/CommonViews/Navbar";
import tailwindStyles from "../../../../utils/tailwindStyles";


const AboutRufrent = () => {
  return (
    <>
      
      <div className="max-w-4xl mt-20 lg:mt-12 mx-auto p-4 pt-2 bg-white shadow-lg rounded-lg border border-[#ffc107]">
        <h1 className={`${tailwindStyles.heading_2}`}>Welcome to Rufrent!</h1>
        <div className="md:px-28 mx-auto text-lg text-justify">
          <p
            className={`${tailwindStyles.paragraph} pt-1 pb-2 leading-relaxed ml-4`}
          >
            Rufrent is a revolutionary rental platform designed to make home
            renting seamless, secure, and{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              broker-free.
            </strong>{" "}
            We eliminate the hassle of dealing with middlemen while ensuring a
            smooth experience for both tenants and landlords.
          </p>

          <p
            className={`${tailwindStyles.paragraph} pt-1 pb-2 leading-relaxed ml-4`}
          >
            We created Rufrent because we believe{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              finding a rental home should be simple, direct, and fair.
            </strong>{" "}
            Traditionally, renters and landlords have had to rely on brokers,
            paying hefty commissions without receiving real value in return. The
            primary challenge was{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              information asymmetry
            </strong>
            —renters struggled to find verified listings, and landlords had
            limited access to genuine tenants.{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              Rufrent eliminates this gap,
            </strong>{" "}
            creating a transparent marketplace where renters and landlords can
            connect{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              through a structured process.
            </strong>
          </p>

          <h2
            className={`${tailwindStyles.heading_3} font-semibold text-center`}
          >
            How We Make Renting Easier for You
          </h2>

          <ul className="list-disc list-outside ml-6 space-y-3 mt-4 text-justify">
            <li className={`${tailwindStyles.heading_4}`}>
              <span className="text-xs 2xl:text-xl">
                100% Verified Listings –
              </span>{" "}
              Every property is carefully verified to ensure you deal only with
              direct owners, eliminating middlemen and brokers.
            </li>
            <li className={`${tailwindStyles.heading_4}`}>
              <span className="text-xs 2xl:text-xl">
                RR Package – A Smarter Alternative to Brokerage –
              </span>{" "}
              Unlike traditional brokers who charge high commissions without
              adding real value, our RR Package provides a structured,
              transparent, and valuable service at no additional cost.
            </li>
            <li className={`${tailwindStyles.heading_4}`}>
              <span className="text-xs 2xl:text-xl">
                Dedicated Relationship Manager (RM) –
              </span>{" "}
              To ensure a professional and secure rental process, every deal
              goes through our Relationship Manager, who mediates discussions
              between the tenant and owner. This avoids unnecessary direct
              contact until the owner is interested.
            </li>
            <li className={`${tailwindStyles.heading_4}`}>
              <span className="text-xs 2xl:text-xl">
                Mandatory RR Package for Closing Deals –
              </span>{" "}
              Rufrent ensures a structured and hassle-free rental experience by
              requiring tenants to opt for the RR Package, which streamlines
              negotiations, protects privacy, and facilitates a smooth agreement
              process.
            </li>
            <li className={`${tailwindStyles.heading_4} font-semibold`}>
              <span className="text-xs 2xl:text-xl">
                Detailed Property Insights –
              </span>{" "}
              Our platform provides comprehensive property details, images, and
              amenities, allowing you to shortlist homes without multiple
              visits.
            </li>
            <li className={`${tailwindStyles.heading_4} font-semibold`}>
              <span className="text-xs 2xl:text-xl">
                Exclusive to Premium Communities –
              </span>{" "}
              Rufrent specializes in listing homes only in premium residential
              communities, ensuring quality living spaces for tenants.
            </li>
          </ul>

          <p
            className={`${tailwindStyles.paragraph} pt-1 pb-2 leading-relaxed ml-4`}
          >
            Whether you are a{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              tenant looking for your next home
            </strong>{" "}
            or a{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              landlord wanting to list your property,
            </strong>{" "}
            Rufrent ensures a{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              broker-free, efficient, and professional rental experience.
            </strong>
          </p>

          <p
            className={`${tailwindStyles.paragraph} pt-1 pb-2 leading-relaxed text-center`}
          >
            Start your{" "}
            <strong className="font-semibold text-xs 2xl:text-lg">
              rental journey with Rufrent
            </strong>{" "}
            today!
          </p>
        </div>
      </div>
     
    </>
  );
};

export default AboutRufrent;
