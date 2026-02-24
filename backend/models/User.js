const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['coach', 'client'],
    default: 'client',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving (only when password is new or changed)
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  const self = this;
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(self.password, salt, (err, hash) => {
      if (err) return next(err);
      self.password = hash;
      next();
    });
  });
});

// Check if stored password is a bcrypt hash
function isBcryptHash(str) {
  return typeof str === 'string' && (str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$'));
}

// Compare password: supports both hashed and legacy plain-text (then re-hashes)
UserSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.password) return false;
  const stored = this.password;

  if (isBcryptHash(stored)) {
    try {
      return await bcrypt.compare(plainPassword, stored);
    } catch (err) {
      console.error('Password comparison error:', err);
      return false;
    }
  }

  // Legacy: password was stored in plain text (e.g. from before hashing fix)
  if (stored === plainPassword) {
    try {
      const hash = await bcrypt.hash(plainPassword, 10);
      await this.constructor.updateOne({ _id: this._id }, { password: hash });
      return true;
    } catch (err) {
      console.error('Re-hash error:', err);
      return true; // still allow login
    }
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema);