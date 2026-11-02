import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RFMS API",
      version: "1.0.0",
      description: "Retail Feedback Management System REST API",
    },
    servers: [{ url: `http://localhost:${env.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
});

(swaggerSpec as any).paths = {
  "/api/health": {
    get: { tags: ["Health"], security: [], responses: { 200: { description: "OK" } } },
  },
  "/api/auth/register": {
    post: { tags: ["Auth"], security: [], summary: "Register customer" },
  },
  "/api/auth/login": {
    post: { tags: ["Auth"], security: [], summary: "Login" },
  },
  "/api/auth/refresh": {
    post: { tags: ["Auth"], security: [], summary: "Refresh access token" },
  },
  "/api/auth/logout": { post: { tags: ["Auth"], summary: "Logout" } },
  "/api/auth/me": { get: { tags: ["Auth"], summary: "Current user" } },
  "/api/auth/change-password": { patch: { tags: ["Auth"], summary: "Change password" } },
  "/api/users": {
    get: { tags: ["Users"], summary: "List users (ADMIN)" },
    post: { tags: ["Users"], summary: "Create user (ADMIN)" },
  },
  "/api/products": {
    get: { tags: ["Products"], security: [], summary: "List products" },
    post: { tags: ["Products"], summary: "Create product (ADMIN)" },
  },
  "/api/categories": {
    get: { tags: ["Categories"], security: [], summary: "List categories" },
    post: { tags: ["Categories"], summary: "Create category (ADMIN)" },
  },
  "/api/reviews": {
    get: { tags: ["Reviews"], summary: "List reviews (STAFF/ADMIN)" },
    post: { tags: ["Reviews"], summary: "Create review (CUSTOMER)" },
  },
  "/api/replies": { post: { tags: ["Replies"], summary: "Create reply (STAFF/ADMIN)" } },
  "/api/dashboard": { get: { tags: ["Dashboard"], summary: "Admin dashboard" } },
  "/api/reports": { get: { tags: ["Reports"], summary: "Admin report" } },
  "/api/reports/export": { get: { tags: ["Reports"], summary: "Export CSV" } },
};
