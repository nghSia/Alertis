import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

export function createApp() {
    const app = express();

    // Middlewares globaux
    app.use(cors({ origin: env.corsOrigin, credentials: true }));
    app.use(express.json());

    app.use("/api", apiRouter);

    app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get("/", (req, res) => {
        res.redirect("/api-docs");
    });

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
