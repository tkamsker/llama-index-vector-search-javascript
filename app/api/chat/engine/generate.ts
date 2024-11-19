import { Settings, VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";

import * as dotenv from "dotenv";

import { getDocuments } from "./loader";
import { initSettings } from "./settings";

// Load environment variables from local .env file
dotenv.config();

async function getRuntime(func: any) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

async function generateDatasource() {
  console.log(`Generating storage context...`);
  // Split documents, create embeddings and store them in the storage context
  const persistDir = process.env.STORAGE_CACHE_DIR;
  if (!persistDir) {
    throw new Error("STORAGE_CACHE_DIR environment variable is required!");
  }
  const ms = await getRuntime(async () => {
    const storageContext = await storageContextFromDefaults({
      vectorStore: (Settings as any).__AzureAISearchVectorStoreInstance__,
      persistDir,
    });
    const documents = await getDocuments();

    await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
      logProgress: true,
    });
  });
  console.log(`Storage context successfully generated in ${ms / 1000}s.`);
}

(async () => {
  await initSettings();
  await generateDatasource();
  console.log("Finished generating storage.");
})();
