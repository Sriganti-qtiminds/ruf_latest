import React from "react";
import tailwindStyles from "../../../../utils/tailwindStyles";


const OwnersDoc = () => {
  return (
    <>
    
    <div className="max-w-4xl mt-20 lg:mt-12 mx-auto p-4 pt-2 bg-white shadow-lg rounded-lg border border-[#ffc107]">
      {/* Header Section */}
      <div className="text-start ">
        <h1 className={`${tailwindStyles.heading_3} text-center`}>
          Why List Your Property with RUFRENT?
        </h1>
        <p className={`${tailwindStyles.paragraph} mt-2`}>
          At <strong>RUFRENT</strong>, we provide property owners in premium gated communities with a <strong>hassle-free and transparent</strong> way to find <strong>verified tenants</strong>—without involving brokers.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mt-6">
        <div className="mt-4">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            No Brokerage, No Middlemen
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2`}>
            Unlike traditional brokers, RUFRENT eliminates unnecessary intermediaries, ensuring a <strong>direct connection</strong> between owners and tenants. This not only makes the process more <strong>convenient</strong> but also <strong>saves you time and money</strong>.
          </p>
        </div>

        <div className="mt-6">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Verified & Quality Tenants
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2`}>
            Brokers often show your property randomly to tenants without any pre-filtering, leading to wasted time and inconvenience. At <strong>RUFRENT</strong>, every tenant undergoes a <strong>verification process</strong>, ensuring they align with <strong>society rules and community standards</strong> before they visit your property.
          </p>
        </div>

        <div className="mt-6">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Full Control Over Your Listing
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2`}>
            With <strong>RUFRENT</strong>, you will have a <strong>dedicated Relationship Manager</strong> who will talk to prospective tenants on your behalf. Once you are comfortable, only then will a property visit be planned—saving you a lot of <strong>precious time</strong>.
          </p>
        </div>

        <div className="mt-6">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Quick & Easy Listing
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2`}>
            Listing your property on <strong>RUFRENT</strong> is simple and takes <strong>less than 5 minutes</strong>. Our platform ensures that only <strong>genuine owners and tenants</strong> connect, eliminating broker calls. Plus, our <strong>customer support</strong> is always available if you need assistance.
          </p>
        </div>

        <div className="mt-6">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Transparent & Hassle-Free Renting
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2`}>
            Tenants pay a <strong>one-time RR Package fee</strong> upon finalizing a property. This <strong>fixed and transparent cost</strong> replaces brokerage and provides unique services like <strong>rental agreement assistance, property handover coordination, and tenant support</strong>—ensuring a smooth rental experience for both owners and tenants.
          </p>
        </div>
      </div>

      {/* Conclusion */}
      <div className="mt-6 text-start">
        <h2 className={`${tailwindStyles.heading_3} text-start`}>
          📌 List Your Property Today!
        </h2>
        <p className={`${tailwindStyles.paragraph} mt-2`}>
          If you own a property in a <strong>RUFRENT Verified Premium Gated Community</strong>, post your listing now and connect with <strong>quality tenants</strong>—all without paying any brokerage!
        </p>
        <p className={`${tailwindStyles.paragraph} mt-2`}>
          🔗 Click on <strong>‘Post Your Property’</strong> or contact us at <strong>support@rufrent.com</strong>.
        </p>
      </div>
    </div>
   
    </>
  );
};

export default OwnersDoc;
