import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide unique username"],
        unique: [true, "Username exist"]
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, "Please provide a unique email"],
        unique: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    mobile: {
        type: Number
    },
    address: {
        type: String
    },
    profile: {
        type: String
    }
});
const User = mongoose.Model.Users || mongoose.model("User", UserSchema);
export default User;