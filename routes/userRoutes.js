import express from "express"
const router = express.Router()
import {
    userRegister, userMail, userLogin, getUserByName,
    generateOTP, verifyOTP, resetAllVairables, updateUser, resetPassword
} from "../controllers/userController.js"
import { verifyUser, localVaiables, usernameVerification } from "../helper/verify.js";

router.get("/generateotp/:username", usernameVerification, localVaiables, generateOTP)

router.get("/verifyotp", verifyOTP)

router.get("/createresetsession", resetAllVairables);

router.get("/:username", verifyUser, getUserByName)

router.post("/register", userRegister)

router.post("/registermail", userMail)

router.post("/login", userLogin)


router.put("/updateuser", verifyUser, updateUser)

router.put("/resetpassword", verifyUser, resetPassword)

export default router;