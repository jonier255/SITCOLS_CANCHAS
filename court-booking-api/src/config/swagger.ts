import swaggerJSDoc from 'swagger-jsdoc'
import { env } from './env.js'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Court Booking API',
    version: '1.0.0',
    description: 'API para gestion de canchas, reservas y usuarios.',
  },
  servers: [
    {
      url: env.API_PREFIX,
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
}

export const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ['src/modules/**/*.routes.ts'],
})
