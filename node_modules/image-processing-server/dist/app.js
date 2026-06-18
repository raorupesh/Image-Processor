import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { transformRouter } from './routes/transformRoute.js';
const app = express();
const currentDirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.resolve(currentDirname, '../../client/dist');
const hasClientBuild = fs.existsSync(clientBuildPath);
app.use(cors({
    origin: config.clientOrigin,
    credentials: false
}));
app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
});
app.use('/api', transformRouter);
if (hasClientBuild) {
    app.use(express.static(clientBuildPath));
    app.get('*', (request, response, next) => {
        if (request.path.startsWith('/api')) {
            next();
            return;
        }
        response.sendFile(path.join(clientBuildPath, 'index.html'), (error) => {
            if (error) {
                next(error);
            }
        });
    });
}
app.use(notFoundHandler);
app.use(errorHandler);
export { app };
