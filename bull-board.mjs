import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { notificationQueue } from "./lib/notification/notification-queue.js";
import express from "express";

// import { notificationQueue } from './notification-queue'; // your actual queue

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Hook up your real queue instance here
createBullBoard({
  queues: [notificationQueue],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

const PORT = 3001;

app.listen(PORT, () => {
  console.log(
    `✅ Bull Board is running at http://localhost:${PORT}/admin/queues`
  );
});
