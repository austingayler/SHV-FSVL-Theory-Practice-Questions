const fs = require("fs");
const axios = require("axios");
const path = require("path");

const jsonFiles = [
  "practice.json",
  "materials.json",
  "legislation.json",
  "meteorology.json",
  "aerodynamics.json",
];

const uniqueImageIDs = new Set();

jsonFiles.forEach((fileName) => {
  try {
    const jsonData = JSON.parse(fs.readFileSync(fileName, "utf8"));

    const questions =
      jsonData.Envelope.Body.GetQuestionsResponse.GetQuestionsResult.Result
        .__Question;

    questions.forEach((question) => {
      uniqueImageIDs.add(question.ImageID);
    });
  } catch (error) {
    console.error(`Error reading or processing ${fileName}: ${error}`);
  }
});

// Convert the Set to an array
const uniqueImageIDsArray = [...uniqueImageIDs].filter((id) => !!id);

const downloadImage = async (id) => {
  try {
    const response = await axios.get(
      `https://elearning.shv-fsvl.ch/pictures/${id}.jpg`,
      {
        responseType: "stream",
      }
    );

    const imagePath = path.join(__dirname, "images", `${id}.jpg`);

    const writer = fs.createWriteStream(imagePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Error downloading image ${id}: ${error}`);
  }
};

const downloadImages = async () => {
  try {
    await fs.promises.mkdir("images", { recursive: true });

    for (const id of uniqueImageIDsArray) {
      await downloadImage(id);
    }

    console.log("Images downloaded successfully.");
  } catch (error) {
    console.error(
      `Error creating images folder or downloading images: ${error}`
    );
  }
};

console.log(uniqueImageIDsArray);

downloadImages();
