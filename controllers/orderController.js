const pool = require('../database');
const { NotFoundError, ValidationError } = require('../utils/errors'); // ← ADD THIS

const getAllOrders = async (req, res, next) => {
  try {
    console.log(`📊 Querying orders table...`);
    
    const result = await pool.query('SELECT * FROM orders');
    
    console.log(`✨ Found ${result.rows.length} orders in database`);
    
    res.json({
      success: true,
      data: {
        orders: result.rows,
        count: result.rows.length
      }
    });
    
  } catch (error) {
    console.error(`❌ Database error:`, error.message);
    next(error);
  }
};

const getOrdersWithDetails = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        orders.id,
        users.name as customer_name,
        products.name as product_name,
        order_items.quantity
      FROM orders
      JOIN users ON orders.user_id = users.id
      JOIN order_items ON orders.id = order_items.order_id  
      JOIN products ON order_items.product_id = products.id
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: {
        orders: result.rows,
        count: result.rows.length
      }
    });
    
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Order'); // ← NOW I can use custom errors!
    }
    
    res.json({ success: true, data: { order: result.rows[0] } });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getAllOrders,
  getOrdersWithDetails,
  getOrderById
};
