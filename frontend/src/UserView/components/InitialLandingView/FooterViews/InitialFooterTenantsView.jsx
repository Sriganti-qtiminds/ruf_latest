import React from "react";
import tailwindStyles from "../../../../utils/tailwindStyles";


const TenantsDoc= () => {
  return (
    <>
   
    <div className="max-w-4xl mt-20 lg:mt-12 mx-auto p-4 pt-2 bg-white shadow-lg rounded-lg border border-[#ffc107]">
      {/* Header Section */}
      <div className="text-center mt-2">
        <h1 className={`${tailwindStyles.heading_3}`}>
          Why Should Tenants Choose Rufrent for Finding a Rental Home?
        </h1>
        <p className={`${tailwindStyles.paragraph} mt-2 text-start`}>
          At Rufrent, we redefine the rental experience by offering a <strong>hassle-free, transparent, and premium home search</strong> within <strong>verified gated communities</strong>. Unlike traditional brokers, we ensure:
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mt-2">
        <div className="p-2 ">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Zero Brokerage for Owners, Fixed RR Package for Tenants
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2 text-start`}>
            Say goodbye to hefty broker fees! With our <strong>RR Package</strong>, you get a <strong>fixed, transparent cost</strong> that not only helps you find a home but also provides <strong>exclusive value-added services</strong>.
          </p>
        </div>

        <div className="mt-2 p-2">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Exclusive Access to Premium Gated Communities
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2 text-start`}>
            We list only <strong>verified properties</strong> in <strong>top-tier residential societies</strong>, ensuring <strong>safety, security, and premium living standards</strong>.
          </p>
        </div>

        <div className="mt-2 p-2">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Direct Owner-Tenant Interaction
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2 text-start`}>
            No middlemen! Connect <strong>directly with property owners</strong> through our <strong>dedicated Relationship Manager</strong>, discuss terms transparently, and make informed decisions.
          </p>
        </div>

        <div className="mt-2 p-2 ">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Hassle-Free Move-in Experience
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2 text-start`}>
            Beyond just finding a home, our <strong>RR Package</strong> includes <strong>unique services</strong> that standard brokers don’t offer, making your move-in process <strong>seamless and stress-free</strong>.
          </p>
        </div>

        <div className="mt-2 p-2">
          <h2 className={`${tailwindStyles.heading_3} text-start`}>
            Save Time & Effort
          </h2>
          <p className={`${tailwindStyles.paragraph} mt-2 text-start`}>
            No more random property visits! Our platform <strong>matches you with properties</strong> that suit your <strong>lifestyle and budget</strong> within your preferred gated community.
          </p>
        </div>
      </div>

      {/* Conclusion */}
      <div className="mt-2 text-center p-2">
        <h2 className={`${tailwindStyles.heading_3} `}>
          Start Your Home Search Today with Rufrent! 🏡
        </h2>
        <p className={`${tailwindStyles.paragraph} mt-2`}>
          With Rufrent, you get a <strong>better home, better value, and a better rental experience</strong>!
        </p>
      </div>
    </div>
    
    </>
  );
};

export default TenantsDoc;
