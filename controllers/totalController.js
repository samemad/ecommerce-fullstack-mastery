const pool = require('../database');
const { NotFoundError } = require('../utils/errors'); // ← ADD THIS

const gettotal = async (req, res, next) => {
  try {
    console.log(`📊 Querying total table...`);
    
    const result = await pool.query( `SELECT 
    orders.id,
    users.name,
    orders.total,
    SUM(orders.total) OVER (PARTITION BY users.id ORDER BY orders.created_at) as running_total
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY users.id, orders.created_at`);
    
    console.log(`✨ Found ${result.rows.length} total in database`);
    
    res.json({
      success: true,
      data: {
        total: result.rows,
        count: result.rows.length
      }
    });
    
  } catch (error) {
    console.error(`❌ Database error:`, error.message);
    next(error);
  }
};
module.exports = {
    gettotal 
};
