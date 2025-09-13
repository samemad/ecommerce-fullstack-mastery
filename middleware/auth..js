
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    console.log('🔐 Checking authentication...');
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      throw new AuthError('Access denied. No token provided.');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    
    console.log('✅ Authentication successful');
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthError('Token expired'));
    } else {
      next(error);
    }
  }
};

module.exports = {
  authenticateToken
};