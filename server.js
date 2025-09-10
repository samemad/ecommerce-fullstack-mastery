// server.js
require('dotenv').config();
const express = require('express');
const pool = require('./database'); // <--- new
const { hash } = require('bcryptjs');
const bcrypt = require('bcryptjs'); // ← Fix this
const jwt = require('jsonwebtoken'); // ← Add this
const app = express();
app.use(express.json());

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


//.................................Registre User ............ 
app.post('/auth/register', async (req, res) => {
  console.log(`Adding a new user!`);
  
  try {
    // 1. Get data from request body
    const { name, email, password } = req.body;
    
    // 2. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        ok: false, 
        error: "Name, email, and password are required" 
      });
    }
    
    // 3. 🔥 HASH THE PASSWORD - This is crucial!
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // 4. Insert into database with hashed password
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`, // Don't return password!
      [name, email, password_hash]
    );
    
    console.log(`Added user! ${result.rows.length} user created`);
    
    // 5. Return success (without password hash!)
    res.json({ 
      ok: true, 
      message: "User created successfully",
      user: result.rows[0] 
    });
    
  } catch (err) {
    console.error(`❌ Database error:`, err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});
//.....................................................Login User...................................

app.post('/auth/login', async (req, res) => {

  console.log(`User login attempt...`);
  
  try {
    const { email, password } = req.body;
    const result = await pool.query(`
      SELECT id, name, email, password_hash 
      FROM users 
      WHERE email = $1`, [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash); 
    if (!passwordMatch) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }
          // 🎯 ADD JWT GENERATION HERE:
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        }, 
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn: '7d' }
      );
    res.json({ ok: true, message: "Login successful", user: { 
    id: user.id,
    name: user.name, 
    email: user.email}, 
    token: token
    });


  } catch (err) {
    console.error(`❌ Login error:`, err.message);
    res.status(500).json({ ok: false, error: err.message });
  }

});
  
//.................................. Auth Middleware ...............................
const authenticateToken = (req, res, next) => {
  try {
    console.log('🔍 All headers:', req.headers); // ← Add this debug line
    
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header:', authHeader); // ← Add this debug line
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('🔍 Extracted token:', token); // ← Add this debug line
    
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    req.user = decoded;
    next();
    
  } catch (error) {
    console.log('🔍 JWT Error:', error.message); // ← Add this debug line
    res.status(403).json({ error: "Invalid token" });
  }
};

// Protected route example:
app.get('/auth/me', authenticateToken, (req, res) => {
  // Only runs if token is valid!
  res.json({ 
    ok: true, 
    user: req.user // ← This comes from the middleware!
  });
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