const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Custom middleware to serve directory listings and files
app.use('/files', (req, res) => {
    const baseDir = path.join(__dirname);
    const reqPath = path.join(baseDir, req.path);

    fs.stat(reqPath, (err, stats) => {
        if (err) {
            return res.status(404).send('Not Found');
        }

        if (stats.isDirectory()) {
            fs.readdir(reqPath, (err, files) => {
                if (err) {
                    return res.status(500).send('Server Error');
                }

                const fileLinks = files.map(file => {
                    const filePath = path.join(req.path, file);
                    return `<li><a href="${filePath}">${file}</a></li>`;
                }).join('');

                res.send(`<ul>${fileLinks}</ul>`);
            });
        } else {
            res.sendFile(reqPath);
        }
    });
});

// Fallback to index.html for single-page applications (optional)
app.get('*', (req, res, next) => {
    const staticFileExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];

    if (staticFileExtensions.some(ext => req.path.endsWith(ext))) {
        // If the request is for a static file, try to serve it
        res.sendFile(path.join(__dirname, 'frontend', req.path), err => {
            if (err) {
                res.status(404).send('Not Found');
            }
        });
    } else {
        // For all other routes, serve the SPA's index.html
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});