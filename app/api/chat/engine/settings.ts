import {
  DefaultAzureCredential,
  getBearerTokenProvider,
  ManagedIdentityCredential,
} from "@azure/identity";
import {
  KnownAnalyzerNames,
  KnownVectorSearchAlgorithmKind,
} from "@azure/search-documents";

import {
  FilterableMetadataFieldKeysType,
  OpenAI,
  OpenAIEmbedding,
  Settings,
} from "llamaindex";

// FIXME: import from 'llamaindex'
import {
  AzureAISearchVectorStore,
  IndexManagement,
} from "llamaindex/vector-store/azure/AzureAISearchVectorStore";

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 20;
const AZURE_COGNITIVE_SERVICES_SCOPE =
  "https://cognitiveservices.azure.com/.default";

export const initSettings = async () => {
  if (
    !process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
    !process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT
  ) {
    throw new Error(
      "'AZURE_OPENAI_CHAT_DEPLOYMENT' and 'AZURE_OPENAI_EMBEDDING_DEPLOYMENT' env variables must be set.",
    );
  }

  let credential;
  let openAiApiKey;
  let azureSearchApiKey;

  if (process.env.OPENAI_API_KEY) {
    // Authenticate using an Azure OpenAI API key
    // This is generally discouraged, but is provided for developers
    // that want to develop locally inside the Docker container.
    openAiApiKey = process.env.OPENAI_API_KEY;
    console.log("Using OpenAI API key for authentication");
  }

  if (process.env.AZURE_AI_SEARCH_KEY) {
    // Authenticate using an Azure AI Search API key
    // This is generally discouraged, but is provided for developers
    // that want to develop locally inside the Docker container.
    azureSearchApiKey = process.env.AZURE_AI_SEARCH_KEY;
  }

  if (process.env.AZURE_CLIENT_ID) {
    // Authenticate using a user-assigned managed identity on Azure
    // See infra/main.bicep for value of AZURE_OPENAI_CLIENT_ID
    credential = new ManagedIdentityCredential({
      clientId: process.env.AZURE_CLIENT_ID,
    });
    console.log("Using managed identity for authentication");
    console.log({ clientId: process.env.AZURE_CLIENT_ID });
  } else {
    // Authenticate using the default Azure credential chain
    // See https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/overview#use-defaultazurecredential-in-an-application
    // This will *not* work inside a Docker container.
    credential = new DefaultAzureCredential();
    console.log("Using default Azure credential chain for authentication");
  }

  const azureADTokenProvider = getBearerTokenProvider(
    credential,
    AZURE_COGNITIVE_SERVICES_SCOPE,
  );
  const azure = {
    azureADTokenProvider,
    deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
  };

  // configure LLM model
  Settings.llm = new OpenAI({
    apiKey: openAiApiKey,
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

  const endpoint = process.env.AZURE_AI_SEARCH_ENDPOINT;
  const indexName = process.env.AZURE_AI_SEARCH_INDEX ?? "llamaindex-vector-search";
  const idFieldKey = process.env.AZURE_AI_SEARCH_ID_FIELD ?? "id";
  const chunkFieldKey = process.env.AZURE_AI_SEARCH_CHUNK_FIELD ?? "chunk";
  const embeddingFieldKey = process.env.AZURE_AI_SEARCH_EMBEDDING_FIELD ?? "embedding";
  const metadataStringFieldKey = process.env.AZURE_AI_SEARCH_METADATA_FIELD ?? "metadata";
  const docIdFieldKey = process.env.AZURE_AI_SEARCH_DOC_ID_FIELD ?? "doc_id";

  console.log("Initializing Azure AI Search Vector Store");

  (Settings as any).__AzureAISearchVectorStoreInstance__ =
    new AzureAISearchVectorStore({
      // credential: credential as unknown as DefaultAzureCredential,
      key: azureSearchApiKey,
      endpoint,
      indexName,
      idFieldKey,
      chunkFieldKey,
      embeddingFieldKey,
      metadataStringFieldKey,
      docIdFieldKey,
      serviceApiVersion: "2024-09-01-preview",
      // FIXME: import IndexManagement.CREATE_IF_NOT_EXISTS from 'llamaindex'
      // indexManagement: IndexManagement.CREATE_IF_NOT_EXISTS,
      indexManagement: "CreateIfNotExists" as IndexManagement,
      embeddingDimensionality: 3072,
      languageAnalyzer: KnownAnalyzerNames.EnLucene,
      // store vectors on disk
      vectorAlgorithmType: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,
    });
};
