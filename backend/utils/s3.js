const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const redis = require("../config/redis");
const db = require("../config/db");
const  TransactionController=require("../utils/transaction")

class S3Service {
  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION });
    this.bucketName = process.env.AWSS3_BUCKET_NAME;
    this.cacheTTL = process.env.REDIS_TTL || 86400; // 1 day
  }

  async getAllCommunityImg() {
    try {
      let allImages = await redis.hgetall("all_community_images");
      console.log("allImages", allImages);
      if (!Object.keys(allImages).length) {
        let allimg = await this.fetchAndCacheCommunityImages();
        console.log("allImags", allimg);
        allImages = await redis.hgetall("all_community_images");
      }

      const updated = Object.entries(allImages).map(([id, urlJson]) => {
        // Parse the JSON string to get the array
        const urls = JSON.parse(urlJson);
        const url = urls[0]; // Assuming only one image per community

        const imageName = url.split("/").pop();

        return {
          id,
          url,
          name: imageName.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, ""), // remove file extension
        };
      });

      console.log("Updated images: ", updated);
      return updated;
    } catch (err) {
      console.error("Error in getAllCommunityImg:", err);
      return [];
    }
  }

  async uploadImages(files, uid, folderType) {
    let folderPath = `${folderType}/${uid}/images/`;
    try {
      await Promise.all(
        files.map(async (file) => {
          const resizedImageBuffer = await sharp(file.buffer)
            .resize(800, 600)
            .toBuffer();

          const filePath = `${folderPath}${file.originalname}`;
          await this.s3.send(
            new PutObjectCommand({
              Bucket: this.bucketName,
              Key: filePath,
              Body: resizedImageBuffer,
              ContentType: file.mimetype,
            })
          );
        })
      );

      return folderPath;
    } catch (error) {
      throw new Error("Failed to upload images: " + error.message);
    }
  }
  async uploadCommunityImages(files, uid, folderType) {
    let folderPath = `${folderType}/${uid}/`;
    try {
      await Promise.all(
        files.map(async (file) => {
          const resizedImageBuffer = await sharp(file.buffer)
            .resize(800, 600)
            .toBuffer();

          const filePath = `${folderPath}${file.originalname}`;
          await this.s3.send(
            new PutObjectCommand({
              Bucket: this.bucketName,
              Key: filePath,
              Body: resizedImageBuffer,
              ContentType: file.mimetype,
            })
          );
        })
      );

      return folderPath;
    } catch (error) {
      throw new Error("Failed to upload images: " + error.message);
    }
  }

  async fetchAndCachePropertyImages() {
    try {
      let allPropertyImages = {};
      let isTruncated = true;
      let continuationToken = null;

      while (isTruncated) {
        const propertyCommand = new ListObjectsV2Command({
          Bucket: process.env.AWSS3_BUCKET_NAME,
          Prefix: "properties/",
          MaxKeys: 1000, // Fetch up to 1000 objects per request
          ContinuationToken: continuationToken, // Handle pagination
        });

        const {
          Contents: propertyContents,
          IsTruncated,
          NextContinuationToken,
        } = await this.s3.send(propertyCommand);
        isTruncated = IsTruncated;
        continuationToken = NextContinuationToken;

        if (propertyContents && propertyContents.length > 0) {
          propertyContents.forEach((file) => {
            const match = file.Key.match(/properties\/([^/]+)\/images\/(.+)/);
            if (match) {
              const propertyUid = match[1];
              const imageUrl = `https://${process.env.AWSS3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`;

              if (!allPropertyImages[propertyUid]) {
                allPropertyImages[propertyUid] = [];
              }
              allPropertyImages[propertyUid].push(imageUrl);
            }
          });
        }
      }

      // ✅ Cache property images in Redis
      if (Object.keys(allPropertyImages).length > 0) {
        await Promise.all(
          Object.entries(allPropertyImages).map(([uid, images]) =>
            redis.hset("all_property_images", uid, JSON.stringify(images))
          )
        );
        await redis.expire("all_property_images", 21600);
      }

      return allPropertyImages;
    } catch (error) {
      console.error("Error fetching and caching property images:", error);
      return {};
    }
  }
  async fetchAndCacheCommunityImages() {
    try {
      let allCommunityImages = {};
      let isTruncated = true;
      let continuationToken = null;

      while (isTruncated) {
        const communityCommand = new ListObjectsV2Command({
          Bucket: process.env.AWSS3_BUCKET_NAME,
          Prefix: "communities/default_images/",
          MaxKeys: 1000, // Fetch up to 1000 objects per request
          ContinuationToken: continuationToken,
        });

        const {
          Contents: communityContents,
          IsTruncated,
          NextContinuationToken,
        } = await this.s3.send(communityCommand);
        isTruncated = IsTruncated;
        continuationToken = NextContinuationToken;

        if (communityContents && communityContents.length > 0) {
          communityContents.forEach((file) => {
            const match = file.Key.match(
              /communities\/default_images\/([^/]+)\/(.+)/
            );
            if (match) {
              const communityId = match[1];
              const imageUrl = `https://${process.env.AWSS3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`;

              if (!allCommunityImages[communityId]) {
                allCommunityImages[communityId] = [];
              }
              allCommunityImages[communityId].push(imageUrl);
            }
          });
        }
      }

      // ✅ Cache community images in Redis
      if (Object.keys(allCommunityImages).length > 0) {
        await Promise.all(
          Object.entries(allCommunityImages).map(([uid, images]) =>
            redis.hset("all_community_images", uid, JSON.stringify(images))
          )
        );
        await redis.expire("all_community_images", 21600);
      }

      return allCommunityImages;
    } catch (error) {
      console.error("Error fetching and caching community images:", error);
      return {};
    }
  }
  async uploadPDFs(files, user_id, prop_id) {
    let folderPath = `users/${user_id}/rentalagreements/RRA_${prop_id}`;
    try {
      await Promise.all(
        files.map(async (file) => {
          const fileExtension = file.originalname.split(".").pop(); // Extract file extension
          console.log("fileExtension: ", fileExtension);

          const filePath = `${folderPath}.${fileExtension}`; // Appending original name with extension

          const rss = await this.s3.send(
            new PutObjectCommand({
              Bucket: this.bucketName,
              Key: filePath,
              Body: file.buffer, // Directly upload file buffer
              ContentType: file.mimetype, // Ensure proper MIME type
            })
          );
        })
      );

      return folderPath;
    } catch (error) {
      throw new Error("Failed to upload PDFs: " + error.message);
    }
  }

  async getPDFUrls(folderPath) {
    if (!folderPath) {
      console.error("Folder path is required.");
      return;
    }

    try {
      const listParams = {
        Bucket: this.bucketName,
        Prefix: folderPath.endsWith("/") ? folderPath : folderPath + "/",
      };

      const data = await this.s3.send(new ListObjectsV2Command(listParams));
      console.log("S3 ListObjects Response:", data);

      if (!data.Contents || data.Contents.length === 0) {
        console.log("No files found in the specified folder.");
        return [];
      }

      console.log(
        "S3 Files:",
        data.Contents.map((item) => item.Key)
      );

      // Generate URLs for all files in the folder
      const fileUrls = data.Contents.map(
        (file) =>
          `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
      );

      return fileUrls;
    } catch (error) {
      console.error("Error fetching PDFs from S3:", error);
      throw new Error("Failed to fetch PDFs: " + error.message);
    }
  }

  async getPropertyImages(uid) {
    try {
      let images = await redis.hget("all_property_images", uid);

      if (!images) {
        await this.fetchAndCachePropertyImages();
        images = await redis.hget("all_property_images", uid);
      }

      return images ? JSON.parse(images) : [];
    } catch (error) {
      console.error("Error fetching property images from Redis:", error);
      return [];
    }
  }

  async getCommunityImages(uid) {
    try {
      let images = await redis.hget("all_community_images", uid);
      if (!images) {
        await this.fetchAndCacheCommunityImages(); // Fetch all images if not found in cache
        images = await redis.hget("all_community_images", uid);
      }
      return images ? JSON.parse(images) : [];
    } catch (error) {
      console.error("Error fetching community images from Redis:", error);
      return [];
    }
  }

  async uploadJsonToS3(key, jsonData) {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWSS3_BUCKET_NAME,
        Key: key,
        Body: jsonData,
        ContentType: "application/json",
      });

      await this.s3.send(command);
      console.log(`Successfully uploaded JSON to S3: ${key}`);
    } catch (error) {
      console.error("Error uploading JSON to S3:", error);
      throw new Error("Failed to upload JSON to S3.");
    }
  }
  async getJsonFromS3(s3Key) {
    try {
      const params = {
        Bucket: process.env.AWSS3_BUCKET_NAME,
        Key: s3Key,
      };

      // Fetch the object from S3
      const command = new GetObjectCommand(params);
      const response = await this.s3.send(command);

      // Read the stream from the response
      const streamToString = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () =>
            resolve(Buffer.concat(chunks).toString("utf-8"))
          );
          stream.on("error", reject);
        });

      const jsonString = await streamToString(response.Body);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Error retrieving JSON from S3 (${s3Key}):`, error);
      throw new Error("Failed to retrieve JSON from S3");
    }
  }
  async listFilesInS3Folder(folderPath) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName, // Use class property for bucket name
        Prefix: folderPath, // Folder path as prefix
      });

      const response = await this.s3.send(command); // Use S3Client instance from the class
      if (!response.Contents || response.Contents.length === 0) {
        console.log(`No files found in S3 folder: ${folderPath}`);
        return [];
      }

      // Extract file keys from the response
      const fileKeys = response.Contents.map((file) => file.Key);

      return fileKeys;
    } catch (error) {
      console.error(
        `Error listing files in S3 folder (${folderPath}):`,
        error.message
      );
      throw new Error("Failed to list files in S3.");
    }
  }

  async ensureFolderExists(folderPath) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folderPath,
        MaxKeys: 1,
      });

      const { Contents } = await this.s3.send(command);
      console.log("contents", Contents);
      if (!Contents || Contents.length === 0) {
        const createFolder = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `${folderPath}`,
          Body: "",
        });

        await this.s3.send(createFolder);
        console.log(`Created folder: ${folderPath}`);
      }
    } catch (error) {
      console.error(`Error checking/creating folder ${folderPath}:`, error);
    }
  }

  async deleteImage(imagePaths) {
    if (!imagePaths || imagePaths.length === 0) {
      return;
    }

    try {
      // Prepare objects for deletion
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: imagePaths.map((path) => ({ Key: path })),
          Quiet: false,
        },
      };

      // Perform batch delete in S3
      await this.s3.send(new DeleteObjectsCommand(deleteParams));

      // Extract UID from image paths and update Redis
      const uidSet = new Set();
      imagePaths.forEach((path) => {
        const match = path.match(/property_images\/([^/]+)\//);
        if (match) {
          uidSet.add(match[1]); // Extract UID
        }
      });

      // Update Redis Cache for affected UIDs
      for (let uid of uidSet) {
        let cachedImages = await redis.hget("all_property_images", uid);
        if (cachedImages) {
          let updatedImages = JSON.parse(cachedImages).filter(
            (img) =>
              !imagePaths.includes(
                img.replace(
                  `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
                  ""
                )
              )
          );

          if (updatedImages.length > 0) {
            await redis.hset(
              "all_property_images",
              uid,
              JSON.stringify(updatedImages)
            );
          } else {
            await redis.hdel("all_property_images", uid); // Remove entry if no images left
          }
        }
      }

      console.log("Images successfully deleted from S3 and Redis updated.");
    } catch (error) {
      console.error("Error deleting images from S3:", error);
      throw new Error("Failed to delete images: " + error.message);
    }
  }
}
module.exports = new S3Service();
