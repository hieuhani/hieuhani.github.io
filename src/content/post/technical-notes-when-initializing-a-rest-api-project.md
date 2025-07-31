---
title: "Technical Notes When Initializing a REST API Project"
description: "Essential technical considerations and best practices for setting up a robust REST API server project"
pubDate: "July 28 2025"
tags:
  - Software Engineer
  - API Design
  - Backend Development
  - Best Practices
---

When starting a new REST API project, there are several critical technical considerations that can make or break your application's reliability, maintainability, and performance. Based on my experience building and maintaining production APIs, here are the essential technical notes that every developer should keep in mind.

## The Typical REST API Architecture

A modern REST API server typically involves several components:

- **Client-Server Communication**: HTTP/HTTPS requests and responses
- **RESTful API Design**: Following REST principles and conventions
- **Service Dependencies**: Both internal and external services
  - **Database Services** (via TCP): PostgreSQL, Redis, MongoDB
  - **Integration Services** (via HTTP): AWS S3, Elasticsearch, SendGrid, OneSignal, payment gateways

## Critical Technical Considerations

### 1. Implement Graceful Shutdown

**Why it matters**: In modern containerized environments, services must be designed to be replaceable. When your server receives a shutdown signal (SIGTERM, SIGINT), it needs to properly close all connections to avoid resource leaks and ensure data integrity. This is especially critical in container environments where services are frequently restarted, scaled, or replaced.

**The Container Reality**: I experienced a service that reached OOM (Out of Memory) state but couldn't shutdown properly to be replaced. This created a cascading failure where the container couldn't be terminated gracefully, leading to resource exhaustion and service unavailability.

**What to implement**:
- Handle shutdown signals properly (SIGTERM, SIGINT)
- Close database connections gracefully
- Complete in-flight requests within a reasonable timeout
- Stop accepting new requests immediately
- Release system resources (memory, file handles, network connections)
- Implement timeout mechanisms to prevent hanging shutdowns
- Log shutdown progress for debugging

**Enhanced implementation** (Node.js/Express):
```javascript
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // Set a timeout to force exit if graceful shutdown takes too long
  const shutdownTimeout = setTimeout(() => {
    console.error('Graceful shutdown timeout reached. Forcing exit...');
    process.exit(1);
  }, 30000); // 30 seconds timeout
  
  // Stop accepting new requests immediately
  server.close(() => {
    console.log('HTTP server closed - no new requests accepted');
    
    // Close database connections
    db.close(() => {
      console.log('Database connections closed');
      
      // Close Redis connections
      redisClient.quit(() => {
        console.log('Redis connections closed');
        
        // Close other external service connections
        Promise.all([
          s3Client.destroy(),
          emailService.close(),
          // Add other service cleanup here
        ]).then(() => {
          console.log('All external service connections closed');
          
          clearTimeout(shutdownTimeout);
          console.log('Graceful shutdown completed');
          process.exit(0);
        }).catch((error) => {
          console.error('Error during service cleanup:', error);
          clearTimeout(shutdownTimeout);
          process.exit(1);
        });
      });
    });
  });
  
  // Handle requests that are still in progress
  server.on('close', () => {
    console.log('Server closed, waiting for in-flight requests to complete...');
  });
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions to prevent hanging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});
```

**Memory Management for Container Environments**:

```javascript
// Monitor memory usage and trigger cleanup if needed
const memoryThreshold = 400 * 1024 * 1024; // 400MB
const checkMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  const heapUsed = memUsage.heapUsed;
  
  if (heapUsed > memoryThreshold) {
    console.warn(`Memory usage high: ${Math.round(heapUsed / 1024 / 1024)}MB`);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('Garbage collection triggered');
    }
    
    // If memory is critically high, consider graceful shutdown
    if (heapUsed > 450 * 1024 * 1024) { // 450MB
      console.error('Critical memory usage detected, initiating graceful shutdown');
      gracefulShutdown('MEMORY_CRITICAL');
    }
  }
};

// Check memory every 30 seconds
setInterval(checkMemoryUsage, 30000);
```

