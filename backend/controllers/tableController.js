const DatabaseService = require("../utils/service"); // Correct import path
const db = require("../config/db"); // Database connection object
const { propertyFields, fieldNames1 } = require("../utils/joins");
require("dotenv").config();
const BaseController = require("../utils/baseClass"); // Adjust the path as needed
const S3Service = require("../utils/s3"); // Assuming s3Service is

const { S3Client } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const redis = require("../config/redis"); // Import configuration
const { v4: uuidv4 } = require("uuid");
const paginate = require("../utils/pagination");
const TransactionController = require("../utils/transaction");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

const credentials = JSON.parse(process.env.GOOGLE_CREDS);
const client = new BetaAnalyticsDataClient({ credentials });

class PropertyController extends BaseController {
  async getAllCommunityImg(req, res) {
    try {
      const allImages = await S3Service.getAllCommunityImg();
      return res.status(200).json({
        success: true,
        data: allImages,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch community images.",
      });
    }
  }

  async createProperty(req, res) {
    try {
      let propertyData = JSON.parse(req.body.propertyData);

      let connection;

      try {
        // Step 1: Get database connection and start transaction
        connection = await TransactionController.getConnection();
        await TransactionController.beginTransaction(connection);

        // Step 2: Generate a unique UUID for the property
        let propertyUid;
        let isUnique = false;

        while (!isUnique) {
          propertyUid = uuidv4();
          const existingProperty = await this.dbService.getRecordsByFields(
            "dy_property",
            "uid",
            `uid = '${propertyUid}'`
          );
          if (existingProperty.length === 0) {
            isUnique = true;
          }
        }

        propertyData.uid = propertyUid; // Add UUID to property data

        // Step 3: Insert property data into the database
        await this.dbService.addNewRecord(
          "dy_property",
          Object.keys(propertyData).join(", "),
          Object.values(propertyData)
            .map((val) => db.escape(val))
            .join(", "),
          connection
        );

        // Step 4: Upload property images to S3
        let folderUrl = await S3Service.uploadImages(
          req.files,
          propertyUid,
          "properties"
        );

        // Step 5: Commit the transaction
        await TransactionController.commitTransaction(connection);

        // Respond with success
        return res.status(201).json({
          message: "Property created successfully",
          propertyUid,
        });
      } catch (error) {
        console.error("Error creating property:", error.message);

        // Rollback transaction on error
        if (connection) {
          await TransactionController.rollbackTransaction(
            connection,
            error.message
          );
        }

        // Respond with error
        return res.status(500).json({
          error: "An error occurred while creating the property.",
          details: error.message,
        });
      } finally {
        // Step 6: Release the database connection
        if (connection) {
          await TransactionController.releaseConnection(connection);
        }
      }
    } catch (error) {
      // Handle errors outside transaction scope
      return res.status(500).json({
        error: "Error parsing property data.",
        details: error.message,
      });
    }
  }

  async showPropDetails(req, res) {
    try {
      const {
        page = 1,
        limit = 6,
        property_id,
        city,
        builders,
        community,
        hometype,
        propertydescription,
        tenanttype,
        eat_pref,
        availability,
      } = req.query;

      const sanitizedPage = Math.max(1, parseInt(page, 10));
      const sanitizedLimit = Math.max(1, parseInt(limit, 10));
      const offset = (sanitizedPage - 1) * sanitizedLimit;
      const redisKey = "properties";

      let allProperties = await redis.get(redisKey);

      if (!allProperties) {
        const tableName = "dy_property dy";
        const joinClauses = `${propertyFields}`;
        const fieldNames = `${fieldNames1}`;
        allProperties = await this.dbService.getJoinedData(
          tableName,
          joinClauses,
          fieldNames,
          `dy.current_status = 3 ORDER BY dy.id DESC`
        );
        await redis.set(redisKey, JSON.stringify(allProperties));
        await redis.expire(redisKey, 21600);
      } else {
        allProperties = JSON.parse(allProperties);
      }

      let filteredProperties = [];
      let similarResults = [];
      let similarMessage = "";
      // **Community + property_id**
      if (community && property_id) {
        // Step 1: Properties of the selected community with the selected property_id
        filteredProperties = allProperties.filter(
          (property) =>
            property.community_name == community && property.uid == property_id
        );
        // Step 2: Properties of the same community with other property_id
        let communityOtherProperties = allProperties.filter(
          (property) =>
            property.community_name == community && property.uid != property_id
        );
        // Step 3: Other properties in the same city by the same builder
        let sameBuilderOtherProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name == builders &&
            property.community_name != community &&
            property.uid != property_id
        );
        // Step 4: Other properties in the same city by other builders
        let otherBuildersProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name != builders &&
            property.community_name != community &&
            property.uid != property_id
        );
        // Merging the similar results in order
        similarResults = [
          ...communityOtherProperties,
          ...sameBuilderOtherProperties,
          ...otherBuildersProperties,
        ];

        similarMessage = "Showing similar properties based on community name.";
      }
      // **Community + hometype**
      else if (community && hometype) {
        // Step 1: Properties of the selected community with the selected hometype type
        filteredProperties = allProperties.filter(
          (property) =>
            property.community_name == community &&
            hometype.includes(String(property.home_type))
        );

        // Step 2: Properties of the same community with other hometype types
        let communityOtherhometype = allProperties.filter(
          (property) =>
            property.community_name == community &&
            !hometype.includes(String(property.home_type))
        );

        // Step 3: Other properties in the same city by the same builder
        let sameBuilderOtherProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name == builders &&
            property.community_name != community &&
            hometype.includes(String(property.home_type))
        );

