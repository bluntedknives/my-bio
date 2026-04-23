const fs = require("fs");
const ytdl = require("@distube/ytdl-core");

const videoUrl = "https://www.youtube.com/watch?v=nhGCSga_0wU";
const outputFilePath = "video.mp4";

ytdl(videoUrl, {
  quality: "highest",
  filter: "audioandvideo",
  requestOptions: {
    headers: {
      // helps a lot on Cloud environments
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
  },
})
  .pipe(fs.createWriteStream(outputFilePath))
  .on("error", (err) => console.error("Error during download:", err))
  .on("finish", () => console.log("Download finished successfully!"));
