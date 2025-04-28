import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";

import { fetchFiltersData } from "../../../services/newapiservices";
import useFilterStore from "../../../store/filterStore";
import useListingStore from "../../../store/listingsStore";

import tailwindStyles from "../../../utils/tailwindStyles";
import Dropdown from "./hooks/dropdown";

import "../../styles/animations.css";
import CompactCallbackForm from "./Reqcallback";

const ContentOverlay = () => {
  const navigate = useNavigate();
  const [searchClicked, setSearchClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    cities: [],
    builders: [],
    communities: [],
    bhks: [],
    availability: [],
  });
  const [dataFromDB, setDataFronDB] = useState([]);
  const [city, setCity] = useState("");
  const [builder, setBuilder] = useState("");
  const [community, setCommunityType] = useState("");
  const [hometype, setBhk] = useState([]);
  const [availability, setAvailability] = useState([]);
  const { setFilterData, filterData } = useFilterStore();
  const { setCurrentPage } = useListingStore();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetchFiltersData();
        setDataFronDB(response.data.result);
        setData((prev) => ({
          ...prev,
          cities: response.data.result.cities,
          bhks: response.data.result.homeTypes,
          availability: response.data.result.availability,
        }));
        setLoading(false);
      } catch (error) {
        console.error("Filters Fetching Failed", error);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    if (city) {
      const builders = dataFromDB.builders.filter(
        (eachBuilder) => eachBuilder.city_name == city
      );
      setData((prev) => ({ ...prev, builders }));
    }
  }, [city]);

  useEffect(() => {
    if (builder) {
      const communities = dataFromDB.communities.filter(
        (eachCommunity) => eachCommunity.builder_name == builder
      );
      setData((prev) => ({ ...prev, communities }));
    }
  }, [builder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearchClicked(true);
    await setCurrentPage(1);

    const queryParams = new URLSearchParams();

    if (city) queryParams.append("city", city);
    if (builder) queryParams.append("builders", builder);
    if (community) queryParams.append("community", community);
    if (hometype.length > 0) queryParams.append("hometype", hometype[0]);
    if (availability.length > 0)
      queryParams.append("availability", availability[0]);

    navigate(`/property/rent?${queryParams.toString()}`);
  };

  return (
    <>
      <div className="relative w-full flex flex-col items-center justify-center px-6 py-6 md:py-12 lg:py-20 bg-opacity-70">
        <div className="text-center text-white">
          <h1 className={`${tailwindStyles.heading_1} text-[#ffc107] mb-4`}>
            Rufrent - Your Smart Rental Platform ONLY for Premium Gated Communities
          </h1>
          <h1 className={`${tailwindStyles.heading_3} text-gray-200 mb-4`}>
            Find Your Perfect Rental in a Premium Gated Community in Hyderabad
             {/* – Start Here
            <span className="inline-block animate-pointing-finger text-2xl ml-2">
              👇
            </span> */}
          </h1>
        </div>
        <div className="relative z-10 p-4 rounded-md md:rounded-2xl shadow-lg bg-white text-[#001433] w-full md:w-auto">
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <form
              className="flex flex-col items-center gap-3"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-3">
                <Dropdown
                  label="City"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (e.target.value === "") {
                      setData((prev) => ({
                        ...prev,
                        builders: [],
                        communities: [],
                      }));
                      setBuilder("");
                      setCommunityType("");
                    }
                  }}
                  options={data.cities}
                />
                <Dropdown
                  label="Builders"
                  value={builder}
                  onChange={(e) => {
                    setBuilder(e.target.value);
                    if (e.target.value === "") {
                      setData((prev) => ({
                        ...prev,
                        communities: [],
                      }));
                      setCommunityType("");
                    }
                  }}
                  options={data.builders}
                />
                <div className="col-span-2 md:col-span-1">
                  <Dropdown
                    label="Communities"
                    value={community}
                    onChange={(e) => setCommunityType(e.target.value)}
                    options={data.communities}
                  />
                </div>
              </div>
              <div className="flex w-full md:w-3/4 gap-3">
                <Dropdown
                  label="BHK"
                  value={hometype[0]}
                  onChange={(e) => setBhk([e.target.value])}
                  options={data.bhks}
                />
                <Dropdown
                  label="Availability"
                  value={availability[0]}
                  onChange={(e) => setAvailability([e.target.value])}
                  options={data.availability}
                />
                <button
                  type="submit"
                  className={`${
                    searchClicked
                      ? "bg-gray-500 text-white"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  } px-4 py-0 text-sm font-semibold rounded-full text-center hidden md:block`}
                  disabled={searchClicked}
                >
                  {searchClicked ? (
                    <ThreeDots
                      height="24"
                      width="24"
                      color="white"
                      ariaLabel="loading"
                    />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              <button
                type="submit"
                className={`${
                  searchClicked
                    ? "bg-gray-500 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } px-4 py-1 text-sm font-semibold text-center block md:hidden w-full md:w-auto rounded-md transition duration-300`}
                disabled={searchClicked}
              >
                {searchClicked ? (
                  <div className="flex justify-center">
                    <ThreeDots
                      height="24"
                      width="24"
                      color="white"
                      ariaLabel="loading"
                    />
                  </div>
                ) : (
                  "Search"
                )}
              </button>
            </form>
          )}
        </div>
        <div className="mt-10">
          <CompactCallbackForm />
        </div>
      </div>

      {/* <div className="overflow-hidden w-full bg-black md:rounded-b-3xl">
        <p
          className={`${tailwindStyles.heading_3} font-extrabold py-1 text-gray-200 textmove`}
        >
          ✨ Every Deal Closure on Rufrent Comes with a Shine – Get a Free Deep
          Cleaning! ✨
        </p>
      </div> */}
    </>
  );
};

export default ContentOverlay;
