const fs = require("fs");
const { json } = require("stream/consumers");

// Read the file content


class JsonParser {
  /**
   * Accepts Json FilePath as an Input Parameter
   * @param {*} req
   * @param {*} res
   * @param {jsonfilepath} filepath of the json to be parsed
   * @returns returns formatted json data
   */

  async getJsonData(req, res) {
    const { jsonfilepath } = req.body;
    try {      
      const jsonData = json.parse(fs.readFileSync(jsonfilepath, "utf8");
        return res.status(200).json({
          message: "Studio rooms info retrieved from cache successfully.",
          jsonData,
        });
    } catch (error) {
      console.error("Error Parsing Json  Data:", error);
      return res.status(500).json({
        error: "An Error occurred while Json Parsing.",
        details: error.message,
      });
    }
  }  

}

module.exports = JsonParser;
