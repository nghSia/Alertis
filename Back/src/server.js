import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { Server } from "socket.io";
import { supabase } from "./config/db_client.js";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import dotenv from "dotenv";

dotenv.config();

const app = createApp();

const httpServer = app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});

const io = new Server(httpServer, {
  cors: {
    origin: env.corsOrigin,
  },
});

// Configuration du client pour récupérer les clés publiques de Supabase
const client = jwksClient({
  jwksUri: `https://vhjyvanfrczszvxthdnl.supabase.co/auth/v1/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const connectedClients = new Map();

/**
 * On Websocket connexion
 */
io.on("connection", (socket) => {
  console.log("A user connected");
  console.log("Socket ID:", socket.id);

  socket.on("user:join", async (data) => {
    jwt.verify(
      data.token,
      getKey,
      { algorithms: ["ES256"] },
      async (err, decoded) => {
        if (err) {
          console.error(
            `❌ user:join échoué pour ${data.userType} - Raison: ${err.message}`,
          );
          console.log(
            "Token reçu :",
            data.token
              ? "Présent (longueur " + data.token.length + ")"
              : "ABSENT",
          );
          return;
        }

        const userId = decoded.sub;

        if (data.userType === "client") {
          socket.join(`client:${userId}`);
          connectedClients.set(userId, socket.id);
          console.log(
            `✅ Client ${userId} rejoint le canal client:${userId} (socket: ${socket.id})`,
          );
        } else if (data.userType === "patrol") {
          socket.join(`alerts:${data.patrolType}`);
          console.log(
            `✅ Patrouille ${data.patrolType} rejoint le canal alerts:${data.patrolType}`,
          );
        }
      },
    );
  });

  socket.on("emergency:alert", async (data) => {
    jwt.verify(
      data.tokenForClient,
      getKey,
      { algorithms: ["ES256"] },
      async (err, decoded) => {
        if (err) {
          console.error("❌ Erreur JWT :", err.message);
          return socket.emit("error", "Authentification échouée");
        }

        // Le "sub" dans le token Supabase correspond à l'ID de l'utilisateur
        const clientId = decoded.sub;

        // Avant de sauvegarder, on injecte le userId du client dans les données de l'alerte
        const secureData = { ...data, userId: clientId };

        const alertId = await saveAlertToDatabase(secureData);

        if (alertId) {
          const patrolType =
            CATEGORY_TO_PATROL_TYPE[data.category.toLowerCase()];

          if (patrolType) {
            io.to(`alerts:${patrolType}`).emit("alert:new", {
              id: alertId,
              category: data.category,
              subcategory: data.subcategory,
              location: data.location,
              timestamp: data.timestamp,
              clientId: clientId,
              clientName: data.clientName,
              status: "pending",
            });
            console.log(`🚨 Alerte envoyée au canal alerts:${patrolType}`);
          }

          socket.emit("alert:created", {
            alertId: alertId,
            status: "pending",
          });
          console.log(`✅ Confirmation envoyée au client ${clientId}`);
        }
      },
    );
  });

  socket.on("emergency:accept", async (data) => {
    jwt.verify(
      data.tokenForPatrol,
      getKey,
      { algorithms: ["ES256"] },
      async (err, decoded) => {
        if (err) {
          console.error("❌ Erreur JWT :", err.message);
          return socket.emit("error", "Authentification échouée");
        }

        // Le "sub" dans le token Supabase correspond à l'ID de l'utilisateur
        const patrolId = decoded.sub;

        console.log(
          `🔴 emergency:accept reçu: alertId=${data.alertId}, patrolId=${patrolId}`,
        );

        const alert = await updateAlertStatus(
          data.alertId,
          "accepted",
          patrolId,
        );

        if (alert) {
          console.log(`✅ Alerte mise à jour dans la DB`);

          const clientSocketId = connectedClients.get(alert.client_id);
          if (clientSocketId) {
            io.to(clientSocketId).emit("alert:status-update", {
              alertId: data.alertId,
              status: "in_progress",
            });
            io.to(clientSocketId).emit("alert:accepted", {
              alertId: data.alertId,
              patrolType: data.patrolType,
              patrolName: data.patrolName,
            });
            console.log(
              `✅ Notification d'acceptation envoyée au client ${alert.client_id} (socket: ${clientSocketId})`,
            );
          } else {
            console.warn(
              `⚠️ Client ${alert.client_id} pas trouvé dans connectedClients`,
            );
          }

          io.to(`alerts:${data.patrolType}`).emit("alert:accepted", {
            alertId: data.alertId,
            patrolId: patrolId,
            patrolName: data.patrolName,
            status: "accepted",
          });
          console.log(
            `✅ Alerte acceptée notifiée au canal alerts:${data.patrolType}`,
          );
        } else {
          console.error(
            `❌ Erreur lors de la mise à jour de l'alerte ${data.alertId}`,
          );
        }
      },
    );
  });

  socket.on("emergency:resolve", async (data) => {
    const alert = await updateAlertStatus(data.alertId, "resolved", null);

    if (alert) {
      const clientSocketId = connectedClients.get(alert.client_id);
      if (clientSocketId) {
        io.to(clientSocketId).emit("alert:status-update", {
          alertId: data.alertId,
          status: "resolved",
        });
        io.to(clientSocketId).emit("alert:resolved", {
          alertId: data.alertId,
        });
        console.log(
          `✅ Notification de résolution envoyée au client ${alert.client_id} (socket: ${clientSocketId})`,
        );
      } else {
        console.warn(
          `⚠️ Client ${alert.client_id} pas trouvé dans connectedClients`,
        );
      }

      io.to(`alerts:${data.patrolType}`).emit("alert:resolved", {
        alertId: data.alertId,
        status: "resolved",
      });
      console.log(
        `✅ Alerte résolue notifiée au canal alerts:${data.patrolType}`,
      );
    }
  });
});

