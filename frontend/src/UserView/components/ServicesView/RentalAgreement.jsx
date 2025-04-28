import React, { useState, useEffect } from "react";
import axios from "axios";

import { ThreeDots } from "react-loader-spinner";
import tailwindStyles from "../../../utils/tailwindStyles";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const RentalAgreement = ({ receiptId, userId, propertyId, serviceDetails }) => {
  const [file, setFile] = useState(null);

  const [isloading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // State to store the PDF URL

  // Determine service status based on the serviceDetails prop
  const isServiceFound = serviceDetails.some((service) => service.svc_id === 1);
  const serviceStatus = isServiceFound ? "Requested" : "Available";
  const rentaldetails = isServiceFound
    ? serviceDetails.find((service) => service.svc_id === 1)
    : null;

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        const folderPath = `users/${userId}/rentalagreements`;

        const response = await axios.post(`${apiUrl}/getPdf`, { folderPath });

        if (response.data.pdfUrl && response.data.pdfUrl.length > 0) {
          // Filter files to get only those related to the current propertyId
          const filteredFiles = response.data.pdfUrl.filter((file) =>
            file.includes(`RRA_${propertyId}`)
          );

          if (filteredFiles.length > 0) {
            setPdfUrl(filteredFiles[filteredFiles.length - 1]); // Get the latest uploaded file
          } else {
            setPdfUrl(null); // No matching file found
          }
        } else {
          setPdfUrl(null);
        }
      } catch (error) {
        console.error("Error fetching PDF URL:", error);
      }
    };

    fetchPdfUrl();
  }, [userId, propertyId]);

  // Fetch only once when userId or propertyId changes

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true); // Set loading to true when upload starts

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("user_id", userId);
      formData.append("prop_id", propertyId);

      const response = await axios.post(`${apiUrl}/uploadPdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("File uploaded successfully!");
      console.log("Upload response:", response.data);

      // Directly set the PDF URL using the response from uploadPdf API
      const uploadedFileUrl =
        "https://rufrents3.s3.ap-south-1.amazonaws.com/" +
        response.data.folderPath;
      setPdfUrl(uploadedFileUrl); // Update the PDF URL
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setLoading(false); // Set loading to false when upload is complete or fails
    }
  };

  const handleClaim = async () => {
    const isConfirmed = window.confirm(
      "This is the final agreement. After claiming, you will not be able to edit or upload again. Are you sure you want to proceed?"
    );

    if (isConfirmed) {
      try {
        const requestBody = {
          receipt_id: receiptId,
          svc_id: 1,
          package_id: 1,
          svc_info: { url: pdfUrl }, // Use the pdfUrl from state
          claimed_by: userId,
          claimer_cat: "tenant",
        };

        const response = await axios.post(
          `${apiUrl}/claimservices`,
          requestBody
        );
        console.log("response from claim", response);

        alert("Claim submitted successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error claiming service:", error);
        alert("Failed to claim service. Please try again.");
      }
    }
  };

  return (
    <div
      className={`max-w-md mx-auto p-4 sm:p-2 ${tailwindStyles.whiteCard} min-h-[210px] max-h-[210px] rounded-lg shadow-lg relative`}
    >
      <div className="flex items-center justify-between px-1 py-2 rounded-t-lg flex-nowrap gap-1 sm:gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg shrink-0">
            <img
              src="/Package/Package_Image_1.png"
              alt="Rental Agreement"
              className="w-7 h-7"
            />
          </div>
          <h3 className={` font-semibold ${tailwindStyles.heading}`}>
            Rental Agreement
          </h3>
        </div>
        <span
          className={`inline-flex items-center px-3 md:px-2 lg:px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            serviceStatus === "Requested"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {serviceStatus}
        </span>
      </div>

      {serviceStatus !== "Requested" && (
        <div className="mb-4">
          <input
            type="file"
            className="mb-2 text-gray-500"
            onChange={handleFileChange}
            disabled={serviceStatus === "Requested"}
            accept="application/pdf"
          />
          <button
            onClick={handleUpload}
            disabled={!file || serviceStatus === "Requested" || isloading}
            className={`${tailwindStyles.secondaryButton}  ${
              !file || serviceStatus === "Requested" || isloading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isloading ? (
              <div>
                <ThreeDots
                  height="50"
                  width="50"
                  radius="9"
                  color="white"
                  ariaLabel="three-dots-loading"
                  visible={true}
                />
              </div>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>
      )}

      {pdfUrl && (
        <div className="mb-1">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#001433] underline"
          >
            View Uploaded File
          </a>
        </div>
      )}

      {serviceStatus !== "Requested" && (
        <button
          onClick={handleClaim}
          disabled={!pdfUrl}
          className={`w-full py-2 mt-1 sm:py-1 rounded-md font-semibold transition duration-300 focus:outline-none ${
            pdfUrl
              ? `${tailwindStyles.secondaryButton}`
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Claim
        </button>
      )}

      {serviceStatus === "Requested" && (
        <button
          // onClick={() => { console.log("link", rentaldetails), window.open(rentaldetails.svc_info.url, '_blank', 'noopener noreferrer') }}
          onClick={() => {
            console.log("link", rentaldetails),
              window.open(pdfUrl, "_blank", "noopener noreferrer");
          }}
          className={`${tailwindStyles.secondaryButton}`}
        >
          Download
        </button>
      )}
    </div>
  );
};

export default RentalAgreement;
