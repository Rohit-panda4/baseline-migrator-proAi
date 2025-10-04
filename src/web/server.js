
import express from 'express';
import { BaselineAnalyzer } from '../core/analyzer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile, unlink } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname)));

app.post('/analyze', async (req, res) => {
    const { code, ai } = req.body;
    if (!code) {
        return res.status(400).send({ error: 'Code is required' });
    }

    const tempFilePath = join(__dirname, `temp-${Date.now()}.js`);
    const output = [];
    const logger = {
        log: (...args) => output.push(args.join(' ')),
        error: (...args) => output.push(args.join(' ')),
    };

    try {
        await writeFile(tempFilePath, code);
        const analyzer = new BaselineAnalyzer({ logger });
        await analyzer.analyzeFile(tempFilePath, { ai });
        res.send({ output: output.join('\n') });
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        try {
            await unlink(tempFilePath);
        } catch (error) {
            // Don't log to the user-facing logger, just the server console
            console.error(`Failed to delete temp file: ${error.message}`);
        }
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