/**
 * Map patrol type
 * @type {{sante: string, santé: string, danger: string, incendie: string}}
 */
const CATEGORY_TO_PATROL_TYPE = {
  santé: "samu",
  danger: "police",
  incendie: "firefighter",
};

/**
 * Save alert to DB
 * @param alertData
 * @returns {Promise<*|null>}
 */
async function saveAlertToDatabase(alertData) {
  const { subcategory, location, timestamp, userId } = alertData;
  console.log("Received alert data:", alertData);

  try {
    const { data: subcategoryData } = await supabase
      .from("sub_categories")
      .select("id")
      .eq("name", subcategory)
      .single();

    if (!subcategoryData) {
      console.error("Subcategory not found:", subcategory);
      return null;
    }

    console.log("Subcategory ID:", subcategoryData.id);
    console.log("location:", location.latitude, location.longitude);

    const { data: insertedAlert, error } = await supabase
      .from("alerts")
      .insert({
        sub_category_id: subcategoryData.id,
        alert_location: `(${location.latitude}, ${location.longitude})`,
        created_at: timestamp,
        client_id: userId,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving alert to database:", error);
      return null;
    }

    console.log(
      "Alert saved to database successfully with ID:",
      insertedAlert.id,
    );
    return insertedAlert.id;
  } catch (error) {
    console.error("Erreur saveAlertToDatabase:", error);
    return null;
  }
}

/**
 * Update alert status
 * @param alertId
 * @param status
 * @param patrolId
 * @returns {Promise<ParseNodes<EatWhitespace<"*">>|null>}
 */
async function updateAlertStatus(alertId, status, patrolId) {
  try {
    const statusMap = {
      accepted: "in_progress",
      pending: "pending",
      resolved: "resolved",
    };

    const dbStatus = statusMap[status] || status;

    const updateData = {
      status: dbStatus,
      updated_at: new Date().toISOString(),
    };

    if (patrolId) {
      updateData.patrol_id = patrolId;
    }

    console.log(
      `📝 Mise à jour alerte ${alertId}: status=${dbStatus}, patrol_id=${patrolId}`,
    );

    const { data, error } = await supabase
      .from("alerts")
      .update(updateData)
      .eq("id", alertId)
      .select()
      .single();

    if (error) {
      console.error("Error updating alert status:", error);
      return null;
    }

    console.log("✅ Alert status updated:", data);
    return data;
  } catch (error) {
    console.error("Erreur updateAlertStatus:", error);
    return null;
  }
}
