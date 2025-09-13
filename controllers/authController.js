// authController.js with Joi validation
const Joi = require('joi'); // 👈 1. Import Joi
const { ValidationError, AuthError } = require('../utils/errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database');

// I Create Joi Schemas OUTSIDE the functions then use it in the funcition easly!!
const registrationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must be less than 50 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const register = async (req, res, next) => {
  try {
    console.log('🚀 Register attempt...');
    
    // 👈 3. Use Joi to validate instead of manual checks
    const { error, value } = registrationSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    
    // 👈 4. Use validated data (value) instead of req.body
    const { name, email, password } = value;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new ValidationError('User with this email already exists');
    }
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Insert into database
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`,
      [name, email, password_hash]
    );
    
    console.log('✅ User registered successfully');
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: result.rows[0]
      }
    });
    
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

const login = async (req, res, next) => {
  try {
    console.log('🔑 Login attempt...');
    
    // 👈 5. Use Joi validation for login too
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    
    // 👈 6. Use validated data
    const { email, password } = value;
    
    // Get user from database
    const result = await pool.query(
      `SELECT id, name, email, password_hash FROM users WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      throw new AuthError("Invalid email or password");
    }
    
    const user = result.rows[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new AuthError("Invalid email or password");
    }
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful');
    
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token: token
      }
    });
    
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    // req.user comes from auth middleware
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};