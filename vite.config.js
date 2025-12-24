import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom Plugin for Uploads
const uploadPlugin = () => ({
  name: 'configure-upload-server',
  configureServer(server) {
    console.log("--> [Plugin] Upload Plugin Registered");
    server.middlewares.use('/upload', (req, res, next) => {
      console.log(`--> [Plugin] Request to /upload: ${req.method}`);
      if (req.method === 'POST') {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
           try {
              const buffer = Buffer.concat(chunks);
              const uploadDir = resolve(__dirname, 'public/uploads');
              
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              
              const fileName = `upload_${Date.now()}.webm`;
              const filePath = path.join(uploadDir, fileName);
              fs.writeFileSync(filePath, buffer);
              
              console.log(`[Plugin] Saved upload: ${filePath}`);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ url: `/uploads/${fileName}` }));
           } catch (err) {
              console.error('[Plugin] Upload error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
           }
        });
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  plugins: [uploadPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/VideoRecorder.js'),
      name: 'VideoRecorderJS',
      fileName: (format) => `videorecorder.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  }
});
