import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import {
  KnownAnalyzerNames,
  KnownVectorSearchAlgorithmKind,
} from "@azure/search-documents";

import { OpenAI, OpenAIEmbedding, Settings } from "llamaindex";

import { FilterableMetadataFieldKeysType } from "llamaindex";

// FIXME: import from 'llamaindex'
import {
  AzureAISearchVectorStore,
  IndexManagement,
} from "llamaindex/vector-store/azure/AzureAISearchVectorStore";

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 20;

export const initSettings = async () => {
  if (
    !process.env.AZURE_OPENAI_DEPLOYMENT ||
    !process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT
  ) {
    throw new Error(
      "'AZURE_OPENAI_DEPLOYMENT' and 'AZURE_OPENAI_EMBEDDING_DEPLOYMENT' env variables must be set.",
    );
  }

  const azure: any = {
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4",
  };

  if (process.env.OPENAI_API_KEY) {
    azure.apikey = process.env.OPENAI_API_KEY as string;
  } else {
    const credential = new DefaultAzureCredential();
    const azureADTokenProvider = getBearerTokenProvider(credential, [
      "https://cognitiveservices.azure.com/.default",
      "https://search.azure.com/.default",
    ]);
    azure.azureADTokenProvider = azureADTokenProvider;
  }

  // configure LLM model
  Settings.llm = new OpenAI({
    azure,
  });

  // configure embedding model
  azure.deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
  Settings.embedModel = new OpenAIEmbedding({
    model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
    azure,
  });

  Settings.chunkSize = CHUNK_SIZE;
  Settings.chunkOverlap = CHUNK_OVERLAP;

  // FIXME: find an elegant way to share the same instance across the ingestion and
  // generation pipelines
  (Settings as any).__AzureAISearchVectorStoreInstance__ =
    new AzureAISearchVectorStore({
      indexName:
        process.env.AZURE_SEARCH_INDEX_NAME ?? "llamaindex-vector-search",
      filterableMetadataFieldKeys:
        [] as unknown as FilterableMetadataFieldKeysType,

      // FIXME: import IndexManagement.CREATE_IF_NOT_EXISTS from 'llamaindex'
      // indexManagement: IndexManagement.CREATE_IF_NOT_EXISTS,
      indexManagement: "CreateIfNotExists" as IndexManagement,
      idFieldKey: "id",
      chunkFieldKey: "chunk",
      embeddingFieldKey: "embedding",
      metadataStringFieldKey: "metadata",
      docIdFieldKey: "doc_id",
      embeddingDimensionality: 1536,
      languageAnalyzer: KnownAnalyzerNames.EnLucene,
      // store vectors on disk
      vectorAlgorithmType: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,

      // Optional: Set to "scalar" or "binary" if using HNSW
      // compressionType: KnownVectorSearchCompressionKind.BinaryQuantization,
    });
};
