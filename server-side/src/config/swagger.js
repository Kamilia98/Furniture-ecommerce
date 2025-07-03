const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Furniture Ecommerce API',
      version: '1.0.0',
      description: 'API documentation for the Furniture Ecommerce project',
    },
    servers: [
      {
        url: 'http://localhost:5000', // Change to your server URL if needed
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
