const pool = require('../database');
const { NotFoundError } = require('../utils/errors'); // ← ADD THIS

const getratings = async (req, res, next) => {
  try {
    console.log(`📊 Querying ratings table...`);
    
    const result = await pool.query( `SELECT 
    products.name,
    AVG(reviews.rating) as avg_rating,
    COUNT(reviews.id) as review_count
    FROM products
    LEFT JOIN reviews ON products.id = reviews.product_id
    GROUP BY products.id, products.name`);
    
    console.log(`✨ Found ${result.rows.length} ratings in database`);
    
    res.json({
      success: true,
      data: {
        ratings: result.rows,
        count: result.rows.length
      }
    });
    
  } catch (error) {
    console.error(`❌ Database error:`, error.message);
    next(error);
  }
};
module.exports = {
    getratings 
};
