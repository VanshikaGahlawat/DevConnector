const express = require("express");
const router= express.Router();
const {check, validationResult}= require("express-validator");
const bcrypt= require("bcryptjs");
const gravatar= require("gravatar");
const jwt= require("jsonwebtoken");
const config= require("config");
const User = require("../../models/User");


//@route POST api/users
//@desc Register Users
//@access Public
router.post("/",[
    check ('name', "Name is required").not().isEmpty(),
    check('email',"Enter a valid Email").isEmail(),
    check('password',"Password should be atleast 8 characters long").isLength({min:8})
], async function(req,res){
    const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
    try{
        const {name, email, password} = req.body;

        //Check is user already registered
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({errors:[{msg:"User already exists"}]});
        }

        //Add avatar
        const avatar= gravatar.url(email,{
            s:"200",
            r: 'pg',
            d:'mm'
        });

        //New user
        user = new User({
            name:name,
            email:email,
            password:password,
            avatar:avatar
        });

        //encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);

        await user.save();

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