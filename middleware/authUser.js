// import jwt from 'jsonwebtoken';

// // User authentication middleware
// const authUser = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization?.split(" ")[1];
//         if (!token) {
//             return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         console.error("Auth Error:", error);
//         res.status(401).json({ success: false, message: 'Invalid or Expired Token' });
//     }
// };

// // Middleware to check user roles
// const authRole = (role) => {
//     return (req, res, next) => {
//         if (!req.user || req.user.role !== role) {
//             return res.status(403).json({ success: false, message: 'Forbidden: Insufficient Permissions' });
//         }
//         next();
//     };
// };

// export { authUser, authRole };

import jwt from 'jsonwebtoken';

// User authentication middleware
const authUser = async (req, res, next) => {
    try {
        // const token = req.headers.authorization?.split(" ")[1];
        // if (!token) {
        //     return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });
        // }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });
        }

        const token = authHeader.split(" ")[1]; // Get token after "Bearer"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ success: false, message: "Invalid or Expired Token" });
    }
};

// Middleware to check user roles
const authRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ success: false, message: "Forbidden: Insufficient Permissions" });
        }
        next();
    };
};

export { authUser, authRole };
