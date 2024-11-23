import { BaseToolWithCall } from "llamaindex";
import { ToolsFactory } from "llamaindex/tools/ToolsFactory";
import fs from "node:fs/promises";
import path from "node:path";
import {
  DocumentGenerator,
  DocumentGeneratorParams,
} from "./document-generator";
import { OpenAPIActionTool } from "./openapi-action";

type ToolCreator = (config: unknown) => Promise<BaseToolWithCall[]>;

export async function createTools(toolConfig: {
  local: Record<string, unknown>;
  llamahub: any;
}): Promise<BaseToolWithCall[]> {
  // add local tools from the 'tools' folder (if configured)
  const tools = await createLocalTools(toolConfig.local);
  // add tools from LlamaIndexTS (if configured)
  tools.push(...(await ToolsFactory.createTools(toolConfig.llamahub)));
  return tools;
}

const toolFactory: Record<string, ToolCreator> = {
  "openapi_action.OpenAPIActionToolSpec": async (config: unknown) => {
    const { openapi_uri, domain_headers } = config as {
      openapi_uri: string;
      domain_headers: Record<string, Record<string, string>>;
    };
    const openAPIActionTool = new OpenAPIActionTool(
      openapi_uri,
      domain_headers,
    );
    return await openAPIActionTool.toToolFunctions();
  },
  document_generator: async (config: unknown) => {
    return [new DocumentGenerator(config as DocumentGeneratorParams)];
  },
};

async function createLocalTools(
  localConfig: Record<string, unknown>,
): Promise<BaseToolWithCall[]> {
  const tools: BaseToolWithCall[] = [];

  for (const [key, toolConfig] of Object.entries(localConfig)) {
    if (key in toolFactory) {
      const newTools = await toolFactory[key](toolConfig);
      tools.push(...newTools);
    }
  }

  return tools;
}

export async function getConfiguredTools(
  configPath?: string,
): Promise<BaseToolWithCall[]> {
  const configFile = path.join(configPath ?? "config", "tools.json");
  const toolConfig = JSON.parse(await fs.readFile(configFile, "utf8"));
  const tools = await createTools(toolConfig);
  return tools;
}

export async function getTool(
  toolName: string,
): Promise<BaseToolWithCall | undefined> {
  const tools = await getConfiguredTools();
  return tools.find((tool) => tool.metadata.name === toolName);
}
