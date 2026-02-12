import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { Server } from "socket.io";
import { supabase } from "./config/db_client.js";

const app = createApp();

const httpServer = app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});

const io = new Server(httpServer, {
  cors: {
    origin: env.corsOrigin,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");
  console.log("Socket ID:", socket.id);

    // Événement d'authentification - Rejoindre la room appropriée
    socket.on("user:join", async (data) => {
        // data contient : { userId, userType, patrolType? }
        // userType: 'client' ou 'patrol'
        // patrolType: 'samu' | 'police' | 'firefighter' (si userType === 'patrol')

        if (data.userType === 'client') {
            socket.join(`client:${data.userId}`);
            console.log(`✅ Client ${data.userId} rejoint le canal client:${data.userId}`);
        } else if (data.userType === 'patrol') {
            socket.join(`alerts:${data.patrolType}`);
            console.log(`✅ Patrouille ${data.patrolType} rejoint le canal alerts:${data.patrolType}`);
        }
    });

    socket.on("emergency:alert", async (data) => {
        const alertId = await saveAlertToDatabase(data);
        if (alertId) {
            // 1. Déduire le type de patrouille à partir de la catégorie (en minuscule)
            const patrolType = CATEGORY_TO_PATROL_TYPE[data.category.toLowerCase()];

            if (patrolType) {
                // 2. Émettre au canal de patrouille correspondant
                io.to(`alerts:${patrolType}`).emit("alert:new", {
                    id: alertId,
                    category: data.category,
                    subcategory: data.subcategory,
                    location: data.location,
                    timestamp: data.timestamp,
                    clientId: data.userId,
                    clientName: data.clientName,
                    status: 'pending'
                });
                console.log(`🚨 Alerte envoyée au canal alerts:${patrolType}`);
            }

            // 3. Confirmer au client sur son canal privé
            io.to(`client:${data.userId}`).emit("alert:created", {
                alertId: alertId,
                status: 'pending'
            });
            console.log(`✅ Confirmation envoyée au client ${data.userId}`);
        }
    });

    socket.on("emergency:accept", async (data) => {
        // data: { alertId, patrolId, patrolType }

        // 1. Mettre à jour la base de données
        const alert = await updateAlertStatus(data.alertId, 'accepted', data.patrolId);

        if (alert) {
            // 2. Notifier le client sur son canal privé
            io.to(`client:${alert.client_id}`).emit("alert:accepted", {
                alertId: data.alertId,
                patrolType: data.patrolType,
                patrolName: data.patrolName
            });
            console.log(`✅ Notification d'acceptation envoyée au client ${alert.client_id}`);

            // 3. Notifier les autres patrouilles du même canal
            io.to(`alerts:${data.patrolType}`).emit("alert:accepted", {
                alertId: data.alertId,
                patrolId: data.patrolId,
                patrolName: data.patrolName,
                status: 'accepted'
            });
            console.log(`✅ Alerte acceptée notifiée au canal alerts:${data.patrolType}`);
        }
    });

    socket.on("emergency:resolve", async (data) => {
        // data: { alertId, patrolType }

        // 1. Mettre à jour la base de données
        const alert = await updateAlertStatus(data.alertId, 'resolved', null);

        if (alert) {
            // 2. Notifier le client sur son canal privé
            io.to(`client:${alert.client_id}`).emit("alert:resolved", {
                alertId: data.alertId
            });
            console.log(`✅ Notification de résolution envoyée au client ${alert.client_id}`);

            // 3. Notifier les patrouilles du canal
            io.to(`alerts:${data.patrolType}`).emit("alert:resolved", {
                alertId: data.alertId,
                status: 'resolved'
            });
            console.log(`✅ Alerte résolue notifiée au canal alerts:${data.patrolType}`);
        }
    });
});

// Fonctions utilitaires

// Mapping des catégories vers les types de patrouille
const CATEGORY_TO_PATROL_TYPE = {
    'sante': 'samu',
    'danger': 'police',
    'incendie': 'firefighter'
};

async function saveAlertToDatabase(alertData) {
    const { subcategory, location, timestamp, userId } = alertData;
    console.log("Received alert data:", alertData);

    try {
        const { data: subcategoryData } = await supabase
            .from('sub_categories')
            .select('id')
            .eq('name', subcategory)
            .single();

        if (!subcategoryData) {
            console.error("Subcategory not found:", subcategory);
            return null;
        }

        console.log("Subcategory ID:", subcategoryData.id);
        console.log("location:", location.latitude, location.longitude);

        const { data: insertedAlert, error } = await supabase
            .from('alerts')
            .insert({
                sub_category_id: subcategoryData.id,
                alert_location: `(${location.latitude}, ${location.longitude})`,
                created_at: timestamp,
                client_id: userId,
                status: 'pending'
            })
            .select('id')
            .single();

        if (error) {
            console.error("Error saving alert to database:", error);
            return null;
        }

        console.log("Alert saved to database successfully with ID:", insertedAlert.id);
        return insertedAlert.id;
    } catch (error) {
        console.error("Erreur saveAlertToDatabase:", error);
        return null;
    }
}

async function updateAlertStatus(alertId, status, patrolId) {
    try {
        const updateData = {
            status: status,
            updated_at: new Date().toISOString()
        };

        if (patrolId) {
            updateData.patrol_id = patrolId;
            if (status === 'accepted') {
                updateData.accepted_at = new Date().toISOString();
            }
        }

        if (status === 'resolved') {
            updateData.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('alerts')
            .update(updateData)
            .eq('id', alertId)
            .select()
            .single();

        if (error) {
            console.error("Error updating alert status:", error);
            return null;
        }

        console.log("Alert status updated:", data);
        return data;
    } catch (error) {
        console.error("Erreur updateAlertStatus:", error);
        return null;
    }
}