**Key Takeaways for Container Environments**:
- Always implement timeout mechanisms to prevent hanging shutdowns
- Monitor memory usage and implement cleanup strategies
- Use health checks to help orchestration systems make decisions
- Log shutdown progress for debugging container issues
- Handle both graceful and forced shutdown scenarios
- Consider implementing circuit breakers for external dependencies during shutdown

### 2. Implement Proper Health Check Endpoints

**Why it matters**: In containerized environments, orchestration systems (Kubernetes, Docker Swarm, ECS) rely on health checks to make critical decisions about service availability, load balancing, and automatic recovery. Many implementations are perfunctory and don't provide meaningful health status, leading to poor orchestration decisions.

**The Reality**: I've seen many services that implement basic health checks that only verify the process is running, but don't actually validate if the service can perform its core functions. This leads to situations where containers appear healthy but are actually unable to serve requests properly.

**Liveness vs Readiness**:

**Liveness Probe** (`/live` or `/healthz`):
- Answers: "Is the process alive?"
- Should be lightweight and fast (< 1 second)
- Should not depend on external services
- Used to determine if container should be restarted

**Readiness Probe** (`/ready` or `/health`):
- Answers: "Can the service handle requests?"
- Can be more comprehensive
- Should check all critical dependencies
- Used to determine if container should receive traffic

**Proper Implementation**:

