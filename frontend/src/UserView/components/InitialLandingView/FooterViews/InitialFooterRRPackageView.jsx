import React from "react";
import tailwindStyles from "../../../../utils/tailwindStyles";

import FooterSection from "../InitialFooterView";
const RRPackage = () => {
  return (
    <>
    
    <div className="max-w-3xl mt-2 mx-auto p-6 bg-white shadow-lg rounded-lg border border-[#ffc107]">
      {/* Header Section */}
      <div className="text-center mt-2">
        <h1 className={`${tailwindStyles.heading_2}`}>RR Package</h1>
        <p className={`${tailwindStyles.heading_3}`}>15 days rent <span className="text-gray-500 text-sm">(Launching Offer)</span></p>
      </div>

      {/* Features List */}
      <div className="mt-6 space-y-4">
        <h2 className={`${tailwindStyles.heading_3} ml-1 text-start`}>Key Benefits</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li className={`${tailwindStyles.paragraph}`}>📜 One-time drafting and management of the rental agreement.</li>
          <li className={`${tailwindStyles.paragraph}`}>📸 Professional property photo shoot with a detailed report.</li>
          <li className={`${tailwindStyles.paragraph}`}>⏰ Monthly reminders for rental payment.</li>
          <li className={`${tailwindStyles.paragraph}`}>📅 Timely reminders for lease renewal.</li>
          <li className={`${tailwindStyles.paragraph}`}>📊 AI-driven projections of the prevailing rental market value.</li>
          <li className={`${tailwindStyles.paragraph}`}>🎽 Complimentary RUFRENT sports T-shirt.</li>
          <li className={`${tailwindStyles.paragraph}`}>🧹 Deep cleaning service *</li>
          <li className={`${tailwindStyles.paragraph}`}>👤 Dedicated Relationship Manager (RM).</li>
          <li className={`${tailwindStyles.paragraph}`}>🔐 Secure online access to property-related data.</li>
          <li className={`${tailwindStyles.paragraph}`}>💰 A 25% discount on RR Package renewal.</li>
        </ul>
      </div>

      {/* Additional Benefit */}
      <div className="mt-6 p-4 bg-[#e7eff7] border-l-4 border-blue-500">
        <h2 className={`${tailwindStyles.heading_3} text-start`}>🎉 Additional Benefit</h2>
        <p className={`${tailwindStyles.paragraph}`}>Referral bonus of <strong>1,000 points</strong> for every successful tenant referral.</p>
      </div>

      {/* Package Validity and Service Claims */}
      <div className="mt-6">
        <h2 className={`${tailwindStyles.heading_3} text-start`}>📅 Package Validity & Claiming Services</h2>
        <p className={`${tailwindStyles.paragraph}`}>
          The RR Package is valid for <strong>11 months</strong> from the activation date. The following services must be availed within the first month:
        </p>
        <ul className="list-disc pl-5 space-y-1  mt-2">
          <li className={`${tailwindStyles.paragraph}`}>📜 Rental Agreement</li>
          <li className={`${tailwindStyles.paragraph}`}>🎽 T-Shirt</li>
          <li className={`${tailwindStyles.paragraph}`}>🧹 Deep Cleaning</li>
          <li className={`${tailwindStyles.paragraph}`}>📸 Photo Shoot</li>
        </ul>
      </div>

      {/* Non-Refundable Payments */}
      <div className="mt-6">
        <h2 className={`${tailwindStyles.heading_3} text-start`}>💳 Non-Refundable Payments</h2>
        <p className={`${tailwindStyles.paragraph}`}>
          All payments made for the RR Package are <strong>final and non-refundable</strong> after activation.
        </p>
      </div>

      {/* Bonus Points Redemption */}
      <div className="mt-6">
        <h2 className={`${tailwindStyles.heading_3} text-start`}>🎯 Bonus Points Redemption</h2>
        <p className={`${tailwindStyles.paragraph}`}>Points can be redeemed against the following services:</p>
        <ul className="list-none pl-5 mt-2 space-y-1">
          <li className={`${tailwindStyles.paragraph}`}>👕 T-Shirt: <strong>2,000 points</strong></li>
          <li className={`${tailwindStyles.paragraph}`}>📜 Rental Agreement: <strong>3,000 points</strong></li>
          <li className={`${tailwindStyles.paragraph}`}>📸 Photo Shoot: <strong>4,000 points</strong></li>
          <li className={`${tailwindStyles.paragraph}`}>🧹 Deep Cleaning: <strong>10,000 points</strong></li>
          <li className={`${tailwindStyles.paragraph}`}>🎁 RR Base Package: <strong>15,000 points</strong></li>
          <li className={`${tailwindStyles.paragraph}`}>🎁 RR Premium Package: <strong>20,000 points</strong></li>
        </ul>
      </div>

      {/* Deep Cleaning Exclusions */}
      <div className="mt-6 p-4 bg-[#e7eff7] border-l-4 border-red-500">
        <h2 className={`${tailwindStyles.heading_3} text-start`}>⚠️ Deep Cleaning Service Exclusions</h2>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li className={`${tailwindStyles.paragraph}`}>🚫 Does not include removal of plastics from laminates, paint stains, or garbage from interiors.</li>
          <li className={`${tailwindStyles.paragraph}`}>🏡 Limited to the communities listed on Rufrent.</li>
          <li className={`${tailwindStyles.paragraph}`}>🏠 Covers a single floor only in multi-floor houses.</li>
          <li className={`${tailwindStyles.paragraph}`}>📌 This is a one-time service, claimable by either the Tenant or Owner.</li>
        </ul>
      </div>

      {/* Legal Information */}
      <div className="mt-6 p-4">
        <h2 className={`${tailwindStyles.heading_3} text-start`}>⚖️ Legal Information</h2>
        <p className={`${tailwindStyles.paragraph}`}>
          This document is legally binding and governed by the <strong>laws of India</strong>. Any disputes shall be handled under the jurisdiction of the courts in the city of the company’s registered office.
        </p>
      </div>
    </div>
   
    </>
  );
};

export default RRPackage;
