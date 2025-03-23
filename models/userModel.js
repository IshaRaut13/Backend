// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     phone: { type: String, default: '000000000' },
//     address: { type: Object, default: { line1: '', line2: '' } },
//     gender: { type: String, default: 'Not Selected' },
//     dob: { type: String, default: 'Not Selected' },
//     password: { type: String, required: true },
//     role: { type: String, enum: ["user", "admin"], default: "user" },
// }, { timestamps: true });

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// const userModel = mongoose.models.user || mongoose.model("user", userSchema);
// export default userModel;

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '000000000' },
    address: { type: String, default: "" },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    gender: { type: String, default: 'Not Selected' },
    dob: { type: String, default: 'Not Selected' },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });


const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
