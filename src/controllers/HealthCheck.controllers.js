import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getHealthScore = asyncHandler(async(req,res) => {
    const {
    age,
    gender,
    height,
    weight,
    screenTime,
    viewingDistance,
    deviceUsed,
    videoBrightness,
    audioLevel,
    sleepSchedule,
    headache
    } = req.body;

    const response = await fetch("https://health-score-qy4x.onrender.com/predictHealthScore",{
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
                Age: age,
                Gender: gender,
                Height: height,
                Weight: weight,
                ScreenTime: screenTime,
                ViewingDistance: viewingDistance,
                DeviceUsed: deviceUsed,
                VideoBrightness: videoBrightness,
                AudioLevel: audioLevel,
                SleepSchedule: sleepSchedule,
                Headache: headache
            })
        })

        const healthData = response.json();
        if(!healthData){
            throw new ApiError(404,"Health Score Output is not got here.");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,healthData,"Health Score is successfully Fetched.")
        );
});

export {getHealthScore};