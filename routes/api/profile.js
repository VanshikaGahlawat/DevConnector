const express = require("express");
const router= express.Router();
const {check, validationResult}= require("express-validator");
const auth= require("../../middleware/auth");
const Profile= require('../../models/Profile');
const User= require('../../models/User');

//@route GET api/profile/me
//@desc Get profile
//@access Private
router.get("/me", auth, async function(req,res){
    try {
        const profile= await Profile.findOne({user:req.user.id}).populate('user',['name', 'avatar']);
        if(!profile){
            return res.status(400).json({msg:'Profile doesnt exists'}); 
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

//@route POST api/profile
//@desc Create Profile
//@access Private
router.post("/",[auth, [
    check('status','status is required').not().isEmpty(),
    check('skills', "skills are required").not().isEmpty()
]], async function(req,res){
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()}); 
    }
    const {company, website, location, bio,status, skills, githubusername, youtube,facebook, twitter, instagram,linkedin} = req.body;

    const profileFields={};
    profileFields.user= req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website= website;
    if(location) profileFields.location= location;
    if(bio) profileFields.bio=bio;
    if(status) profileFields.status= status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills=skills.split(',').map(skill => skill.trim());
    }
    profileFields.social={}
    if(youtube) profileFields.social.youtube= youtube;
    if(twitter) profileFields.social.twitter= twitter;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(facebook) profileFields.social.facebook = facebook;
    if(instagram) profileFields.social.instagram = instagram;

    try{
        //check if proflie already exists
        let profile= await Profile.findOne({user:req.user.id});
        
        // updating existing profile
        if(profile){
            profile= await Profile.findOneAndUpdate({user:req.user.id}, { $set:profileFields},{new:true});
            return res.json(profile);
        }

        // creating new profile
        profile= new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }

});

//@route GET api/profile
//@desc View all profiles
//@access Public
router.get("/", async function(req,res){
    try{
        let profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

//@route GET api/profile/user/:user_id
//@desc View profile by id
//@access Public
router.get("/user/:user_id", async function(req,res){
    try{
        let profile = await Profile.findOne({user:req.params.user_id}).populate('user', ['name', 'avatar']);

        if(!profile){
           return res.status(400).json({msg:'Profile not found'});
        }
        res.json(profile);
    }catch(err){
        if(err.kind=='ObjectId'){
            return res.status(400).json({msg:"profile not found"});
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

//@route DELETE api/profile
//@desc Delete profile, user and posts
//@access Private
router.delete('/',auth, async function(req,res){
    try {
        //remove posts

        //remove profile
        await Profile.findOneAndRemove({user:req.user.id});
        //remove user
        await User.findOneAndRemove({_id: req.user.id});

        res.json({msg: 'user deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router; 