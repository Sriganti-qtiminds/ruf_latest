// --------------------------- POST WORKING ---------------------

import React, { useState } from "react";
import TabNavigation from "../../../components/CommonViews/TabNavigation";
import { studioTailwindStyles } from "../../../utils/studioTailwindStyles";
import { Phone, User } from "lucide-react";
import { postCallbackDetails } from "../../../services/studioapiservices"; // Assuming the service is in a services folder

const hero = {
  title: "Transform Your Space",
  description:
    "We create personalized interior designs that reflect your unique style and elevate your living experience. From concept to completion, we're with you every step of the way.",
  form: {
    fields: [
      {
        label: "Full Name",
        type: "text",
        id: "name",
        placeholder: "Enter your name",
        icon: <User className="text-gray-400 text-base" />,
      },
      {
        label: "Phone Number",
        type: "tel",
        id: "phone",
        placeholder: "Enter your phone number",
        icon: <Phone className="text-gray-400 text-base" />,
      },
    ],
    submit: "Request a Call Back",
  },
};

const Hero = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?\d{10,12}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await postCallbackDetails(formData.name, formData.phone);
      if (response.status === 200 || response.status === 201) {
        setSubmitStatus({
          type: "success",
          message: "Your request has been submitted successfully!",
        });
        setFormData({ name: "", phone: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit request. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="hero"
      className="w-[100vw] text-center md:w-[calc(100vw-99px)] flex flex-col items-center bg-cover bg-center bg-no-repeat md:rounded-b-3xl"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(26, 31, 61, 0.9), rgba(26, 31, 61, 0.7)), url("/Studio/HERO.png")`,
      }}
    >
      <TabNavigation />
      <div className="container mx-auto px-6 py-10">
        <div className="w-full flex flex-col items-center text-center">
          <h1 className={`${studioTailwindStyles.heading_1} text-white mb-4`}>
            {hero.title}
          </h1>
          <p
            className={`${studioTailwindStyles.paragraph_1} text-gray-200 mb-8 max-w-2xl`}
          >
            {hero.description}
          </p>
          <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-[16px] p-6 md:p-8">
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col md:flex-row md:items-end md:gap-4 space-y-4 md:space-y-0">
                {hero.form.fields.map((field) => (
                  <div key={field.id} className="flex-1">
                    <label
                      htmlFor={field.id}
                      className="block text-gray-200 mb-1 text-sm font-medium transition-colors duration-300 peer-focus:text-[#E07A5F] peer-placeholder-shown:text-gray-200"
                    >
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-8 h-full">
                        {field.icon}
                      </div>
                      <input
                        type={field.type}
                        id={field.id}
                        className={`w-full pl-10 pr-3 py-2 text-white placeholder-gray-400 text-sm bg-white/5 border ${
                          errors[field.id]
                            ? "border-red-500"
                            : "border-white/20"
                        } rounded-lg shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 focus:border-[#E07A5F] focus:shadow-[0_0_0_3px_rgba(224,122,95,0.2),inset_2px_2px_5px_rgba(0,0,0,0.1)] focus:outline-none`}
                        placeholder={field.placeholder}
                        value={formData[field.id]}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        aria-invalid={errors[field.id] ? "true" : "false"}
                        aria-describedby={
                          errors[field.id] ? `${field.id}-error` : undefined
                        }
                      />
                      {errors[field.id] && (
                        <p
                          id={`${field.id}-error`}
                          className="mt-1 text-red-500 text-xs"
                        >
                          {errors[field.id]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  className={`w-full md:w-auto md:px-6 text-white py-2 font-medium whitespace-nowrap mt-4 bg-gradient-to-br from-[#E07A5F] to-[#7C9A92] rounded-lg transition-all duration-300 ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:translate-y-[-2px] hover:scale-105 hover:shadow-[0_10px_15px_-3px_rgba(224,122,95,0.3)]"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : hero.form.submit}
                </button>
              </div>
              {submitStatus && (
                <p
                  className={`mt-4 text-sm ${
                    submitStatus.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                  role="alert"
                >
                  {submitStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
