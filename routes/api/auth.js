const express = require("express");
const router= express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult}= require("express-validator");
const bcrypt= require("bcryptjs");
const jwt= require("jsonwebtoken");
const config= require("config");
const User= require("../../models/User");

//@route GET api/auth
//@desc Test route
//@access Public
router.get("/", auth, async function(req,res){
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        res.status(500).send("server error");
    }

});

//login user
router.post("/",[
    check('email',"Enter a valid Email").isEmail(),
    check('password',"Password required").exists()
], async function(req,res){
    const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
    try{
        const {email, password} = req.body;

        //Check is user available or not
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({errors:[{msg:"invalid credentials"}]});
        }

        //check if password same
        const isMatch= await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({errors:[{msg:"invalid credentials"}]});
        }

        //JWT token
        const payload= {
            user: {
               id: user.id
            } 
        }

        jwt.sign(payload, config.get("JwtSecret"), {expiresIn:360000},function(err, token){
            if(err) throw err
            res.json({token});
        });

    }catch(err){
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;