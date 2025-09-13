const pool = require('../database');
const { NotFoundError, ValidationError } = require('../utils/errors'); // ← ADD THIS

const getAllOrder_items = async (req, res, next) => {
  try {
    console.log(`📊 Querying order_items table...`);
    
    const result = await pool.query('SELECT * FROM order_items');
    
    console.log(`✨ Found ${result.rows.length} order_items in database`);
    
    res.json({
      success: true,
      data: {
        order_items: result.rows,
        count: result.rows.length
      }
    });
    
  } catch (error) {
    console.error(`❌ Database error:`, error.message);
    next(error);
  }
};
module.exports = {
    getAllOrder_items
};