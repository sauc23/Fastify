import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import chalk from 'chalk';
import _ from 'lodash';

const apiRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.join(__dirname, '../api');
const customTitle = "Wudysoft API";
const serverUrl = "/api";
let routers = [];
const getJSFiles = (dir) => {
  let files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = [...files, ...getJSFiles(fullPath)];
      } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'api.js') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(chalk.red.bold(`❌ Error reading directory ${dir}:`), error);
  }
  return files;
};

const init = async () => {
  const spinner = ora({ text: chalk.cyan('Loading API routes'), spinner: 'moon' }).start();
  const routes = [];
  routers = routes;
  try {
    for (const file of getJSFiles(apiDir)) {
      try {
        const module = await import(`${file}`);
        const baseRoute = `/${path.relative(apiDir, file).replace(/\\/g, '/').replace('.js', '')}`;
        const routeMethod = module.method === 'POST' ? 'post' : 'get';

        if (module.default) routes.push({ routePath: baseRoute, handler: module.default, method: routeMethod });
        Object.entries(module).forEach(([name, handler]) => {
          if (name !== 'default' && name !== 'method' && typeof handler === 'function') {
            routes.push({ routePath: `${baseRoute}/${name}`, handler, method: routeMethod });
          }
        });

        console.log(chalk.green(`✔️ Loaded module ${file}`));
      } catch (error) {
        console.error(chalk.red.bold(`❌ Error loading module ${file}:`), error);
        continue;
      }
    }
    spinner.succeed(chalk.green('Loaded API routes'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to read API directory'));
    console.error(chalk.red('Error during route initialization:'), error);
  }

  const paths = {};
  const tags = {};

  for (const { routePath, handler, method } of routes) {
    const fullPath = `${serverUrl}${routePath}`;
    apiRouter[method](routePath, async (req, res) => {
      const input = method === 'post' ? req.body : req.query;
      const params = Object.values(input);

      try {
        const response = await handler(...params);
        res.status(200).json({ result: response });
      } catch (error) {
        console.error(chalk.red.bold(`❌ Error in ${routePath} route:`), error);
        res.status(500).json({ error: 'Failed to generate response' });
      }
    });

    const getFnParamNames = (fn) => {
    const fnStr = fn.toString().replace(/\s+/g, ' ');
    const arrowMatch = fnStr.match(/^(async\s*)?[^(]*\(([^)]*)\)\s*=>/) ||
                       fnStr.match(/^\s*\w+\s*=\s*(async\s*)?\(?([^)]*)\)?\s*=>/);
    if (arrowMatch) return arrowMatch[2].split(',').map(param => param.trim()).filter(Boolean);
    const functionMatch = fnStr.match(/function\s*(async\s*)?\w*\s*\(([^)]*)\)/);
    if (functionMatch) return functionMatch[2].split(',').map(param => param.trim()).filter(Boolean);
    const boundFunctionMatch = fnStr.match(/bound\s*function\s*\(([^)]*)\)/);
    if (boundFunctionMatch) return boundFunctionMatch[1].split(',').map(param => param.trim()).filter(Boolean);
    const anonymousMatch = fnStr.match(/^\(([^)]*)\)\s*=>/);
    return anonymousMatch ? anonymousMatch[1].split(',').map(param => param.trim()).filter(Boolean) : [];
};

const parameters = (handler, method = 'get') => {
    const params = getFnParamNames(handler);
    return params.map(param => {
        const [namePart, defaultValue] = param.split('=').map(part => part.trim());
        const name = namePart.replace(/async\s+/g, '').split(' ')[0].trim();
        return {
            name,
            in: method === 'post' ? 'body' : 'query',
            required: defaultValue === undefined,
            description: `Parameter: ${name}`,
            schema: { type: 'string', example: defaultValue }
        };
    });
};

    const tag = routePath.split('/')[1].toUpperCase();
    tags[tag] || (tags[tag] = []);
    tags[tag].push(fullPath);

    paths[fullPath] = {
      [method]: {
        summary: `Perform ${method.toUpperCase()} request on ${fullPath}`,
        tags: [tag],
        parameters: parameters(handler, method),
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
 schema: {
                  type: 'object',
                  properties: {
                    result: { type: 'object', additionalProperties: true },
                  },
                },
                example: {
                  result: { message: "Success!", data: {} },
                },
              },
            },
          },
          500: { description: 'Internal server error' },
        },
      },
    };
  }

  const sortedTags = Object.keys(tags).sort();
  const sortedPaths = {};

  sortedTags.forEach(tag => {
    tags[tag].sort().forEach(route => {
      sortedPaths[route] = paths[route];
    });
  });

  return {
    openapi: '3.0.0',
    info: {
      title: customTitle,
      version: '1.0.0',
      description: `${customTitle} Documentation. This documentation provides information on all available API endpoints. Below you can find all the necessary details on required parameters and expected responses for each endpoint.`,
      contact: {
        name: "API Support",
        url: "https://wudysoft.us.kg/contact",
        email: "support@wudysoft.us.kg",
      },
    },
    servers: [
      { url: 'https://wudysoft.us.kg', description: 'Primary server' },
      { url: 'https://wudysoft.biz.id', description: 'Secondary server' },
    ],
    tags: sortedTags.map(tag => ({ name: tag, description: `Endpoints related to ${tag}` })),
    paths: sortedPaths,
  };
};

const start = async () => {
  try {
    const swaggerDefs = await init();
    return { apiRouter, swaggerDefs };
  } catch (error) {
    console.error(chalk.red('Failed to initialize API routes and definitions.'));
    throw error;
  }
};

const { apiRouter: apiRouters, swaggerDefs } = await start();
export { apiRouters, swaggerDefs, routers };