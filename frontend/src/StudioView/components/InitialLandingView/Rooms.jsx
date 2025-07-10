
// export default Rooms;

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAllAreasData } from "../../../services/studioapiservices";
import ImageModal from "./ImageModel";
import { studioTailwindStyles } from "../../../utils/studioTailwindStyles";

const apiUrl = `${import.meta.env.VITE_API_URL}`;
const baseS3Url = `${import.meta.env.VITE_STUDIO_ROOMS_BASE_S3_URL}`;

const RoomCard = ({ room, index, openModal }) => {
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

  // Get the current image's category for the label
  const currentCategory =
    room.images[currentIndex]?.category || room.defaultCategory;

  return (
    <div className="flex items-stretch justify-center w-full">
      <div className="w-1/4 hidden lg:block" />
      <div
        className={`flex flex-col md:flex-row ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} bg-white rounded-2xl overflow-hidden shadow-md transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] max-w-full lg:max-w-[calc(100%-1*25%)]`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative md:w-4/6 overflow-hidden h-52 md:h-80 bg-white"
          data-room-index={index}
        >
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {room.images.map((img, imgIndex) => (
              <div
                key={imgIndex}
                className="flex-none w-full flex items-center justify-center"
                data-image-index={imgIndex}
              >
                <img
                  src={img.url}
                  alt={`${room.title} ${img.category} Image ${img.index + 1}`}
                  className="max-h-96 w-auto object-contain cursor-pointer"
                  onClick={() => openModal(room, imgIndex, img.category)}
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
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${dotIndex === currentIndex ? "bg-[#E07A5F]" : "bg-white/50"}`}
                onClick={() => handleDotClick(dotIndex)}
              ></div>
            ))}
          </div>
        </div>
        <div className="p-4 md:w-2/6">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${studioTailwindStyles.heading_3} text-[#1A1F3D]`}>
              {room.title}
            </h3>
            <span className="text-sm font-medium text-white bg-gradient-to-br from-[#E07A5F] to-[#7C9A92] px-3 py-1 rounded-full">
              {currentCategory.charAt(0).toUpperCase() +
                currentCategory.slice(1)}
            </span>
          </div>
          <p className={`${studioTailwindStyles.paragraph_2} text-gray-600`}>
            {room.images[currentIndex]?.description ||
              room.descriptions[room.defaultCategory]}
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
      style={{ animation: "spin 2s linear infinite" }}
    >
      <div
        className="absolute inset-0 border-4 border-t-[#E07A5F] border-l-[#7C9A92] border-r-[#E07A5F] border-b-[#7C9A92] rounded-full"
        style={{ animation: "spin 2s linear infinite" }}
      />
      <div
        className="absolute inset-2 border-2 border-t-[#7C9A92] border-l-[#E07A5F] border-r-[#7C9A92] border-b-[#E07A5F] rounded-full"
        style={{ animation: "spin 1.5s linear infinite reverse" }}
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
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1) rotate(45deg); }
          50% { transform: scale(1.2) rotate(45deg); }
        }
      `}
    </style>
  </div>
);

const Rooms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [roomsData, setRoomsData] = useState({
    title: "Design Your Perfect Space",
    description:
      "Explore our customized design solutions for every room in your home, with options to fit any budget and style preference.",
    items: [],
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    room: null,
    imageIndex: 0,
    category: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAllAreasData();
        const data = response.data.result;

        // Group rooms by area_type, collecting images and descriptions from all categories
        const roomMap = {};
        // Dynamically generate tabs from API keys and reverse for desired order
        const tabs = Object.keys(data).map((tier) => tier);
        const categoryOrder = tabs.reverse();

        for (const category of categoryOrder) {
          if (data[category]) {
            for (const room of data[category]) {
              const { area_type, room_desc, image_count } = room;
              if (!roomMap[area_type]) {
                roomMap[area_type] = {
                  title: area_type.charAt(0).toUpperCase() + area_type.slice(1),
                  images: [],
                  descriptions: {}, // Store descriptions for each category
                  defaultCategory: "premium",
                };
              }
              // Store description for this category
              roomMap[area_type].descriptions[category] =
                room_desc || "No description available";
              // Collect images for this category
              const count = image_count || 1;
              for (let i = 1; i <= count; i++) {
                roomMap[area_type].images.push({
                  url: `${baseS3Url}/${category}/${area_type}/img_${i}.jpg`,
                  category,
                  index: i - 1,
                  description: room_desc || "No description available", // Associate description with image
                });
              }
            }
          }
        }

        // Convert roomMap to array of items
        const items = Object.values(roomMap);

        setApiData(data);
        setRoomsData((prev) => ({
          ...prev,
          items,
        }));
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    fetchRooms();
  }, []);

  const openModal = (room, imageIndex, category) => {
    setModalState({ isOpen: true, room, imageIndex, category });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, room: null, imageIndex: 0, category: "" });
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
        <div className="px-4 lg:px-6 mx-auto">
          {isLoading ? (
            <div className="transition-opacity duration-300 ease-in-out opacity-100">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 transition-opacity duration-300 ease-in-out opacity-100">
              {roomsData.items.map((room, index) => (
                <RoomCard
                  key={`${room.title}-${index}`}
                  room={room}
                  index={index}
                  openModal={openModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ImageModal
        isOpen={modalState.isOpen}
        room={modalState.room}
        imageIndex={modalState.imageIndex}
        category={modalState.category}
        closeModal={closeModal}
      />
    </section>
  );
};

export default Rooms;
