
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useRoleStore } from "../../../store/roleStore";
import {
  uploadProperty,
  fetchPostPropertiesData,
} from "../../../services/newapiservices";
import { updateProperty } from "../../../config/apiRoute";
import useUserListingsStore from "../../../store/userListingsStore";
import ProgressBar from "./ProgressBar";
import LoadingView from "../../../components/CommonViews/LoadingView";
import PropertyForm from "./PropertyForm";
import tailwindStyles from "../../../utils/tailwindStyles";
import PostProcess from "./PostProcessModel";
import SuccessView from "./SuccessView";
import ErrorView from "./ErrorView";
import TextModel from "./WhyTextModel";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

const PostPropertiesView = () => {
  const navigate = useNavigate();
  const { userData } = useRoleStore();
  const { fetchUserListings, selectedProperty, clearSelectedProperty } = useUserListingsStore();
  const userId = userData.id;
  const [pageLoading, setPageLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const jwtToken = Cookies.get(jwtSecretKey);

  useEffect(() => {
    const initRender = () => {
      if (!jwtToken) {
        navigate("/");
      }
    };
    initRender();
  }, [jwtToken, navigate]);

  const [formData, setFormData] = useState({
    city: "",
    builder: "",
    community: "",
    propertyType: "",
    towerNumber: "",
    floorNumber: "",
    flatNumber: "",
    bedrooms: "",
    bathrooms: "",
    propertyDescription: "",
    balcony: "",
    tenantType: "",
    foodPreferences: "",
    rental_low: "",
    rental_high: "",
    parking: "",
    maintenance: "",
    available: "",
    depositAmount: "",
    area: "",
    facing: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [newImages, setNewImages] = useState([]); // New File objects
  const [existingImages, setExistingImages] = useState([]); // URLs from selectedProperty
  const [removedImages, setRemovedImages] = useState([]); // URLs to delete

  const [buildersAndCommunities, setBuildersAndCommunities] = useState({
    builders: [],
    communities: [],
  });
  const [dropdownData, setDropdownData] = useState({
    cityList: [],
    builderList: [],
    communityList: [],
    propertyType: [],
    bedrooms: [],
    bathrooms: [],
    balcony: [],
    tenantType: [],
    foodPreference: [],
    parking: [],
    propertyDescription: [],
    availability: [],
    facing: [],
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [modalImage, setModalImage] = useState(null);


useEffect(() => {
  if (selectedProperty) {
    console.log("Selected Property:", selectedProperty);
    setFormData({
      city: selectedProperty.city_id || "",
      builder: selectedProperty.builder_id || "",
      community: selectedProperty.community_id || "",
      propertyType: selectedProperty.prop_type_id || selectedProperty.prop_type || "",
      towerNumber: selectedProperty.tower_no || "",
      floorNumber: selectedProperty.floor_no || "",
      flatNumber: selectedProperty.flat_no || "",
      bedrooms: selectedProperty.home_type_id || "",
      bathrooms: selectedProperty.nbaths || "",
      propertyDescription: selectedProperty.prop_desc_id || "",
      balcony: selectedProperty.nbalcony || "",
      tenantType: selectedProperty.tenant_type_id || "",
      foodPreferences: selectedProperty.eat_pref_id || "",
      rental_low: selectedProperty.rental_low || "",
      rental_high: selectedProperty.rental_high || "",
      parking: selectedProperty.parking_count || "",
      maintenance: selectedProperty.maintenance_id || "",
      available: selectedProperty.available_date_id || "", // Adjust if date format differs
      depositAmount: selectedProperty.deposit_amount || "",
      area: selectedProperty.super_area || "",
      facing: selectedProperty.facing || "",
    });
    // Only include user-uploaded images, exclude default_img
    const userImages = (selectedProperty.images || []).filter(Boolean);
    setExistingImages(userImages);
    setImagePreviews(userImages.slice(0, 5));
  }
}, [selectedProperty]);

  // Fetch dropdown data (unchanged)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchPostPropertiesData();
        if (response?.data?.result) {
          const {
            cities,
            builders,
            communities,
            propType,
            homeTypes,
            baths,
            balconies,
            tenants,
            tenantEatPrefs,
            parkingCounts,
            propDesc,
            availability,
            facing,
          } = response.data.result;

          setDropdownData({
            cityList: cities || [],
            builderList: [],
            communityList: [],
            propertyType: propType || [],
            bedrooms: homeTypes || [],
            bathrooms: baths || [],
            balcony: balconies || [],
            tenantType: tenants || [],
            foodPreference: tenantEatPrefs || [],
            parking: parkingCounts || [],
            propertyDescription: propDesc || [],
            availability: availability || [],
            facing: facing || [],
          });

          setBuildersAndCommunities({
            builders: builders || [],
            communities: communities || [],
          });
        }
      } catch (err) {
        console.error("Error fetching static data:", err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.city) {
      const builders = buildersAndCommunities.builders.filter(
        (eachBuilder) => eachBuilder.city_id == formData.city
      );
      setDropdownData((prev) => ({ ...prev, builderList: builders }));
    }
  }, [formData.city, buildersAndCommunities.builders]);

  useEffect(() => {
    if (formData.builder) {
      const filteredCommunities = buildersAndCommunities.communities.filter(
        (eachCommunity) => eachCommunity.builder_id == formData.builder
      );
      setDropdownData((prev) => ({ ...prev, communityList: filteredCommunities }));
    }
  }, [formData.builder, buildersAndCommunities.communities]);

  const handleInputChange = (e) => {
    const { name, type, value, files, checked } = e.target;

    if (type === "file") {
      const fileList = Array.from(files);
      if (newImages.length + fileList.length + existingImages.length - removedImages.length > 10) {
        alert("Maximum 10 images are allowed.");
        return;
      }
      setNewImages((prev) => [...prev, ...fileList]);
      setImagePreviews((prev) => [
        ...prev,
        ...fileList.map((file) => URL.createObjectURL(file)),
      ].slice(0, 5));
    } else if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        builder: "",
        community: "",
      }));
      setDropdownData((prev) => ({
        ...prev,
        builderList: [],
        communityList: [],
      }));
    } else if (name === "builder") {
      setFormData((prev) => ({ ...prev, [name]: value, community: "" }));
      setDropdownData((prev) => ({ ...prev, communityList: [] }));
    } else {
      if (name === "maintenance") {
        const selectedOption = checked ? e.target.dataset.id : null;
        setFormData((prev) => ({ ...prev, maintenance: selectedOption }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRemoveImage = (index) => {
    const previewImage = imagePreviews[index];
    // Check if the image is existing (URL) or new (File)
    if (existingImages.includes(previewImage)) {
      setRemovedImages((prev) => [...prev, previewImage]);
      setExistingImages((prev) => prev.filter((img) => img !== previewImage));
    } else {
      // Remove from newImages by matching the preview URL
      setNewImages((prev) => prev.filter((file) => URL.createObjectURL(file) !== previewImage));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const openImageModal = (image) => setModalImage(image);
  const closeImageModal = () => setModalImage(null);

  const validatePanel = (panelFields) => {
    const panelErrors = {};
    panelFields.forEach((field) => {
      if (
        formData.propertyType === "3" &&
        (field.name === "floorNumber" || field.name === "flatNumber")
      ) {
        return;
      }
      const value = formData[field.name];
      if (
        (field.type === "dropdown" || field.type === "radio") &&
        !value
      ) {
        panelErrors[field.name] = `Please select a valid ${field.label.toLowerCase()}.`;
      } else if (
        (field.type === "text" || field.type === "number") &&
        !value
      ) {
        panelErrors[field.name] = `${field.label} must be entered.`;
      }
    });
    return panelErrors;
  };

  const handleNext = () => {
    const panelFields = panels[currentStep - 1];
    const panelErrors = validatePanel(panelFields);
    if (Object.keys(panelErrors).length > 0) {
      setErrors(panelErrors);
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const panelFields = panels[currentStep - 1];
    const panelErrors = validatePanel(panelFields);
    if (Object.keys(panelErrors).length > 0) {
      setErrors(panelErrors);
      return;
    }
  
    const propertyData = {
      prop_type_id: formData.propertyType || null,
      home_type_id: formData.bedrooms || null,
      prop_desc_id: formData.propertyDescription || null,
      community_id: formData.community || null,
      no_baths: formData.bathrooms || null, // Align with backend schema
      no_balconies: formData.balcony || null, // Align with backend schema
      tenant_type_id: formData.tenantType || null,
      tenant_eat_pref_id: formData.foodPreferences || null,
      rental_low: isNaN(parseInt(formData.rental_low)) ? null : parseInt(formData.rental_low),
      rental_high: isNaN(parseInt(formData.rental_high)) ? null : parseInt(formData.rental_high),
      parking_count_id: formData.parking || null,
      maintenance_id: formData.maintenance || null,
      tower_no: formData.towerNumber || null,
      floor_no: isNaN(parseInt(formData.floorNumber)) ? null : parseInt(formData.floorNumber),
      flat_no: formData.flatNumber || null,
      available_date: formData.available || null,
      deposit_amount: isNaN(parseInt(formData.depositAmount)) ? null : parseInt(formData.depositAmount),
      super_area: isNaN(parseInt(formData.area)) ? null : parseInt(formData.area),
      facing: formData.facing || null,
      current_status: selectedProperty ? 1 : undefined,
    };
  
    // Remove undefined fields
    Object.keys(propertyData).forEach((key) => {
      if (propertyData[key] === undefined) {
        delete propertyData[key];
      }
    });
  
    try {
      let response;
      if (selectedProperty) {
        if (!selectedProperty.id) {
          throw new Error("Property ID is missing");
        }
        console.log("Submitting update with propertyId:", selectedProperty.id);
        console.log("Property Data:", propertyData);
        console.log("New Images:", newImages.map((file) => file.name));
        console.log("Removed Images:", removedImages);
        response = await updateProperty(
          selectedProperty.id,
          propertyData,
          newImages,
          removedImages
        );
        console.log("Update Response:", response);
      } else {
        response = await uploadProperty({
          ...propertyData,
          images: newImages,
        });
      }
  
      setSubmissionStatus("success");
      setErrors({});
      setNewImages([]);
      setRemovedImages([]);
      clearSelectedProperty();
      await fetchUserListings(userId);
    } catch (error) {
      console.error("Error submitting data:", error);
      setSubmissionStatus("error");
      setErrorMessage(
        error.response?.data?.message || error.message || "An error occurred while submitting the property"
      );
    }
  };

  const panels = [
    [
      { label: "City", name: "city", options: dropdownData.cityList, type: "dropdown", displayKey: "name" },
      { label: "Builder", name: "builder", options: dropdownData.builderList, type: "dropdown", displayKey: "name" },
      { label: "Community", name: "community", options: dropdownData.communityList, type: "dropdown", displayKey: "name" },
      { label: "Property Type", name: "propertyType", options: dropdownData.propertyType, type: "dropdown", displayKey: "prop_type" },
      { label: "Description", name: "propertyDescription", options: dropdownData.propertyDescription, type: "dropdown", displayKey: "prop_desc" },
      { label: "Home Type", name: "bedrooms", options: dropdownData.bedrooms, type: "dropdown", displayKey: "home_type" },
    ],
    [
      { label: "Tower/Unit Number", name: "towerNumber", type: "text" },
      { label: "Floor Number", name: "floorNumber", type: "number" },
      { label: "Flat Number", name: "flatNumber", type: "text" },
      { label: "Bathrooms", name: "bathrooms", options: dropdownData.bathrooms, type: "dropdown", displayKey: "nbaths" },
      { label: "Balcony Count", name: "balcony", options: dropdownData.balcony, type: "dropdown", displayKey: "nbalcony" },
      { label: "Parking", name: "parking", options: dropdownData.parking, type: "dropdown", displayKey: "parking_count" },
    ],
    [
      { label: "Monthly Rental (INR)", name: "monthly_rental", type: "group" },
      { label: "Min", name: "rental_low", type: "number" },
      { label: "Max", name: "rental_high", type: "number" },
      { label: "Tenant Type", name: "tenantType", options: dropdownData.tenantType, type: "dropdown", displayKey: "tenant_type" },
      { label: "Food Preferences", name: "foodPreferences", options: dropdownData.foodPreference, type: "dropdown", displayKey: "eat_pref" },
      { label: "Maintenance", name: "maintenance", type: "radio", options: [
          { label: "Included", value: "included", id: 1 },
          { label: "Not Included", value: "not_included", id: 2 },
        ] },
      { label: "Availability", name: "available", options: dropdownData.availability, type: "dropdown", displayKey: "available" },
      { label: "Deposit Amount (INR)", name: "depositAmount", type: "number" },
      { label: "Area in sqft", name: "area", type: "number" },
      { label: "Flat Facing", name: "facing", options: dropdownData.facing, type: "dropdown", displayKey: "name" },
      { label: "Upload Images (* Highlights Your Property)", name: "images", type: "file" },
    ],
  ];

  const totalSteps = panels.length;

  const resetSubmissionStatus = async () => {
    setSubmissionStatus(null);
    await fetchUserListings(userId);
    navigate("/user");
  };

  return (
    <div
      className="px-5 lg:px-10 py-3"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "calc(100vh - 60px)",
        width: "100%",
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='1440' height='560' preserveAspectRatio='none' viewBox='0 0 1440 560'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1059%26quot%3b)' fill='none'%3e%3crect width='1440' height='560' x='0' y='0' fill='rgba(231%2c 239%2c 247%2c 1)'%3e%3c/rect%3e%3cpath d='M0%2c418.711C88.787%2c428.575%2c184.186%2c451.475%2c262.361%2c408.242C341.751%2c364.338%2c372.414%2c269.651%2c414.685%2c189.38C459.483%2c104.31%2c512.997%2c21.829%2c516.444%2c-74.253C520.268%2c-180.825%2c504.03%2c-295.645%2c435.004%2c-376.933C365.784%2c-458.449%2c255.828%2c-508.271%2c148.895%2c-507.091C49.706%2c-505.996%2c-20.179%2c-415.266%2c-108.915%2c-370.931C-178.648%2c-336.09%2c-256.615%2c-324.073%2c-316.731%2c-274.449C-384.982%2c-218.109%2c-459.288%2c-155.372%2c-475.455%2c-68.36C-491.764%2c19.416%2c-447.05%2c106.531%2c-401.823%2c183.506C-359.804%2c255.02%2c-298.977%2c311.931%2c-227.394%2c353.832C-157.962%2c394.474%2c-79.96%2c409.828%2c0%2c418.711' fill='%23a7c4e2'%3e%3c/path%3e%3cpath d='M1440 898.6890000000001C1520.907 898.406 1601.338 958.328 1676.074 927.338 1752.623 895.596 1792.045 811.835 1828.695 737.511 1866.2350000000001 661.383 1899.441 579.679 1889.05 495.43600000000004 1878.564 410.422 1830.026 335.29200000000003 1771.3809999999999 272.857 1714.306 212.094 1638.595 178.03699999999998 1561.386 146.598 1476.204 111.91199999999998 1387.471 54.646000000000015 1299.2359999999999 80.601 1211.005 106.555 1158.982 197.48399999999998 1114.585 278.027 1076.251 347.571 1076.415 427.499 1064.722 506.043 1052.962 585.0360000000001 1021.014 664.104 1045.809 740.021 1071.7640000000001 819.489 1125.31 897.778 1202.862 928.994 1278.315 959.365 1358.664 898.9739999999999 1440 898.6890000000001' fill='white'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1059'%3e%3crect width='1440' height='560' fill='white'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e")`,
      }}
    >
      {pageLoading ? (
        <LoadingView />
      ) : (
        <div className="w-full md:min-h-[calc(100vh-200px)] mx-auto">
          <div className="flex md:hidden mb-4 min-w-[100%]">
            <TextModel />
          </div>
          <div className="flex items-end justify-center md:justify-between">
            <div className="hidden md:block md:mr-5">
              <TextModel />
            </div>
            <div className="md:w-[75%] w-full justify-self-end">
              <h2 className={`${tailwindStyles.heading_2} text-center`}>
                {selectedProperty ? "Edit Property" : "Post A Property"}
              </h2>
              <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
              <div className="bg-white shadow-lg p-4 md:p-6 rounded-lg mt-3 md:mt-6">
                <PropertyForm
                  panels={panels}
                  currentStep={currentStep}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  loading={false}
                  imagePreviews={imagePreviews}
                  handleRemoveImage={handleRemoveImage}
                  openImageModal={openImageModal}
                  handleSubmit={handleSubmit}
                  handleNext={handleNext}
                  totalSteps={totalSteps}
                  setCurrentStep={setCurrentStep}
                />
              </div>
            </div>
          </div>
          <PostProcess />
        </div>
      )}
      {modalImage && (
        <div className="fixed inset-0 top-10 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-gray-600 rounded-lg p-4 shadow-lg relative w-3/4 h-3/4 flex items-center justify-center">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <img
              src={modalImage}
              alt="Modal View"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      {submissionStatus === "success" && (
        <SuccessView onClose={resetSubmissionStatus} />
      )}
      {submissionStatus === "error" && (
        <ErrorView
          onClose={resetSubmissionStatus}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
};

export default PostPropertiesView;
