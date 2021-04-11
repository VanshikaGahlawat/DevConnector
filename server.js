const express= require("express");
const connectDB= require("./config/db");


const app = express();
app.use(express.json({extended: false}));

//connect db
connectDB();

//Define routes
app.use("/api/users", require("./routes/api/user"));

app.get("/", function(req,res){
    res.send("server running");
});

const port= process.env.PORT || 3000;
app.listen(port,function(){
    console.log(`server running at port ${port}`);
});