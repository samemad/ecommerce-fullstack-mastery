// models/User.js
const bcrypt = require('bcryptjs');

class User {
  static async hashPassword(plainPassword) {
    const saltRounds = 12; // Higher = more secure but slower
    return await bcrypt.hash(plainPassword, saltRounds);
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}