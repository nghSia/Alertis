import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Alertis API",
            version: "1.0.0",
            description: "API documentation",
        },
        servers: [{ url: "http://localhost:3000" }],
    },
    // Ici on dit à swagger-jsdoc où chercher les commentaires JSDoc
    apis: ["./src/routes/**/*.js"],
});
