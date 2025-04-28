import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { FaWhatsapp, FaFacebook, FaX, FaEnvelope } from "react-icons/fa6";
import tailwindStyles from "../../../utils/tailwindStyles";

const services = [
  {
    id: 1,
    imgSrc: "/Package/Package_Image_1.png",
    title: "Rental Agreements",
    coins: 2500,
  },
  {
    id: 2,
    imgSrc: "/Package/Package_Image_2.png",
    title: "360° Photo Shoot",
    coins: 2000,
  },
  {
    id: 3,
    imgSrc: "/Package/Package_Image_3.png",
    title: "T-shirt",
    coins: 1000,
  },
  {
    id: 4,
    imgSrc: "/Package/Package_Image_4.png",
    title: "Deep Cleaning Service",
    coins: 3000,
  },
];

const UserReferralView = ({ userID, profile, userCoins, userCoinsHistory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoinHistoryModalOpen, setIsCoinHistoryModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [signupLink, setSignupLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [coinHistory, setCoinHistory] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (profile) setReferralCode(profile.ref_code);
        if (userCoins) {
          setTotalEarned(userCoins[0] || 0);
          setTotalRedeemed(userCoins[1] || 0);
          setTotalRemaining(userCoins[2] || 0);
        }
        if (userCoinsHistory) {
          const history = userCoinsHistory.map((item) => ({
            date:
              item?.time_earned_coins || item?.time_redeemed_coins
                ? new Date(
                    item?.time_earned_coins || item?.time_redeemed_coins
                  ).toLocaleDateString()
                : "NA",
            type: item.earned_coins ? "Earning" : "Redemption",
            reason: getReason(
              item.svc_id,
              item.earned_coins ? "Earning" : "Redemption"
            ),
            amount: item.earned_coins || item.redeemed_coins,
          }));
          setCoinHistory(history);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userID, profile, userCoins, userCoinsHistory]);

  // Generate signup link
  useEffect(() => {
    if (referralCode)
      setSignupLink(`https://www.rufrent.com/signup?ref=${referralCode}`);
  }, [referralCode]);

  const getReason = (svcId, type) => {
    if (type === "Earning") return "First Transaction by Referral";
    const reasons = {
      1: "Rental Agreement",
      2: "Photo Shoot",
      3: "Deep Cleaning",
      4: "T-Shirt",
    };
    return reasons[svcId] || "Unknown Service";
  };

  const shareLink = (platform) => {
    const message = `Sign up with this link: ${signupLink} and get rewards!`;
    switch (platform) {
      case "whatsapp":
        navigator.clipboard
          .writeText(message)
          .then(() =>
            window.open(
              `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
              "_blank"
            )
          );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(signupLink)}`,
          "_blank"
        );
        break;
      case "email":
        window.location.href = `mailto:?subject=Join and Earn Rewards!&body=${encodeURIComponent(message)}`;
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(signupLink)}`,
          "_blank"
        );
        break;
      default:
        break;
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(signupLink);
    alert("Referral link copied!");
  };

  // Reusable Components within the file
  const CoinBalanceCard = () => (
    <div className="w-full bg-gradient-to-br from-yellow-500 to-yellow-200 rounded-xl shadow-sm border border-[#001433] p-6">
      <h1 className={tailwindStyles.heading_2}>Coin Balance</h1>
      <div className="mt-3">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <h1 className={tailwindStyles.heading_3}>Available Coins</h1>
          <div className="flex items-center space-x-4">
            <p className="text-3xl font-bold text-gray-900">{totalRemaining}</p>
            <img src="/Profile/COINS.png" className="h-12 w-12" alt="coins" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className={tailwindStyles.heading_3}>
            <span className="text-green-600 font-medium">Earned: </span> +{" "}
            {totalEarned}
          </p>
          <p className={tailwindStyles.heading_3}>
            <span className="text-red-600 font-medium">Redeemed: </span> -{" "}
            {totalRedeemed}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3 mt-4">
        <button
          className={`${tailwindStyles.secondaryButton} w-full`}
          onClick={() => setIsModalOpen(true)}
        >
          Refer & Earn
        </button>
        <button
          className={`${tailwindStyles.secondaryButton} w-full`}
          onClick={() => setIsCoinHistoryModalOpen(!isCoinHistoryModalOpen)}
        >
          Coins History
        </button>
      </div>
    </div>
  );

  const CoinHistoryModal = () =>
    isCoinHistoryModalOpen && (
      <div className="absolute top-20 mt-2 md:top-[85%] md:right-5 w-full md:w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className={tailwindStyles.heading_3}>Coin History</h2>
            <button
              className="text-gray-500 hover:text-gray-800"
              onClick={() => setIsCoinHistoryModalOpen(false)}
            >
              <FaTimes size={16} />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-4">
            {coinHistory.length > 0 ? (
              coinHistory.map((history, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">{history.date}</p>
                    <p className={tailwindStyles.paragraph}>{history.reason}</p>
                  </div>
                  <div
                    className={`font-semibold ${history.type === "Earning" ? "text-green-600" : "text-red-600"}`}
                  >
                    {history.type === "Earning" ? "+" : "-"} {history.amount} 🪙
                  </div>
                </div>
              ))
            ) : (
              <p className={`${tailwindStyles.paragraph_b} text-center`}>
                No Coin History
              </p>
            )}
          </div>
        </div>
      </div>
    );

  const ReferralModal = () =>
    isModalOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20"
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className={tailwindStyles.heading_3}>Share Referral Link</h2>
            <button
              className="text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="p-6">
            <div className="flex justify-center gap-4 mb-6">
              {[
                {
                  Icon: FaWhatsapp,
                  color: "bg-green-500",
                  hover: "hover:bg-green-600",
                  platform: "whatsapp",
                },
                {
                  Icon: FaEnvelope,
                  color: "bg-gray-900",
                  hover: "hover:bg-gray-700",
                  platform: "email",
                },
                {
                  Icon: FaFacebook,
                  color: "bg-blue-600",
                  hover: "hover:bg-blue-700",
                  platform: "facebook",
                },
                {
                  Icon: FaX,
                  color: "bg-gray-900",
                  hover: "hover:bg-gray-700",
                  platform: "twitter",
                },
              ].map(({ Icon, color, hover, platform }) => (
                <button
                  key={platform}
                  className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white ${hover} transition-all duration-300`}
                  onClick={() => shareLink(platform)}
                >
                  <Icon size={24} />
                </button>
              ))}
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
              <input
                type="text"
                value={
                  isLoading
                    ? "Loading..."
                    : signupLink || "No referral link available"
                }
                readOnly
                className="flex-1 bg-transparent text-gray-700 outline-none text-sm"
              />
              <button
                className={tailwindStyles.secondaryButton}
                onClick={copyReferral}
                disabled={isLoading || !signupLink}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  const ServiceCard = ({ service }) => (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-all duration-200">
      <img
        src={service.imgSrc}
        alt={service.title}
        className="w-9 h-9 object-cover"
      />
      <p className={`${tailwindStyles.heading_3} my-2 text-center`}>
        {service.title}
      </p>
      <div className="flex items-start space-x-2">
        <img src="/Profile/COIN.png" alt="coin" className="w-6 h-6" />
        <p className={`${tailwindStyles.heading_3} mb-4 text-center`}>
          {service.coins}
        </p>
      </div>
      <button className={tailwindStyles.secondaryButton}>Redeem</button>
    </div>
  );

  return (
    <div className="p-2">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center mb-4 relative">
          <CoinBalanceCard />
          <CoinHistoryModal />
        </div>

        <div className="p-2 relative">
          <div className="absolute rounded-xl inset-0 bg-gradient-to-r from-yellow-900 via-gray-700 to-gray-900 opacity-90 flex items-center justify-center z-10">
            <h1 className="text-white text-2xl md:text-4xl font-bold tracking-wide drop-shadow-lg">
              Coming Soon ...
            </h1>
          </div>
          <h2 className={`${tailwindStyles.heading_2} mb-4 text-center`}>
            Available Redeemable Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        <ReferralModal />
      </div>
    </div>
  );
};

export default UserReferralView;
