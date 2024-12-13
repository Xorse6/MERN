import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';


import userModel from "../models/userModel.js";
import transporter from '../config/nodemailer.js';




export const register = async (req, res) => {
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.json({success:false, message: 'Missing Details'})
    }

    try {

        // Checking already existed user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" })
        }

        // Validating email and password
        // if (!validator.isEmail(email)) {
        //     return res.json({ success: false, message: "Please enter a valid email" })
        // }

        // if (password.length < 8) {
        //     return res.json({ success: false, message: "Please enter a strong password" })
        // }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });

        const user = await newUser.save()

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        } );


        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Niche Studios",
            text:`Welcome to Niche Studios, your account has been created with email id: ${email}`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success: true});

    } catch (error) {
       return res.json({success: false, message: error.message})
    }
}



export const login = async (req, res) => {
    const {name,email,password} = req.body;

    if(!email || !password){
        return res.json({success:false, message: 'Email and Password are required'})
    }

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Password" })

        }
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        } );

        return res.json({success: true});



    } catch (error) {
        console.log(error);
       return res.json({ success: false, message: error.message })
    }
}


export const logout = async (req, res) => {
    

    try {
       
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        } );

        return res.json({success: true, message: "Logged Out"});



    } catch (error) {
        
        return res.json({ success: false, message: error.message })
    }
}

// Verification OTP
export const sendVerifyOtp = async (req,res) => {
    try {
        const {userId} = req.body;

        const user  = await userModel.findById(userId) ;
        if(user.isAccountVerified){
            res.json({ success: false, message: "Account Already Verified" })
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            // text:`Your OTP is ${otp}. Verify your account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        res.json({success: true, message: "Verification OTP sent on Email"})

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const verifyEmail = async(req,res) => {
    const {userId, otp} = req.body;

    if(!userId || !otp){
        res.json({ success: false, message: "Missing Details" });

    }
    try {
        const user = await userModel.findById(userId);
        if(!user){
            res.json({ success: false, message: "User Not Found" });
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            res.json({ success: false, message: "Invalid OTP" });
        }

        if(user.verifyOtpExpireAt < Date.now()){
            res.json({ success: false, message: "OTP Expired" });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        res.json({ success: true, message: "Email Verified Successfully" });


    } catch (error) {
        return res.json({ success: false, message: error.message })
    }

}


// check for user authentication
export const isAuthenticated = async (req, res) => {
    try {
        
        res.json({ success: true});

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// password reset OTP
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        res.json({ success: false, message: "Email Required" });
    }


    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            res.json({ success: false, message: "User Not Found" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            // text:`Your OTP for resetting your password is ${otp}. Proceed using the OTP to set your password.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)

        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "OTP Sent To Your Email" })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}



// OTP Verification and Password Reset

export const resetPassword = async (req,res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: "Email, OTP, New Password Required"});
    }

    try {

        const user = await userModel.findOne({email});
        if(!user){
            return res.json({ success: false, message: "User Not Found" });

        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({ success: false, message: "Invalid OTP" });

        }

        if(user.resetOtpExpiredAt < Date.now()){
            return res.json({ success: false, message: "OTP Expired" });

        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiredAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password Has Been Reset Successfully" });

        
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
















