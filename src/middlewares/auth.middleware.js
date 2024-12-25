import jwt from "jsonwebtoken"
import  {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req,res,next) => {
        try 
        {
            const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
    
            if(!token)
            {
                throw new ApiError(400,"error while getting the error")
            }

            const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
            
            if(!decodedToken)
            {
                throw new ApiError(400,"error while verify the token")
            }

            const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")

            if(!user)
            {
                throw new ApiError(400,"Invalid Access Token")
            }

            req.user = user
            next()
        } 
        catch (error) 
        {
            console.log("Invalid Access Token")
        }
})
