import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDirectory = path.join(__dirname, '../api');
const groupedRoutes = {};

function scanDirectory(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (stat.isFile() && file.endsWith('.js')) {
            const folderName = path.basename(path.dirname(fullPath));
            const commandName = path.basename(fullPath, '.js');

            if (!groupedRoutes[folderName]) {
                groupedRoutes[folderName] = [];
            }
            groupedRoutes[folderName].push(commandName);
        }
    });
}

scanDirectory(apiDirectory);

Object.keys(groupedRoutes).forEach(key => {
    if (groupedRoutes[key].length === 0) {
        delete groupedRoutes[key];
    }
});

export default groupedRoutes;
