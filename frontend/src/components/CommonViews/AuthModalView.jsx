

// Latest authmodal login page first 


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
// import { ChevronRight } from "lucide-react";

import {
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";

import { useRoleStore } from "../../store/roleStore";
import useUserListingsStore from "../../store/userListingsStore";
import useActionsListingsStore from "../../store/userActionsListingsStore";
import useTransactionsStore from "../../store/transactionsStore";

import tailwindStyles from "../../utils/tailwindStyles";

const apiUrl = `${import.meta.env.VITE_API_URL}`;
const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

const AuthModal = ({ isOpen, onClose, triggerBy = "/" }) => {
  const { setUserData } = useRoleStore();
  const { fetchUserListings } = useUserListingsStore();
  const { fetchActionsListings } = useActionsListingsStore();
  const { fetchUserTransactions } = useTransactionsStore();

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [confirmMobileNumber, setConfirmMobileNumber] = useState("");
  const [isMobileConfirmed, setIsMobileConfirmed] = useState(false);
  const [isMobileValid, setIsMobileValid] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Default to login page
  const [selectedCountry,

 setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isConfirmDropdownOpen, setConfirmDropdownOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [afterLoginIsMobile, setAfterLoginIsMobile] = useState(false);
  const [afterLoginData, setAfterLoginData] = useState([]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const dropdownRef = useRef(null);
  const confirmDropdownRef = useRef(null);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const data = response.data.map((country) => ({
          name: country.name.common,
          code: country.idd?.root + (country.idd?.suffixes?.[0] || ""),
          flag: country.flags?.png || "",
        }));
        setCountries(data);
        const india = data.find((country) => country.name === "India");
        if (india) setSelectedCountry(india);
      } catch (error) {
        setMessage("Failed to load country data.");
        setMessageType("error");
      }
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        confirmDropdownRef.current &&
        !confirmDropdownRef.current.contains(event.target)
      ) {
        setConfirmDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) setReferralCode(refCode);
  }, [searchParams]);

  const displayMessage = (type, text) => {
    setMessageType(type);
    setMessage(text);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  useEffect(() => {
    if (confirmMobileNumber.length === 10) handleMobileConfirm();
  }, [confirmMobileNumber]);

  const handleMobileConfirm = async () => {
    if (mobileNumber !== confirmMobileNumber) {
      displayMessage("error", "Mobile numbers do not match!");
      setIsMobileValid(false);
      return;
    }
    if (mobileNumber.length !== 10) {
      displayMessage("error", "Please enter a valid 10-digit mobile number!");
      setIsMobileValid(false);
      return;
    }
    try {
      const response = await axios.post(`${apiUrl}/checkMobile`, {
        mobile_no: mobileNumber,
      });
      displayMessage("success", response.data.message);
      setIsMobileValid(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        displayMessage("error", error.response.data.message);
      } else {
        displayMessage(
          "error",
          "Error checking mobile number: " + error.message
        );
      }
      setIsMobileValid(false);
    }
  };

  const handleSignup = async () => {
    if (!name) {
      displayMessage("error", "Please enter your name!");
      return;
    }
    if (password !== confirmPassword) {
      displayMessage("error", "Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = userCredential._tokenResponse.idToken;
      const user = userCredential.user;
      await sendEmailVerification(user);

      displayMessage(
        "success",
        "Verification email sent! Please check your inbox."
      );

      const response = await axios.post(`${apiUrl}/signup`, {
        uid: user.uid,
        email: user.email,
        token: token,
        displayName: name || user.displayName,
        mobile_no: selectedCountry?.code + mobileNumber || user.phoneNumber,
        role_id: 2,
        referredBy: referralCode,
      });

      if (response.status === 201) {
        displayMessage("success", "User registered successfully!");
        setIsLogin(true); // Switch to login after successful signup
      } else {
        displayMessage(
          "error",
          response.data.message || "Signup failed. Please try again."
        );
      }
    } catch (error) {
      displayMessage("error", "Error signing up: " + error.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      displayMessage("error", "Please enter your email and password!");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (!user.emailVerified) {
        displayMessage("error", "Please verify your email before logging in.");
        return;
      }

      const response = await axios.post(`${apiUrl}/login`, {
        token: userCredential._tokenResponse.idToken,
        uid: user.uid,
      });

      const data = response.data;

      if (!data.isMobile) {
        displayMessage("success", "Please Enter Mobile Number");
        setAfterLoginData(data);
        setAfterLoginIsMobile(!data.isMobile);
        // Do not change isLogin here to keep login page
      }
      if (data.token && data.isMobile) {
        displayMessage("success", "User logged in successfully!");
        await setUserData({
          id: data.id,
          role: data.role.toLowerCase(),
          userName: data.username,
        });

        await fetchActionsListings(data.id);
        await fetchUserListings(data.id);
        await fetchUserTransactions(data.id);

        Cookies.set(jwtSecretKey, data.token, { expires: 1 });

        if (triggerBy) {
          navigate(`/user/${triggerBy}`);
        }
        onClose();
      }
    } catch (error) {
      displayMessage("error", `Login failed: ${error.message}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      displayMessage(
        "error",
        "Please enter your email address to reset your password!"
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      displayMessage("success", "Password reset email sent!");
    } catch (error) {
      displayMessage(
        "error",
        `Error sending password reset email: ${error.message}`
      );
    }
  };

  const fullMobileNumber = selectedCountry
    ? selectedCountry.code + mobileNumber
    : "";

  const handleGoogleAuth = async () => {
    let num1 = "";
    if (fullMobileNumber.length > 6) num1 = fullMobileNumber;
    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const response = await axios.post(`${apiUrl}/g_login`, {
        uid: user.uid,
        email: user.email,
        displayName: name || user.displayName,
        mobile_no: num1 || user.phoneNumber,
        role_id: 2,
        token: result._tokenResponse.idToken,
        referredBy: referralCode,
      });
      const data = response.data;

      if (!data.isMobile) {
        displayMessage("success", "Please Enter Mobile Number");
        setAfterLoginData(data);
        setAfterLoginIsMobile(!data.isMobile);
        // Do not change isLogin to keep login page
      }
      if (data.token && data.isMobile) {
        displayMessage("success", "User signed in with Google successfully!");
        await setUserData({
          id: data.id,
          role: data.role.toLowerCase(),
          userName: data.username,
        });

        await fetchUserListings(data.id);
        await fetchActionsListings(data.id);
        await fetchUserTransactions(data.id);
        Cookies.set(jwtSecretKey, data.token, { expires: 1 });

        if (triggerBy) {
          navigate(`/user/${triggerBy}`);
        }
        onClose();
      }
    } catch (error) {
      displayMessage("error", `Error signing in with Google: ${error.message}`);
    }
  };

  const submitMobileNumber = async () => {
    const response = await axios.put(`${apiUrl}/addMobileNumber`, {
      id: afterLoginData.id,
      mobile_no: fullMobileNumber,
    });
    if (response.status) {
      setAfterLoginIsMobile(false);
      if (afterLoginData.token) {
        displayMessage("success", "User signed in successfully!");
        await setUserData({
          id: afterLoginData.id,
          role: afterLoginData.role.toLowerCase(),
          userName: afterLoginData.username,
        });

        await fetchUserListings(afterLoginData.id);
        await fetchActionsListings(afterLoginData.id);
        await fetchUserTransactions(afterLoginData.id);
        Cookies.set(jwtSecretKey, afterLoginData.token, { expires: 1 });
        if (triggerBy) {
          navigate(`/user/${triggerBy}`);
        }
        onClose();
      }
    }
  };

  const handleContinue = () => {
    if (!isMobileValid) {
      displayMessage("error", "Please Enter Mobile Number");
      return;
    }
    setIsMobileConfirmed(true);
    setIsLogin(false); // Show signup form after mobile confirmation
  };

  const handleSwitch = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMobileNumber("");
    setConfirmMobileNumber("");
    setIsMobileConfirmed(false);
    setIsMobileValid(false);
    if (isLogin) {
      setIsLogin(false);
      // When switching to signup, show mobile number page first
    } else {
      setIsLogin(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      setIsLogin(true); // Ensure login page is shown when modal opens
      setIsMobileConfirmed(false);
      setAfterLoginIsMobile(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setMobileNumber("");
      setConfirmMobileNumber("");
      setIsMobileValid(false);
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50">
      <div
        className={`relative mx-5 w-full max-w-xl lg:max-w-2xl md:bg-white rounded-lg shadow-md overflow-hidden transition-all duration-700 ease-in-out flex flex-col md:flex-row ${
          isLogin ? "flex-row-reverse" : ""
        }`}
      >
        <div className="w-full bg-[#001433] h-24 md:min-h-[440px] md:rounded-r-full md:w-1/2 flex items-center justify-center p-6">
          <div>
            <div className="flex flex-col items-center justify-center">
              <img src="/RUFRENT6.png" alt="login" className={`h-12`} />
            </div>
          </div>
        </div>
        <div className="relative bg-white w-full md:w-1/2 p-6 flex flex-col justify-center items-center">
          {message && (
            <div
              className={`${tailwindStyles.paragraph}
                absolute top-2 w-[calc(100%-20px)] mb-4 p-2 text-center rounded ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {message}
            </div>
          )}
          {((!isLogin && !isMobileConfirmed) || afterLoginIsMobile) && (
            <div className="flex flex-col items-center">
              <img
                src="/MOBILE.png"
                className="w-10 h-10 mb-2"
                alt="mobile_icon"
              />
              <h2 className={`${tailwindStyles.heading_2} mb-2`}>
                Mobile Number
              </h2>
              <div className="mb-4 min-w-[240px] lg:min-w-[280px]">
                <div className="flex items-center space-x-2 mb-2">
                  <CountryCodeDropdown
                    dropdownRef={dropdownRef}
                    isDropdownOpen={isDropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    countries={countries}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={`${tailwindStyles.paragraph} w-[70%] px-2 h-8 border rounded-md`}
                    maxLength="10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <CountryCodeDropdown
                    dropdownRef={confirmDropdownRef}
                    isDropdownOpen={isConfirmDropdownOpen}
                    setDropdownOpen={setConfirmDropdownOpen}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    countries={countries}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                  <input
                    type="tel"
                    placeholder="Confirm Mobile Number"
                    value={confirmMobileNumber}
                    onChange={(e) => setConfirmMobileNumber(e.target.value)}
                    className={`${tailwindStyles.paragraph} w-[70%] px-2 h-8 border rounded-md`}
                    maxLength="10"
                  />
                </div>
              </div>
              {afterLoginIsMobile ? (
                <button
                  className={`${tailwindStyles.secondaryButton}`}
                  onClick={submitMobileNumber}
                >
                  Submit
                </button>
              ) : (
                <button
                  className={`${tailwindStyles.secondaryButton}`}
                  // className="flex items-center justify-center bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                  onClick={handleContinue}
                >
                 Continue
                </button>
              )}
              {!afterLoginIsMobile && (
                <button
                  className={`${tailwindStyles.heading_3} mt-2`}
                  onClick={handleSwitch}
                >
                  Already have an account?{" "}
                  <span className="text-[#ffc107]">Login</span>
                </button>
              )}
            </div>
          )}
          {(isLogin || (isMobileConfirmed && !isLogin)) && (
            <div>
              <div className="flex flex-col items-center">
                {isLogin ? (
                  <img
                    src="/LOGIN.png"
                    className="w-10 h-10 mb-2"
                    alt="login_icon"
                  />
                ) : (
                  <img
                    src="/SIGNUP.png"
                    className="w-10 h-10 mb-2"
                    alt="signup_icon"
                  />
                )}
                <h2 className={`${tailwindStyles.heading_2} mb-2`}>
                  {isLogin ? "Welcome" : "Create Account"}
                </h2>
              </div>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${tailwindStyles.paragraph} w-full px-2 border rounded-md h-8 mb-2`}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${tailwindStyles.paragraph} w-full px-2 border rounded-md h-8 mb-2`}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${tailwindStyles.paragraph} w-full px-2 border rounded-md h-8 mb-2`}
              />
              {!isLogin && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${tailwindStyles.paragraph} w-full px-2 border rounded-md h-8 mb-2`}
                />
              )}
              {isLogin && (
                <div className="w-full flex justify-between mb-2">
                  <div
                    className={`${tailwindStyles.paragraph} flex items-center space-x-2`}
                  >
                    <input
                      onClick={togglePasswordVisibility}
                      id="show"
                      type="checkbox"
                    />
                    <label htmlFor="show">Show Password</label>
                  </div>
                  <span
                    className={`text-[10px] lg:text-xs 2xl:text-md text-blue-500 cursor-pointer hover:underline transition-colors duration-300`}
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <button
                  className={`${tailwindStyles.secondaryButton} mt-2`}
                  onClick={isLogin ? handleLogin : handleSignup}
                >
                  {isLogin ? "Login" : "Sign Up"}
                </button>
                <button
                  className={`${tailwindStyles.heading_3}`}
                  onClick={handleSwitch}
                >
                  {isLogin ? (
                    <>
                      Don't have an account?{" "}
                      <span className="text-[#ffc107]">Sign up</span>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <span className="text-[#ffc107]">Login</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center my-2">
                <div className="line flex-1 h-0.5 bg-gray-200"></div>
                <span className="mx-2 pb-1 text-gray-400">or</span>
                <div className="line flex-1 h-0.5 bg-gray-200"></div>
              </div>
              <div>
                <button
                  className={`border rounded-md h-8 w-full flex items-center justify-center gap-2`}
                  onClick={handleGoogleAuth}
                >
                  <img
                    src="/GOOGLE.png"
                    alt="Google Logo"
                    className="w-5 h-5 bg-white rounded-full"
                  />
                  <p className={`${tailwindStyles.paragraph_b}`}>
                    Continue With Google
                  </p>
                </button>
              </div>
            </div>
          )}
          <div
            onClick={onClose}
            className="absolute flex items-center justify-center top-4 right-4 bg-[#001433] w-7 h-7 rounded-full"
          >
            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-300">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;


// CountryCodeDropdown.jsx

export const CountryCodeDropdown = ({
  dropdownRef,
  isDropdownOpen,
  setDropdownOpen,
  selectedCountry,
  setSelectedCountry,
  countries,
  searchTerm,
  setSearchTerm,
}) => {
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-[30%]" ref={dropdownRef}>
      <button
        className="w-full px-2 h-8 border rounded flex items-center justify-between bg-white text-sm md:text-md"
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        {selectedCountry ? (
          <div className="flex items-center space-x-1">
            <img
              src={selectedCountry.flag}
              alt={selectedCountry.name}
              className="w-5 h-5"
            />
            <span className={`${tailwindStyles.paragraph} truncate`}>
              {selectedCountry.code}
            </span>
          </div>
        ) : (
          <span>Select</span>
        )}
      </button>
      {isDropdownOpen && (
        <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg w-full min-w-[100px]">
          <ul className="max-h-60 overflow-y-auto">
            <li className="p-2">
              <input
                type="text"
                placeholder="Search countries"
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </li>
            {filteredCountries.map((country, index) => (
              <li
                key={index}
                className="p-2 flex items-center cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedCountry(country);
                  setDropdownOpen(false);
                }}
              >
                <img
                  src={country.flag}
                  alt={country.name}
                  className="w-5 h-5 mr-2"
                />
                <span className={`${tailwindStyles.paragraph} truncate`}>
                  {country.name} {country.code}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
