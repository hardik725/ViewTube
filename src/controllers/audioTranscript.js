import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import fs from "fs-extra";

const baseUrl = "https://api.assemblyai.com";
const headers = {
  authorization: process.env.ASSEMBLY_API_KEY, // use env key
};

const uploadAudio = asyncHandler(async (req, res) => {
  const audioPath = req.file?.path;
  const audioData = await fs.readFile(audioPath);
  if (!audioData) throw new ApiError(400, "No audio file uploaded");

//   Upload to AssemblyAI
    const uploadResponse = await axios.post(`${baseUrl}/v2/upload`, audioData, {
        headers,
    });

  const audioUrl = uploadRes.data.upload_url;

  // Request transcription
  const transcriptRes = await axios.post(
    `${baseUrl}/v2/transcript`,
    { audio_url: audioUrl, speech_model: "universal" },
    { headers }
  );

  const transcriptId = transcriptRes.data.id;
  const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;

  // Polling
  let completed = false;
  while (!completed) {
    const pollRes = await axios.get(pollingEndpoint, { headers });
    const transcriptionResult = pollRes.data;

    if (transcriptionResult.status === "completed") {
      completed = true;
      return res.status(200).json(
        new ApiResponse(200, transcriptionResult, "Audio converted to text successfully")
      );
    } else if (transcriptionResult.status === "error") {
      throw new ApiError(400, `Transcription failed: ${transcriptionResult.error}`);
    } else {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
});

export {uploadAudio};
