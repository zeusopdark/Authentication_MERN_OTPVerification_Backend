import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyUser = (req, res, next) => {

    const token = req.cookies.token;

    if (!token || token === undefined) {
        return res.status(403).json({ message: "No cookie, authorization failed" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decodedToken);
        req.id = decodedToken.userId; // Accessing `userId` property
        // console.log(req.id);
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid cookie" });
    }
};

export const usernameVerification = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        // console.log(username, user);
        console.log(user.email);
        if (!user) {
            return res.status(404).json({ message: "Username Not found", success: false });
        }
        req.userEmail = user.email;
        next();
    }
    catch (err) {
        return res.status(500).json({ message: "Internal server error" });

    }
}

export const localVaiables = (req, res, next) => {
    req.app.locals = {
        OTP: null,
        resetSession: false
    }
    next();
}




