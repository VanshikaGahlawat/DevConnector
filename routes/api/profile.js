const express = require("express");
const router= express.Router();
const {check, validationResult}= require("express-validator");
const config= require('config');
const request= require('request');
const auth= require("../../middleware/auth");
const Profile= require('../../models/Profile');
const User= require('../../models/User');
const Post= require('../../models/Post');

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
        await Post.deleteMany({user: req.user.id})
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

//@route PUT api/profile/experience
//@desc Add profile experience
//@access Private
router.put('/experience',[auth , [
    check('title',"title is required").not().isEmpty(),
    check('company',"company is required").not().isEmpty(),
    check('from',"from is required").not().isEmpty()
]],async function(req,res){
    const errors =validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
    const {title, company, location, from, to, current, description} = req.body;
    const newExp = {
        title: title,
        company: company,
        location:location,
        from: from,
        to:to,
        current:current,
        description: description
    }

    try {
        let profile = await Profile.findOne({user:req.user.id});
        profile.experience.unshift(newExp);

        await profile.save();
        res.json(profile);
        
    } catch (err) {
        if(err){
            console.error(err.message);
            res.status(500).send('server error');
        }
        
    }


});

//@route DELETE api/profile/experience/:experience_id
//@desc Delete profile experience
//@access Private
router.delete('/experience/:experience_id', auth, async function(req,res){
    try {
        const profile= await Profile.findOne({user:req.user.id});

        //get index of experience to be deleted
        const removeIndex= profile.experience.map(item => item.id).indexOf(req.params.experience_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
        
    } catch (err) {
        if(err){
            console.error(err.message);
            res.status(500).send('server error');
        }
        
    }
});

//@route PUT api/profile/education
//@desc Add profile education
//@access Private
router.put('/education',[auth , [
    check('school',"school is required").not().isEmpty(),
    check('degree',"degree is required").not().isEmpty(),
    check('fieldofstudy',"fieldofstudy is required").not().isEmpty(),
    check('from',"from is required").not().isEmpty()

]],async function(req,res){
    const errors =validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
    const {school, degree, fieldofstudy, from, to, current, description} = req.body;
    const newEdu = {
        school:school,
        degree: degree,
        fieldofstudy:fieldofstudy,
        from: from,
        to:to,
        current:current,
        description: description
    }

    try {
        let profile = await Profile.findOne({user:req.user.id});
        profile.education.unshift(newEdu);

        await profile.save();
        res.json(profile);
        
    } catch (err) {
        if(err){
            console.error(err.message);
            res.status(500).send('server error');
        }
        
    }


});

//@route DELETE api/profile/education/:education_id
//@desc Delete profile education
//@access Private
router.delete('/education/:education_id', auth, async function(req,res){
    try {
        const profile= await Profile.findOne({user:req.user.id});

        //get index of education to be deleted
        const removeIndex= profile.education.map(item => item.id).indexOf(req.params.education_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
        
    } catch (err) {
        if(err){
            console.error(err.message);
            res.status(500).send('server error');
        }
        
    }
});

//@route GET api/profile/github/:username
//@desc Get github repos
//@access Public
router.get('/github/:username', function(req,res){
    try {
        options ={
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}` ,
            method: 'GET',
            headers: {'user-agent':'node.js' }
        }

        request(options,(error, response, body) =>{
            if(error) console.error(error.message)

            if(response.statusCode !== 200){
                return res.status(404).json({msg:"github not found"});
            }

            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('sever error');
        
    }
});

module.exports = router; 