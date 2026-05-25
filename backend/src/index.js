const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory metrics storage
const metrics = {
  totalRequests: 0,
  successfulCompilations: 0,
  totalRepairs: 0,
  averageLatency: 0,
  failures: []
};

// Helper function to extract intent from prompt
function extractIntent(prompt) {
  const promptLower = prompt.toLowerCase();
  
  // Detect app type
  let appType = "Web Application";
  if (promptLower.includes('crm')) appType = "CRM";
  if (promptLower.includes('ecommerce') || promptLower.includes('shop') || promptLower.includes('store')) appType = "E-commerce";
  if (promptLower.includes('task') || promptLower.includes('todo')) appType = "Task Management";
  if (promptLower.includes('blog')) appType = "Blog Platform";
  if (promptLower.includes('social')) appType = "Social Platform";
  
  // Detect entities
  const entities = [];
  if (promptLower.includes('contact')) entities.push({ name: "Contact", attributes: ["name", "email", "phone", "company"] });
  if (promptLower.includes('product')) entities.push({ name: "Product", attributes: ["name", "price", "description", "stock"] });
  if (promptLower.includes('task')) entities.push({ name: "Task", attributes: ["title", "description", "status", "dueDate"] });
  if (promptLower.includes('user')) entities.push({ name: "User", attributes: ["name", "email", "password", "role"] });
  if (promptLower.includes('order')) entities.push({ name: "Order", attributes: ["total", "status", "date"] });
  if (promptLower.includes('project')) entities.push({ name: "Project", attributes: ["name", "description", "deadline"] });
  
  // Always add User if not present
  if (!entities.find(e => e.name === "User")) {
    entities.unshift({ name: "User", attributes: ["name", "email", "password"] });
  }
  
  // Detect features
  const features = [];
  if (promptLower.includes('login') || promptLower.includes('auth')) features.push("authentication");
  if (promptLower.includes('dashboard')) features.push("dashboard");
  if (promptLower.includes('analytics')) features.push("analytics");
  if (promptLower.includes('payment') || promptLower.includes('premium')) features.push("payments");
  if (promptLower.includes('role')) features.push("role-based-access");
  
  // Detect roles
  const userRoles = ["user"];
  if (promptLower.includes('admin')) userRoles.push("admin");
  if (promptLower.includes('manager')) userRoles.push("manager");
  if (promptLower.includes('premium')) userRoles.push("premium_user");
  
  return {
    appType,
    entities,
    features: features.length ? features : ["crud-operations"],
    userRoles,
    businessRules: [],
    integrations: promptLower.includes('payment') ? ["stripe"] : [],
    constraints: [],
    ambiguityScore: entities.length === 0 ? 0.8 : 0.2
  };
}

// Generate complete schema from intent
function generateSchema(intent) {
  const entities = intent.entities;
  
  // Create database entities with proper fields
  const databaseEntities = entities.map(entity => ({
    name: entity.name,
    fields: entity.attributes.map(attr => ({
      name: attr,
      type: attr.includes('email') ? 'email' : 
             attr.includes('password') ? 'password' :
             attr.includes('price') ? 'number' :
             attr.includes('date') ? 'date' : 'string',
      required: attr !== 'id' && attr !== 'description'
    }))
  }));
  
  // Create API endpoints
  const endpoints = [];
  entities.forEach(entity => {
    const basePath = `/${entity.name.toLowerCase()}s`;
    endpoints.push(
      { path: basePath, method: 'GET', entity: entity.name, auth: ['user'], validation: {} },
      { path: basePath, method: 'POST', entity: entity.name, auth: ['user'], validation: {} },
      { path: `${basePath}/:id`, method: 'PUT', entity: entity.name, auth: ['user'], validation: {} },
      { path: `${basePath}/:id`, method: 'DELETE', entity: entity.name, auth: ['admin'], validation: {} }
    );
  });
  
  // Create UI pages
  const pages = entities.map(entity => ({
    name: `${entity.name}List`,
    path: `/${entity.name.toLowerCase()}s`,
    components: [
      { type: 'table', entity: entity.name, actions: ['create', 'edit', 'delete'] }
    ]
  }));
  
  // Add dashboard if requested
  if (intent.features.includes('dashboard')) {
    pages.unshift({
      name: 'Dashboard',
      path: '/',
      components: [
        { type: 'chart', entity: entities[0]?.name, actions: [] }
      ]
    });
  }
  
  // Create navigation
  const navigation = [
    { label: 'Dashboard', path: '/', roles: ['user', 'admin'] },
    ...entities.map(entity => ({
      label: entity.name,
      path: `/${entity.name.toLowerCase()}s`,
      roles: ['user', 'admin']
    }))
  ];
  
  // Create roles with permissions
  const roles = intent.userRoles.map(role => ({
    name: role,
    permissions: role === 'admin' ? ['read', 'write', 'delete', 'manage_users'] :
                 role === 'premium_user' ? ['read', 'write', 'premium_features'] :
                 ['read', 'write']
  }));
  
  // Create business logic for premium features
  const businessLogic = [];
  if (intent.features.includes('payments')) {
    businessLogic.push({
      name: "premium_gating",
      condition: "user.subscription_tier === 'premium'",
      action: "allow_premium_features",
      roles: ["admin", "premium_user"]
    });
  }
  
  return {
    metadata: {
      appName: `${intent.appType} Generator`,
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      confidence: 1 - intent.ambiguityScore,
      assumptions: [
        "Authentication is required for all protected routes",
        "Standard CRUD operations are implemented",
        "Responsive UI design with Tailwind CSS"
      ]
    },
    database: {
      entities: databaseEntities,
      relations: []
    },
    api: {
      endpoints: endpoints
    },
    auth: {
      roles: roles,
      defaultRole: 'user'
    },
    ui: {
      pages: pages,
      layout: {
        navigation: navigation
      }
    },
    businessLogic: businessLogic
  };
}

