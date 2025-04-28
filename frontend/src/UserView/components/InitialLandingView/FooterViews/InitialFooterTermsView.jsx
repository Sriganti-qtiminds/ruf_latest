import React from "react";

import tailwindStyles from "../../../../utils/tailwindStyles";


const TermsAndConditions = () => {
  return (
    <>
      
      <div className="max-w-4xl mt-20 lg:mt-12 mx-auto p-4 pt-2 bg-white shadow-lg rounded-lg border border-[#ffc107]">
        <h1
          className={`${tailwindStyles.heading_2} font-bold text-center mb-2`}
        >
          Terms and Conditions
        </h1>

        <div className="bg-white p-6 ">
          <div className="space-y-6 text-justify leading-relaxed">
            {/* Section 1 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                1. Introduction
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Welcome to Rufrent. These Terms and Conditions govern your
                access to and use of the Rufrent platform, including our website
                and mobile application. By using Rufrent, you agree to comply
                with and be bound by these Terms and Conditions.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                2. Definitions
              </h2>
              <ul className="list-disc list-inside space-y-1">
                <li className={`${tailwindStyles.paragraph}`}>
                  <strong>User:</strong> Any individual or entity using the
                  Rufrent platform.
                </li>
                <li className={`${tailwindStyles.paragraph}`}>
                  <strong>Account:</strong> The registered user profile required
                  to access Rufrent services.
                </li>
                <li className={`${tailwindStyles.paragraph}`}>
                  <strong>Service Provider:</strong> Third-party providers
                  offering ancillary services through Rufrent.
                </li>
                <li className={`${tailwindStyles.paragraph}`}>
                  <strong>Property Listing:</strong> Rental and sales properties
                  listed by users.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                3. Account Registration and Management
              </h2>
              <ul className="list-disc list-inside space-y-1">
                <li className={`${tailwindStyles.paragraph}`}>
                  Users must register an account by providing accurate personal
                  information.
                </li>
                <li className={`${tailwindStyles.paragraph}`}>
                  Users are responsible for maintaining the confidentiality of
                  their account credentials.
                </li>
                <li className={`${tailwindStyles.paragraph}`}>
                  Unauthorized access must be reported to Rufrent immediately.
                </li>
                <li className={`${tailwindStyles.paragraph}`}>
                  Rufrent reserves the right to suspend accounts suspected of
                  security breaches.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                4. Property Listings
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Users may list rental or sale properties, ensuring all
                information is accurate. Rufrent reserves the right to review or
                reject any property listing.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                5. Payment and Transactions
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                All payments must be made through approved methods on the
                platform. Refund policies, if applicable, will be specified
                separately.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                6. Unauthorized Access and Security
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Users must safeguard their credentials. Any unauthorized access
                must be reported immediately.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                7. Usage of Information
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Rufrent complies with data protection laws and does not sell
                user data without consent.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                8. Third-Party Services
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Rufrent may recommend services but is not liable for disputes
                between users and third parties.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                9. Platform Usage and Restrictions
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Users must comply with laws and are prohibited from posting
                false information or engaging in fraud.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                10. Liability and Disclaimers
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Rufrent acts as a platform connecting owners and tenants and is
                not responsible for transactions.
              </p>
            </div>

            {/* Section 11 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                11. Indemnification
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Users agree to indemnify Rufrent against claims or damages
                resulting from platform misuse.
              </p>
            </div>

            {/* Section 12 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                12. Modifications to Terms
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                Rufrent may update these Terms & Conditions, and continued use
                constitutes acceptance.
              </p>
            </div>

            {/* Section 13 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                13. Governing Law
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                These terms are governed by the laws of Hyderabad, Telangana.
              </p>
            </div>

            {/* Section 14 */}
            <div>
              <h2 className={`${tailwindStyles.heading_4} font-semibold mb-2`}>
                14. Contact Information
              </h2>
              <p className={`${tailwindStyles.paragraph}`}>
                For any queries, contact Rufrent at{" "}
                <a
                  href="mailto:support@rufrent.com"
                  className="text-blue-500 underline"
                >
                  support@rufrent.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default TermsAndConditions;
