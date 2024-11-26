
# Enabling optional features

This document covers optional features that can be enabled in the deployed Azure resources.
You should typically enable these features before running `azd up`. Once you've set them, return to the [deployment steps](../README.md#deploying).

- [Enabling optional features](#enabling-optional-features)
  - [Using GPT-4](#using-gpt-4)
  - [Using text-embedding-3 models](#using-text-embedding-3-models)
  - [Enabling authentication](#enabling-authentication)
  - [Adding an OpenAI load balancer](#adding-an-openai-load-balancer)

## Using GPT-4

(Instructions for **GPT-4**, **GPT-4o**, and **GPT-4o mini** models are also included here.)

We generally find that most developers are able to get high-quality answers using GPT-3.5. However, if you want to try GPT-4, GPT-4o, or GPT-4o mini, you can do so by following these steps:

Execute the following commands inside your terminal:

1. To set the name of the deployment, run this command with a unique name in your Azure OpenAI account. You can use any deployment name, as long as it's unique in your Azure OpenAI account.

```bash
azd env set AZURE_OPENAI_CHAT_DEPLOYMENT <your-deployment-name>
```

For example:

```bash
azd env set AZURE_OPENAI_CHAT_DEPLOYMENT chat4
```

1. To set the GPT model name to a **gpt-4**, **gpt-4o**, or **gpt-4o mini** version from the [available models](https://learn.microsoft.com/azure/ai-services/openai/concepts/models), run this command with the appropriate GPT model name.

For GPT-4:

```bash
azd env set AZURE_OPENAI_CHATGPT_MODEL gpt-4
```

For GPT-4o:

```bash
azd env set AZURE_OPENAI_CHATGPT_MODEL gpt-4o
```

For GPT-4o mini:

```bash
azd env set AZURE_OPENAI_CHATGPT_MODEL gpt-4o-mini
```

1. To set the Azure OpenAI deployment SKU name, run this command with [the desired SKU name](https://learn.microsoft.com/azure/ai-services/openai/how-to/deployment-types#deployment-types).

```bash
azd env set AZURE_OPENAI_CHAT_DEPLOYMENT_SKU GlobalStandard
```

1. To set the Azure OpenAI deployment capacity, run this command with the desired capacity.

```bash
azd env set AZURE_OPENAI_CHAT_DEPLOYMENT_CAPACITY 10
```

1. To set the Azure OpenAI deployment version from the [available versions](https://learn.microsoft.com/azure/ai-services/openai/concepts/models), run this command with the appropriate version.

For GPT-4:

```bash
azd env set AZURE_OPENAI_CHAT_DEPLOYMENT_VERSION turbo-2024-04-09
```

For GPT-4o:

```bash
azd env set AZURE_OPENAI_CHAT_DEPLOYMENT_VERSION 2024-05-13
```

For GPT-4o mini:

```bash
azd env set AZURE_OPENAI_CHAT_DEPLOYMENT_VERSION 2024-07-18
```

1. To update the deployment with the new parameters, run this command.

```bash
azd up
```

> [!NOTE]
> To revert back to GPT 3.5, run the following commands:
>
> * `azd env set AZURE_OPENAI_CHAT_DEPLOYMENT chat` to set the name of your old GPT 3.5 deployment.
> * `azd env set AZURE_OPENAI_CHATGPT_MODEL gpt-35-turbo` to set the name of your old GPT 3.5 model.
> * `azd env set AZURE_OPENAI_CHAT_DEPLOYMENT_CAPACITY 30` to set the capacity of your old GPT 3.5 deployment.
> * `azd env set AZURE_OPENAI_CHAT_DEPLOYMENT_SKU Standard` to set the Sku name back to Standard.
> * `azd env set AZURE_OPENAI_CHAT_DEPLOYMENT_VERSION 0613` to set the version number of your old GPT 3.5.
> * `azd up` to update the provisioned resources.
>
> Note that this does not delete your GPT-4 deployment; it just makes your application create a new or reuse an old GPT 3.5 deployment. If you want to delete it, you can go to your Azure OpenAI studio and do so.

## Using text-embedding-3 models

By default, the deployed Azure web app uses the `text-embedding-ada-002` embedding model. If you want to use one of the text-embedding-3 models, you can do so by following these steps:

1. Run one of the following commands to set the desired model:

```shell
azd env set AZURE_OPENAI_EMB_MODEL_NAME text-embedding-3-small
```

```shell
azd env set AZURE_OPENAI_EMB_MODEL_NAME text-embedding-3-large
```

2. Specify the desired dimensions of the model: (from 256-3072, model dependent)

```shell
azd env set AZURE_OPENAI_EMB_DIMENSIONS 256
```

3. Set the model version to "1" (the only version as of March 2024):

```shell
azd env set AZURE_OPENAI_EMB_DEPLOYMENT_VERSION 1
```

4. When prompted during `azd up`, make sure to select a region for the OpenAI resource group location that supports the text-embedding-3 models. There are [limited regions available](https://learn.microsoft.com/azure/ai-services/openai/concepts/models#embeddings-models).

If you have already deployed:

* You'll need to change the deployment name by running `azd env set AZURE_OPENAI_EMB_DEPLOYMENT <new-deployment-name>`
* You'll need to create a new index, and re-index all of the data using the new model. You can either delete the current index in the Azure Portal, or create an index with a different name by running `azd env set AZURE_SEARCH_INDEX new-index-name`. When you next run `azd up`, the new index will be created and the data will be re-indexed.
* If your OpenAI resource is not in one of the supported regions, you should delete `openAiServiceLocation` from `.azure/YOUR-ENV-NAME/config.json`. When running `azd up`, you will be prompted to select a new region.

## Enabling authentication

By default, the deployed Azure web app will have no authentication or access restrictions enabled, meaning anyone with routable network access to the web app can chat with your indexed data.

Alternatively, you can manually require authentication to your Azure Active Directory by following the [Add app authentication](https://learn.microsoft.com/azure/container-apps/authentication) tutorial and set it up against the deployed web app.

To then limit access to a specific set of users or groups, you can follow the steps from [Restrict your Microsoft Entra app to a set of users](https://learn.microsoft.com/entra/identity-platform/howto-restrict-your-app-to-a-set-of-users) by changing "Assignment Required?" option under the Enterprise Application, and then assigning users/groups access.  Users not granted explicit access will receive the error message -AADSTS50105: Your administrator has configured the application <app_name> to block users unless they are specifically granted ('assigned') access to the application.-

## Adding an OpenAI load balancer

As discussed in more details in our [productionizing guide](./prod.md), you may want to consider implementing a load balancer between OpenAI instances if you are consistently going over the TPM limit.
Fortunately, this repository is designed for easy integration with other repositories that create load balancers for OpenAI instances.
