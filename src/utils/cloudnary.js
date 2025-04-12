// here we will create a middle ware to upload file to the server in cloudnary
import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; // it is a file system available in node helps to read write remove or update

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


// now we will write a function to upload the file in the cloudinary server
const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        // upload the file on the cloudinary site 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded if it reaches here
        // console.log("The file was uploaded on the cloudinary server",response.url);
        fs.unlinkSync(localFilePath);
        // when the file is uploaded then it is removed automatically from the folder
        return response;
    }catch(error){
        // if the file is not uploaded to cloudinary then we have to clean it from our system
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as upload
        return null;
    }
}

export {uploadOnCloudinary};