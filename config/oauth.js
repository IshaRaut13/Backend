// import passport from "passport";
// import GoogleStrategy from "passport-google-oauth20";
// import AppleStrategy from "passport-apple";
// import userModel from "../models/userModel.js";
// import dotenv from "dotenv";

// dotenv.config();

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/user/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await userModel.findOne({ email: profile.emails[0].value });
//         if (!user) {
//           user = new userModel({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             password: "", // OAuth users don't need passwords
//           });
//           await user.save();
//         }
//         done(null, user);
//       } catch (error) {
//         done(error, null);
//       }
//     }
//   )
// );

// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID,
//       teamID: process.env.APPLE_TEAM_ID,
//       keyID: process.env.APPLE_KEY_ID,
//       privateKeyLocation: process.env.APPLE_PRIVATE_KEY,
//       callbackURL: "/api/user/apple/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await userModel.findOne({ email: profile.email });
//         if (!user) {
//           user = new userModel({
//             name: profile.displayName || "Apple User",
//             email: profile.email,
//             password: "",
//           });
//           await user.save();
//         }
//         done(null, user);
//       } catch (error) {
//         done(error, null);
//       }
//     }
//   )
// );

// export default passport;
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import AppleStrategy from "passport-apple";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      callbackURL: "/api/auth/apple/callback",
      privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

export default passport;
