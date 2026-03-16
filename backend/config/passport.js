import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Only configure Google strategy if credentials are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        scope: ['profile', 'email'],
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value.toLowerCase();

            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // Update lastActive
                user.lastActive = new Date();
                user.isOnline = true;
                await user.save({ validateBeforeSave: false });
                return done(null, user);
            }

            // Check if user exists with the same email (registered via email/password)
            user = await User.findOne({ email });

            if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                if (!user.avatar && profile.photos?.[0]?.value) {
                    user.avatar = profile.photos[0].value;
                }
                user.lastActive = new Date();
                user.isOnline = true;
                await user.save({ validateBeforeSave: false });
                return done(null, user);
            }

            // Create new user (defaults to student role)
            user = await User.create({
                googleId: profile.id,
                email,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value || '',
                role: 'student',
                status: 'approved',
                isOnline: true,
                lastActive: new Date(),
            });

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
    console.log('✅ Google OAuth strategy configured');
} else {
    console.log('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)');
}

export default passport;
