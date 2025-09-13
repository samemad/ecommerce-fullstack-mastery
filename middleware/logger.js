// Request Logger Middleware - Shows every request coming in 
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`🚀 [${timestamp}] ${req.method} ${req.url} - Request started`);
  
  // Add timing to response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`✅ [${timestamp}] ${req.method} ${req.url} - Completed in ${duration}ms`);
  });
  
  next();
};

// Database Connection Logger
const dbLogger = (req, res, next) => {
  console.log(`🔗 Database connection ready for ${req.url}`);
  next();
};

// Export both middlewares
module.exports = { requestLogger, dbLogger };