```javascript
let isShuttingDown = false;
let isReady = false;

// Liveness probe - lightweight, no external dependencies
app.get('/live', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).send();
  }
  
  // Basic process health check
  const processHealth = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    pid: process.pid
  };
  
  // Check if process is responsive
  const isAlive = processHealth.uptime > 0 && 
                  processHealth.memory.heapUsed < 500 * 1024 * 1024; // 500MB limit
  
  res.status(isAlive ? 200 : 503).json({
    status: isAlive ? 'alive' : 'unhealthy',
    timestamp: new Date().toISOString(),
    process: processHealth
  });
});

// Readiness probe - comprehensive dependency check
app.get('/ready', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ 
      status: 'shutting_down',
      reason: 'Service is shutting down'
    });
  }
  
  if (!isReady) {
    return res.status(503).json({ 
      status: 'not_ready',
      reason: 'Service is still starting up'
    });
  }
  
  try {
    // Check all critical dependencies with timeouts
    const healthChecks = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
      checkExternalServices(),
      checkDiskSpace(),
      checkMemoryUsage()
    ]);
    
    const results = healthChecks.map((result, index) => {
      const services = ['database', 'redis', 'external_services', 'disk', 'memory'];
      return {
        service: services[index],
        status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        error: result.status === 'rejected' ? result.reason.message : null
      };
    });
    
    const isHealthy = results.every(check => check.status === 'healthy');
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: results,
      uptime: process.uptime()
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Comprehensive health check for monitoring systems
app.get('/health', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'shutting_down' });
  }
  
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION || 'unknown',
      checks: {}
    };
    
    // Perform all health checks
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
      checkExternalServices(),
      checkDiskSpace(),
      checkMemoryUsage(),
      checkNetworkConnectivity()
    ]);
    
    const checkNames = ['database', 'redis', 'external_services', 'disk', 'memory', 'network'];
    checks.forEach((result, index) => {
      healthData.checks[checkNames[index]] = {
        status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        responseTime: result.status === 'fulfilled' ? result.value.responseTime : null,
        error: result.status === 'rejected' ? result.reason.message : null
      };
    });
    
    // Determine overall health
    const allHealthy = Object.values(healthData.checks)
      .every(check => check.status === 'healthy');
    
    healthData.status = allHealthy ? 'healthy' : 'unhealthy';
    
    res.status(allHealthy ? 200 : 503).json(healthData);
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check helper functions
async function checkDatabase() {
  const startTime = Date.now();
  
  try {
    // Test database connectivity and basic query
    const result = await dbPool.query('SELECT 1 as health_check');
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      details: {
        connectionPool: dbPool.totalCount,
        idleConnections: dbPool.idleCount
      }
    };
  } catch (error) {
    throw new Error(`Database check failed: ${error.message}`);
  }
}

async function checkRedis() {
  const startTime = Date.now();
  
  try {
    // Test Redis connectivity
    const result = await redisClient.ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      details: {
        redisStatus: redisClient.status
      }
    };
  } catch (error) {
    throw new Error(`Redis check failed: ${error.message}`);
  }
}

async function checkExternalServices() {
  const startTime = Date.now();
  
  try {
    // Check critical external services
    const checks = await Promise.allSettled([
      s3Client.headBucket({ Bucket: process.env.S3_BUCKET }).promise(),
      emailService.ping()
    ]);
    
    const responseTime = Date.now() - startTime;
    const allHealthy = checks.every(check => check.status === 'fulfilled');
    
    if (!allHealthy) {
      throw new Error('One or more external services are unavailable');
    }
    
    return {
      status: 'healthy',
      responseTime,
      details: {
        s3: checks[0].status === 'fulfilled',
        email: checks[1].status === 'fulfilled'
      }
    };
  } catch (error) {
    throw new Error(`External services check failed: ${error.message}`);
  }
}

async function checkDiskSpace() {
  const startTime = Date.now();
  
  try {
    // Check available disk space (example for Linux)
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync('df /tmp | tail -1 | awk \'{print $4}\'');
    const availableSpace = parseInt(stdout.trim()) * 1024; // Convert to bytes
    
    const responseTime = Date.now() - startTime;
    const isHealthy = availableSpace > 100 * 1024 * 1024; // 100MB minimum
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime,
      details: {
        availableSpace,
        threshold: 100 * 1024 * 1024
      }
    };
  } catch (error) {
    throw new Error(`Disk space check failed: ${error.message}`);
  }
}

async function checkMemoryUsage() {
  const startTime = Date.now();
  const memUsage = process.memoryUsage();
  const responseTime = Date.now() - startTime;
  
  const isHealthy = memUsage.heapUsed < 500 * 1024 * 1024; // 500MB limit
  
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    responseTime,
    details: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    }
  };
}

async function checkNetworkConnectivity() {
  const startTime = Date.now();
  
  try {
    // Test basic network connectivity
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('ping -c 1 8.8.8.8');
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      details: {
        testTarget: '8.8.8.8'
      }
    };
  } catch (error) {
    throw new Error(`Network connectivity check failed: ${error.message}`);
  }
}

// Set service as ready after initialization
app.listen(port, async () => {
  console.log(`Server starting on port ${port}`);
  
  try {
    // Initialize all dependencies
    await initializeServer();
    
    // Mark service as ready
    isReady = true;
    console.log('Service is ready to handle requests');
  } catch (error) {
    console.error('Failed to initialize service:', error);
    process.exit(1);
  }
});
```

**Key Takeaways for Health Checks**:
- **Separate concerns**: Liveness for process health, readiness for service capability
- **Comprehensive checks**: Include all critical dependencies in readiness probe
- **Fast responses**: Liveness should be < 1 second, readiness < 3 seconds
- **Meaningful status**: Provide detailed health information for debugging
- **Graceful degradation**: Handle partial failures appropriately
- **Monitoring integration**: Expose metrics for monitoring systems
- **Security**: Don't expose sensitive information in health checks

### 3. Configure Timeouts for All Integration Services

**Why it matters**: External services can be slow or unresponsive, potentially causing your API to hang indefinitely.

**Best practices**:
- Set appropriate timeout values for each service
- Implement retry mechanisms with exponential backoff
- Handle timeout errors gracefully
- Use circuit breakers for critical services

**Example timeout configuration**:
```javascript
// Database connection timeout
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  connectionTimeoutMillis: 5000,  // 5 seconds
  query_timeout: 10000,           // 10 seconds
  statement_timeout: 10000        // 10 seconds
};

// HTTP client timeout
const httpClient = axios.create({
  timeout: 10000,  // 10 seconds
  retry: 3,
  retryDelay: 1000
});
```

