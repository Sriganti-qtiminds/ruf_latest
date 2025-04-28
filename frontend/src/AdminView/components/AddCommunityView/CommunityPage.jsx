"use client";

import { useState, useEffect, useRef } from "react";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const Communities = () => {
  // Common states
  const [cities, setCities] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);

  // UI toggle states for forms
  const [showCommunityForm, setShowCommunityForm] = useState(false);
  const [showAmenitiesForm, setShowAmenitiesForm] = useState(false);
  const [showLandmarksForm, setShowLandmarksForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showImportLandmarksForm, setShowImportLandmarksForm] = useState(false);

  // Refs for scrolling
  const communityFormRef = useRef(null);
  const amenitiesFormRef = useRef(null);
  const landmarksFormRef = useRef(null);

  // ===== COMMUNITY FORM STATES =====
  const [communityCity, setCommunityCity] = useState("");
  const [communityBuilders, setCommunityBuilders] = useState([]);
  const [communityBuilder, setCommunityBuilder] = useState("");
  const [selectedCommunityForCommunity, setSelectedCommunityForCommunity] =
    useState("");

  // Community form fields
  const [nameCommunity, setNameCommunity] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [openArea, setOpenArea] = useState("");
  const [nblocks, setNBlocks] = useState("");
  const [nfloorsPerBlock, setNFloorsPerBlock] = useState("");
  const [nhousesPerFloor, setNHousesPerFloor] = useState("");
  const [address, setAddress] = useState("");
  const [majorArea, setMajorArea] = useState("");
  const [totflats, setTotFlats] = useState("");
  const [status, setStatus] = useState("");
  const [rstatus, setRStatus] = useState("");
  const [images, setImages] = useState(null);

  // ===== AMENITY FORM STATES =====
  const [amenityCity, setAmenityCity] = useState("");
  const [amenityBuilders, setAmenityBuilders] = useState([]);
  const [amenityBuilder, setAmenityBuilder] = useState("");
  const [amenityCommunities, setAmenityCommunities] = useState([]);
  const [selectedCommunityForAmenity, setSelectedCommunityForAmenity] =
    useState("");

  // Amenity specific states
  const [amenitiesCategories, setAmenitiesCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenityCategory, setSelectedAmenityCategory] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Additional states for target community filtering
  const [targetCity, setTargetCity] = useState("");
  const [targetBuilders, setTargetBuilders] = useState([]);
  const [targetBuilder, setTargetBuilder] = useState("");
  const [targetCommunities, setTargetCommunities] = useState([]);

  // ===== LANDMARK FORM STATES =====
  const [landmarkCity, setLandmarkCity] = useState("");
  const [landmarkBuilders, setLandmarkBuilders] = useState([]);
  const [landmarkBuilder, setLandmarkBuilder] = useState("");
  const [landmarkCommunities, setLandmarkCommunities] = useState([]);
  const [selectedCommunityForLandmark, setSelectedCommunityForLandmark] =
    useState("");

  // Landmark specific states
  const [landmarkCategories, setLandmarkCategories] = useState([]);
  const [landmarks, setLandmarks] = useState([
    { category: "", name: "", distance: "" },
  ]);

  // ===== IMPORT FORM STATES =====
  const [sourceCommunityId, setSourceCommunityId] = useState("");
  const [targetCommunityId, setTargetCommunityId] = useState("");

  // --- Data Fetching Effects ---

  // Fetch cities (common for all forms)
  useEffect(() => {
    fetch(
      `${apiUrl}/getRecords?tableName=st_city&fieldNames=id,name&whereCondition=rstatus=1`
    )
      .then((response) => response.json())
      .then((data) => setCities(data.result || []))
      .catch((error) => console.error("Error fetching cities:", error));
  }, []);

  // Fetch all communities for target dropdown
  useEffect(() => {
    fetch(
      `${apiUrl}/getRecords?tableName=st_community&fieldNames=id,name&whereCondition=rstatus=1`
    )
      .then((response) => response.json())
      .then((data) => {
        setAllCommunities(data.result || []);
      })
      .catch((error) =>
        console.error("Error fetching all communities:", error)
      );
  }, []);

  // ===== COMMUNITY FORM EFFECTS =====

  // Fetch builders based on selected city for Community form
  useEffect(() => {
    if (communityCity) {
      fetch(
        `${apiUrl}/getRecords?tableName=st_builder&fieldNames=id,name&whereCondition=rstatus=1 AND city_id=${communityCity}`
      )
        .then((response) => response.json())
        .then((data) => setCommunityBuilders(data.result || []))
        .catch((error) =>
          console.error("Error fetching builders for community form:", error)
        );
    } else {
      setCommunityBuilders([]);
      setCommunityBuilder("");
    }
  }, [communityCity]);

  // ===== AMENITY FORM EFFECTS =====

  // Fetch builders based on selected city for Amenity form
  useEffect(() => {
    if (amenityCity) {
      fetch(
        `${apiUrl}/getRecords?tableName=st_builder&fieldNames=id,name&whereCondition=rstatus=1 AND city_id=${amenityCity}`
      )
        .then((response) => response.json())
        .then((data) => setAmenityBuilders(data.result || []))
        .catch((error) =>
          console.error("Error fetching builders for amenity form:", error)
        );
    } else {
      setAmenityBuilders([]);
      setAmenityBuilder("");
    }
  }, [amenityCity]);

  // Fetch communities based on selected builder for Amenity form
  useEffect(() => {
    if (amenityBuilder) {
      fetch(
        `${apiUrl}/getRecords?tableName=st_community&fieldNames=id,name&whereCondition=rstatus=1 AND builder_id=${amenityBuilder}`
      )
        .then((response) => response.json())
        .then((data) => {
          setAmenityCommunities(data.result || []);
          setSelectedCommunityForAmenity("");
        })
        .catch((error) =>
          console.error("Error fetching communities for amenity form:", error)
        );
    } else {
      setAmenityCommunities([]);
      setSelectedCommunityForAmenity("");
    }
  }, [amenityBuilder]);

  // Fetch amenity categories
  useEffect(() => {
    fetch(
      `${apiUrl}/getRecords?tableName=st_amenity_category&fieldNames=id,amenity_category&whereCondition=rstatus=1`
    )
      .then((response) => response.json())
      .then((data) => {
        setAmenitiesCategories(data.result || []);
      })
      .catch((error) =>
        console.error("Error fetching amenity categories:", error)
      );
  }, []);

  // Fetch amenities based on selected category
  useEffect(() => {
    if (selectedCommunityForAmenity && selectedAmenityCategory) {
      const encodedWhereCondition = encodeURIComponent(
        `rstatus=1 AND amenity_category_id=${selectedAmenityCategory}`
      );

      fetch(
        `${apiUrl}/getRecords?tableName=st_amenities&fieldNames=id,amenity_name&whereCondition=${encodedWhereCondition}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setAmenities(data.result || []);
        })
        .catch((error) => {
          console.error("Error fetching amenities:", error);
        });
    } else {
      setAmenities([]);
    }
  }, [selectedCommunityForAmenity, selectedAmenityCategory]);

  // Fetch builders for target community
  useEffect(() => {
    if (targetCity) {
      fetch(
        `${apiUrl}/getRecords?tableName=st_builder&fieldNames=id,name&whereCondition=rstatus=1 AND city_id=${targetCity}`
      )
        .then((response) => response.json())
        .then((data) => setTargetBuilders(data.result || []))
        .catch((error) =>
          console.error("Error fetching target builders:", error)
        );
    } else {
      setTargetBuilders([]);
      setTargetBuilder("");
      setTargetCommunities([]);
    }
  }, [targetCity]);

  // Fetch communities based on selected builder for Target community
  useEffect(() => {
    if (targetBuilder) {
      fetch(
        `${apiUrl}/getRecords?tableName=st_community&fieldNames=id,name&whereCondition=rstatus=1 AND builder_id=${targetBuilder}`
      )
        .then((response) => response.json())
        .then((data) => {
          setTargetCommunities(data.result || []);
          setTargetCommunityId(""); // Reset target community when builder changes
        })
        .catch((error) =>
          console.error("Error fetching target communities:", error)
        );
    } else {
      setTargetCommunities([]);
      setTargetCommunityId("");
    }
  }, [targetBuilder]);

  // ===== LANDMARK FORM EFFECTS =====

  // Fetch builders based on selected city for Landmark form
  useEffect(() => {
    if (landmarkCity) {
      fetch(
        `${apiUrl}/getRecords?tableName=st_builder&fieldNames=id,name&whereCondition=rstatus=1 AND city_id=${landmarkCity}`
      )
        .then((response) => response.json())
        .then((data) => setLandmarkBuilders(data.result || []))
        .catch((error) =>
          console.error("Error fetching builders for landmark form:", error)
        );
    } else {
      setLandmarkBuilders([]);
      setLandmarkBuilder("");
    }
  }, [landmarkCity]);

  // Fetch communities based on selected builder for Landmark form
  useEffect(() => {
    if (landmarkBuilder) {
      fetch(
        `${apiUrl}/getRecords?tableName=st_community&fieldNames=id,name&whereCondition=rstatus=1 AND builder_id=${landmarkBuilder}`
      )
        .then((response) => response.json())
        .then((data) => {
          setLandmarkCommunities(data.result || []);
          setSelectedCommunityForLandmark("");
        })
        .catch((error) =>
          console.error("Error fetching communities for landmark form:", error)
        );
    } else {
      setLandmarkCommunities([]);
      setSelectedCommunityForLandmark("");
    }
  }, [landmarkBuilder]);

  // Fetch landmark categories
  useEffect(() => {
    fetch(
      `${apiUrl}/getRecords?tableName=st_landmarks_category&fieldNames=id,landmark_category&whereCondition=rstatus=1`
    )
      .then((response) => response.json())
      .then((data) => setLandmarkCategories(data.result || []))
      .catch((error) =>
        console.error("Error fetching landmark categories:", error)
      );
  }, []);

  // --- Handlers ---

  const handleAmenityCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    setSelectedAmenityCategory(selectedCategoryId);
    setAmenities([]);
  };

  const handleAmenityChange = (amenityId) => {
    setSelectedAmenities((prevSelected) =>
      prevSelected.includes(amenityId)
        ? prevSelected.filter((id) => id !== amenityId)
        : [...prevSelected, amenityId]
    );
  };

  const handleSaveAmenities = () => {
    if (selectedAmenities.length === 0) {
      alert("Please select at least one amenity.");
      return;
    }
    const payload = {
      community_id: Number.parseInt(selectedCommunityForAmenity, 10),
      amenity_ids: selectedAmenities.map(Number),
    };
    fetch(`${apiUrl}/addamenities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message && data.message.includes("successfully")) {
          alert(data.message);
        } else {
          alert("Failed to save amenities.");
        }
      })
      .catch((error) => {
        console.error("Error saving amenities:", error);
        alert("An error occurred while saving the amenities.");
      });
  };

  const handleAddLandmark = () => {
    setLandmarks([...landmarks, { category: "", name: "", distance: "" }]);
  };

  const handleLandmarkInputChange = (index, field, value) => {
    const newLandmarks = [...landmarks];
    newLandmarks[index][field] = value;
    setLandmarks(newLandmarks);
  };

  const handleSaveLandmarks = () => {
    const payload = {
      community_id: Number.parseInt(selectedCommunityForLandmark, 10),
      landmarks: landmarks.map((landmark) => ({
        landmark_name: landmark.name,
        distance: Number.parseFloat(landmark.distance) || 0,
        landmark_category_id: Number.parseInt(landmark.category, 10),
      })),
    };
    fetch(`${apiUrl}/landmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message && data.message.includes("successfully")) {
          alert("landmark saved successfully");
        } else {
          alert("Failed to save landmarks.");
        }
      })
      .catch((error) => {
        console.error("Error saving landmarks:", error);
        alert("An error occurred while saving landmarks.");
      });
  };

  const handleSaveCommunity = () => {
    // Validate all required fields
    if (!nameCommunity?.trim()) {
      alert("Please enter a community name.");
      return;
    }
    if (!communityBuilder) {
      alert("Please select a builder.");
      return;
    }
    if (!totalArea || isNaN(Number(totalArea))) {
      alert("Please enter a valid total area.");
      return;
    }
    if (!openArea || isNaN(Number(openArea))) {
      alert("Please enter a valid open area.");
      return;
    }
    if (!nblocks || isNaN(Number(nblocks))) {
      alert("Please enter a valid number of blocks.");
      return;
    }
    if (!nfloorsPerBlock || isNaN(Number(nfloorsPerBlock))) {
      alert("Please enter a valid number of floors per block.");
      return;
    }
    if (!nhousesPerFloor || isNaN(Number(nhousesPerFloor))) {
      alert("Please enter a valid number of houses per floor.");
      return;
    }
    if (!totflats || isNaN(Number(totflats))) {
      alert("Please enter a valid total number of flats.");
      return;
    }
    if (!address?.trim()) {
      alert("Please enter a valid address.");
      return;
    }
    if (!majorArea?.trim()) {
      alert("Please enter a valid major area.");
      return;
    }
    if (!status?.trim()) {
      alert("Please enter a valid status.");
      return;
    }
    if (!rstatus?.trim()) {
      alert("Please enter a valid rstatus.");
      return;
    }

    // Build the communityData object
    const communityData = {
      name: nameCommunity.trim(),
      map_url: mapUrl?.trim() || "", // Default empty string if missing
      total_area: Number(totalArea),
      open_area: Number(openArea),
      nblocks: Number(nblocks),
      nfloors_per_block: Number(nfloorsPerBlock),
      nhouses_per_floor: Number(nhousesPerFloor),
      address: address.trim(),
      major_area: majorArea.trim(),
      builder_id: Number(communityBuilder),
      totflats: Number(totflats),
      status: status.trim(),
      rstatus: rstatus.trim(),
    };

    console.log("Sending communityData:", JSON.stringify(communityData));

    // Create FormData
    const formData = new FormData();
    formData.append("communityData", JSON.stringify(communityData));

    if (images) {
      formData.append("images", images);
    }

    fetch(`${apiUrl}/createCommunity`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.message && data.message.includes("successfully")) {
          alert("Community added successfully!");
        } else {
          alert("Failed to add community.");
        }
      })
      .catch((error) => {
        console.error("Error adding community:", error);
        alert("An error occurred while adding the community.");
      });
  };

  const handleImportAmenities = async () => {
    if (!sourceCommunityId || !targetCommunityId) {
      alert("Please select both source and target communities");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/importamenities?source_community_id=${sourceCommunityId}&target_community_id=${targetCommunityId}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (data.message && data.message.includes("completed")) {
        alert("Amenities imported successfully!");
      } else {
        alert("Failed to import amenities.");
      }
    } catch (error) {
      console.error("Error importing amenities:", error);
      alert("An error occurred while importing amenities.");
    }
  };

  const handleImportLandmarks = async () => {
    if (!sourceCommunityId || !targetCommunityId) {
      alert("Please select both source and target communities");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/importLandmarks?source_community_id=${sourceCommunityId}&target_community_id=${targetCommunityId}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (data.message && data.message.includes("completed")) {
        alert("Landmarks imported successfully!");
      } else {
        alert("Failed to import landmarks.");
      }
    } catch (error) {
      console.error("Error importing landmarks:", error);
      alert("An error occurred while importing landmarks.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Communities Management
      </h2>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <button
          onClick={() => {
            setShowCommunityForm(true);
            setShowAmenitiesForm(false);
            setShowLandmarksForm(false);
            setTimeout(() => {
              communityFormRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-6 py-2 rounded-full shadow transition transform hover:scale-105"
        >
          Add Community
        </button>
        <button
          onClick={() => {
            setShowCommunityForm(false);
            setShowAmenitiesForm(true);
            setShowLandmarksForm(false);
            setTimeout(() => {
              amenitiesFormRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-6 py-2 rounded-full shadow transition transform hover:scale-105"
        >
          Add Amenities
        </button>
        <button
          onClick={() => {
            setShowCommunityForm(false);
            setShowAmenitiesForm(false);
            setShowLandmarksForm(true);
            setTimeout(() => {
              landmarksFormRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white px-6 py-2 rounded-full shadow transition transform hover:scale-105"
        >
          Add Landmark
        </button>
      </div>

      {/* Community Form Section */}
      {showCommunityForm && (
        <div
          ref={communityFormRef}
          className="mb-8 p-6 border rounded-lg shadow-sm bg-gray-50"
        >
          <h3 className="text-xl font-semibold mb-4">Community Details</h3>

          {/* City and Builder Selection for Community Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label
                htmlFor="community-city"
                className="block font-medium mb-1"
              >
                Select City:
              </label>
              <select
                id="community-city"
                value={communityCity}
                onChange={(e) => setCommunityCity(e.target.value)}
                className="mt-2 block w-full border px-3 py-2 rounded-md"
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="community-builder"
                className="block font-medium mb-1"
              >
                Select Builder:
              </label>
              <select
                id="community-builder"
                value={communityBuilder}
                onChange={(e) => setCommunityBuilder(e.target.value)}
                className="mt-2 block w-full border px-3 py-2 rounded-md"
              >
                <option value="">Select a builder</option>
                {communityBuilders.map((builder) => (
                  <option key={builder.id} value={builder.id}>
                    {builder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Enter Community Name"
              className="border p-2 rounded"
              value={nameCommunity}
              onChange={(e) => setNameCommunity(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Map URL"
              className="border p-2 rounded"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Total Area"
              className="border p-2 rounded"
              value={totalArea}
              onChange={(e) => setTotalArea(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Open Area"
              className="border p-2 rounded"
              value={openArea}
              onChange={(e) => setOpenArea(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Number of Blocks"
              className="border p-2 rounded"
              value={nblocks}
              onChange={(e) => setNBlocks(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Floors per Block"
              className="border p-2 rounded"
              value={nfloorsPerBlock}
              onChange={(e) => setNFloorsPerBlock(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Houses per Floor"
              className="border p-2 rounded"
              value={nhousesPerFloor}
              onChange={(e) => setNHousesPerFloor(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Address"
              className="border p-2 rounded"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Major Area"
              className="border p-2 rounded"
              value={majorArea}
              onChange={(e) => setMajorArea(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Total Flats"
              className="border p-2 rounded"
              value={totflats}
              onChange={(e) => setTotFlats(e.target.value)}
            />
            <select
              className="border p-2 rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="active">completed</option>
              <option value="inactive">Ongoing</option>
            </select>
            <input
              type="number"
              placeholder="Enter RStatus"
              className="border p-2 rounded"
              value={rstatus}
              onChange={(e) => setRStatus(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium">
              Default Image
            </label>
            <input
              type="file"
              className="border p-2 rounded w-full"
              onChange={(e) => setImages(e.target.files[0])}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSaveCommunity}
              className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs px-4 py-2 rounded-full shadow transition transform hover:scale-105"
            >
              Save Community
            </button>
          </div>
        </div>
      )}

      {/* Amenities Form Section */}
      {showAmenitiesForm && (
        <div
          ref={amenitiesFormRef}
          className="mb-8 p-6 border rounded-lg shadow-sm bg-gray-50"
        >
          <div className="mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setShowImportForm(false)}
                className={`py-2 px-4 font-medium ${
                  !showImportForm
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Add Amenities
              </button>
              <button
                onClick={() => setShowImportForm(true)}
                className={`py-2 px-4 font-medium ${
                  showImportForm
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Import Amenities
              </button>
            </div>
          </div>

          {!showImportForm ? (
            // Add Amenities Form (No heading, all in one line)
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="amenity-city"
                    className="block font-medium mb-1"
                  >
                    City:
                  </label>
                  <select
                    id="amenity-city"
                    value={amenityCity}
                    onChange={(e) => setAmenityCity(e.target.value)}
                    className="mt-2 block w-full border px-3 py-2 rounded-md"
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="amenity-builder"
                    className="block font-medium mb-1"
                  >
                    Builder:
                  </label>
                  <select
                    id="amenity-builder"
                    value={amenityBuilder}
                    onChange={(e) => setAmenityBuilder(e.target.value)}
                    className="mt-2 block w-full border px-3 py-2 rounded-md"
                  >
                    <option value="">Select a builder</option>
                    {amenityBuilders.map((builder) => (
                      <option key={builder.id} value={builder.id}>
                        {builder.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="amenity-community"
                    className="block font-medium mb-1"
                  >
                    Community:
                  </label>
                  <select
                    id="amenity-community"
                    value={selectedCommunityForAmenity}
                    onChange={(e) =>
                      setSelectedCommunityForAmenity(e.target.value)
                    }
                    className="mt-2 block w-full border px-3 py-2 rounded-md"
                  >
                    <option value="">Select Community</option>
                    {amenityCommunities.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="amenity-category"
                  className="block font-medium mb-1"
                >
                  Select Amenities Category:
                </label>
                <select
                  id="amenity-category"
                  value={selectedAmenityCategory}
                  onChange={handleAmenityCategoryChange}
                  className="mt-2 block w-full border px-3 py-2 rounded-md"
                >
                  <option value="">Select Amenity Category</option>
                  {amenitiesCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.amenity_category}
                    </option>
                  ))}
                </select>
              </div>
              {selectedAmenityCategory && amenities.length > 0 && (
                <div className="mt-2 grid grid-cols-5 gap-4">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={amenity.id}
                        onChange={() => handleAmenityChange(amenity.id)}
                        checked={selectedAmenities.includes(amenity.id)}
                        className="h-4 w-4"
                      />
                      <label className="text-gray-700">
                        {amenity.amenity_name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleSaveAmenities}
                  className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs px-4 py-2 rounded-full shadow transition transform hover:scale-105"
                >
                  Save Amenities
                </button>
              </div>
            </div>
          ) : (
            // Import Amenities Form
            <div className="space-y-6">
              {/* Source Community Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Source Community</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="source-city"
                      className="block font-medium mb-1"
                    >
                      City:
                    </label>
                    <select
                      id="source-city"
                      value={amenityCity}
                      onChange={(e) => setAmenityCity(e.target.value)}
                      className="mt-2 block w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="source-builder"
                      className="block font-medium mb-1"
                    >
                      Builder:
                    </label>
                    <select
                      id="source-builder"
                      value={amenityBuilder}
                      onChange={(e) => setAmenityBuilder(e.target.value)}
                      className="mt-2 block w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">Select a builder</option>
                      {amenityBuilders.map((builder) => (
                        <option key={builder.id} value={builder.id}>
                          {builder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="source-community"
                      className="block font-medium mb-1"
                    >
                      Source Community:
                    </label>
                    <select
                      id="source-community"
                      value={sourceCommunityId}
                      onChange={(e) => setSourceCommunityId(e.target.value)}
                      className="mt-2 block w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">Select Source Community</option>
                      {amenityCommunities.map((community) => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Target Community Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Target Community</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="target-city"
                      className="block font-medium mb-1"
                    >
                      City:
                    </label>
                    <select
                      id="target-city"
                      value={targetCity}
                      onChange={(e) => setTargetCity(e.target.value)}
                      className="mt-2 block w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="target-builder"
                      className="block font-medium mb-1"
                    >
                      Builder:
                    </label>
                    <select
                      id="target-builder"
                      value={targetBuilder}
                      onChange={(e) => setTargetBuilder(e.target.value)}
                      className="mt-2 block w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">Select a builder</option>
                      {targetBuilders.map((builder) => (
                        <option key={builder.id} value={builder.id}>
                          {builder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="target-community"
                      className="block font-medium mb-1"
                    >
                      Target Community:
                    </label>
                    <select
                      id="target-community"
                      value={targetCommunityId}
                      onChange={(e) => setTargetCommunityId(e.target.value)}
                      className="mt-2 block w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">Select Target Community</option>
                      {targetCommunities.map((community) => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={handleImportAmenities}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
                >
                  Import Amenities
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Landmarks Form Section */}
      {showLandmarksForm && (
        <div
          ref={landmarksFormRef}
          className="mb-8 p-6 border rounded-lg shadow-sm bg-gray-50"
        >
          <h3 className="text-xl font-semibold mb-4">Landmarks Management</h3>
          <div className="mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setShowImportLandmarksForm(false)}
                className={`py-2 px-4 font-medium ${
                  !showImportLandmarksForm
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Add Landmarks
              </button>
              <button
                onClick={() => setShowImportLandmarksForm(true)}
                className={`py-2 px-4 font-medium ${
                  showImportLandmarksForm
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Import Landmarks
              </button>
            </div>
          </div>

          {/* City and Builder Selection for Landmark Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label htmlFor="landmark-city" className="block font-medium mb-1">
                Select City:
              </label>
              <select
                id="landmark-city"
                value={landmarkCity}
                onChange={(e) => setLandmarkCity(e.target.value)}
                className="mt-2 block w-full border px-3 py-2 rounded-md"
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="landmark-builder"
                className="block font-medium mb-1"
              >
                Select Builder:
              </label>
              <select
                id="landmark-builder"
                value={landmarkBuilder}
                onChange={(e) => setLandmarkBuilder(e.target.value)}
                className="mt-2 block w-full border px-3 py-2 rounded-md"
              >
                <option value="">Select a builder</option>
                {landmarkBuilders.map((builder) => (
                  <option key={builder.id} value={builder.id}>
                    {builder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!showImportLandmarksForm ? (
            // Existing add landmarks form code here
            <>
              {/* Select Community Dropdown for Landmarks */}
              <div className="mb-4">
                <label
                  htmlFor="landmark-community"
                  className="block font-medium mb-1"
                >
                  Select Community:
                </label>
                <select
                  id="landmark-community"
                  value={selectedCommunityForLandmark}
                  onChange={(e) =>
                    setSelectedCommunityForLandmark(e.target.value)
                  }
                  className="mt-2 block w-full border px-3 py-2 rounded-md"
                >
                  <option value="">Select Community</option>
                  {landmarkCommunities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>
              {landmarks.map((landmark, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4"
                >
                  <select
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-1/3"
                    value={landmark.category}
                    onChange={(e) =>
                      handleLandmarkInputChange(
                        index,
                        "category",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select Landmark Category</option>
                    {landmarkCategories.length === 0 ? (
                      <option disabled>No landmark categories available</option>
                    ) : (
                      landmarkCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.landmark_category}
                        </option>
                      ))
                    )}
                  </select>
                  <input
                    type="text"
                    placeholder="Landmark Name"
                    value={landmark.name}
                    onChange={(e) =>
                      handleLandmarkInputChange(index, "name", e.target.value)
                    }
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-1/3"
                  />
                  <input
                    type="text"
                    placeholder="Distance (km)"
                    value={landmark.distance}
                    onChange={(e) =>
                      handleLandmarkInputChange(
                        index,
                        "distance",
                        e.target.value
                      )
                    }
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-1/3"
                  />
                </div>
              ))}
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
                <button
                  onClick={handleAddLandmark}
                  className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs px-4 py-2 rounded-full shadow transition transform hover:scale-105"
                >
                  Add More Landmark
                </button>
                <button
                  onClick={handleSaveLandmarks}
                  className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs px-4 py-2 rounded-full shadow transition transform hover:scale-105"
                >
                  Save Landmarks
                </button>
              </div>
            </>
          ) : (
            // Import landmarks form
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">
                  Source Community:
                </label>
                <select
                  value={sourceCommunityId}
                  onChange={(e) => setSourceCommunityId(e.target.value)}
                  className="mt-2 block w-full border px-3 py-2 rounded-md"
                >
                  <option value="">Select Source Community</option>
                  {landmarkCommunities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Target Community:
                </label>
                <select
                  value={targetCommunityId}
                  onChange={(e) => setTargetCommunityId(e.target.value)}
                  className="mt-2 block w-full border px-3 py-2 rounded-md"
                >
                  <option value="">Select Target Community</option>
                  {allCommunities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleImportLandmarks}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
                >
                  Import Landmarks
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Communities;
