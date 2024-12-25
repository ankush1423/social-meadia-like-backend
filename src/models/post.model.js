import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 280, // Limit post content to 280 characters (like Twitter)
  },
  media: [
    {
      url: {
        type: String, // URL for the media file (image, video, etc.)
        required: true,
      },
      type: {
        type: String,
        enum: ['image', 'video', 'audio'], // Restrict to specific media types
        required: true,
      },
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: 200, // Optional limit for comment length
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  shares: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  hashtags: [
    {
      type: String,
      trim: true,
    },
  ],
  location: {
    type: String,
    maxlength: 100, // Optional: Location tagged by the user
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'], // Post visibility settings
    default: 'public',
  },
},{timestamps : true});

postSchema.plugin(mongooseAggregatePaginate)

export const Post = mongoose.model("Post",postSchema)
