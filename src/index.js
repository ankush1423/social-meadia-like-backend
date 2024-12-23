import { app } from "./app.js";
import { connectDB } from "./db/connectDB.js";

const port = process.env.PORT || 8080

const start = async() => {
     try
     {
           await connectDB(process.env.MONGODB_URI)
           console.log("DATABASE IS CONNECTED")
           app.listen(port , () => console.log("SERVER LISTEN AT PORT : ",port))
     }
     catch(error)
     {
        console.log("ERROR IN CONNECTING DATABASE : ",error)
     }
}

start()