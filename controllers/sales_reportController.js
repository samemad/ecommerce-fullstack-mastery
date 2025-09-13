const pool = require('../database');
const { NotFoundError } = require('../utils/errors'); // ← ADD THIS

const getsales_report = async (req, res, next) => {
  try {
    console.log(`📊 Querying total sales-report...`);
    
    const result = await pool.query( `
            SELECT 
              users.name,
              COUNT(orders.id) as total_orders,
              SUM(orders.total) as total_spent,
              AVG(reviews.rating) as avg_rating
            FROM users
            LEFT JOIN orders ON users.id = orders.user_id
            LEFT JOIN reviews ON users.id = reviews.user_id
            GROUP BY users.id, users.name
          `);
    
    console.log(`✨ Found ${result.rows.length} sales-report in database`);
    
    res.json({
      success: true,
      data: {
        salesreport: result.rows,
        count: result.rows.length
      }
    });
    
  } catch (error) {
    console.error(`❌ Database error:`, error.message);
    next(error);
  }
};
module.exports = {
getsales_report};
