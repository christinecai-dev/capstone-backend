const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'development-placeholder-secret';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.userId);

        if (!user) {
          return done(null, false);
        }

        return done(null, {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
