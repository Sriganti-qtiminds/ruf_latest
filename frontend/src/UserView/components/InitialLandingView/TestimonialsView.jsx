import React, { useState, useEffect, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import Cookies from 'js-cookie';
import AuthModal from '../../../components/CommonViews/AuthModalView';
import { addNewTestimonial, getTestimonials, fetchFiltersData } from '../../../services/newapiservices';
import { useRoleStore } from '../../../store/roleStore';
import tailwindStyles from "../../../utils/tailwindStyles";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

const TestimonialsView = () => {
  const { userData } = useRoleStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imageScale, setImageScale] = useState(100);
  const [error, setError] = useState('');
  const [reviewLengthError, setReviewLengthError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [testimonials, setTestimonials] = useState([]);
  const [fetchError, setFetchError] = useState('');

  // States for dropdowns
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [filteredBuilders, setFilteredBuilders] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [isBuilderDropdownOpen, setIsBuilderDropdownOpen] = useState(false);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const builderDropdownRef = useRef(null);
  const communityDropdownRef = useRef(null);

  const MIN_REVIEW_LENGTH = 80;

  
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await getTestimonials();
        const mappedTestimonials = data.map((item) => ({
          name: item.display_name || item.user_name || 'Anonymous',
          image: item.image_data || null,
          rating: item.rating,
          text: item.description,
          city: item.city_name || null,
          builder: item.builder_name || null,
          community: item.community_name || null,
        }));
        setTestimonials(mappedTestimonials);
        setFetchError('');
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setFetchError(
          error.message === 'No approved testimonials found.'
            ? 'No approved testimonials available.'
            : 'Unable to load testimonials due to a server error. Please try again later.'
        );
        
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetchFiltersData();
        if (response.status === 200) {
          const { cities, builders, communities } = response.data.result;
          setCities(cities);
          setBuilders(builders);
          setCommunities(communities);
        } else {
          setError('Failed to load dropdown data');
        }
      } catch (err) {
        setError('Failed to load dropdown data');
        console.error('Error fetching dropdown data:', err);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      const filtered = builders.filter(builder => builder.city_id === parseInt(selectedCity));
      setFilteredBuilders(filtered);
      setSelectedBuilder('');
      setFilteredCommunities([]);
      setSelectedCommunity('');
    } else {
      setFilteredBuilders([]);
      setSelectedBuilder('');
      setFilteredCommunities([]);
      setSelectedCommunity('');
    }
  }, [selectedCity, builders]);

  useEffect(() => {
    if (selectedBuilder) {
      const filtered = communities.filter(community => community.builder_id === parseInt(selectedBuilder));
      setFilteredCommunities(filtered);
      setSelectedCommunity('');
    } else {
      setFilteredCommunities([]);
      setSelectedCommunity('');
    }
  }, [selectedBuilder, communities]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (builderDropdownRef.current && !builderDropdownRef.current.contains(event.target)) {
        setIsBuilderDropdownOpen(false);
      }
      if (communityDropdownRef.current && !communityDropdownRef.current.contains(event.target)) {
        setIsCommunityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex < testimonials.length - 1 ? prevIndex + 1 : 0
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, testimonials.length]);

  const handleAddReviewClick = () => {
    if (!userData?.id) {
      setLoginOpen(true);
    } else {
      setName(userData?.userName || '');
      setIsModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    setName(userData?.userName || '');
    setIsModalOpen(true);
  };

  const handleCardClick = () => {
    setIsPaused(true);
    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current && touchEndX.current) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 50 && currentIndex < testimonials.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 5000);
      } else if (diff < -50 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 5000);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleReviewChange = (e) => {
    const text = e.target.value;
    if (text.length <= 250) {
      setReview(text);
      setError('');
      if (text.length > 0 && text.length < MIN_REVIEW_LENGTH) {
        setReviewLengthError(`Review must be at least ${MIN_REVIEW_LENGTH} characters long`);
      } else {
        setReviewLengthError('');
      }
    } else {
      setError('Review cannot exceed 250 characters');
      setReviewLengthError('');
    }
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleBuilderSelect = (builderId) => {
    setSelectedBuilder(builderId);
    setIsBuilderDropdownOpen(false);
  };

  const handleCommunitySelect = (communityId) => {
    setSelectedCommunity(communityId);
    setIsCommunityDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review || !rating || !name || !selectedCity || !selectedBuilder || !selectedCommunity) {
      let errorMessage = 'Please fill all required fields: ';
      if (!name) errorMessage += 'Name, ';
      if (!review) errorMessage += 'Review, ';
      if (!rating) errorMessage += 'Rating, ';
      if (!selectedCity) errorMessage += 'City, ';
      if (!selectedBuilder) errorMessage += 'Builder, ';
      if (!selectedCommunity) errorMessage += 'Community, ';
      errorMessage = errorMessage.slice(0, -2); // Remove trailing comma and space
      errorMessage += '. (Image upload is optional)';
      setError(errorMessage);
      return;
    }

    if (review.length < MIN_REVIEW_LENGTH) {
      setError(`Review must be at least ${MIN_REVIEW_LENGTH} characters long. (Image upload is optional)`);
      return;
    }

    if (!userData?.id) {
      setError('You must be logged in to submit a review. (Image upload is optional)');
      setLoginOpen(true);
      return;
    }

    try {
      const testimonialData = {
        user_id: userData.id,
        display_name: name,
        rating,
        description: review,
        current_status: 1,
        city_id: selectedCity,
        builder_id: selectedBuilder,
        community_id: selectedCommunity,
      };

      await addNewTestimonial(testimonialData, profileImage);

      setIsModalOpen(false);
      setReview('');
      setRating(0);
      setName('');
      setLocation('');
      setProfileImage(null);
      setImageScale(100);
      setError('');
      setReviewLengthError('');
      setSelectedCity('');
      setSelectedBuilder('');
      setSelectedCommunity('');
      alert('Thank you for your review! It is under admin review and will appear once approved.');

      setTestimonials((prev) => [
        ...prev,
        {
          name: name,
          image: profileImage ? URL.createObjectURL(profileImage) : null,
          rating,
          text: review,
          city: selectedCity ? cities.find(c => c.id === parseInt(selectedCity))?.name : null,
          builder: selectedBuilder ? builders.find(b => b.id === parseInt(selectedBuilder))?.name : null,
          community: selectedCommunity ? communities.find(c => c.id === parseInt(selectedCommunity))?.name : null,
        },
      ]);
      window.location.reload();
    } catch (error) {
      setError(error.message || 'Failed to submit review. (Image upload is optional)');
    }
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  const isFormValid = review.trim() && review.length >= MIN_REVIEW_LENGTH && rating > 0 && name.trim() && selectedCity && selectedBuilder && selectedCommunity;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl w-full mx-auto">
        {/* <h2 className={""}>Our Clients' Experiences</h2> */}
        <h2 className={`${tailwindStyles.heading_1}`}>Our Client's Experiences</h2>
        {fetchError && (
          <div className="text-center text-red-500 mb-6">{fetchError}</div>
        )}
        {testimonials.length === 0 && !fetchError ? (
          <div className="text-center text-gray-500">No approved testimonials available.</div>
        ) : (
          <>
            <div
              className="overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / (window.innerWidth < 768 ? 1 : 3))}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="snap-center flex-shrink-0 w-full md:w-1/3 p-4 animate-fadeIn"
                    onClick={handleCardClick}
                  >
                    <div className="w-full max-w-md mx-auto relative group hover:scale-105 transition-transform duration-300">
                      <div
                        className="bg-gradient-to-b from-gray-400 to-yellow-100 h-24 w-full"
                        style={{
                          clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
                        }}
                      ></div>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-white border-2 border-white shadow-md">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span className="text-2xl font-semibold text-gray-600">
                            {testimonial.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="bg-gradient-to-b from-blue-200 to-cream-100 rounded-b-lg shadow-lg p-4 pt-12">
                        <h3 className="text-lg font-semibold text-gray-900 text-center">{testimonial.name}</h3>
                        <div className="text-sm text-gray-600 text-center mt-1">
                          {testimonial.city || testimonial.builder || testimonial.community ? (
                            <>
                              {testimonial.city && `${testimonial.city}`}
                              {testimonial.city && (testimonial.builder || testimonial.community) && ' | '}                              
                              {testimonial.community && `Community: ${testimonial.community}`}
                            </>
                          ) : (
                            'No location details'
                          )}
                        </div>
                        <div className="flex justify-center items-center mt-2 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-5 h-5 animate-bounceStar ${
                                i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 text-center text-sm md:text-base break-words">{testimonial.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-4 h-4 mx-1 transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300 hover:bg-blue-400'
                  }`}
                  style={{
                    clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
                  }}
                />
              ))}
            </div>
          </>
        )}

        <div className="text-center mt-8">
          <button
            onClick={handleAddReviewClick}
            className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-md"
          >
            Add Your Review
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gradient-to-b from-white to-blue-50 rounded-2xl max-w-md w-full mx-4 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl p-4">
                <h3 className="text-xl font-semibold text-white">Share Your Experience</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col items-center mb-5">
                    <div className="relative w-20 h-20 rounded-full bg-gray-100 overflow-hidden mb-2 border-2 border-dashed border-blue-300 flex items-center justify-center transition-transform hover:scale-105">
                      {profileImage ? (
                        <div className="w-20 h-20 overflow-hidden rounded-full">
                          <img
                            src={URL.createObjectURL(profileImage)}
                            alt="Profile preview"
                            className="w-full h-full object-cover object-top"
                            style={{ transform: `scale(${imageScale / 100})` }}
                          />
                        </div>
                      ) : name ? (
                        <span className="text-2xl font-semibold text-gray-600">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <svg className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                    <label htmlFor="profileUpload" className="text-sm text-blue-600 cursor-pointer hover:underline transition-colors">
                      Upload Photo (Optional)
                    </label>
                    <input
                      type="file"
                      id="profileUpload"
                      accept="image/*"
                      onChange={handleProfileUpload}
                      className="hidden"
                    />
                    {profileImage && (
                      <div className="mt-3 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adjust Image Size</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={imageScale}
                          onChange={(e) => setImageScale(e.target.value)}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your name to be displayed
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                      placeholder="Enter your display name"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Select City
                      </label>
                      <select
                        id="city"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        required
                      >
                        <option value="">Select a city</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 relative" ref={builderDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Builder
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsBuilderDropdownOpen(!isBuilderDropdownOpen)}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 flex justify-between items-center ${
                          !selectedCity ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        disabled={!selectedCity}
                      >
                        <span>
                          {selectedBuilder
                            ? filteredBuilders.find((builder) => builder.id === parseInt(selectedBuilder))?.name
                            : 'Select a builder'}
                        </span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isBuilderDropdownOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isBuilderDropdownOpen && selectedCity && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-[35vh] overflow-y-auto shadow-lg">
                          {filteredBuilders.length > 0 ? (
                            filteredBuilders.map((builder) => (
                              <li
                                key={builder.id}
                                onClick={() => handleBuilderSelect(builder.id)}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                              >
                                {builder.name}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-2 text-gray-500">No builders available</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="relative" ref={communityDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Community
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCommunityDropdownOpen(!isCommunityDropdownOpen)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 flex justify-between items-center ${
                        !selectedBuilder ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      disabled={!selectedBuilder}
                    >
                      <span>
                        {selectedCommunity
                          ? filteredCommunities.find((community) => community.id === parseInt(selectedCommunity))?.name
                          : 'Select a community'}
                      </span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isCommunityDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isCommunityDropdownOpen && selectedBuilder && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-[35vh] overflow-y-auto shadow-lg">
                        {filteredCommunities.length > 0 ? (
                          filteredCommunities.map((community) => (
                            <li
                              key={community.id}
                              onClick={() => handleCommunitySelect(community.id)}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                            >
                              {community.name}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-gray-500">No communities available</li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`cursor-pointer w-7 h-7 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          } hover:scale-110 transition-transform duration-200`}
                          onClick={() => handleRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="testimonial" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Review
                    </label>
                    <textarea
                      id="testimonial"
                      value={review}
                      onChange={handleReviewChange}
                      placeholder="Share your experience with RufRent..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 resize-none"
                      rows="4"
                      maxLength={250}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">{review.length}/250 characters</p>
                    {reviewLengthError && (
                      <p className="text-sm text-red-500 mt-1">{reviewLengthError}</p>
                    )}
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
              </div>

              <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`flex-1 py-3 font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 ${
                      isFormValid
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes bounceStar {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        .animate-bounceStar {
          animation: bounceStar 0.8s ease;
        }
      `}</style>
      <AuthModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}        
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default TestimonialsView;



