const express= require("express");
const connectDB= require("./config/db");

const app = express();
//connect db
// connectDB();

//Define routes
app.use("/api/users", require("./routes/api/user"));

const port= process.env.PORT || 3000;
app.get("/", function(req,res){
    res.send("server running");
});

app.listen(port,function(){
    console.log(`server running at port ${port}`);
});