import {
  Document,
  IngestionPipeline,
  SentenceSplitter,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

export async function runPipeline(
  currentIndex: VectorStoreIndex | null,
  documents: Document[],
) {
  // Use ingestion pipeline to process the documents into nodes and add them to the vector store
  const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({
        chunkSize: Settings.chunkSize,
        chunkOverlap: Settings.chunkOverlap,
      }),
      Settings.embedModel,
    ],
  });
  const nodes = await pipeline.run({ documents });
  if (currentIndex) {
    await currentIndex.insertNodes(nodes);
    currentIndex.storageContext.docStore.persist();
    console.log("Added nodes to the vector store.");
    return documents.map((document) => document.id_);
  } else {
    // Initialize a new index with the documents
    console.log(
      "Got empty index, created new index with the uploaded documents",
    );
    const persistDir = process.env.LLAMAINDEX_STORAGE_CACHE_DIR;
    if (!persistDir) {
      throw new Error("LLAMAINDEX_STORAGE_CACHE_DIR environment variable is required!");
    }
    const storageContext = await storageContextFromDefaults({
      vectorStore: (Settings as any)._vectorStor,
      persistDir,
    });
    const newIndex = await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
    newIndex.storageContext.docStore.persist();
    return documents.map((document) => document.id_);
  }
}