        // Step 4: Other properties in the same city by other builders
        let otherBuildersProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name != builders &&
            hometype.includes(String(property.home_type))
        );

        // Merging the similar results in order
        similarResults = [
          ...communityOtherhometype,
          ...sameBuilderOtherProperties,
          ...otherBuildersProperties,
        ];

        similarMessage =
          "Showing similar properties based on hometype type, same community, same builder, and other builders in the same city.";
      }
      // **Builder + hometype**
      else if (builders && hometype) {
        // Step 1: Properties of the selected builder with the selected hometype type
        filteredProperties = allProperties.filter(
          (property) =>
            property.builder_name == builders &&
            hometype.includes(String(property.home_type))
        );

        // Step 2: Properties of the same builder with other hometype types
        let builderOtherHometype = allProperties.filter(
          (property) =>
            property.builder_name == builders &&
            !hometype.includes(String(property.home_type))
        );

        // Step 3: Other properties in the same city with the selected hometype but different builders
        let otherBuildersSameHometype = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name != builders &&
            hometype.includes(String(property.home_type))
        );

        // Step 4: Other properties in the same city with different hometype types and different builders
        let otherBuildersOtherHometype = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name != builders &&
            !hometype.includes(String(property.home_type))
        );

        // Merging the similar results in order
        similarResults = [
          ...builderOtherHometype,
          ...otherBuildersSameHometype,
          ...otherBuildersOtherHometype,
        ];

        similarMessage =
          "Showing similar properties based on hometype type, same builder, and other builders in the same city.";
      }

      // **City + hometype**
      else if (city && hometype) {
        // Step 1: Properties in the selected city with the selected hometype
        filteredProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            hometype.includes(String(property.home_type))
        );

        // Step 2: Properties in the same city with other hometype types
        let cityOtherHometype = allProperties.filter(
          (property) =>
            property.city_name == city &&
            !hometype.includes(String(property.home_type))
        );

        // Step 3: Properties in other cities with the selected hometype
        let otherCitiesSameHometype = allProperties.filter(
          (property) =>
            property.city_name != city &&
            hometype.includes(String(property.home_type))
        );

        // Step 4: Properties in other cities with other hometype types
        let otherCitiesOtherHometype = allProperties.filter(
          (property) =>
            property.city_name != city &&
            !hometype.includes(String(property.home_type))
        );

        // Merging the similar results in order
        similarResults = [
          ...cityOtherHometype,
          ...otherCitiesSameHometype,
          ...otherCitiesOtherHometype,
        ];

        similarMessage =
          "Showing similar properties based on hometype type in the same city and other cities.";
      }
      // **Community + propertydescription**
      else if (community && propertydescription) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.community_name == community &&
            property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        let otherPropertiesSameCommunity = allProperties.filter(
          (property) =>
            property.community_name == community &&
            !property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        let sameBuilderOtherCommunities = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name == builders &&
            property.community_name != community &&
            property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        similarResults = [
          ...otherPropertiesSameCommunity,
          ...sameBuilderOtherCommunities,
        ];
        similarMessage =
          "Showing similar properties based on property description for the same community and other communities under the same builder.";
      }

      // **Builder + propertydescription**
      else if (builders && propertydescription) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.builder_name == builders &&
            property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        let otherPropertiesSameBuilder = allProperties.filter(
          (property) =>
            property.builder_name == builders &&
            !property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        let sameCityOtherBuilders = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name != builders &&
            property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        similarResults = [
          ...otherPropertiesSameBuilder,
          ...sameCityOtherBuilders,
        ];
        similarMessage =
          "Showing similar properties based on property description for the same builder and other builders in the city.";
      }

      // **City + propertydescription**
      else if (city && propertydescription) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        let otherPropertiesSameCity = allProperties.filter(
          (property) =>
            property.city_name == city &&
            !property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        let otherCitiesSameDescription = allProperties.filter(
          (property) =>
            property.city_name != city &&
            property.property_description
              .toLowerCase()
              .includes(propertydescription.toLowerCase())
        );

        similarResults = [
          ...otherPropertiesSameCity,
          ...otherCitiesSameDescription,
        ];
        similarMessage =
          "Showing similar properties based on property description in the same city and other cities.";
      }

      // **Community + availability**
      else if (community && availability) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.community_name == community &&
            availability.includes(String(property.available_date))
        );

        let communityOtherAvailability = allProperties.filter(
          (property) =>
            property.community_name == community &&
            !availability.includes(String(property.available_date))
        );

        let sameBuilderOtherProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name == builders &&
            property.community_name != community &&
            availability.includes(String(property.available_date))
        );

        similarResults = [
          ...communityOtherAvailability,
          ...sameBuilderOtherProperties,
        ];
        similarMessage =
          "Showing similar properties based on availability, same community, same builder, and other builders in the city.";
      }
      // **Builder + availability**
      else if (builders && availability) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.builder_name == builders &&
            availability.includes(String(property.available_date))
        );

        let builderOtherAvailability = allProperties.filter(
          (property) =>
            property.builder_name == builders &&
            !availability.includes(String(property.available_date))
        );

        let otherBuildersSameAvailability = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name != builders &&
            availability.includes(String(property.available_date))
        );

        similarResults = [
          ...builderOtherAvailability,
          ...otherBuildersSameAvailability,
        ];
        similarMessage =
          "Showing similar properties based on availability, same builder, and other builders in the city.";
      }

      // **City + availability**
      else if (city && availability) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            availability.includes(String(property.available_date))
        );

        let cityOtherAvailability = allProperties.filter(
          (property) =>
            property.city_name == city &&
            !availability.includes(String(property.available_date))
        );

        let otherCitiesSameAvailability = allProperties.filter(
          (property) =>
            property.city_name != city &&
            availability.includes(String(property.available_date))
        );

        similarResults = [
          ...cityOtherAvailability,
          ...otherCitiesSameAvailability,
        ];
        similarMessage =
          "Showing similar properties based on availability in the same city and other cities.";
      }

      // **Community + Tenant Type
      else if (community && tenanttype) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.community_name == community &&
            tenanttype.includes(String(property.tenant_type))
        );

        let communityOtherTenantType = allProperties.filter(
          (property) =>
            property.community_name == community &&
            !tenanttype.includes(String(property.tenant_type))
        );

        let sameBuilderOtherProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name == builders &&
            property.community_name != community &&
            tenanttype.includes(String(property.tenant_type))
        );

        similarResults = [
          ...communityOtherTenantType,
          ...sameBuilderOtherProperties,
        ];
        similarMessage =
          "Showing similar properties based on tenant type, same community, same builder, and other builders in the city.";
      }

      // **Builder + Tenant Type
      else if (builders && tenanttype) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.builder_name == builders &&
            tenanttype.includes(String(property.tenant_type))
        );

        let builderOtherTenantType = allProperties.filter(
          (property) =>
            property.builder_name == builders &&
            !tenanttype.includes(String(property.tenant_type))
        );

        let otherBuildersSameTenantType = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name != builders &&
            tenanttype.includes(String(property.tenant_type))
        );

        similarResults = [
          ...builderOtherTenantType,
          ...otherBuildersSameTenantType,
        ];
        similarMessage =
          "Showing similar properties based on tenant type, same builder, and other builders in the city.";
      }

      // **City + Tenant Type
      else if (city && tenanttype) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.city_name == city &&
            tenanttype.includes(String(property.tenant_type))
        );

        let cityOtherTenantType = allProperties.filter(
          (property) =>
            property.city_name == city &&
            !tenanttype.includes(String(property.tenant_type))
        );

        similarResults = [...cityOtherTenantType];
        similarMessage = "Showing similar properties based on tenant type.";
      }

      // Primary filtering

      // **Only property id**
      else if (property_id) {
        filteredProperties = allProperties.filter(
          (property) => property.uid == property_id
        );
        let propertywithcommunity = allProperties.filter(
          (property) =>
            property.community_name == filteredProperties[0].community_name
        );
        let propertywithothercommunity = allProperties.filter(
          (property) =>
            property.community_name != filteredProperties[0].community_name
        );
        similarResults = [
          ...propertywithcommunity,
          ...propertywithothercommunity,
        ];
        similarResults = similarResults.sort((a, b) => b.id - a.id);

        similarMessage = "Showing similar properties based on property ID.";
      }

      // **Only availability**
      else if (availability) {
        filteredProperties = allProperties.filter((property) =>
          availability.includes(String(property.available_date))
        );

        similarResults = allProperties.filter(
          (property) => !availability.includes(String(property.available_date))
        );
        similarResults = similarResults.sort(
          (a, b) => b.available_date - a.available_date
        );

        similarMessage = "Showing properties based on availability status.";
      }
      // **Only eating preference**
      else if (eat_pref) {
        filteredProperties = allProperties.filter((property) =>
          eat_pref.includes(String(property.eat_pref))
        );

        similarResults = allProperties.filter(
          (property) => !eat_pref.includes(String(property.eat_pref))
        );
        similarResults = similarResults.sort((a, b) => b.eat_pref - a.eat_pref);

        similarMessage =
          "Showing properties matching the selected eating preference.";
      }
      // **Only tenant type**
      else if (tenanttype) {
        filteredProperties = allProperties.filter((property) =>
          tenanttype.includes(String(property.tenant_type))
        );

        similarResults = allProperties.filter(
          (property) => !tenanttype.includes(String(property.tenant_type))
        );
        similarResults = similarResults.sort(
          (a, b) => b.tenant_type - a.tenant_type
        );

        similarMessage =
          "Showing properties suitable for the selected tenant type.";
      } else if (propertydescription) {
        filteredProperties = allProperties.filter((property) =>
          propertydescription.includes(String(property.prop_desc))
        );
        //similarResults = allProperties.filter(property => property.home_type_id != hometype).sort((property) => property.home_type_id > hometype)

        similarResults = allProperties.filter(
          (property) =>
            !propertydescription.includes(String(property.prop_desc))
        );
        similarResults = similarResults.sort(
          (a, b) => b.prop_desc - a.prop_desc
        );

        similarMessage =
          "Showing properties that match the selected propertydesccription type.";
      } else if (hometype) {
        filteredProperties = allProperties.filter((property) =>
          hometype.includes(property.home_type)
        );
        filteredProperties = filteredProperties.sort(
          (a, b) => b.home_type - a.home_type
        );
        //similarResults = allProperties.filter(property => property.home_type_id != hometype).sort((property) => property.home_type_id > hometype)

        similarResults = allProperties.filter(
          (property) => !hometype.includes(String(property.home_type))
        );
        similarResults = similarResults.sort(
          (a, b) => b.home_type - a.home_type
        );

        similarMessage =
          "Showing properties that match the selected hometype type.";
      } else if (community) {
        filteredProperties = allProperties.filter(
          (property) => property.community_name == community
        );

        similarResults = allProperties.filter(
          (property) =>
            property.city_name == city &&
            property.builder_name == builders &&
            property.community_name != community
        );

        similarMessage =
          "Showing similar properties from the same city and builder.";
      } else if (builders) {
        filteredProperties = allProperties.filter(
          (property) =>
            property.city_name == city && property.builder_name == builders
        );

        similarResults = allProperties.filter(
          (property) =>
            property.city_name == city && property.builder_name != builders
        );

        similarMessage = `Showing similar properties from the same ${city}`;
      } else if (city) {
        console.log("🔍 Applying City filter...");
        filteredProperties = allProperties.filter(
          (property) => property.city_name == city
        );

        similarResults = allProperties.filter(
          (property) => property.city_name != city
        );

        similarMessage = `Showing similar properties from other ${city}`;
      } else {
        filteredProperties = allProperties;
      }

      // Construct final results
      const combinedResults = [...filteredProperties];

      // Insert `similarProperties` only if there are similar properties
      if (similarResults.length > 0) {
        combinedResults.push({
          similarProperties: { message: similarMessage },
        });
        combinedResults.push(...similarResults);
      }

      const totalRecords = combinedResults.length;
      const totalPages = Math.ceil(totalRecords / sanitizedLimit);
      const paginatedProperties = combinedResults.slice(
        offset,
        offset + sanitizedLimit
      );

      // **Fetching additional details**
      const enhancedResults = await Promise.all(
        paginatedProperties.map(async (property) => {
          const amenities = await this.getAmenities(property.community_id);
          //const landmarks = await this.landMarks({ community_id: property.community_id });
          let images = property.uid
            ? await S3Service.getPropertyImages(property.uid)
            : [];
          let defaultImages = property.default_images
            ? await S3Service.getCommunityImages(property.default_images)
            : [];

          return {
            ...property,
            images,
            default_img: defaultImages,
            amenities,
          };
        })
      );

      res.status(200).json({
        message: "Property details fetched successfully",
        pagination: {
          currentPage: sanitizedPage,
          totalPages,
          totalRecords,
          limit: sanitizedLimit,
        },
        count: {
          resultsCount: filteredProperties.length,
          similarCount: similarResults.length,
        },
        results: enhancedResults,
      });
    } catch (error) {
      console.error("Error fetching property details:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching property details.",
        details: error.message,
      });
    }
  }

  async updateProperty(req, res) {
    try {
      let propertyData = JSON.parse(req.body.propertyData);

      const { property_id, removedImages, ...updateFields } = propertyData;
      const newImages = req.files; // Uploaded images

      if (!property_id) {
        return res.status(400).json({ message: "Property ID is required" });
      }

      const S3_BASE_URL = `https://${process.env.AWSS3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

      // **Fetch UID from dy_property**
      let existingProperty = await this.dbService.getRecordsByFields(
        "dy_property",
        "id, uid",
        `id = ${db.escape(property_id)}`
      );

      existingProperty = existingProperty[0] || null;

      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      let { uid } = existingProperty;

      // **If UID is missing, generate a new one and update dy_property**
      if (!uid) {
        uid = uuidv4(); // Generate a new UID
        await this.dbService.updateRecord(
          "dy_property",
          { uid },
          `id = ${db.escape(property_id)}`
        );
      }

      // **Update Property Details (excluding images)**
      if (Object.keys(updateFields).length > 0) {
        await this.dbService.updateRecord(
          "dy_property",
          updateFields,
          `id = ${db.escape(property_id)}`
        );
      }

      // **Set Folder Path using UID**
      let finalPropertyFolderPath = `properties/${uid}/images`;

      // 1️⃣ **Delete Removed Images from S3**
      if (removedImages && removedImages.length > 0) {
        // Convert full URLs to relative S3 keys
        const imagesToDelete = removedImages.map((img) =>
          img.replace(S3_BASE_URL, "")
        );
        await S3Service.deleteImage(imagesToDelete);
      }

      let uploadedImageUrls = [];

      // 2️⃣ **Upload New Images to S3**
      let folderUrl = await S3Service.uploadImages(
        newImages,
        uid,
        "properties"
      );

      return res.status(200).json({
        message: "Property updated successfully",
      });
    } catch (error) {
      console.error("Error updating property:", error);
      res
        .status(500)
        .json({ message: "Error updating property", error: error.message });
    }
  }
  async getAmenities(community_id) {
    try {
      let rediskey = "as_all_community_amenities";
      let amenities = await redis.hget(rediskey, community_id);

      if (!amenities) {
        await this.fetchAndCacheAllAmenities(); // Fetch and cache all amenities if not found
        amenities = await redis.hget(rediskey, community_id);
      }

      return amenities ? JSON.parse(amenities) : {};
    } catch (error) {
      console.error("Error fetching amenities from Redis:", error);
      return {};
    }
  }

  async fetchAndCacheAllAmenities() {
    try {
      let allCommunityAmenities = {};
      const rediskey = "as_all_community_amenities";

      const tableName = `dy_amenities a`;
      const joinClauses = `
              LEFT JOIN st_amenities sa ON a.amenity = sa.id
              LEFT JOIN st_amenity_category sac ON sa.amenity_category_id = sac.id
              LEFT JOIN st_community sc ON a.community = sc.id
          `;
      const fieldNames = `
              sc.id AS community_id, 
              sa.amenity_name,
              sac.amenity_category
          `;

      const allAmenities = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        `1`
      );

      // ✅ Structuring data properly
      allAmenities.forEach((item) => {
        const communityId = item.community_id;
        const category = item.amenity_category;
        const amenity = item.amenity_name;

        if (!allCommunityAmenities[communityId]) {
          allCommunityAmenities[communityId] = {};
        }
        if (!allCommunityAmenities[communityId][category]) {
          allCommunityAmenities[communityId][category] = [];
        }
        allCommunityAmenities[communityId][category].push(amenity);
      });

      // ✅ Store all community amenities in Redis as hash using community_id
      if (Object.keys(allCommunityAmenities).length > 0) {
        await Promise.all(
          Object.entries(allCommunityAmenities).map(
            ([communityId, categories]) =>
              redis.hset(rediskey, communityId, JSON.stringify(categories))
          )
        );
      }

      return allCommunityAmenities;
    } catch (error) {
      console.error("Error fetching and caching amenities:", error);
      return {};
    }
  }

  async userPropDetails(req, res) {
    try {
      const { user_id, property_id, page = 1, limit = 6 } = req.query;

      const sanitizedPage = Math.max(1, parseInt(page, 10));
      const sanitizedLimit = Math.max(1, parseInt(limit, 10));
      const offset = (sanitizedPage - 1) * sanitizedLimit;

      const tableName = "dy_property dy";
      const joinClauses = `
          ${propertyFields}
        `;
      const fieldNames = `${fieldNames1}`;

      const whereClauses = [];

      if (user_id) whereClauses.push(`dy.user_id = ${db.escape(user_id)}`);

      const orderByClause = "ORDER BY dy.id DESC"; // Sort by ID in descending order

      // Fetch data using the DatabaseService
      const results = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        `${whereClauses} ${orderByClause}`
      );

      const paginatedResults = results.slice(offset, offset + sanitizedLimit);
      const totalRecords = results.length;
      const totalPages = Math.ceil(totalRecords / sanitizedLimit);

      // Enhance results with pincode information
      const enhancedResults = await Promise.all(
        paginatedResults.map(async (property) => {
          // Fetch amenities for each property
          const amenities = await this.getAmenities({
            community_id: property.community_id,
          });

          // const landmarks = await this.landMarks({
          //   community_id: property.community_id,
          // });

          let images = [];

          if (property.uid) {
            images = await S3Service.getPropertyImages(property.uid);
          }
          let defaultImages = [];
          if (property.default_images) {
            defaultImages = await S3Service.getCommunityImages(
              property.default_images
            );
          }

          return {
            ...property,
            images,
            default_img: defaultImages,
            amenities,
            //landmarks,
          };
        })
      );

      res.status(200).json({
        message: property_id
          ? `Details for property ID: ${property_id}`
          : `All property details`,
        pagination: {
          currentPage: sanitizedPage,
          totalPages,
          totalRecords,
          limit: sanitizedLimit,
        },
        results: enhancedResults,
      });
    } catch (error) {
      console.error("Error fetching property details:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching property details.",
        details: error.message,
      });
    }
  }

  async filterdata(req, res) {
    try {
      const cacheKey = "filtered_data";

      // For testing - clear cache each time
      await redis.del(cacheKey);

      // Try cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("Serving from cache");
        return res.status(200).json(JSON.parse(cachedData));
      }

      const tables = {
        cities: "st_city",
        builders: "st_builder",
        communities: "st_community",
        homeTypes: "st_home_type",
        availability: "st_availability",
        propDesc: "st_prop_desc",
        tenants: "st_tenant",
      };

      const joins = {
        cities: "",
        builders: `
        LEFT JOIN st_city sc 
          ON st_builder.city_id = sc.id
        INNER JOIN st_community c 
          ON st_builder.id = c.builder_id 
         AND c.rstatus = 1
      `,
        communities: `
        INNER JOIN st_builder sb 
          ON st_community.builder_id = sb.id 
         AND sb.rstatus = 1
      `,
        homeTypes: "",
        availability: "",
        propDesc: "",
        tenants: "",
      };

      const fieldsToFetch = {
        cities: "st_city.id AS id, st_city.name AS name",
        builders: `
        DISTINCT st_builder.id AS id, 
        st_builder.name AS name, 
        st_builder.city_id AS city_id,
        sc.name AS city_name
      `,
        communities: `
        st_community.id AS id, 
        st_community.name AS name, 
        st_community.builder_id, 
        sb.name AS builder_name
      `,
        homeTypes: "id, home_type AS name",
        availability: "id, available AS name",
        propDesc: "id, prop_desc AS name",
        tenants: "id, tenant_type AS name",
      };

      const data = await Promise.all(
        Object.keys(tables).map(async (tableName) => {
          const fields = fieldsToFetch[tableName];
          let condition = "";

          if (tableName === "builders") {
            condition = `st_builder.rstatus = 1`;
          } else if (tableName === "communities") {
            condition = `st_community.rstatus = 1`;
          } else if (tableName !== "availability") {
            condition = `${tables[tableName]}.rstatus = 1`;
          }

          const join = joins[tableName] || "";

          return await this.dbService.getJoinedData(
            tables[tableName],
            join,
            fields,
            condition
          );
        })
      );

      const responseData = {
        message: "Associated data retrieved successfully.",
        result: {
          cities: data[0].sort((a, b) => a.name.localeCompare(b.name)),
          builders: data[1].sort((a, b) => a.name.localeCompare(b.name)),
          communities: data[2].sort((a, b) => a.name.localeCompare(b.name)),
          homeTypes: data[3].sort((a, b) => a.id - b.id),
          availability: data[4].sort((a, b) => a.id - b.id),
          propDesc: data[5].sort((a, b) => a.id - b.id),
          tenantTypes: data[6].sort((a, b) => a.name.localeCompare(b.name)),
        },
      };

      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 86400);

      res.status(200).json(responseData);
    } catch (error) {
      console.error("Error fetching associated data:", error);
      res.status(500).json({
        error: "An error occurred while fetching data.",
        details: error.message,
      });
    }
  }

  async getPostData(req, res) {
    try {
      const cacheKey = "getPostData";
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("Serving from cache");
        return res.status(200).json(JSON.parse(cachedData));
      }

      const tables = {
        cities: "st_city",
        builders: "st_builder",
        communities: "st_community",
        balconies: "st_balcony",
        baths: "st_baths",
        beds: "st_beds",
        homeTypes: "st_home_type",
        parkingCounts: "st_parking_count",
        propDesc: "st_prop_desc",
        tenants: "st_tenant",
        tenantEatPrefs: "st_tenant_eat_pref",
        st_prop_type: "st_prop_type",
        availability: "st_availability",
        facing: "st_prop_facing",
      };

      const activeCondition = "rstatus = 1";
      const fieldsToFetch = {
        cities: "id, name",
        builders: "id, name, city_id",
        communities: "id, name, builder_id",
        balconies: "id, nbalcony",
        baths: "id, nbaths",
        beds: "id, nbeds",
        homeTypes: "id, home_type",
        parkingCounts: "id, parking_count",
        propDesc: "id, prop_desc",
        tenants: "id, tenant_type",
        tenantEatPrefs: "id, eat_pref",
        st_prop_type: "id, prop_type",
        availability: "id, available",
        facing: "id,prop_facing as name",
      };

      const data = await Promise.all(
        Object.keys(tables).map(async (tableName) => {
          const fields = fieldsToFetch[tableName];
          const condition = tableName === "availability" ? "" : activeCondition;
          return await this.dbService.getRecordsByFields(
            tables[tableName],
            fields,
            condition
          );
        })
      );

      const responseData = {
        message: "Data retrieved successfully.",
        result: {
          cities: Array.from(
            data[0].sort((a, b) => a.name.localeCompare(b.name))
          ),
          builders: Array.from(
            data[1].sort((a, b) => a.name.localeCompare(b.name))
          ),
          communities: Array.from(
            data[2].sort((a, b) => a.name.localeCompare(b.name))
          ),

          balconies: data[3],
          baths: data[4],
          beds: data[5],
          homeTypes: data[6],
          parkingCounts: data[7],
          propDesc: data[8],
          tenants: data[9],

          tenantEatPrefs: Array.from(
            data[10].sort((a, b) => a.eat_pref.localeCompare(b.eat_pref))
          ),

          propType: data[11],
          availability: data[12],
          facing: data[13],
        },
      };

      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 86400);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Error fetching data:", error);
      return res.status(500).json({
        error: "An error occurred while fetching data.",
        details: error.message,
      });
    }
  }

  async getUserTransactions(req, res) {
    const { tenant_id } = req.query;

    try {
      if (!tenant_id) {
        return res.status(400).json({ error: "Tenant ID is required" });
      }

      const documentTypes = ["invoices", "receipts"];
      let result = {};

      for (const type of documentTypes) {
        const s3FolderPath = `users/${tenant_id}/${type}/`;

        // Fetch all file keys from S3
        const files = await S3Service.listFilesInS3Folder(s3FolderPath);

        if (!files || files.length === 0) {
          result[type] = [];
        } else {
          // Fetch data from each file
          result[type] = await Promise.all(
            files.map(async (fileKey) => {
              try {
                return await S3Service.getJsonFromS3(fileKey);
              } catch (error) {
                console.error(
                  `Error fetching ${type} from S3: ${fileKey}`,
                  error
                );
                return {
                  error: `Failed to retrieve ${type} ${fileKey} from S3`,
                };
              }
            })
          );
        }
      }

      return res.status(200).json({
        message: "Invoices and Receipts retrieved successfully from S3.",
        invoices: result.invoices,
        receipts: result.receipts,
      });
    } catch (error) {
      console.error("Error fetching property documents:", error);
      res.status(500).json({
        error: "An error occurred while fetching property documents.",
        details: error.message,
      });
    }
  }
  async uploadPDF(req, res) {
    try {
      console.log(
        "Uploading file. Total files received:",
        req.files?.length || 0
      );

      // Check if files exist
      if (!Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded!" });
      }

      // Ensure all files are PDFs
      const isAllPDFs = req.files.every(
        (file) => file.mimetype === "application/pdf"
      );
      if (!isAllPDFs) {
        return res.status(400).json({ message: "Only PDF files are allowed!" });
      }

      // Validate request body
      const { user_id, prop_id } = req.body;
      if (!user_id || !prop_id) {
        return res
          .status(400)
          .json({ message: "Missing required parameters (user_id, prop_id)" });
      }

      try {
        // Upload PDFs to S3
        const folderPath = await S3Service.uploadPDFs(
          req.files,
          user_id,
          prop_id
        );
        console.log("PDFs uploaded successfully to:", folderPath);

        return res.status(200).json({
          message: "PDFs uploaded successfully!",
          folderPath,
        });
      } catch (uploadError) {
        console.error("S3 Upload Error:", uploadError);
        return res.status(500).json({
          message: "Error uploading PDFs to storage",
          error: uploadError.message,
        });
      }
    } catch (error) {
      console.error("Unexpected Error uploading PDFs:", error.message);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async getPDFController(req, res) {
    try {
      const { folderPath } = req.body;
      if (!folderPath) {
        return res.status(400).json({ message: "Folder path is required" });
      }

      const pdfUrl = await S3Service.getPDFUrls(folderPath);
      if (!pdfUrl) {
        return res
          .status(404)
          .json({ message: "No PDF found in the specified folder" });
      }

      return res
        .status(200)
        .json({ message: "PDF retrieved successfully", pdfUrl });
    } catch (error) {
      console.error("Error retrieving PDF:", error);
      res
        .status(500)
        .json({ message: "Error retrieving PDF", error: error.message });
    }
  }
}

class UserActionsController extends BaseController {
  async getUserActions(req, res) {
    try {
      const { user_id } = req.query;

      let userProperties = [];
      if (user_id) {
        const mainTable = "dy_transactions dt";
        const joinClauses = `
      LEFT JOIN dy_rm_fm_com_map rfm ON dt.prop_id = rfm.community_id
      LEFT JOIN dy_user rm ON rfm.rm_id = rm.id
      LEFT JOIN dy_user fm ON rfm.fm_id = fm.id
      LEFT JOIN dy_property dy ON dt.prop_id = dy.id
      LEFT JOIN st_current_status sct ON dt.cur_stat_code = sct.id
      ${propertyFields}`;

        const fields = `
      dt.id as tr_id, dt.prop_id, dt.tr_st_time AS start_time,
    dt.tr_upd_time AS update_time,dt.cur_stat_code, sct.status_code, dt.tr_st_time, 
      rm.user_name as rm_name, rm.mobile_no as rm_mobile_no, 
      fm.user_name as fm_name, fm.mobile_no as fm_mobile_no, 
      rfm.rm_id, rfm.fm_id, ${fieldNames1}`;

        const whereClause = `dt.user_id = ${db.escape(user_id)}`;

        userProperties = await this.dbService.getJoinedData(
          mainTable,
          joinClauses,
          fields,
          whereClause
        );

        const uniqueProperties = [];
        const seenProps = new Set();

        for (let item of userProperties) {
          if (!seenProps.has(item.prop_id)) {
            seenProps.add(item.prop_id);
            let images = await redis.hget("all_property_images", item.uid);
            images = images ? JSON.parse(images) : [];

            let community_images = await redis.hget(
              "all_community_images",
              item.default_images
            );
            community_images = community_images
              ? JSON.parse(community_images)
              : [];

            uniqueProperties.unshift({
              prop_id: item.prop_id,
              property_added_at: item.tr_st_time,
              rm_id: item.rm_id,
              rm_name: item.rm_name,
              RM_mobile_no: item.rm_mobile_no,
              fm_id: item.fm_id,
              fm_name: item.fm_name,
              FM_mobile_no: item.fm_mobile_no,
              current_status_id: item.cur_stat_code,
              current_status: item.status_code,
              transaction_id: item.tr_id,
              propert_current_status: item.current_status,
              prop_type: item.prop_type,
              home_type: item.home_type,
              prop_desc: item.prop_desc,
              community_name: item.community_name,
              map_url: item.map_url,
              total_area: item.total_area,
              open_area: item.open_area,
              nblocks: item.nblocks,
              nfloors_per_block: item.nfloors_per_block,
              nhouses_per_floor: item.nhouses_per_floor,
              address: item.address,
              totflats: item.totflats,
              default_images: item.default_images,
              available_date: item.available_date,
              nbeds: item.nbeds,
              nbaths: item.nbaths,
              nbalcony: item.nbalcony,
              eat_pref: item.eat_pref,
              parking_count: item.parking_count,
              deposit_amount: item.deposit_amount,
              majorArea: item.majorArea,
              super_area: item.super_area,
              maintenance_type: item.maintenance_type,
              rental_low: item.rental_low,
              rental_high: item.rental_high,
              tower_no: item.tower_no,
              floor_no: item.floor_no,
              flat_no: item.flat_no,
              images_location: item.images_location,
              images: images,
              builder_name: item.builder_name,
              city_name: item.city_name,
              default_img: community_images,
            });
          }
        }
        userProperties = uniqueProperties;
      }

      res.status(200).json({
        message: "User actions retrieved successfully.",
        userProperties,
      });
      console.log("Response sent successfully");
    } catch (error) {
      console.error("Error fetching user actions:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching user actions.",
        details: error.message,
      });
    }
  }
}

class UserProfile extends BaseController {
  async getUserProfile(req, res) {
    const { user_id } = req.query; // Extract user_id from query parameters

    try {
      if (!user_id) {
        return res.status(400).json({ error: "User ID is required." });
      }

      // Define the main table and its alias for the query
      const tableName = `dy_user_profile p`; // Main table alias

      // Define the JOIN clauses to link the main table with dy_user
      const joinClauses = `LEFT JOIN dy_user u ON p.user_id = u.id
            LEFT JOIN st_conv_mode cm ON p.conv_mode_id = cm.id
            LEFT JOIN st_gender g ON u.gender_id = g.id
            LEFT JOIN st_billing_plan bp ON u.bill_plan = bp.id
            LEFT JOIN st_role r ON u.role_id = r.id`;

      // Define the fields to select from both tables
      const fieldNames = `
            p.user_id, p.current_city, p.alt_email_id, p.alt_mobile_no, 
            p.Interests, p.last_updated,
            u.id, u.user_name, u.email_id, u.mobile_no, u.role_id, 
            u.ref_code, u.mobile_verified, u.email_verified,
            u.signuptime, g.gender_type AS gender, bp.billing_plan AS bill_plan, 
            bp.billing_amount, bp.billing_duration, cm.conv_mode AS conversation_mode, r.role AS user_role,
            u.last_updated AS user_last_updated
        `;

      // Escape user_id to prevent SQL injection
      const whereCondition = `p.user_id = ${db.escape(user_id)}`;

      // Fetch user profile details
      const results = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        whereCondition
      );

      // Fetch coins history for the given user_id
      const coinsWhereCondition = `user_id = ${db.escape(user_id)}`;
      const coinsHistory = await this.dbService.getRecordsByFields(
        "dy_coins_history",
        "id, user_id, earned_coins, time_earned_coins, redeemed_coins, time_redeemed_coins, svc_id, receipt_id",
        coinsWhereCondition
      );

      // Calculate total earned and redeemed coins
      const totalEarned = await this.dbService.getAggregateValue(
        "dy_coins_history",
        "earned_coins",
        "SUM",
        coinsWhereCondition
      );

      const totalRedeemed = await this.dbService.getAggregateValue(
        "dy_coins_history",
        "redeemed_coins",
        "SUM",
        coinsWhereCondition
      );

      // Ensure values are numbers (default to 0 if null)
      const earnedCoins = totalEarned?.[0]?.result
        ? Number(totalEarned[0].result)
        : 0;
      const redeemedCoins = totalRedeemed?.[0]?.result
        ? Number(totalRedeemed[0].result)
        : 0;
      const remainingCoins = earnedCoins - redeemedCoins;

      // Fetch additional data
      const conv_mode = await this.dbService.getRecordsByFields(
        "st_conv_mode",
        "id, conv_mode"
      );
      const gender = await this.dbService.getRecordsByFields(
        "st_gender",
        "id, gender_type"
      );

      // Return the results in a successful response
      res.status(200).json({
        message: "Retrieved successfully.",
        result: results, // User profile information along with user details
        coins_history: coinsHistory,
        total_earned: earnedCoins,
        total_redeemed: redeemedCoins,
        total_remaining: remainingCoins,
        conv_mode: conv_mode,
        gender: gender,
      });
    } catch (error) {
      // Log and return any errors that occur during the process
      console.error("Error fetching user profile data:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching user profile data.",
        details: error.message, // Provide the error details for debugging
      });
    }
  }
}

class UserController extends BaseController {
  async getUsersByRole(req, res) {
    try {
      // Define the table and fields to fetch
      const tableName = "dy_user"; // Main table
      const fieldNames = "user_name,id AS user_id,role_id"; // Fields to select

      // Fetch ADMIS (Role ID = 1)
      const adminCondition = `role_id = 1`; // Condition for ADMIS
      const adminResults = await this.dbService.getRecordsByFields(
        tableName,
        fieldNames,
        adminCondition
      );

      // Fetch RMs (Role ID = 3)
      const rmCondition = `role_id = 3`; // Condition for RMs
      const rmResults = await this.dbService.getRecordsByFields(
        tableName,
        fieldNames,
        rmCondition
      );

      // Fetch FMs (Role ID = 4)
      const fmCondition = `role_id = 4`; // Condition for FMs
      const fmResults = await this.dbService.getRecordsByFields(
        tableName,
        fieldNames,
        fmCondition
      );
      // Fetch Communities Details
      const communityResults = await this.dbService.getRecordsByFields(
        "st_community",
        "id, name",
        "rstatus = 1"
      );

      // Return the results in a grouped response
      res.status(200).json({
        message: "Users retrieved successfully.",
        result: {
          community: communityResults || [], // List of Communities
          Admins: adminResults || [], // List of Admins
          RMs: rmResults || [], // List of RMs
          FMs: fmResults || [], // List of FMs
        },
      });
    } catch (error) {
      // Log and return any errors that occur during the process
      console.error("Error fetching users by role:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching users by role.",
        details: error.message, // Provide error details for debugging
      });
    }
  }

  async getEnquirerCatCode(req, res) {
    try {
      const result = await this.dbService.getRecordsByFields(
        "st_enquirer_category",
        "id, category",
        1
      );
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      // Generic error response
      return res.status(500).json({
        success: false,
        message: "Failed to fetch codes.",
        error: error.message,
      });
    }
  }

  async addNewEnquiryRecord(req, res) {
    let flag = false;
    let message = "";
    let connection;
    let { usercat, name, country_code, mobile_no, status } = req.body;
    // Validate input
    if (!usercat) {
      flag = false;
      usercat = 1;
      message = "Please Select Your Category";
    }
    if (!country_code) {
      flag = false;
      country_code = "+91";
      message = "Please Select Your Country";
    }
    if (!name) {
      flag = false;
      message = "Please Enter Your Name";
    }
    if (!mobile_no) {
      flag = false;
      message = "Please Enter Your Mobile_no";
    }

    if (flag) {
      return res.status(400).json({
        success: false,
        message: "Please ensure data is correct",
      });
    }

    try {
      // Step 1: Get database connection and start transaction
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      const tableName = "dy_enqs";

      status = 25;

      // Step 2: Insert data into the database
      const fieldNames =
        "enq_cat, enq_country_code,enq_name, enq_mobile,enq_status";
      const fieldValues = `${db.escape(usercat)}, ${db.escape(
        country_code
      )},${db.escape(name)}, ${db.escape(mobile_no)},${db.escape(status)}`;

      console.log("Field Values :", fieldValues);

      const result = await this.dbService.addNewRecord(
        tableName,
        fieldNames,
        fieldValues,
        connection
      );

      console.log("Enquiry added successfully:", result);

      // Step 3: Commit the transaction
      await TransactionController.commitTransaction(connection);

      // Respond with success
      return res.status(201).json({
        success: true,
        message: "Enquiry added successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error in EnquiryEntry:", error.message);

      // Step 4: Rollback transaction on error
      if (connection) {
        await TransactionController.rollbackTransaction(
          connection,
          error.message
        );
      }
      // Respond with a generic error
      return res.status(500).json({
        success: false,
        message: "Failed to add Enquiry entry.",
        error: error.message,
      });
    } finally {
      // Step 5: Release the database connection
      if (connection) {
        await TransactionController.releaseConnection(connection);
      }
    }
  }

  async updateEnquiry(req, res) {
    const {
      enq_id,
      enq_city,
      enq_builder,
      enq_community,
      enq_bhk_type,
      enq_prop_type,
      enq_prop_desc,
      enq_prop_facing,
      enq_rental_low,
      enq_rental_high,

      enq_parking_count,
      enq_available,
      enq_super_area,
      enq_tenant_type,
      enq_tenant_eat_pref,
      enq_no_baths,
      enq_flat_details,
      enq_status,
    } = req.body;

    // enq_id is required for identifying which record to update
    if (!enq_id) {
      return res
        .status(400)
        .json({ error: "Missing 'enq_id' for update operation." });
    }

    // Construct the object of only provided fields
    const allFields = {
      enq_city,
      enq_builder,
      enq_community,
      enq_bhk_type,
      enq_prop_type,
      enq_prop_desc,
      enq_prop_facing,
      enq_rental_low,
      enq_rental_high,

      enq_parking_count,
      enq_available,
      enq_super_area,
      enq_tenant_type,
      enq_tenant_eat_pref,
      enq_no_baths,
      enq_flat_details,
      enq_status,
    };

    const fieldValuePairs = Object.fromEntries(
      Object.entries(allFields).filter(([_, value]) => value !== undefined)
    );

    // No updatable fields provided
    if (Object.keys(fieldValuePairs).length === 0) {
      return res.status(400).json({ error: "No fields provided to update." });
    }

    try {
      const tableName = "dy_enqs";
      const whereCondition = `enq_id = ${db.escape(enq_id)}`;

      const result = await this.dbService.updateRecord(
        tableName,
        fieldValuePairs,
        whereCondition
      );

      return res.status(200).json({
        message: "Enquiry updated successfully.",
        result,
      });
    } catch (error) {
      console.error("Error updating enquiry:", error.message);
      return res.status(500).json({
        error: "An error occurred while updating the enquiry.",
        details: error.message,
      });
    }
  }

  async getNewEnquiryRecord(req, res) {
    const { enq_id } = req.query;

    try {
      const tableName = `dy_enqs de`;

      const joinClauses = `
        LEFT JOIN st_enquirer_category sec ON de.enq_cat = sec.id
        LEFT JOIN st_city sc ON de.enq_city = sc.id
        LEFT JOIN st_builder sb ON de.enq_builder = sb.id
        LEFT JOIN st_community scom ON de.enq_community = scom.id
        LEFT JOIN st_beds sbh ON de.enq_bhk_type = sbh.id
        LEFT JOIN st_prop_type spt ON de.enq_prop_type = spt.id
        LEFT JOIN st_prop_desc spd ON de.enq_prop_desc = spd.id
        LEFT JOIN st_prop_facing spf ON de.enq_prop_facing = spf.id        
        LEFT JOIN st_parking_count spc ON de.enq_parking_count = spc.id
        LEFT JOIN st_availability sa ON de.enq_available = sa.id
        LEFT JOIN st_tenant st ON de.enq_tenant_type = st.id
        LEFT JOIN st_tenant_eat_pref step ON de.enq_tenant_eat_pref = step.id
        LEFT JOIN st_baths sbt ON de.enq_no_baths = sbt.id
      `;

      const fieldNames = `
        de.enq_id,
        de.enq_cat,
        sec.category AS category_name,
        de.enq_name,
        de.enq_mobile,
        de.enq_pref_slot,
        de.enq_flat_details,        
        sc.name AS city_name,        
        sb.name AS builder_name,        
        scom.name AS community_name,        
        sbh.nbeds AS bhk_name,        
        spt.prop_type AS prop_type_name,        
        spd.prop_desc AS prop_desc_name,        
        spf.prop_facing AS prop_facing_name,        
        de.enq_rental_low,
        de.enq_rental_high,      
        
        
        spc.parking_count AS parking_count_value,
        
        sa.available AS availability_status,
        
        de.enq_super_area,
        
        st.tenant_type AS tenant_type_name,
        
        step.eat_pref AS eat_pref_name,
        
        de.enq_no_baths,
        sbt.nbaths AS no_baths_count,
        
        de.enq_rec_create_time,
        de.enq_rec_modified_time,
        de.enq_uid,
        de.enq_status
      `;

      const whereCondition = enq_id ? `de.enq_id = ${db.escape(enq_id)}` : "";

      const results = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        whereCondition
      );

      if (!results || results.length === 0) {
        return res
          .status(404)
          .json({ error: "No records found for the provided enquiry ID." });
      }

      res.status(200).json({
        message: "Retrieved successfully.",
        result: results,
      });
    } catch (error) {
      console.error("Error fetching enquiry data:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching enquiry data.",
        details: error.message,
      });
    }
  }

  async getPostDataForEnq(req, res) {
    try {
      const cacheKey = "getPostDataForEnq";
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("Serving from cache");
        return res.status(200).json(JSON.parse(cachedData));
      }

      const tables = {
        citylist: "st_city",
        builderlist: "st_builder",
        communitylist: "st_community",
        hometypelist: "st_home_type",
        proptypelist: "st_prop_type",
        propdesclist: "st_prop_desc",
        propfacinglist: "st_prop_facing",
        parkingtypelist: "st_parking_type",
        parkingcountlist: "st_parking_count",
        availabilitylist: "st_availability",
        bathslist: "st_baths",
        tenanttypelist: "st_tenant",
        tenanteatprefslist: "st_tenant_eat_pref",
        statuslist: "st_current_status",
      };

      const activeCondition = "rstatus = 1";
      const fieldsToFetch = {
        lstcities: "id, name",
        lstbuilders: "id, name, city_id",
        lstcommunities: "id, name, builder_id",
        hometypelist: "id, home_type",
        proptypelist: "id,prop_type",

        balconies: "id, nbalcony",
        baths: "id, nbaths",
        beds: "id, nbeds",

        parkingCounts: "id, parking_count",
        propDesc: "id, prop_desc",
        tenants: "id, tenant_type",
        tenantEatPrefs: "id, eat_pref",
        st_prop_type: "id, prop_type",
        availability: "id, available",
        facing: "id,prop_facing as name",
      };

      const data = await Promise.all(
        Object.keys(tables).map(async (tableName) => {
          const fields = fieldsToFetch[tableName];
          const condition = tableName === "availability" ? "" : activeCondition;
          return await this.dbService.getRecordsByFields(
            tables[tableName],
            fields,
            condition
          );
        })
      );

      const responseData = {
        message: "Data retrieved successfully.",
        result: {
          cities: Array.from(
            data[0].sort((a, b) => a.name.localeCompare(b.name))
          ),
          builders: Array.from(
            data[1].sort((a, b) => a.name.localeCompare(b.name))
          ),
          communities: Array.from(
            data[2].sort((a, b) => a.name.localeCompare(b.name))
          ),

          balconies: data[3],
          baths: data[4],
          beds: data[5],
          homeTypes: data[6],
          parkingCounts: data[7],
          propDesc: data[8],
          tenants: data[9],

          tenantEatPrefs: Array.from(
            data[10].sort((a, b) => a.eat_pref.localeCompare(b.eat_pref))
          ),

          propType: data[11],
          availability: data[12],
          facing: data[13],
        },
      };

      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 86400);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Error fetching data:", error);
      return res.status(500).json({
        error: "An error occurred while fetching data.",
        details: error.message,
      });
    }
  }

  async addChatbotEntry(req, res) {
    const { name, city, mobile_no, time_slot, purpose } = req.body;

    // Validate input
    if (!name || !city || !mobile_no || !time_slot) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, city, mobile_no, time_slot) are required.",
      });
    }

    let connection;

    try {
      // Step 1: Get database connection and start transaction
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      const tableName = "dy_enquiries";

      // Step 2: Insert data into the database
      const fieldNames = "name, city, mobile_number, time_slot, purpose";
      const fieldValues = `${db.escape(name)}, ${db.escape(city)}, ${db.escape(
        mobile_no
      )}, ${db.escape(time_slot)}, ${db.escape(purpose)}`;

      const result = await this.dbService.addNewRecord(
        tableName,
        fieldNames,
        fieldValues,
        connection
      );

      console.log("User entry added successfully:", result);

      // Step 3: Commit the transaction
      await TransactionController.commitTransaction(connection);

      // Respond with success
      return res.status(201).json({
        success: true,
        message: "User entry added successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error in addChatbotEntry:", error.message);

      // Step 4: Rollback transaction on error
      if (connection) {
        await TransactionController.rollbackTransaction(
          connection,
          error.message
        );
      }

      // Handle duplicate entry error
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Data already exists for this mobile number.",
        });
      }

      // Respond with a generic error
      return res.status(500).json({
        success: false,
        message: "Failed to add user entry.",
        error: error.message,
      });
    } finally {
      // Step 5: Release the database connection
      if (connection) {
        await TransactionController.releaseConnection(connection);
      }
    }
  }
  async addNewTestimonialRecord(req, res) {
    let connection;

    try {
      const testimonialData = req.body;
      const file = req.file;

      // Log inputs
      console.log("req.body:", testimonialData);
      console.log("req.file:", file);

      // Destructure fields from testimonialData
      const {
        user_id,
        rating,
        city_id,
        builder_id,
        community_id,
        description,
        display_name,
        current_status,
      } = testimonialData;

      // Validate required fields
      if (
        !user_id ||
        !display_name ||
        !rating ||
        !description ||
        !current_status
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide all required testimonial fields including display name.",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating should be between 1 and 5",
        });
      }

      if (display_name.length > 255) {
        return res.status(400).json({
          success: false,
          message: "Display name should not exceed 255 characters",
        });
      }

      // Step 1: Initialize imagePath
      let imagePath = null;

      // Upload image to S3 if file is provided
      if (file) {
        const testimonialUid = uuidv4(); // Optional: UUID for tracking
        imagePath = await S3Service.uploadImage(
          file,
          user_id,
          "testimonial_images"
        );

        if (!imagePath) {
          throw new Error("Image upload failed.");
        }
      }

      // Step 2: Get connection & start transaction
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      // Step 3: Prepare and insert testimonial data
      const testimonialRecord = {
        user_id,
        rating,
        city_id,
        builder_id,
        community_id,
        image_data: imagePath,
        description,
        display_name,
        current_status,
      };

      const [result] = await this.dbService.addNewRecord(
        "dy_testimonial",
        Object.keys(testimonialRecord).join(", "),
        Object.values(testimonialRecord)
          .map((val) => db.escape(val))
          .join(", "),
        connection
      );

      if (!result.insertId) {
        throw new Error("Testimonial insert failed.");
      }

      // Step 4: Commit transaction
      await TransactionController.commitTransaction(connection);

      return res.status(201).json({
        success: true,
        message: "Testimonial added successfully.",
        testimonialId: result.insertId,
      });
    } catch (error) {
      console.error("Error adding testimonial:", error.message);

      if (connection) {
        await TransactionController.rollbackTransaction(connection);
      }

      return res.status(500).json({
        success: false,
        message: "Failed to add testimonial entry.",
        error: error.message,
      });
    } finally {
      if (connection) {
        await TransactionController.releaseConnection(connection);
      }
    }
  }

  async getNewtestimonialRecord(req, res) {
    const { id } = req.query;

    try {
      const tableName = `dy_testimonial dyt`;

      const joinClauses = `
      LEFT JOIN dy_user du ON dyt.user_id = du.id
      LEFT JOIN st_city sc ON dyt.city_id = sc.id
      LEFT JOIN st_builder sb ON dyt.builder_id = sb.id
      LEFT JOIN st_community scom ON dyt.community_id = scom.id
    `;

      const fieldNames = `
      dyt.id,
      dyt.user_id,
      dyt.rating,
      dyt.image_data,
      dyt.display_name,
      dyt.description,
      dyt.current_status,
      dyt.testimonial_date,
      du.user_name,
      du.email_id,
      du.mobile_no,
      du.customer_id,
      sc.id AS city_id,
      sc.name AS city_name,
      sb.id AS builder_id,
      sb.name AS builder_name,
      scom.id AS community_id,
      scom.name AS community_name
    `;

      let whereCondition = `dyt.current_status = 3`;
      if (id) {
        whereCondition += ` AND dyt.id = ${db.escape(id)}`;
      }

      const results = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        whereCondition
      );

      if (!results || results.length === 0) {
        return res.status(404).json({
          error:
            "No records found for the provided testimonial ID with status 3.",
        });
      }

      res.status(200).json({
        message: "Retrieved successfully.",
        result: results,
      });
    } catch (error) {
      console.error("Error fetching testimonial data:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching testimonial data.",
        details: error.message,
      });
    }
  }

  async getAllTestimonialRecords(req, res) {
    const { id } = req.query;

    try {
      const tableName = `dy_testimonial dyt`;

      const joinClauses = `
      LEFT JOIN dy_user du ON dyt.user_id = du.id
      LEFT JOIN st_city sc ON dyt.city_id = sc.id
      LEFT JOIN st_builder sb ON dyt.builder_id = sb.id
      LEFT JOIN st_community scom ON dyt.community_id = scom.id
    `;

      const fieldNames = `
      dyt.id,
      dyt.user_id,
      dyt.rating,
      dyt.image_data,
      dyt.display_name,
      dyt.description,
      dyt.current_status,
      dyt.testimonial_date,
      du.user_name,
      du.email_id,
      du.mobile_no,
      du.customer_id,
      sc.id AS city_id,
      sc.name AS city_name,
      sb.id AS builder_id,
      sb.name AS builder_name,
      scom.id AS community_id,
      scom.name AS community_name
    `;

      const whereCondition = id ? `dyt.id = ${db.escape(id)}` : "";

      const results = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        whereCondition
      );

      if (!results || results.length === 0) {
        return res
          .status(404)
          .json({ error: "No records found for the provided testimonial ID." });
      }

      res.status(200).json({
        message: "Retrieved successfully.",
        result: results,
      });
    } catch (error) {
      console.error("Error fetching testimonial data:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching testimonial data.",
        details: error.message,
      });
    }
  }

  async deleteTestimonialRecord(req, res) {
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Testimonial ID is required for deletion." });
    }

    try {
      const whereCondition = `id = ${db.escape(id)}`;

      const result = await this.dbService.deleteRecord(
        "dy_testimonial",
        whereCondition
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "No testimonial found with the provided ID." });
      }

      res.status(200).json({ message: "Testimonial deleted successfully." });
    } catch (error) {
      console.error("Error deleting testimonial:", error.message);
      res.status(500).json({
        error: "An error occurred while deleting the testimonial.",
        details: error.message,
      });
    }
  }
  async updateTestimonialRecord(req, res) {
    const {
      id,
      rating,
      image_data,
      description,
      current_status,
      testimonial_date,
    } = req.body;

    // Validate required ID
    if (!id) {
      return res
        .status(400)
        .json({ error: "Missing 'id' for update operation." });
    }

    // Only include fields that are provided (non-undefined)
    const updateFields = {};
    if (rating !== undefined) updateFields.rating = rating;
    if (image_data !== undefined) updateFields.image_data = image_data;
    if (description !== undefined) updateFields.description = description;
    if (current_status !== undefined)
      updateFields.current_status = current_status;
    if (testimonial_date !== undefined)
      updateFields.testimonial_date = testimonial_date;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided to update." });
    }

    try {
      const tableName = "dy_testimonial";
      const whereCondition = `id = ${db.escape(id)}`;

      const result = await this.dbService.updateRecord(
        tableName,
        updateFields,
        whereCondition
      );

      return res.status(200).json({
        message: "Testimonial updated successfully.",
        result,
      });
    } catch (error) {
      console.error("Error updating testimonial:", error.message);
      return res.status(500).json({
        error: "An error occurred while updating the testimonial.",
        details: error.message,
      });
    }
  }
}

class LandMarksController extends BaseController {
  async addLandmarks(req, res) {
    const { community_id, landmarks } = req.body;

    if (!community_id || !Array.isArray(landmarks) || landmarks.length === 0) {
      return res.status(400).json({
        error:
          "Invalid input. Please provide a community_id and a list of landmarks.",
      });
    }

    try {
      const tableName = "dy_landmarks"; // Target table
      const fieldNames =
        "landmark_name, `distance`, landmark_category_id, community_id"; // Fields to insert

      const errors = []; // Store any errors during insertion

      for (const landmark of landmarks) {
        const { landmark_name, distance, landmark_category_id } = landmark;

        // Validate landmark fields
        if (!landmark_name || distance == null || !landmark_category_id) {
          errors.push({
            landmark_name,
            distance,
            landmark_category_id,
            error:
              "Invalid landmark data. Ensure all required fields are provided.",
          });
          continue;
        }

        try {
          // Format the fieldValues as a comma-separated string
          const fieldValues = `'${landmark_name}', ${distance}, ${landmark_category_id}, ${community_id}`;

          // Call the addNewRecord method
          await this.dbService.addNewRecord(tableName, fieldNames, fieldValues);
        } catch (error) {
          console.error(
            `Failed to add landmark "${landmark_name}" for community_id ${community_id}:`,
            error.message
          );
          errors.push({
            landmark_name,
            distance,
            landmark_category_id,
            error: error.message,
          });
        }
      }

      // Check for errors and send an appropriate response
      if (errors.length > 0) {
        return res.status(207).json({
          message: "Some landmarks were not added successfully.",
          errors,
        });
      }
      // Commit transaction if all inserts are successful

      // If all landmarks are added successfully, send a success response
      res.status(200).json({
        message: "All landmarks added successfully to the community.",
      });
    } catch (error) {
      console.error("Error adding landmarks:", error.message);
      res.status(500).json({
        error: "An unexpected error occurred while adding landmarks.",
        details: error.message,
      });
    }
  }

  async landMarks(req, res) {
    const { community_id } = req.query; // Extract community_id from query parameters

    try {
      // Define the main table and its alias for the query
      const tableName = `dy_landmarks dl`; // Main table alias

      // Define the JOIN clauses to link the main table with other tables
      const joinClauses = `      LEFT JOIN st_landmarks_category slc ON dl.landmark_category_id = slc.id
`;
      // Define the fields to select from the database
      const fieldNames = `   dl.landmark_name AS landmark_name,
        dl.distance AS distance,
        dl.landmark_category_id AS landmark_category_id,
        slc.landmark_category AS landmark_category

`; // Fields to select

      // If community_id is provided, escape it to prevent SQL injection
      const whereCondition = community_id
        ? `dl.community_id = ${db.escape(community_id)}` // Escape community_id to avoid SQL injection
        : "";

      // Fetch the data using the DatabaseService
      const results = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        whereCondition
      );

      // Check if no records are found
      if (!results || results.length === 0) {
        return res
          .status(404)
          .json({ error: "No records found for the provided community_id." });
      }

      // Return the results in a successful response
      res.status(200).json({
        message: "Retrieved successfully.",
        result: results, // List of Facility Managers for the given community_id
      });
    } catch (error) {
      // Log and return any errors that occur during the process
      console.error("Error fetching FM status data:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching FM status data.",
        details: error.message, // Provide the error details for debugging
      });
    }
  }

  async importLandmarks(req, res) {
    const { source_community_id, target_community_id } = req.query;

    try {
      // Validate the required parameters
      if (!source_community_id || !target_community_id) {
        return res.status(400).json({
          error:
            "Both source_community_id and target_community_id are required.",
        });
      }

      // Fetch all landmarks associated with the source community ID
      const whereCondition = `community_id = ${db.escape(source_community_id)}`;
      const landmarks = await this.dbService.getRecordsByFields(
        "dy_landmarks",
        "landmark_name, distance, landmark_category_id",
        whereCondition
      );

      if (landmarks.length === 0) {
        return res.status(404).json({
          message: "No landmarks found for the provided source_community_id.",
        });
      }

      // Track which landmarks were added and which were already present
      const addedLandmarks = [];
      const existingLandmarks = [];

      // Insert each landmark into the dy_landmarks table for the target community ID
      const insertPromises = landmarks.map(async (landmark) => {
        // Check if the landmark already exists for the target community
        const whereCondition = `landmark_name = ${db.escape(
          landmark.landmark_name
        )} AND community_id = ${db.escape(target_community_id)}`;
        const existingLandmark = await this.dbService.getRecordsByFields(
          "dy_landmarks",
          "id",
          whereCondition
        );

        if (existingLandmark.length === 0) {
          // If it doesn't exist, insert the landmark
          const insertData = {
            landmark_name: landmark.landmark_name,
            distance: landmark.distance,
            landmark_category_id: landmark.landmark_category_id,
            community_id: target_community_id,
          };

          await this.dbService.addNewRecord(
            "dy_landmarks",
            Object.keys(insertData).join(", "),
            Object.values(insertData)
              .map((value) => db.escape(value))
              .join(", ")
          );
          addedLandmarks.push(landmark.landmark_name); // Track added landmark
        } else {
          existingLandmarks.push(landmark.landmark_name); // Track existing landmark
        }
      });

      // Wait for all insert operations to complete
      await Promise.all(insertPromises);

      // Return a detailed success response
      let message = "Landmarks import process completed.";
      if (addedLandmarks.length > 0) {
        message += ` Added: ${addedLandmarks.join(", ")}.`;
      }
      if (existingLandmarks.length > 0) {
        message += ` Already present: ${existingLandmarks.join(", ")}.`;
      }

      res.status(200).json({
        message,
        added_landmarks: addedLandmarks.length,
        existing_landmarks: existingLandmarks.length,
      });
    } catch (error) {
      // Log and return any errors that occur during the process
      console.error("Error cloning landmarks:", error.message);
      res.status(500).json({
        error: "An error occurred while cloning landmarks.",
        details: error.message, // Provide the error details for debugging
      });
    }
  }
}

class AmenitiesController extends BaseController {
  async addAmenities(req, res) {
    const { community_id, amenity_ids } = req.body;

    // Validate input
    if (
      !community_id ||
      !Array.isArray(amenity_ids) ||
      amenity_ids.length === 0
    ) {
      return res.status(400).json({
        error:
          "Invalid input. Provide a valid community ID and an array of amenity IDs.",
      });
    }

    let connection;

    try {
      // Step 1: Get database connection and start transaction
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      const tableName = "dy_amenities";

      // Step 2: Retrieve existing amenities for the community
      const whereCondition = `community = ${db.escape(community_id)}`;
      const existingRecords = await this.dbService.getRecordsByFields(
        tableName,
        "amenity",
        whereCondition
      );

      const existingAmenityIds = existingRecords.map(
        (record) => record.amenity
      );
      const newAmenities = amenity_ids.filter(
        (amenityId) => !existingAmenityIds.includes(amenityId)
      );

      // If no new amenities, rollback transaction and return
      if (newAmenities.length === 0) {
        await TransactionController.rollbackTransaction(
          connection,
          "No new amenities to add; transaction rolled back."
        );
        return res.status(200).json({
          message: "All amenities already exist for this community.",
        });
      }

      // Step 3: Insert new amenities and related records
      for (const amenityId of newAmenities) {
        // Insert into dy_amenities table
        const fieldNames = `amenity, community`;
        const fieldValues = `${db.escape(amenityId)}, ${db.escape(
          community_id
        )}`;
        await this.dbService.addNewRecord(
          tableName,
          fieldNames,
          fieldValues,
          connection
        );
      }

      // Step 4: Commit the transaction
      await TransactionController.commitTransaction(connection);

      // Respond with success
      res.status(200).json({
        message: "New amenities added successfully.",
        addedCount: newAmenities.length,
      });
    } catch (error) {
      console.error("Error adding amenities:", error.message);

      // Step 5: Rollback transaction on error
      if (connection) {
        await TransactionController.rollbackTransaction(
          connection,
          error.message
        );
      }

      // Respond with error
      res.status(500).json({
        error: "An error occurred while adding amenities.",
        details: error.message,
      });
    } finally {
      // Step 6: Release the database connection
      if (connection) {
        await TransactionController.releaseConnection(connection);
      }
    }
  }

  async getAmenities(req, res) {
    const { community_id } = req.query; // Extract community_id from query parameters

    try {
      if (!community_id) {
        return res.status(400).json({
          error: "community_id is required to fetch amenities.",
        });
      }

      // Define the main table and its alias for the query
      const tableName = `dy_amenities a`; // Main table alias

      // Define the JOIN clauses to link the main table with other tables
      const joinClauses = `
            LEFT JOIN st_amenities sa ON a.amenity = sa.id
            LEFT JOIN st_amenity_category sac ON sa.amenity_category_id = sac.id
            LEFT JOIN st_community sc ON a.community = sc.id
        `;

      // Define the fields to select from the database
      const fieldNames = `
            a.id AS amenity_mapping_id,
            a.community AS community_id,
            sc.name,
            sa.id AS amenity_id,
            sa.amenity_name,
            sac.id AS amenity_category_id,
            sac.amenity_category
        `;

      // Create a condition to filter by the given community_id
      const whereCondition = `a.community = ${db.escape(community_id)}`;

      // Fetch the data using the DatabaseService
      const results = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        whereCondition
      );

      // ✅ Group the amenities by community_name and category
      const groupedAmenities = results.reduce((acc, item) => {
        const key = `${item.community_name}-${item.amenity_category}`;

        if (!acc[key]) {
          acc[key] = {
            community_name: item.community_name,
            category: item.amenity_category,
            amenities: [],
          };
        }

        acc[key].amenities.push(item.amenity_name);
        return acc;
      }, {});

      // Convert grouped data into an array
      const formattedAmenities = Object.values(groupedAmenities);

      // Return the formatted result
      res.status(200).json({
        message: "Amenities retrieved successfully.",
        amenities: formattedAmenities,
      });
    } catch (error) {
      // Log and return any errors that occur during the process
      console.error("Error fetching amenities:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching amenities.",
        details: error.message, // Provide the error details for debugging
      });
    }
  }

  async createCommunity(req, res) {
    let connection;

    try {
      let communityData = JSON.parse(req.body.communityData);
      const communityUid = uuidv4(); // Generate UUID for community
      communityData.uid = communityUid; // Store UUID in database

      // Step 1: Get database connection and start transaction
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      // Step 2: Insert community data into the database
      const [result] = await this.dbService.addNewRecord(
        "st_community",
        Object.keys(communityData).join(", "),
        Object.values(communityData)
          .map((val) => db.escape(val))
          .join(", "),
        connection // Pass connection for transactional support
      );

      if (!result.insertId) {
        throw new Error("Community insert failed.");
      }

      // Step 3: Upload community images to S3
      const folderUrl = await S3Service.uploadCommunityImages(
        req.files,
        communityUid,
        "communities/default_images"
      );

      // Step 4: Commit the transaction
      await TransactionController.commitTransaction(connection);

      // Respond with success
      return res.status(201).json({
        message: "Community created successfully",
        communityUid,
      });
    } catch (error) {
      console.error("Error creating community:", error.message);

      // Step 5: Rollback transaction on error
      if (connection) {
        await TransactionController.rollbackTransaction(
          connection,
          error.message
        );
      }

      // Respond with error
      return res.status(500).json({
        error: "An error occurred while creating the community.",
        details: error.message,
      });
    } finally {
      // Step 6: Release the database connection
      if (connection) {
        await TransactionController.releaseConnection(connection);
      }
    }
  }

  async importAmenities(req, res) {
    const { source_community_id, target_community_id } = req.query;

    // Validate input
    if (!source_community_id || !target_community_id) {
      return res.status(400).json({
        error: "Both source_community_id and target_community_id are required.",
      });
    }

    let connection;

    try {
      // Step 1: Get database connection and start transaction
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      // Step 2: Fetch amenities associated with the source community ID
      const whereCondition = `community = ${db.escape(source_community_id)}`;
      const amenities = await this.dbService.getRecordsByFields(
        "dy_amenities",
        "amenity",
        whereCondition
      );

      if (amenities.length === 0) {
        await TransactionController.rollbackTransaction(
          connection,
          "No amenities found for the provided source_community_id; transaction rolled back."
        );
        return res.status(404).json({
          message: "No amenities found for the provided source_community_id.",
        });
      }

      // Step 3: Track added and existing amenities
      const addedAmenities = [];
      const existingAmenities = [];

      // Step 4: Insert each amenity into the dy_amenities table for the target community ID
      for (const amenity of amenities) {
        const whereCondition = `amenity = ${db.escape(
          amenity.amenity
        )} AND community = ${db.escape(target_community_id)}`;
        const existingAmenity = await this.dbService.getRecordsByFields(
          "dy_amenities",
          "id",
          whereCondition
        );

        if (existingAmenity.length === 0) {
          // If it doesn't exist, insert the amenity
          const fieldNames = "amenity, community";
          const fieldValues = `${db.escape(amenity.amenity)}, ${db.escape(
            target_community_id
          )}`;
          await this.dbService.addNewRecord(
            "dy_amenities",
            fieldNames,
            fieldValues,
            connection
          );
          addedAmenities.push(amenity.amenity);
        } else {
          existingAmenities.push(amenity.amenity);
        }
      }

      // Step 5: Commit the transaction
      await TransactionController.commitTransaction(connection);

      // Return a detailed success response
      let message = "Amenities import process completed.";
      if (addedAmenities.length > 0) {
        message += ` Added: ${addedAmenities.join(", ")}.`;
      }
      if (existingAmenities.length > 0) {
        message += ` Already present: ${existingAmenities.join(", ")}.`;
      }

      res.status(200).json({
        message,
        added_amenities: addedAmenities.length,
        existing_amenities: existingAmenities.length,
      });
    } catch (error) {
      console.error("Error importing amenities:", error.message);

      // Step 6: Rollback transaction on error
      if (connection) {
        await TransactionController.rollbackTransaction(
          connection,
          error.message
        );
      }

      // Respond with error
      res.status(500).json({
        error: "An error occurred while importing amenities.",
        details: error.message,
      });
    } finally {
      // Step 7: Release the database connection
      if (connection) {
        await TransactionController.releaseConnection(connection);
      }
    }
  }
}
class ServicesController extends BaseController {
  async createServiceInfo(req, res) {
    let connection;

    try {
      let serviceData = req.body;

      // Validate input
      if (!serviceData || Object.keys(serviceData).length === 0) {
        return res.status(400).json({
          error: "Invalid input. Provide valid service data.",
        });
      }

      // Ensure `svc_info` is stored as a JSON string
      if (typeof serviceData.svc_info === "object") {
        serviceData.svc_info = JSON.stringify(serviceData.svc_info);
      }

      // Step 1: Get database connection and start transaction
      connection = await TransactionController.getConnection();
      await TransactionController.beginTransaction(connection);

      // Step 2: Insert data into `dy_services_info`
      const [result] = await this.dbService.addNewRecord(
        "dy_services_info",
        Object.keys(serviceData).join(", "),
        Object.values(serviceData)
          .map((val) => db.escape(val))
          .join(", "),
        connection
      );

      if (!result.insertId) {
        throw new Error("Service info insert failed");
      }

      const insertedId = result.insertId;

      // Step 3: Commit the transaction
      await TransactionController.commitTransaction(connection);

      // Respond with success
      return res.status(201).json({
        message: "Service info created successfully",
        serviceId: insertedId,
      });
    } catch (error) {
      console.error("Error creating service info:", error.message);

      // Step 4: Rollback transaction on error
      if (connection) {
        await TransactionController.rollbackTransaction(
          connection,
          error.message
        );
      }

      // Respond with error
      res.status(500).json({
        error: "An error occurred while creating service info.",
        details: error.message,
      });
    } finally {
      // Step 5: Release the database connection
      if (connection) {
        await TransactionController.releaseConnection(connection);
      }
    }
  }

  async getServiceDetails(req, res) {
    try {
      const { receipt_id, svc_id } = req.query;

      const tableName = "dy_services_info dsi";

      const joinClauses = `
        LEFT JOIN st_services ss ON dsi.svc_id = ss.id
        LEFT JOIN st_packages sp ON dsi.package_id = sp.id
      `;

      const fieldNames = `dsi.id,
        dsi.receipt_id,
        dsi.svc_id,
        dsi.package_id,
        ss.service_name,
        sp.package_desc,
        dsi.svc_info,
        dsi.claimed_date,
        dsi.claimed_by,
        dsi.claimer_cat,
        dsi.serviced_date,
        dsi.serviced_slot,
        dsi.status,
        service_req_id`;
      const whereClauses = [];

      //const whereCondition = `dsi.receipt_id = ${db.escape(receipt_id)}`;
      if (receipt_id)
        whereClauses.push(`dy.receipt_id = ${db.escape(user_id)}`);
      if (svc_id) whereClauses.push(`dsi.svc_id = ${db.escape(svc_id)}`);
      const whereCondition =
        whereClauses.length > 0 ? whereClauses.join(" AND ") : "1";

      const result = await this.dbService.getJoinedData(
        tableName,
        joinClauses,
        fieldNames,
        whereCondition
      );

      if (!result.length) {
        return res
          .status(201)
          .json({ message: "No service details found", services: result });
      }

      return res.status(200).json({
        message: "Service details retrieved successfully",
        services: result,
      });
    } catch (error) {
      console.error("Error fetching service details:", error);
      res.status(500).json({
        message: "Error fetching service details",
        error: error.message,
      });
    }
  }
  async getUsersBySignupDate(req, res) {
    console.log("getUsersBySignupDate function executed");

    const { year } = req.query;

    try {
      if (!year) {
        return res.status(400).json({
          error: "Please provide a valid year.",
        });
      }

      const tableName = "dy_user";

      // Get the current year and month
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-based

      let monthLimitCondition = "";
      let maxMonth = 12; // Default: Return all 12 months

      if (parseInt(year) === currentYear) {
        monthLimitCondition = `AND MONTH(signuptime) <= ${currentMonth}`;
        maxMonth = currentMonth; // Only return up to the current month
      }

      // Define the where condition
      const whereCondition = `DATE_FORMAT(signuptime, '%Y') = ${db.escape(
        year
      )} ${monthLimitCondition}`;

      // Query to count users per month
      const fieldNames = "MONTH(signuptime) AS month, COUNT(*) AS user_count";
      const results = await this.dbService.getRecordsByFields(
        tableName,
        fieldNames,
        whereCondition +
          " GROUP BY MONTH(signuptime) ORDER BY MONTH(signuptime)"
      );

      // Month names mapping
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Generate months based on current year condition
      const allMonths = Array.from({ length: maxMonth }, (_, i) => i + 1);

      // Merge DB results with expected months
      const mergedResults = allMonths.map((month) => {
        const result = results.find((r) => Number(r.month) === month); // Convert to number
        return {
          month_id: month,
          month_name: monthNames[month - 1], // Get the month name from the array
          user_count: result ? result.user_count : 0,
        };
      });

      // Check if all user counts are `0`
      if (mergedResults.every((r) => r.user_count === 0)) {
        return res.status(404).json({
          message: `No user data found for the year ${year}.`,
        });
      }

      res.status(200).json({
        message: `User count per month for the year ${year}.`,
        data: mergedResults,
      });
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching user details.",
        details: error.message,
      });
    }
  }
  async getPropertiesByListingDate(req, res) {
    console.log("getPropertiesByListingDate function executed");

    const { year } = req.query;

    try {
      if (!year) {
        return res.status(400).json({
          error: "Please provide a valid year.",
        });
      }

      const tableName = "dy_property";

      // Get the current year and month
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-based

      let monthLimitCondition = "";
      let maxMonth = 12; // Default: Return all 12 months

      if (parseInt(year) === currentYear) {
        monthLimitCondition = `AND MONTH(rec_add_time) <= ${currentMonth}`;
        maxMonth = currentMonth; // Only return up to the current month
      }

      // Define the where condition
      const whereCondition = `DATE_FORMAT(rec_add_time, '%Y') = ${db.escape(
        year
      )} ${monthLimitCondition}`;

      // Query to count properties per month
      const fieldNames =
        "MONTH(rec_add_time) AS month, COUNT(*) AS property_count";
      const results = await this.dbService.getRecordsByFields(
        tableName,
        fieldNames,
        whereCondition +
          " GROUP BY MONTH(rec_add_time) ORDER BY MONTH(rec_add_time)"
      );

      // Month names mapping
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Generate months based on current year condition
      const allMonths = Array.from({ length: maxMonth }, (_, i) => i + 1);

      // Merge DB results with expected months
      const mergedResults = allMonths.map((month) => {
        const result = results.find((r) => Number(r.month) === month); // Convert to number
        return {
          month_id: month,
          month_name: monthNames[month - 1], // Get the month name from the array
          property_count: result ? result.property_count : 0,
        };
      });

      // Check if all property counts are `0`
      if (mergedResults.every((r) => r.property_count === 0)) {
        return res.status(404).json({
          message: `No property data found for the year ${year}.`,
        });
      }

      res.status(200).json({
        message: `Property count per month for the year ${year}.`,
        data: mergedResults,
      });
    } catch (error) {
      console.error("Error fetching property details:", error.message);
      res.status(500).json({
        error: "An error occurred while fetching property details.",
        details: error.message,
      });
    }
  }
}
class FirebaseController {
  async getAnalyticsData(req, res) {
    try {
      const { startDate = "2025-04-14", endDate = "today" } = req.query; // Allow dynamic date range

      const [response] = await client.runReport({
        property: "properties/476547751",
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "screenPageViews" },
          { name: "activeUsers" },
          { name: "eventCount" },
        ],
        dimensions: [{ name: "pagePath" }],
      });
      if (!response || !response.rows || response.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No analytics data found.",
        });
      }

      // Format the response to a structured JSON
      const formattedData = response.rows.map((row) => ({
        pagePath: row.dimensionValues[0].value,
        screenPageViews: row.metricValues[0].value,
        activeUsers: row.metricValues[1].value,
        eventCount: row.metricValues[2].value,
      }));

      return res.status(200).json({
        success: true,
        data: formattedData,
      });
    } catch (error) {
      console.error("Error fetching analytics report:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch analytics data.",
      });
    }
  }
}

module.exports = {
  UserActionsController,
  PropertyController,
  UserProfile,
  UserController,
  LandMarksController,
  AmenitiesController,
  ServicesController,
  FirebaseController,
};
