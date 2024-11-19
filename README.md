This is a RAG sample app built with [LlamaIndex](https://www.llamaindex.ai/) and uses Azure AI Search Vector Store.

## Prerequisites

- Create an Azure AI Search instance (Basic SKU)
- Create an Azure OpenAI instance
- Create an `.env` file with the following variables:

```
AZURE_AI_SEARCH_ENDPOINT=https://<service-name>.search.windows.net
AZURE_OPENAI_ENDPOINT=https://<service-name>.openai.azure.com/
AZURE_AI_SEARCH_KEY=<you can find this in the Azure portal>
OPENAI_API_KEY=<you can find this in the Azure portal>

AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-ada-002
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_API_VERSION=2024-09-01-preview
AZURE_SEARCH_INDEX_NAME=llamaindex-vector-search
```

## Getting Started

First, install the dependencies:

```
npm install
```

Next, generate the embeddings of the documents in the `./data` directory (if this folder exists - otherwise, skip this step):

```
npm run generate
```

Third, run the development server:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Using Docker

1. Build an image for the Next.js app:

```
docker build -t <your_app_image_name> .
```

2. Generate embeddings:

Parse the data and generate the vector embeddings if the `./data` folder exists - otherwise, skip this step:

```
docker run \
  --rm \
  -v $(pwd)/.env:/app/.env \ # Use ENV variables and configuration from your file-system
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/cache:/app/cache \ # Use your file system to store the vector database
  <your_app_image_name> \
  npm run generate
```

3. Start the app:

```
docker run \
  --rm \
  -v $(pwd)/.env:/app/.env \ # Use ENV variables and configuration from your file-system
  -v $(pwd)/config:/app/config \
  -v $(pwd)/cache:/app/cache \ # Use your file system to store gea vector database
  -p 3000:3000 \
  <your_app_image_name>
```

## Learn More

To learn more about LlamaIndex, take a look at the following resources:

- [LlamaIndex Documentation](https://docs.llamaindex.ai) - learn about LlamaIndex (Python features).
- [LlamaIndexTS Documentation](https://ts.llamaindex.ai) - learn about LlamaIndex (Typescript features).

You can check out [the LlamaIndexTS GitHub repository](https://github.com/run-llama/LlamaIndexTS) - your feedback and contributions are welcome!
