import mongoose  from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
      lowercase : true
    },
    fullname : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 30,
        trim : true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength : 15
    },
    profilePicture: {
      type: String, // URL of the profile picture
    },
    bio: {
      type: String,
      maxlength: 150,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', // Assuming a separate Post model
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    notifications: [
      {
        type: {
          type: String,
          enum: ["like", "comment", "follow", "message"],
          required: true,
        },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post',
        },
        message: {
          type: String,
        },
        read: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    refreshtoken : {
        type : String
    }
},{timestamps : true});

userSchema.pre("save",async function(next){
     if(!this.isModified("password")) return next();
     this.password = await bcrypt.hash(this.password , 10)
     next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
     return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
      return jwt.sign(
           {
               _id : this._id,
               username : this.username,
               email : this.email
           },
           process.env.ACCESS_TOKEN_SECRET,
           {
              expiresIn : process.env.ACCESS_TOKEN_EXPIRY
           }
      )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
      {
        _id : this._id
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
         expiresIn : process.env.REFRESH_TOKEN_EXPIRY
      }
    )
}

userSchema.plugin(mongooseAggregatePaginate)

export const User = mongoose.model("User",userSchema)