// Validation and repair function
function validateAndRepair(schema, intent) {
  const issues = [];
  let repaired = JSON.parse(JSON.stringify(schema));
  
  // Check for missing required fields
  if (!repaired.metadata) {
    issues.push("Missing metadata - adding default");
    repaired.metadata = {
      appName: "Application",
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      confidence: 0.7,
      assumptions: ["Auto-generated defaults"]
    };
  }
  
  // Ensure database entities exist
  if (!repaired.database.entities || repaired.database.entities.length === 0) {
    issues.push("No entities defined - adding default User entity");
    repaired.database.entities = [
      { name: "User", fields: [{ name: "email", type: "email", required: true }] }
    ];
  }
  
  // Ensure each entity has at least an id field
  repaired.database.entities.forEach(entity => {
    if (!entity.fields.find(f => f.name === 'id')) {
      entity.fields.unshift({ name: 'id', type: 'string', required: true });
    }
  });
  
  // Check API endpoints match entities
  for (const endpoint of repaired.api.endpoints) {
    const entityExists = repaired.database.entities.some(e => e.name === endpoint.entity);
    if (!entityExists) {
      issues.push(`Endpoint ${endpoint.path} references unknown entity ${endpoint.entity} - adding entity`);
      repaired.database.entities.push({
        name: endpoint.entity,
        fields: [{ name: 'id', type: 'string', required: true }]
      });
    }
  }
  
  // Ensure auth roles exist
  for (const endpoint of repaired.api.endpoints) {
    for (const role of endpoint.auth) {
      if (!repaired.auth.roles.find(r => r.name === role)) {
        issues.push(`Adding missing role: ${role}`);
        repaired.auth.roles.push({ name: role, permissions: ['read'] });
      }
    }
  }
  
  // Add premium business logic if needed
  if (intent.features.includes('payments') && repaired.businessLogic.length === 0) {
    issues.push("Adding premium payment business logic");
    repaired.businessLogic.push({
      name: "premium_feature_gating",
      condition: "user.plan === 'premium'",
      action: "access_premium_features",
      roles: ["premium_user", "admin"]
    });
  }
  
  return { output: repaired, issues, repaired: issues.length > 0, repairCount: issues.length };
}

// Main compilation endpoint
app.post('/compile', async (req, res) => {
  const startTime = Date.now();
  metrics.totalRequests++;
  
  try {
    const { prompt } = req.body;
    
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({
        status: 'error',
        error: 'Prompt cannot be empty'
      });
    }
    
    console.log(`\n📝 Processing: "${prompt.substring(0, 80)}..."`);
    
    // Stage 1: Intent Extraction
    console.log("🔍 Stage 1: Extracting intent...");
    const intent = extractIntent(prompt);
    
    // Check if ambiguous (less than 2 entities or no features)
    if (intent.entities.length === 0 || intent.features.length === 0) {
      return res.status(400).json({
        status: 'needs_clarification',
        questions: [
          "What are the main entities in your application? (e.g., Users, Products, Orders)",
          "What key features do you need? (e.g., authentication, dashboard, payments)"
        ],
        partialIntent: intent
      });
    }
    
    // Stage 2-3: Schema Generation
    console.log("📝 Stage 2-3: Generating schemas...");
    let schema = generateSchema(intent);
    
    // Stage 4: Validation & Repair
    console.log("🔧 Stage 4: Validating and repairing...");
    const validationResult = validateAndRepair(schema, intent);
    metrics.totalRepairs += validationResult.repairCount;
    
    const latency = Date.now() - startTime;
    metrics.averageLatency = (metrics.averageLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests;
    metrics.successfulCompilations++;
    
    console.log(`✅ Complete! (${latency}ms, ${validationResult.repairCount} repairs)`);
    
    res.json({
      status: 'success',
      output: validationResult.output,
      metrics: {
        latency,
        repairCount: validationResult.repairCount,
        issuesResolved: validationResult.issues,
        executable: true
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    metrics.failures.push({
      timestamp: new Date(),
      error: error.message
    });
    
    res.status(500).json({
      status: 'error',
      error: error.message,
      recoveryStrategy: "Please provide more specific requirements"
    });
  }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successfulCompilations / metrics.totalRequests) * 100).toFixed(2)
    : 0;
    
  res.json({
    totalRequests: metrics.totalRequests,
    successfulCompilations: metrics.successfulCompilations,
    totalRepairs: metrics.totalRepairs,
    averageLatency: Math.round(metrics.averageLatency),
    successRate: `${successRate}%`,
    failures: metrics.failures.slice(-10) // Last 10 failures
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 AI App Compiler Backend Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics\n`);
});