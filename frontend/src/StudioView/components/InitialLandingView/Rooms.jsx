
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { fetchAllAreasData } from "../../../services/studioapiservices";
import ImageModal from "./ImageModel";
import { studioTailwindStyles } from "../../../utils/studioTailwindStyles";

const apiUrl = `${import.meta.env.VITE_API_URL}`;
const baseS3Url = `${import.meta.env.VITE_STUDIO_ROOMS_BASE_S3_URL}`;

const RoomCard = ({ room, index, tier, openModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let interval;
    if (isHovered) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % room.images.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isHovered, room.images.length]);

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + room.images.length) % room.images.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % room.images.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex items-stretch justify-center w-full">
      <div className="w-1/4 hidden lg:block" />
      <div
        className={`flex flex-col md:flex-row ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} bg-white rounded-2xl overflow-hidden shadow-md transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] max-w-full lg:max-w-[calc(100%-1*25%)]`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative md:w-4/6 overflow-hidden h-52 md:h-80"
          data-room-index={index}
        >
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {room.images.map((img, imgIndex) => (
              <div
                key={imgIndex}
                className="flex-none w-full h-full"
                data-image-index={imgIndex}
              >
                <img
                  src={img}
                  alt={`${room.title} Image ${imgIndex + 1}`}
                  className="w-full h-full object-center object-contain cursor-pointer"
                  onClick={() => openModal(index, imgIndex)}
                />
              </div>
            ))}
          </div>
          <div
            className="absolute top-1/2 left-2.5 -translate-y-1/2 bg-black/50 text-white w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 hover:bg-black/70 hover:scale-110"
            onClick={handlePrev}
          >
            <ChevronLeft className="text-white" />
          </div>
          <div
            className="absolute top-1/2 right-2.5 -translate-y-1/2 bg-black/50 text-white w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 hover:bg-black/70 hover:scale-110"
            onClick={handleNext}
          >
            <ChevronRight className="text-white" />
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {room.images.map((_, dotIndex) => (
              <div
                key={dotIndex}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                  dotIndex === currentIndex ? "bg-[#E07A5F]" : "bg-white/50"
                }`}
                onClick={() => handleDotClick(dotIndex)}
              ></div>
            ))}
          </div>
        </div>
        <div className="p-4 md:w-2/6">
          <h3
            className={`${studioTailwindStyles.heading_3} text-[#1A1F3D] mb-3 `}
          >
            {room.title}
          </h3>
          <p className={`${studioTailwindStyles.paragraph_2} text-gray-600`}>
            {room.description}
          </p>
        </div>
      </div>
      <div className="w-1/4 hidden lg:block" />
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-40">
    <div
      className="relative w-16 h-16"
      style={{
        animation: "spin 2s linear infinite",
      }}
    >
      <div
        className="absolute inset-0 border-4 border-t-[#E07A5F] border-l-[#7C9A92] border-r-[#E07A5F] border-b-[#7C9A92] rounded-full"
        style={{
          animation: "spin 2s linear infinite",
        }}
      />
      <div
        className="absolute inset-2 border-2 border-t-[#7C9A92] border-l-[#E07A5F] border-r-[#7C9A92] border-b-[#E07A5F] rounded-full"
        style={{
          animation: "spin 1.5s linear infinite reverse",
        }}
      />
      <div className="absolute inset-4 flex items-center justify-center">
        <div
          className="w-2 h-2 bg-[#E07A5F] rounded-sm"
          style={{
            transform: "rotate(45deg)",
            animation: "pulse 1s ease-in-out infinite",
          }}
        />
      </div>
    </div>
    <style>
      {`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1) rotate(45deg);
          }
          50% {
            transform: scale(1.2) rotate(45deg);
          }
        }
        
      `}
    </style>
  </div>
);

const Rooms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTier, setActiveTier] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [roomsData, setRoomsData] = useState({
    title: "Design Your Perfect Space",
    description:
      "Explore our customized design solutions for every room in your home, with options to fit any budget and style preference.",
    tabs: [],
    items: [],
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    roomIndex: null,
    imageIndex: 0,
  });

  
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAllAreasData();
        const data = response.data;
        setApiData(data.result);

        // Dynamically generate tabs from API keys
        const tabs = Object.keys(data.result).map((tier, index) => ({
          text: tier.charAt(0).toUpperCase() + tier.slice(1),
          tier,
          active: index === 0,
        }));

        setRoomsData((prev) => ({
          ...prev,
          tabs,
        }));

        // Set initial active tier
        setActiveTier(tabs[0]?.tier || null);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    fetchRooms();
  }, []);
  useEffect(() => {
    if (!apiData || !apiData[activeTier]) return;

    setIsLoading(true);
    const seenAreaTypes = new Set();
    const items = [];

    // Iterate only over activeTier data
    for (const room of apiData[activeTier]) {
      const { area_type, room_desc, image_count } = room;
      if (!seenAreaTypes.has(area_type)) {
        seenAreaTypes.add(area_type);

        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        const images = [];

        const count = image_count || 1; // Default to 1 if image_count is null
        for (let i = 1; i <= count; i++) {
          images.push(`${baseS3Url}/${activeTier}/${area_type}/img_${i}.jpg`);
        }

        items.push({
          title: capitalize(area_type),
          description: room_desc || "No description available",
          images,
        });
      }
    }

    setRoomsData((prev) => ({
      ...prev,
      items,
    }));
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [activeTier, apiData]);

  const openModal = (roomIndex, imageIndex) => {
    setModalState({ isOpen: true, roomIndex, imageIndex });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, roomIndex: null, imageIndex: 0 });
  };

  return (
    <section id="rooms" className="py-10 bg-gray-50 w-full">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-6">
          <h2
            className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-4`}
          >
            {roomsData.title}
          </h2>
          <p
            className={`${studioTailwindStyles.paragraph_2} text-gray-600 max-w-2xl mx-auto`}
          >
            {roomsData.description}
          </p>
        </div>
        <div className="flex justify-center mb-10">
          <div className="flex gap-2 md:gap-4 max-w-[90vw] overflow-auto">
            {roomsData.tabs.map((tab, index) => (
              <button
                key={index}
                className={`${studioTailwindStyles.paragraph_2} px-5 md:px-6 py-1 rounded-lg font-medium text-[#1A1F3D] border border-[#1A1F3D] transition-all duration-300 ${
                  tab.tier === activeTier
                    ? "bg-gradient-to-br from-[#E07A5F] to-[#7C9A92] text-white"
                    : "hover:bg-[#E07A5F]/10"
                }`}
                onClick={() => setActiveTier(tab.tier)}
              >
                {tab.text}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 lg:px-6 mx-auto">
          {/* <div className="grid grid-cols-1 gap-8">
            {roomsData.items.map((room, index) => (
              <RoomCard
                key={index}
                room={room}
                index={index}
                tier={activeTier}
                openModal={openModal}
              />
            ))}
          </div> */}
          {isLoading ? (
            <div className="transition-opacity duration-300 ease-in-out opacity-100">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 transition-opacity duration-300 ease-in-out opacity-100">
              {roomsData.items.map((room, index) => (
                <RoomCard
                  key={index}
                  room={room}
                  index={index}
                  tier={activeTier}
                  openModal={openModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ImageModal
        isOpen={modalState.isOpen}
        roomIndex={modalState.roomIndex}
        imageIndex={modalState.imageIndex}
        rooms={roomsData.items}
        closeModal={closeModal}
      />
    </section>
  );
};

export default Rooms;
