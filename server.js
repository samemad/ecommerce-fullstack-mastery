// server.js
require('dotenv').config();
const express = require('express');
const pool = require('./database'); // <--- new
const app = express();
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const { requestLogger, dbLogger } = require('./middleware/logger');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const order_itemsRoutes = require('./routes/order_items');
const reviewRoutes = require('./routes/review');  
const ratingsRoutes = require('./routes/ratings');
const totalRoutes = require('./routes/total');
const salesreport = require('./routes/sales-report');



app.use(express.json());
app.use(requestLogger);
app.use(dbLogger);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/order_items', order_itemsRoutes);
app.use('/reviews', reviewRoutes);
app.use('/ratings', ratingsRoutes);
app.use('/total', totalRoutes);
app.use('/sales-report', salesreport);

app.use(errorHandler);





app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`Server running ⏳✔✨ at http://localhost:${process.env.PORT}`);
});