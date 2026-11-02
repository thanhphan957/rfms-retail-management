import { createApp } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`RFMS API running at http://localhost:${env.port}`);
    console.log(`Swagger docs at http://localhost:${env.port}/api/docs`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
