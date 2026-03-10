// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Tìm user theo googleId
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Nếu chưa có googleId → tìm user theo email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Nếu đã có user với email đó → update googleId
          user.googleId = profile.id;
          await user.save();
        } else {
          // Nếu chưa có email → tạo user mới
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            password: 'google_oauth_no_password'
          });
          await user.save();
        }
      }

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));


passport.serializeUser((user, done) => {
    done(null, user.id); // Lưu userId vào session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
