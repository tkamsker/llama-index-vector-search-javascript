import { Settings, SimpleDocumentStore, VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";

export async function getDataSource(params?: any) {
  const persistDir = process.env.LLAMAINDEX_STORAGE_CACHE_DIR;
  if (!persistDir) {
    throw new Error("LLAMAINDEX_STORAGE_CACHE_DIR environment variable is required!");
  }
  const storageContext = await storageContextFromDefaults({
    vectorStore: (Settings as any).__AzureAISearchVectorStoreInstance__,
    persistDir,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    return null;
  }
  return await VectorStoreIndex.init({
    storageContext,
  });
}
