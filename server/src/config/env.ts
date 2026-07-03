import { loadEnvFile } from "node:process";

try {
  loadEnvFile();
} catch (error) {
  // In production (like Render), .env is not present because env variables
  // are injected directly by the platform. We ignore this error.
}
