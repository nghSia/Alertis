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

  socket.on("emergency:alert", async (data) => {
    await saveAlertToDatabase(data);
  });
});

async function saveAlertToDatabase(alertData) {
  const { subcategory, location, timestamp, userId } = alertData;
  console.log("Received alert data:", alertData);

  const subCategoryId = subcategory;

  console.log("Subcategory ID:", subCategoryId);

  console.log("location:", location.latitude, location.longitude);

  const { error } = await supabase.from("alerts").insert({
    sub_category_id: subCategoryId,
    alert_location: `(${location.latitude}, ${location.longitude})`,
    created_at: timestamp,
    client_id: userId,
  });
  if (error) {
    console.error("Error saving alert to database:", error);
    return;
  }
  console.log("Alert saved to database successfully");
}
