import React from "react";
import tailwindStyles from "../../../../utils/tailwindStyles";

const Team = () => {
  return (
    <>
   
    <div className="max-w-4xl mt-20 lg:mt-12 mx-auto p-4 pt-2 bg-white shadow-lg rounded-lg border border-[#ffc107]">
      {/* Header Section */}
      <div className="text-center mt-2">
        <h1 className={`${tailwindStyles.heading_2} `}>
          Meet the Team Behind Rufrent
        </h1>
        <p className={`${tailwindStyles.paragraph} mt-2 text-gray-700`}>
          At Rufrent, we are a passionate team of professionals committed to revolutionizing the rental experience in premium gated communities. Rufrent is a product of <strong>QTIMINDS PVT LTD</strong>, founded by <strong>IIT Roorkee alumni</strong> and industry veterans with a vision to make home rentals seamless, transparent, and hassle-free.
        </p>
      </div>

      {/* Leadership & Visionaries */}
      <div className="mt-6">
        <h2 className={`${tailwindStyles.heading_3} text-gray-800`}>
          👨‍💼 Leadership & Visionaries
        </h2>
        <p className={`${tailwindStyles.paragraph} mt-2 text-gray-700`}>
          Our leadership team comprises industry experts with years of experience in <strong>real estate, technology, and customer service</strong>. With a clear vision, we are redefining the home rental ecosystem, making it <strong>efficient, cost-effective, and tenant-friendly</strong>.
        </p>
      </div>

      {/* Technology & Product Team */}
      <div className="mt-6 p-4 bg-[#e7eff7]">
        <h2 className={`${tailwindStyles.heading_3}`}>
          💻 Technology & Product Team
        </h2>
        <p className={`${tailwindStyles.paragraph} mt-2`}>
          Our tech innovators ensure that Rufrent remains a <strong>cutting-edge platform</strong>, providing a <strong>smooth, intuitive, and secure</strong> rental search experience. We continuously enhance our <strong>AI-driven property recommendations</strong>, making house hunting <strong>smarter and more convenient</strong>.
        </p>
      </div>

      {/* Customer Success & Support */}
      <div className="mt-6 p-4 bg-white">
        <h2 className={`${tailwindStyles.heading_3}`}>
          📞 Customer Success & Support
        </h2>
        <p className={`${tailwindStyles.paragraph} mt-2`}>
          A dedicated team that works <strong>round the clock</strong> to assist property owners and tenants throughout their rental journey. Whether it’s <strong>onboarding, verifying listings, or resolving queries</strong>, we ensure an unmatched service experience.
        </p>
      </div>

      {/* Community & Operations Team */}
      <div className="mt-6 p-4  bg-[#e7eff7]">
        <h2 className={`${tailwindStyles.heading_3}`}>
          🏡 Community & Operations Team
        </h2>
        <p className={`${tailwindStyles.paragraph} mt-2`}>
          The backbone of Rufrent's premium property listings, this team ensures that <strong>every gated community and home</strong> listed meets our high standards. We work closely with <strong>property owners and societies</strong> to maintain trust and quality.
        </p>
      </div>

      {/* Conclusion */}
      <div className="mt-6 text-center bg-white">
        <h2 className={`${tailwindStyles.heading_3}`}>
          🚀 Welcome to the Future of Home Rentals!
        </h2>
        <p className={`${tailwindStyles.paragraph} mt-2`}>
          At Rufrent, our team’s goal is simple—to create the most <strong>transparent, reliable, and efficient rental ecosystem</strong> for everyone.
        </p>
      </div>
    </div>
   
    </>
  );
};

export default Team;
