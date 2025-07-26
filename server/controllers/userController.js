// Register User

import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from "../lib/cloudinary.js";

export const signup = async(req , res)=>{
    try{
        const {fullName ,email ,password,bio} = req.body;

        if(!fullName || !email || !password || !bio){
            return res.json({success: false,message: 'Missing Details'})
        }

        const existingUser = await User.findOne({email})

        if(existingUser)
            return res.json({success:false,message: 'User Already Exists'})
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({fullName,email,password: hashedPassword,bio})

        const token = jwt.sign({id: newUser._id},process.env.JWT_SECRET, {expiresIn:'7d'});

        res.cookie('token', token, {
            httpOnly: true, // Prevent Javascript to access cookie
            secure: process.env.NODE_ENV === 'production', //Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' , // CSRF protection
            maxAge: 7 * 24 * 60 * 60* 1000, // Cookie expiration time
        })

        return  res.json({
            success:true,
            user: {email: newUser.email, name: newUser.fullName}
            
        
        })




    }catch(error){
        console.log(error.message);
        res.json({success:false, message: error.message});

    }
}

// Login User : /api/user/login

export const login = async (req,res)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password)
            return res.json({success: false, message: 'Email and password are required' });

        const userData = await User.findOne({email});

        if(!userData){
             return res.json({success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, userData.password)

        if(!isMatch){
             return res.json({success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({id: userData._id},process.env.JWT_SECRET, {expiresIn:'7d'});

        res.cookie('token', token, {
            httpOnly: true, // Prevent Javascript to access cookie
            secure: process.env.NODE_ENV === 'production', //Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict' , // CSRF protection
            maxAge: 7 * 24 * 60 * 60 *1000, // Cookie expiration time
        })

        return  res.json({success:true ,user: {email: userData.email, name: userData.fullName}})




    } catch (error) {
         console.log(error.message);
        res.json({success:false, message: error.message});

        
    }
}

// Check Auth :/api/user/is-auth

export const isAuth = async(req , res)=>{
    try {
        const {userId} = req;
        const user = await User.findById(userId).select("-password")
        return res.json({success:true, user})

        
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message: error.message});


        
    }
}


// Logout User : /api/User/logout

export const logout = async(req , res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true, // Prevent Javascript to access cookie
            secure: process.env.NODE_ENV === 'production', //Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict' , // CSRF protection
           

        });
        return res.json({success: true , message:"Logged Out" })
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message: error.message});
        
    }

}


// Controller to update user profile details

export const updateProfile = async(req , res)=>{
    try {
        const {profilePic,bio,fullName} = req.body;
        const userId = req.userId;
        let updatedUser;

        if(!profilePic){
           updatedUser =  await User.findByIdAndUpdate(userId,{bio,fullName},{new:true})
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
        }

        res.json({success:true,user:updatedUser})

    
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}