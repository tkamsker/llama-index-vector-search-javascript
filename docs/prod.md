# Release to Production

This sample is designed to be a starting point for your own production application,
but you should do a thorough review of the security and performance before deploying
to production. Here are some things to consider:

* [Azure resource configuration](#azure-resource-configuration)
* [Additional security measures](#additional-security-measures)
* [Evaluation](#evaluation)

## Azure resource configuration

### OpenAI Capacity

The default TPM (tokens per minute) is set to 30K. That is equivalent
to approximately 30 conversations per minute (assuming 1K per user message/response).
You can increase the capacity by changing the `chatDeploymentCapacity` and `embeddingDeploymentCapacity`
parameters in `infra/main.bicep` to your account's maximum capacity.
You can also view the Quotas tab in [Azure OpenAI studio](https://oai.azure.com/)
to understand how much capacity you have.

If the maximum TPM isn't enough for your expected load, you have a few options:

* Use a backoff mechanism to retry the request. This is helpful if you're running into a short-term quota due to bursts of activity but aren't over long-term quota. Check out this Jupyter notebook for an example of how to implement a backoff mechanism:
  * [Backoff mechanism for OpenAI](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_handle_rate_limits.ipynb)

* If you are consistently going over the TPM, then consider implementing a load balancer between OpenAI instances. Most developers implement that using Azure API Management or container-based load balancers. [Read more](https://learn.microsoft.com/azure/api-management/rate-limit-policy).

### Azure Storage

The default storage account uses the `Standard_LRS` SKU.
To improve your resiliency, we recommend using `Standard_ZRS` for production deployments,
which you can specify using the `sku` property under the `storage` module in `infra/main.bicep`.

### Azure AI Search

The default search service uses the "Basic" SKU
with the free semantic ranker option, which gives you 1000 free queries a month.
After 1000 queries, you will get an error message about exceeding the semantic ranker free capacity.

* Assuming your app will experience more than 1000 questions per month,
  you should upgrade the semantic ranker SKU from "free" to "standard" SKU:

  ```shell
  azd env set AZURE_SEARCH_SEMANTIC_RANKER standard
  ```

  Or disable semantic search entirely:

  ```shell
  azd env set AZURE_SEARCH_SEMANTIC_RANKER disabled
  ```

* The search service can handle fairly large indexes, but it does have per-SKU limits on storage sizes, maximum vector dimensions, etc. You may want to upgrade the SKU to either a Standard or Storage Optimized SKU, depending on your expected load.
However, you [cannot change the SKU](https://learn.microsoft.com/azure/search/search-sku-tier#tier-upgrade-or-downgrade) of an existing search service, so you will need to re-index the data or manually copy it over.
You can change the SKU by setting the `AZURE_SEARCH_SERVICE_SKU` azd environment variable to [an allowed SKU](https://learn.microsoft.com/azure/templates/microsoft.search/searchservices?pivots=deployment-language-bicep#sku).

  ```shell
  azd env set AZURE_SEARCH_SERVICE_SKU standard
  ```

  See the [Azure AI Search service limits documentation](https://learn.microsoft.com/azure/search/search-limits-quotas-capacity) for more details.

* If you see errors about search service capacity being exceeded, you may find it helpful to increase
the number of replicas by changing `searchServiceReplicaCount` in `infra/main.bicep`
or manually scaling it from the Azure Portal.

## Additional security measures

* **Authentication**: By default, the deployed app is publicly accessible.
  We recommend restricting access to authenticated users.
  See [Enabling authentication](./deploy_features.md#enabling-authentication) to learn how to enable authentication.
* **Networking**: We recommend deploying inside a Virtual Network. If the app is only for
  internal enterprise use, use a private DNS zone. Also consider using Azure API Management (APIM)
  for firewalls and other forms of protection.
  For more details, read [Azure OpenAI Landing Zone reference architecture](https://techcommunity.microsoft.com/blog/azurearchitectureblog/azure-openai-landing-zone-reference-architecture/3882102).

## Evaluation

Before you make your chat app available to users, you'll want to rigorously evaluate the answer quality. LlamaIndex provides excellent tools for this purpose, read more at [llamaindex.ai](https://www.llamaindex.ai/blog/building-and-evaluating-a-qa-system-with-llamaindex-3f02e9d87ce1).