

// export default useFilterStore;

import { create } from "zustand";

import { fetchFiltersData } from "../services/newapiservices";

const useFilterStore = create((set) => ({
  allData: [],

  // Dropdown Data State
  dropdownData: {
    cityList: [],
    builderList: [],
    communityList: [],
    bedroomTypes: [],
    propertyDescriptions: [],
    availability: [],
    tenanttype: [],
  },

  // Actions

  setDropdownData: (data) =>
    set((state) => ({
      dropdownData: { ...state.dropdownData, ...data },
    })),

  fetchFilters: async () => {
    try {
      const resp = await fetchFiltersData();

      set((state) => ({
        allData: resp.data.result,

        dropdownData: {
          ...state.dropdownData,
          cityList: resp.data.result.cities,
          builderList: resp.data.result.builders,
          communityList: resp.data.result.communities,
          bedroomTypes: resp.data.result.homeTypes,
          propertyDescriptions: resp.data.result.propDesc,
          availability: resp.data.result.availability,
          tenanttype: resp.data.result.tenantTypes,
        },
      }));
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  },

  fetchBuildersList: async (cityId) => {
    try {
      set((state) => {
        const builders =
          state.allData?.builders?.filter(
            (eachBuilder) => eachBuilder.city_name === cityId
          ) || [];

        return {
          dropdownData: { ...state.dropdownData, builderList: builders },
        };
      });
    } catch (error) {
      console.error("Error fetching builders:", error);
    }
  },

  fetchCommunitiesList: async (builderId) => {
    try {
      set((state) => {
        const communities =
          state.allData?.communities?.filter(
            (eachBuilder) => eachBuilder.builder_name === builderId
          ) || [];

        return {
          dropdownData: { ...state.dropdownData, communityList: communities },
        };
      });
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  },
  // Add reset action
  resetStore: () => {
    set(
      {
        dropdownData: {
          cityList: [],
          builderList: [],
          communityList: [],
          bedroomTypes: [],
          propertyDescriptions: [],
          availability: [],
          tenanttype: [],
        },
      },
      true
    );
  },
}));

export default useFilterStore;
