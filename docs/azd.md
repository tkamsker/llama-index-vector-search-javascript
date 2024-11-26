# Deploying with the Azure Developer CLI

This guide includes advanced topics that are not necessary for a basic deployment. If you are new to the project, please consult the main [README](../README.md#deploying) for steps on deploying the project.

- [Deploying with the Azure Developer CLI](#deploying-with-the-azure-developer-cli)
  - [How does `azd up` work?](#how-does-azd-up-work)
  - [Configuring continuous deployment](#configuring-continuous-deployment)
    - [GitHub actions](#github-actions)
    - [Azure DevOps](#azure-devops)
    - [Provision infrastructure and deploy application code](#provision-infrastructure-and-deploy-application-code)
    - [Configure environment variables for running services](#configure-environment-variables-for-running-services)
    - [Configure CI/CD pipeline](#configure-cicd-pipeline)
  - [Infrastructure as Code](#infrastructure-as-code)
    - [Infrastructure configuration](#infrastructure-configuration)
    - [Build from source (no Dockerfile)](#build-from-source-no-dockerfile)
      - [Build with Buildpacks using Oryx](#build-with-buildpacks-using-oryx)
      - [Exposed port](#exposed-port)
  - [Billing](#billing)
  - [Troubleshooting](#troubleshooting)
    - [Additional information](#additional-information)


## How does `azd up` work?

The `azd up` command comes from the [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/overview), and takes care of both provisioning the Azure resources and deploying code to the selected Azure hosts.

The `azd up` command uses the `azure.yaml` file combined with the infrastructure-as-code `.bicep` files in the `infra/` folder. The `azure.yaml` file for this project declares several "hooks" for the prepackage step and postprovision steps. The `up` command first runs the `prepackage` hook which installs Node dependencies and builds the React.JS-based JavaScript files. It then packages all the code (both frontend and backend) into a zip file which it will deploy later.

Next, it provisions the resources based on `main.bicep` and `main.parameters.json`. At that point, since there is no default value for the OpenAI resource location, it asks you to pick a location from a short list of available regions. Then it will send requests to Azure to provision all the required resources. With everything provisioned, it runs the `postprovision` hook to process the local data and add it to an Azure AI Search index.

Finally, it looks at `azure.yaml` to determine the Azure host (appservice, in this case) and uploads the zip to Azure App Service. The `azd up` command is now complete, but it may take another 5-10 minutes for the App Service app to be fully available and working, especially for the initial deploy.

Related commands are `azd provision` for just provisioning (if infra files change) and `azd deploy` for just deploying updated app code.

## Configuring continuous deployment

This repository includes both a GitHub Actions workflow and an Azure DevOps pipeline for continuous deployment with every push to `main`. The GitHub Actions workflow is the default, but you can switch to Azure DevOps if you prefer.

More details are available in [Learn.com: Configure a pipeline and push updates](https://learn.microsoft.com/azure/developer/azure-developer-cli/configure-devops-pipeline?tabs=GitHub)

### GitHub actions

After you have deployed the app once with `azd up`, you can enable continuous deployment with GitHub Actions.

Run this command to set up a Service Principal account for CI deployment and to store your `azd` environment variables in GitHub Actions secrets:

```shell
azd pipeline config
```

You can trigger the "Deploy" workflow manually from your GitHub actions, or wait for the next push to main.

If you change your `azd` environment variables at any time (via `azd env set` or as a result of provisioning), re-run that command in order to update the GitHub Actions secrets.

### Azure DevOps

After you have deployed the app once with `azd up`, you can enable continuous deployment with Azure DevOps.

Run this command to set up a Service Principal account for CI deployment and to store your `azd` environment variables in GitHub Actions secrets:

```shell
azd pipeline config --provider azdo
```

If you change your `azd` environment variables at any time (via `azd env set` or as a result of provisioning), re-run that command in order to update the GitHub Actions secrets.

### Provision infrastructure and deploy application code

Run `azd up` to provision your infrastructure and deploy to Azure (or run `azd provision` then `azd deploy` to accomplish the tasks separately). Visit the service endpoints listed to see your application up-and-running!

To troubleshoot any issues, see [troubleshooting](#troubleshooting).

### Configure environment variables for running services

Configure environment variables for running services by updating `settings` in [main.parameters.json](./infra/main.parameters.json).

### Configure CI/CD pipeline

1. Create a workflow pipeline file locally. The following starters are available:
   - [Deploy with GitHub Actions](https://github.com/Azure-Samples/azd-starter-bicep/blob/main/.github/workflows/azure-dev.yml)
   - [Deploy with Azure Pipelines](https://github.com/Azure-Samples/azd-starter-bicep/blob/main/.azdo/pipelines/azure-dev.yml)
2. Run `azd pipeline config` to configure the deployment pipeline to connect securely to Azure.

## Infrastructure as Code

### Infrastructure configuration

To describe the infrastructure and application, `azure.yaml` along with Infrastructure as Code files using Bicep were added with the following directory structure:

```yaml
- azure.yaml        # azd project configuration
- infra/            # Infrastructure-as-code Bicep files
  - main.bicep      # Subscription level resources
  - resources.bicep # Primary resource group resources
  - modules/        # Library modules
```

The resources declared in [resources.bicep](../infra/main.bicep) are provisioned when running `azd up` or `azd provision`.

More information about [Bicep](https://aka.ms/bicep) language.

### Build from source (no Dockerfile)

#### Build with Buildpacks using Oryx

If your project does not contain a Dockerfile, we will use [Buildpacks](https://buildpacks.io/) using [Oryx](https://github.com/microsoft/Oryx/blob/main/doc/README.md) to create an image for the services in `azure.yaml` and get your containerized app onto Azure.

To produce and run the docker image locally:

1. Run `azd package` to build the image.
2. Copy the *Image Tag* shown.
3. Run `docker run -it <Image Tag>` to run the image locally.

#### Exposed port

Oryx will automatically set `PORT` to a default value of `80` (port `8080` for Java). Additionally, it will auto-configure supported web servers such as `gunicorn` and `ASP .NET Core` to listen to the target `PORT`. If your application already listens to the port specified by the `PORT` variable, the application will work out-of-the-box. Otherwise, you may need to perform one of the steps below:

1. Update your application code or configuration to listen to the port specified by the `PORT` variable
1. (Alternatively) Search for `targetPort` in a .bicep file under the `infra/app` folder, and update the variable to match the port used by the application.

## Billing

Visit the *Cost Management + Billing* page in Azure Portal to track current spend. For more information about how you're billed, and how you can monitor the costs incurred in your Azure subscriptions, visit [billing overview](https://learn.microsoft.com/azure/developer/intro/azure-developer-billing).

## Troubleshooting

Q: I visited the service endpoint listed, and I'm seeing a blank page, a generic welcome page, or an error page.

A: Your service may have failed to start, or it may be missing some configuration settings. To investigate further:

1. Run `azd show`. Click on the link under "View in Azure Portal" to open the resource group in Azure Portal.
2. Navigate to the specific Container App service that is failing to deploy.
3. Click on the failing revision under "Revisions with Issues".
4. Review "Status details" for more information about the type of failure.
5. Observe the log outputs from Console log stream and System log stream to identify any errors.
6. If logs are written to disk, use *Console* in the navigation to connect to a shell within the running container.

For more troubleshooting information, visit [Container Apps troubleshooting](https://learn.microsoft.com/azure/container-apps/troubleshooting). 

### Additional information

For additional information about setting up your `azd` project, visit our official [docs](https://learn.microsoft.com/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-convert).
