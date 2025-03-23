import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import problemModel from "../models/problemModel.js";
import solutionModel from "../models/solutionModel.js";
import feedbackModel from "../models/feedbackModel.js";
import { OAuth2Client } from "google-auth-library";
import { v2 as cloudinary } from "cloudinary";
 
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID, 
    process.env.GOOGLE_CLIENT_SECRET, 
    process.env.GOOGLE_REDIRECT_URI
);

// ✅ API to register user (Email & Password)
// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;

//         if (!name || !email || !password) {
//             return res.json({ success: false, message: "Missing Details" });
//         }

//         if (!validator.isEmail(email)) {
//             return res.json({ success: false, message: "Invalid Email" });
//         }

//         if (password.length < 8) {
//             return res.json({ success: false, message: "Weak Password" });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new userModel({ name, email, password: hashedPassword, role });
//         const user = await newUser.save();
//         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

//         res.json({ success: true, token });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

const registerUser = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;

        // 🛠️ Trim input to avoid spaces & inconsistencies
        name = name?.trim();
        email = email?.trim();
        password = password?.trim();

        // 🔥 Check for missing details
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        // 🔍 Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid Email Format" });
        }

        // 🔐 Enforce strong password (min 8 characters)
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Weak Password - Must be at least 8 characters" });
        }

        // 🔍 Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email is already registered" });
        }

        // 🔒 Hash password before saving (Ensure only 1-time hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("🔹 Original Password:", password);
        console.log("🔹 Hashed Password Before Saving:", hashedPassword);

        // 💾 Create a new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            role: role || "user" // Default role: "user"
        });

        await newUser.save();

        // ✅ Return success message
        res.status(201).json({ success: true, message: "User registered successfully" });

    } catch (error) {
        console.error("🚨 Registration Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
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

        console.log("🔹 Entered Password:", password);
        console.log("🔹 Stored Hashed Password in DB:", user.password);

        // ✅ FIX: Using `await` for bcrypt.compare() instead of a callback
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("❌ Password Mismatch!");
            return res.json({ success: false, message: "Invalid credentials" });
        }

        console.log("✅ Password Matched! Generating JWT...");
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token });

    } catch (error) {
        console.error("🚨 Login Error:", error);
        res.json({ success: false, message: "Internal server error" });
    }
};
// const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await userModel.findOne({ email });

//         if (!user) {
//             return res.json({ success: false, message: "User does not exist" });
//         }

//         console.log("Entered Password:", password);
//         console.log("Stored Hashed Password:", user.password);
// // Debugging bcrypt.compare()
//         bcrypt.compare(password, user.password, (err, isMatch) => {
//             if (err) {
//                 console.error("❌ bcrypt.compare() Error:", err);
//                 return res.json({ success: false, message: "Error verifying password" });
//             }

//             if (!isMatch) {
//                 console.log("❌ Password Mismatch!");
//                 return res.json({ success: false, message: "Invalid credentials" });
//             }

//             console.log("✅ Password Matched! Generating JWT...");
//             const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

//             res.json({ success: true, token });
//         });
//         // const isMatch = await bcrypt.compare(password, user.password);
//         // if (isMatch) {
//         //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
//         //     res.json({ success: true, token });
//         // } else {
//         //     res.json({ success: false, message: "Invalid credentials" });
//         // }
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

// Google Login (Token-based for frontend apps)
const googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body;

        if (!tokenId) {
            return res.status(400).json({ success: false, message: "Missing Google tokenId" });
        }

        // Verify Google Token
        const response = await googleClient.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = response.getPayload();
        console.log("🔍 Google Token Payload:", payload);

        if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
            return res.status(401).json({ success: false, message: "Invalid Google Audience" });
        }

        const { email, name, picture } = payload;

        let user = await userModel.findOne({ email });

        if (!user) {
            user = new userModel({
                name,
                email,
                password: "",
                role: "user",
                profileImage: picture || "",
                loginMethod: "google",
            });

            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });

    } catch (error) {
        console.error("🚨 Google Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Google login failed",
        });
    }
};

const googleAuthRedirect = (req, res) => {
    const redirectUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile%20openid&access_type=offline&prompt=consent`;
    
    res.redirect(redirectUrl);
};

// Google OAuth Callback (For Web OAuth Flow)
const googleLoginCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ success: false, message: "No authorization code provided" });
        }

        // Exchange code for tokens
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        // Verify and extract user details
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log("✅ Google User:", payload);

        const { email, name, picture } = payload;

        // Check if user exists
        let user = await userModel.findOne({ email });

        if (!user) {
            user = new userModel({
                name,
                email,
                password: "",
                role: "user",
                profileImage: picture || "",
                loginMethod: "google",
            });

            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        // Send response
        res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });

    } catch (error) {
        console.error("🚨 Google Login Callback Error:", error);
        res.status(500).json({
            success: false,
            message: "Google login failed",
        });
    }
};
// const googleLogin = async (req, res) => {
//     try {
//         const { tokenId } = req.body;
//         const response = await googleClient.verifyIdToken({
//             idToken: tokenId,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });

//         const { email, name } = response.getPayload();
//         let user = await userModel.findOne({ email });

//         if (!user) {
//             user = new userModel({ name, email, password: "", role: "user" });
//             await user.save();
//         }

//         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
//         res.json({ success: true, token });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: "Google login failed" });
//     }
// };

// ✅ API for GitHub Login
const githubLogin = async (req, res) => {
    try {
        const { id, username, emails } = req.user;

        let user = await userModel.findOne({ email: emails[0].value });
        if (!user) {
            user = new userModel({ name: username, email: emails[0].value, password: "", role: "user" });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: "GitHub login failed" });
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
    googleAuthRedirect, 
    googleLogin,
    googleLoginCallback,
    githubLogin,
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
