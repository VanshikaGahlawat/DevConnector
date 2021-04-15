const express= require("express");
const connectDB= require("./config/db");


const app = express();
app.use(express.json({extended: false}));

//connect db
connectDB();

//Define routes
app.use("/api/users", require("./routes/api/user"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

app.get("/", function(req,res){
    res.send("server running");
});

const port= process.env.PORT || 5000;
app.listen(port,function(){
    console.log(`server running at port ${port}`);
});