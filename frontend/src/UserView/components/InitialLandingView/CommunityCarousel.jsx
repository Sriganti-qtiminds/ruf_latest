

// --------------------- MY UPDATED --------------------------------------------

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RENTALS_BASE } from "../../../routes/routesPath";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const CommunityCarousel = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunityImages = async () => {
      try {
        // direct backend api call
        const res = await axios.get(`${apiUrl}/user/getCommunityImg`);

        if (Array.isArray(res.data.data)) {
          setImages(res.data.data);
        } else {
          console.warn("Unexpected data format:", res.data);
        }
      } catch (err) {
        console.error("Error fetching community images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityImages();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (images.length === 0) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    const autoScroll = () => {
      if (isDragging) return;

      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft >= maxScroll - 1) {
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: 180, behavior: "smooth" });
      }
    };

    const interval = setInterval(autoScroll, 3000);
    return () => clearInterval(interval);
  }, [images, isDragging]);

  const handleClick = (name) => {
    if (isDragging) return; // Prevents accidental navigation while dragging
    name = name
      .slice(6)
      .trim()
      .replace(/^myhome\s*/i, "");
    const result = name.charAt(0).toUpperCase() + name.slice(1);
    navigate(
      `${RENTALS_BASE}?city=Hyderabad&builders=MyHome&community=Myhome+${result}`
    );
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <p className="my-4 text-center text-gray-600">Loading carousel...</p>
    );
  }

  if (!images.length) {
    return (
      <p className="my-4 text-center text-gray-600">
        No community images found.
      </p>
    );
  }

  return (
    <div className="w-full max-w-screen-4xl px-6 md:px-10 py-6 bg-[#e7eff7]">
      <h2 className="mb-3 text-xl font-bold text-center">
        Popular Communities
      </h2>
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {images.map((img) =>
          img.name.startsWith("myhome") ? (
            <div
              key={img.id}
              onClick={() => handleClick(img.name)}
              className="flex-shrink-0 w-[150px] sm:w-[180px] mx-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 bg-white rounded-xl shadow-md snap-start"
            >
              <img
                src={img.url}
                alt={img.name}
                className="object-cover w-full h-28 sm:h-32 rounded-t-xl"
              />
              <div className="p-2 text-sm font-medium text-center capitalize truncate">
                {img.name}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default CommunityCarousel;
