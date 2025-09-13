const pool = require('../database');
const { NotFoundError, ValidationError } = require('../utils/errors'); // ← ADD THIS

const getreviews = async (req, res, next) => {
  try {
    console.log(`📊 Querying reviews table...`);
    
    const result = await pool.query('SELECT * FROM reviews');
    
    console.log(`✨ Found ${result.rows.length} reviews in database`);
    
    res.json({
      success: true,
      data: {
        reviews: result.rows,
        count: result.rows.length
      }
    });
    
  } catch (error) {
    console.error(`❌ Database error:`, error.message);
    next(error);
  }
};
module.exports = {
    getreviews
};
