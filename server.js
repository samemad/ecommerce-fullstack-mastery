// server.js
require('dotenv').config();
const express = require('express');
const pool = require('./database'); // <--- new

const app = express();


// Request Logger Middleware - Shows every request coming in
app.use((req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`🚀 [${timestamp}] ${req.method} ${req.url} - Request started`);
  
  // Add timing to response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`✅ [${timestamp}] ${req.method} ${req.url} - Completed in ${duration}ms`);
  });
  
  next(); // Pass to next middleware
});

// Database Connection Logger
app.use((req, res, next) => {
  console.log(`🔗 Database connection ready for ${req.url}`);
  next();
});




app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});



app.get('/products', async (req, res) => {
  console.log(`📊 Querying products table...`);
  try {
    const result = await pool.query('SELECT * FROM products');
    console.log(`✨ Found ${result.rows.length} products in database`);
    res.json({ ok: true, products: result.rows });
  } catch (err) {
    console.error(`❌ Database error:`, err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/orders', async (req, res) => {
  console.log(`📊 Querying products table...`);
  try {
    const result = await pool.query('SELECT * FROM orders');
    console.log(`✨ Found ${result.rows.length} orders in database`);
    res.json({ ok: true, orders: result.rows });
  } catch (err) {
    console.error(`❌ Database error:`, err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});
app.get('/order_items', async (req, res) => {
  console.log(`📊 Querying products table...`);
  try {
    const result = await pool.query('SELECT * FROM order_items');
    console.log(`✨ Found ${result.rows.length} order_items in database`);
    res.json({ ok: true, order_item: result.rows });
  } catch (err) {
    console.error(`❌ Database error:`, err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});
app.get('/reviews', async (req, res) => {
  console.log(`📊 Querying products table...`);
  try {
    const result = await pool.query('SELECT * FROM reviews');
    console.log(`✨ Found ${result.rows.length} reviews in database`);
    res.json({ ok: true, reviews: result.rows });
  } catch (err) {
    console.error(`❌ Database error:`, err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});
// In your server code
app.get('/orders-with-details', async (req, res) => {
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
  res.json(result.rows);
});

app.get('/ratings' , async (req, res) => {
  const query = `SELECT 
    products.name,
    AVG(reviews.rating) as avg_rating,
    COUNT(reviews.id) as review_count
    FROM products
    LEFT JOIN reviews ON products.id = reviews.product_id
    GROUP BY products.id, products.name`; 

  const result = await pool.query(query);
  res.json(result.rows);

});


    app.get('/total', (req, res) => {
    const query = `SELECT 
    orders.id,
    users.name,
    orders.total,
    SUM(orders.total) OVER (PARTITION BY users.id ORDER BY orders.created_at) as running_total
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY users.id, orders.created_at`;

    pool.query(query)
      .then(result => res.json(result.rows))
        .catch(err => {
          console.error('Database error:', err);
          res.status(500).json({ ok: false, error: err.message });
        });
      });

              // Any complex business requirement = Custom SQL query
        app.get('/sales-report', async (req, res) => {
          const query = `
            SELECT 
              users.name,
              COUNT(orders.id) as total_orders,
              SUM(orders.total) as total_spent,
              AVG(reviews.rating) as avg_rating
            FROM users
            LEFT JOIN orders ON users.id = orders.user_id
            LEFT JOIN reviews ON users.id = reviews.user_id
            GROUP BY users.id, users.name
          `;
          const result = await pool.query(query);
          res.json(result.rows);
        });






app.listen(process.env.PORT, () => {
  console.log(`Server running ⏳✔✨ at http://localhost:${process.env.PORT}`);
});