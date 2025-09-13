const pool = require('../database');
const { NotFoundError } = require('../utils/errors');

const getAllProducts = async (req, res, next) => {
  try {
    console.log(`📊 Querying products table...`);
    
    const result = await pool.query('SELECT * FROM products');
    
    console.log(`✨ Found ${result.rows.length} products in database`);
    
    res.json({
      success: true,
      data: {
        products: result.rows,
        count: result.rows.length
      }
    });
    
  } catch (error) {
    console.error(`❌ Database error:`, error.message);
    next(error); // Pass to global error handler
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Product');
    }
    
    res.json({
      success: true,
      data: {
        product: result.rows[0]
      }
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById
};
