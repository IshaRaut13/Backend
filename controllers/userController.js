import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import problemModel from "../models/problemModel.js";
import solutionModel from "../models/solutionModel.js";
import feedbackModel from "../models/feedbackModel.js";
import { OAuth2Client } from "google-auth-library";
import { v2 as cloudinary } from "cloudinary";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ API to register user (Email & Password)
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid Email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Weak Password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({ name, email, password: hashedPassword, role });
        const user = await newUser.save();
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ API for user login (Email & Password)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ API for Google Login
const googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body;
        const response = await googleClient.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name } = response.getPayload();
        let user = await userModel.findOne({ email });

        if (!user) {
            user = new userModel({ name, email, password: "", role: "user" });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Google login failed" });
    }
};

// ✅ API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId).select('-password');
        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address } = req.body;
        const imageFile = req.file;

        if (!name || !phone) {
            return res.json({ success: false, message: "Data Missing" });
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address });

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            await userModel.findByIdAndUpdate(userId, { image: imageUpload.secure_url });
        }

        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ API to submit a problem
const submitProblem = async (req, res) => {
    try {
        const { userId, title, description } = req.body;
        if (!title || !description) {
            return res.json({ success: false, message: "Missing problem details" });
        }
        const newProblem = new problemModel({ userId, title, description });
        await newProblem.save();
        res.json({ success: true, message: 'Problem submitted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ API to get all problems
const getProblems = async (req, res) => {
    try {
        const problems = await problemModel.find();
        res.json({ success: true, problems });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ API to submit feedback
const submitFeedback = async (req, res) => {
    try {
        const { userId, feedback } = req.body;
        if (!feedback) {
            return res.json({ success: false, message: "Feedback cannot be empty" });
        }
        const newFeedback = new feedbackModel({ userId, feedback });
        await newFeedback.save();
        res.json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Final Export of All APIs
export {
    registerUser,
    loginUser,
    googleLogin,
    getProfile,
    updateProfile,
    submitProblem,
    getProblems,
    submitFeedback
};

// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import validator from "validator";
// import userModel from "../models/userModel.js";
// import problemModel from "../models/problemModel.js";
// import solutionModel from "../models/solutionModel.js";
// import feedbackModel from "../models/feedbackModel.js";
// import { v2 as cloudinary } from 'cloudinary';

// // API to register user
// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
        
//         if (!name || !email || !password) {
//             return res.json({ success: false, message: 'Missing Details' });
//         }

//         if (!validator.isEmail(email)) {
//             return res.json({ success: false, message: "Please enter a valid email" });
//         }

//         if (password.length < 8) {
//             return res.json({ success: false, message: "Please enter a strong password" });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new userModel({ name, email, password: hashedPassword });
//         const user = await newUser.save();
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

//         res.json({ success: true, token });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // API to login user
// const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await userModel.findOne({ email });

//         if (!user) {
//             return res.json({ success: false, message: "User does not exist" });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (isMatch) {
//             const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//             res.json({ success: true, token });
//         } else {
//             res.json({ success: false, message: "Invalid credentials" });
//         }
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // API to get user profile data
// const getProfile = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const userData = await userModel.findById(userId).select('-password');
//         res.json({ success: true, userData });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // API to update user profile
// const updateProfile = async (req, res) => {
//     try {
//         const { userId, name, phone, address } = req.body;
//         const imageFile = req.file;

//         if (!name || !phone) {
//             return res.json({ success: false, message: "Data Missing" });
//         }

//         await userModel.findByIdAndUpdate(userId, { name, phone, address });

//         if (imageFile) {
//             const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
//             await userModel.findByIdAndUpdate(userId, { image: imageUpload.secure_url });
//         }

//         res.json({ success: true, message: 'Profile Updated' });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // API to submit a problem
// const submitProblem = async (req, res) => {
//     try {
//         const { userId, title, description } = req.body;
//         if (!title || !description) {
//             return res.json({ success: false, message: "Missing problem details" });
//         }
//         const newProblem = new problemModel({ userId, title, description });
//         await newProblem.save();
//         res.json({ success: true, message: 'Problem submitted successfully' });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // API to get all problems
// const getProblems = async (req, res) => {
//     try {
//         const problems = await problemModel.find();
//         res.json({ success: true, problems });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// // API to submit feedback
// const submitFeedback = async (req, res) => {
//     try {
//         const { userId, feedback } = req.body;
//         if (!feedback) {
//             return res.json({ success: false, message: "Feedback cannot be empty" });
//         }
//         const newFeedback = new feedbackModel({ userId, feedback });
//         await newFeedback.save();
//         res.json({ success: true, message: 'Feedback submitted successfully' });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// export {
//     loginUser,
//     registerUser,
//     getProfile,
//     updateProfile,
//     submitProblem,
//     getProblems,
//     submitFeedback
// };





// // import jwt from "jsonwebtoken";
// // import bcrypt from "bcrypt";
// // import validator from "validator";
// // import userModel from "../models/userModel.js";
// // import { OAuth2Client } from "google-auth-library";
// // import { v2 as cloudinary } from "cloudinary";

// // const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // // API to register user
// // const registerUser = async (req, res) => {
// //     try {
// //         const { name, email, password, role } = req.body;
        
// //         if (!name || !email || !password) {
// //             return res.json({ success: false, message: "Missing Details" });
// //         }

// //         if (!validator.isEmail(email)) {
// //             return res.json({ success: false, message: "Invalid Email" });
// //         }

// //         if (password.length < 8) {
// //             return res.json({ success: false, message: "Weak Password" });
// //         }

// //         const salt = await bcrypt.genSalt(10);
// //         const hashedPassword = await bcrypt.hash(password, salt);

// //         const newUser = new userModel({ name, email, password: hashedPassword, role });
// //         const user = await newUser.save();
// //         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

// //         res.json({ success: true, token });
// //     } catch (error) {
// //         console.log(error);
// //         res.json({ success: false, message: error.message });
// //     }
// // };

// // // API for Google Login
// // const googleLogin = async (req, res) => {
// //     try {
// //         const { tokenId } = req.body;
// //         const response = await googleClient.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID });

// //         const { email, name } = response.getPayload();
// //         let user = await userModel.findOne({ email });

// //         if (!user) {
// //             user = new userModel({ name, email, password: "", role: "user" });
// //             await user.save();
// //         }

// //         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
// //         res.json({ success: true, token });
// //     } catch (error) {
// //         console.log(error);
// //         res.json({ success: false, message: "Google login failed" });
// //     }
// // };

// // const getProblems = async (req, res) => {
// //     try {
// //         // Your logic to fetch problems from the database
// //         res.json({ success: true, problems: [] }); // Replace with actual fetched data
// //     } catch (error) {
// //         console.error(error);
// //         res.json({ success: false, message: "Failed to fetch problems" });
// //     }
// // };

// // export {
// //     registerUser,
// //     googleLogin,
// //     getProblems
// // };