### 4. Separate Bootstrapping vs Per-Request Dependencies

**Why it matters**: Initializing expensive resources (like database connection pools) on every request is inefficient and can lead to resource exhaustion.

**Bootstrapping dependencies** (initialize once at server start):
- Database connection pools
- Redis connections
- External service clients
- Configuration loading
- Logging setup

**Per-request dependencies** (initialize per request):
- Request-specific data
- User sessions
- Temporary resources

**Example structure**:
```javascript
// Bootstrapping - runs once at server start
async function initializeServer() {
  // Database connection pool
  const dbPool = await createConnectionPool({
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000
  });
  
  // Redis client
  const redisClient = createRedisClient();
  
  // External service clients
  const s3Client = new AWS.S3();
  const emailService = new SendGrid(process.env.SENDGRID_API_KEY);
  
  return { dbPool, redisClient, s3Client, emailService };
}

// Per-request - runs for each request
app.get('/api/users/:id', async (req, res) => {
  const { dbPool, redisClient } = req.app.locals.services;
  
  // Use the shared connection pool
  const user = await dbPool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  
  res.json(user);
});
```

### 5. Follow RESTful Design Conventions Strictly

**Why it matters**: Consistent API design improves developer experience, reduces confusion, and makes your API more predictable and maintainable.

**Key REST principles to follow**:

**URL Naming Conventions**:
```
✅ Good:
GET    /api/users
GET    /api/users/123
POST   /api/users
PUT    /api/users/123
DELETE /api/users/123

❌ Bad:
GET    /api/getUsers
POST   /api/createUser
GET    /api/user/123/get
POST   /api/user/123/delete
```

**HTTP Methods and Idempotence**:
- **GET**: Safe and idempotent - should not modify data
- **POST**: Not idempotent - creates new resources
- **PUT**: Idempotent - creates or updates entire resource
- **PATCH**: Not idempotent - partial updates
- **DELETE**: Idempotent - removes resource

**Status Codes**:
```javascript
// Success responses
200 OK           // GET, PUT, PATCH
201 Created      // POST
204 No Content   // DELETE

// Client errors
400 Bad Request  // Invalid input
401 Unauthorized // Authentication required
403 Forbidden    // Insufficient permissions
404 Not Found    // Resource doesn't exist
409 Conflict     // Resource conflict

// Server errors
500 Internal Server Error
502 Bad Gateway  // External service error
503 Service Unavailable
```

**Example RESTful endpoint**:
```javascript
// Users API
app.get('/api/users', async (req, res) => {
  const users = await userService.getAll(req.query);
  res.json(users);
});

app.get('/api/users/:id', async (req, res) => {
  const user = await userService.getById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

app.put('/api/users/:id', async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json(user);
});

app.delete('/api/users/:id', async (req, res) => {
  await userService.delete(req.params.id);
  res.status(204).send();
});
```

## Additional Best Practices

### Error Handling
```javascript
// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'NotFoundError') {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### Request Validation
```javascript
// Using a validation library like Joi
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).max(120)
});

app.post('/api/users', (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}, createUserHandler);
```

### Security Considerations
- Implement proper authentication and authorization
- Use HTTPS in production
- Validate and sanitize all inputs
- Implement rate limiting
- Use environment variables for sensitive data
- Regular security updates for dependencies

## Conclusion

Building a robust REST API requires attention to these fundamental technical considerations. By implementing graceful shutdowns, proper timeout handling, efficient resource management, and following REST conventions, you'll create APIs that are reliable, maintainable, and developer-friendly.

Remember that these practices aren't just about following conventions—they're about building systems that can handle real-world scenarios gracefully and provide a great experience for both your users and fellow developers.

The key is to think about your API from multiple perspectives: as a service that needs to be reliable, as an interface that needs to be intuitive, and as a system that needs to be maintainable over time.
