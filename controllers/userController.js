import User from "../models/user.model.js"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import otpgenerator from "otp-generator"
import sendEmail from "./mailer.js";
export const userRegister = async (req, res, next) => {
    try {
        const { username, password, profile, email } = req.body;

        // Check if username or email already exists
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ error: "Username or email already exists." });
        }

        // Check if password exists in the request body
        if (!password) {
            return res.status(400).json({ error: "Password is required." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            username,
            password: hashedPassword,
            profile,
            email
        });

        // Save user to the database
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully." });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const userMail = async (req, res, next) => {
    const { email, text, subject } = req.body;
    await sendEmail(email, text || "Something went wrong ...!", subject || "Password Recovery.")
    res.status(200).json({ success: true });
}

export const userLogin = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        // Find user by username
        const user = await User.findOne({ username });

        // If user doesn't exist or password is incorrect
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const token = jwt.sign({
            userId: user._id,
            username: user.username
        }, process.env.JWT_SECRET, { expiresIn: "24h" })
        console.log(token);

        res.cookie('token', token);
        const { password: something, ...rest } = user._doc;
        // User authenticated successfully
        return res.status(200).json({ message: "Login successful", rest, success: true, token });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getUserByName = async (req, res, next) => {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    try {
        if (!user) {
            return res.status(404).json({ message: "Username not found" });
        }
        return res.status(200).json({ message: "Successful", success: true });
    } catch (err) {
        res.status(500).json("Internal server error");
    }
}
export const generateOTP = async (req, res, next) => {
    req.app.locals.OTP = otpgenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    req.app.locals.resetSession = true; //set the session for reset  password
    res.status(201).send({ code: req.app.locals.OTP, email: req.userEmail, success: true });
}

export const verifyOTP = (req, res, next) => {
    const { code } = req.query;
    console.log(code);
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null;//reset the otp value
        return res.status(201).send({ msg: "Verify succesfully", success: true })
    }
    return res.status(400).json({ error: "Invalid OTP" });

}
export const resetAllVairables = async (req, res, next) => {
    if (req.app.locals.resetSession) {
        req.app.locals.resetSession = false ///allow this access of route only once
        return res.status(201).json({ msg: "access granted", success: true })
    }
    return res.status(400).json({ error: "Session expired" })
}
export const updateUser = async (req, res, next) => {
    try {
        const id = req.id;
        console.log(id);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: "Invalid user ID" });
        }

        const body = req.body;
        // console.log(body);
        const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        const { password, ...rest } = updatedUser._doc;
        return res.status(200).json({ message: "User successfully Updated", success: true, rest });
    } catch (err) {
        return res.status(500).send({ error: "An error occurred while updating the user", details: err });
    }


}
export const resetPassword = async (req, res, next) => {
    try {
        if (!req.app.locals.resetSession) return res.status(440).json({ error: "Session Expired" })
        const { username, password } = req.body;
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "Failed", error: "Invalid username" });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        user.password = hashedPassword;
        await user.save();
        req.app.locals.resetSession = false;
        return res.status(200).json({ message: "Password reset successful", success: true });
    } catch (err) {
        console.error("Error in resetPassword:", err);
        return res.status(500).json({ message: "Failed to reset password", error: err.message });
    }
}


