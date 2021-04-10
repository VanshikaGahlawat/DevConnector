const express = require("express");
const router= express.Router();

//@route GET api/users
//@desc Test route
//@access Public
router.get("/", function(req,res){
    res.send("User Route");
});

module.exports = router;