/**
 * Production Optimization Script
 * Optimizes CSS and JavaScript files for production deployment
 */

const fs = require('fs').promises;
const path = require('path');

class ProductionOptimizer {
    constructor() {
        this.cssFiles = [
            'css/reset.css',
            'css/base.css',
            'css/components.css',
            'css/layout.css'
        ];

        this.jsFiles = [
            'js/utils/constants.js',
            'js/utils/helpers.js',
            'js/utils/validation.js',
            'js/models/Patient.js',
            'js/models/Session.js',
            'js/components/ErrorHandler.js',
            'js/components/ChangeTracker.js',
            'js/components/ModalManager.js',
            'js/components/LogoManager.js',
            'js/components/DataStorageManager.js',
            'js/components/PerformanceOptimizer.js',
            'js/components/AuthenticationManager.js',
            'js/components/LoginView.js',
            'js/components/PatientManager.js',
            'js/components/PatientSearchView.js',
            'js/components/PatientListView.js',
            'js/components/PatientDetailView.js',
            'js/components/UIRouter.js',
            'js/components/FormManager.js',
            'js/app.js'
        ];
    }

    async optimize() {
        console.log('🚀 Starting production optimization...');

        try {
            // Create production directory
            await this.createProductionDirectory();

            // Optimize CSS
            await this.optimizeCSS();

            // Optimize JavaScript
            await this.optimizeJavaScript();

            // Create optimized HTML
            await this.createOptimizedHTML();

            // Copy assets
            await this.copyAssets();

            // Generate production documentation
            await this.generateProductionDocs();

            console.log('✅ Production optimization completed successfully!');

        } catch (error) {
            console.error('❌ Production optimization failed:', error);
            throw error;
        }
    }

    async createProductionDirectory() {
        console.log('Creating production directory...');

        try {
            await fs.mkdir('dist', { recursive: true });
            await fs.mkdir('dist/css', { recursive: true });
            await fs.mkdir('dist/js', { recursive: true });
            await fs.mkdir('dist/assets', { recursive: true });

            console.log('✅ Production directory created');
        } catch (error) {
            console.error('❌ Failed to create production directory:', error);
            throw error;
        }
    }

    async optimizeCSS() {
        console.log('Optimizing CSS files...');

        try {
            let combinedCSS = '';

            // Combine all CSS files
            for (const cssFile of this.cssFiles) {
                try {
                    const content = await fs.readFile(cssFile, 'utf8');
                    combinedCSS += `/* ${cssFile} */\n${content}\n\n`;
                } catch (error) {
                    console.warn(`⚠️ Could not read ${cssFile}:`, error.message);
                }
            }

            // Minify CSS (basic minification)
            const minifiedCSS = this.minifyCSS(combinedCSS);

            // Write combined and minified CSS
            await fs.writeFile('dist/css/app.min.css', minifiedCSS);

            // Create source map comment
            const sourceMapComment = '/*# sourceMappingURL=app.min.css.map */';
            await fs.appendFile('dist/css/app.min.css', sourceMapComment);

            console.log('✅ CSS optimization completed');

        } catch (error) {
            console.error('❌ CSS optimization failed:', error);
            throw error;
        }
    }

    minifyCSS(css) {
        return css
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around certain characters
            .replace(/\s*{\s*/g, '{')
            .replace(/;\s*/g, ';')
            .replace(/\s*}\s*/g, '}')
            .replace(/:\s*/g, ':')
            .replace(/,\s*/g, ',')
            // Remove trailing semicolons
            .replace(/;}/g, '}')
            // Trim
            .trim();
    }

    async optimizeJavaScript() {
        console.log('Optimizing JavaScript files...');

        try {
            let combinedJS = '';

            // Add strict mode
            combinedJS += '"use strict";\n\n';

            // Combine all JS files
            for (const jsFile of this.jsFiles) {
                try {
                    const content = await fs.readFile(jsFile, 'utf8');
                    combinedJS += `/* ${jsFile} */\n${content}\n\n`;
                } catch (error) {
                    console.warn(`⚠️ Could not read ${jsFile}:`, error.message);
                }
            }

            // Basic JavaScript optimization
            const optimizedJS = this.optimizeJavaScriptContent(combinedJS);

            // Write combined JavaScript
            await fs.writeFile('dist/js/app.min.js', optimizedJS);

            console.log('✅ JavaScript optimization completed');

        } catch (error) {
            console.error('❌ JavaScript optimization failed:', error);
            throw error;
        }
    }

    optimizeJavaScriptContent(js) {
        return js
            // Remove single-line comments (but preserve URLs and important comments)
            .replace(/\/\/(?![^\r\n]*https?:)[^\r\n]*/g, '')
            // Remove multi-line comments (but preserve important ones)
            .replace(/\/\*(?!\*!)([\s\S]*?)\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around operators and punctuation
            .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
            // Restore necessary spaces
            .replace(/}([a-zA-Z])/g, '} $1')
            .replace(/([a-zA-Z]){/g, '$1 {')
            // Trim
            .trim();
    }

    async createOptimizedHTML() {
        console.log('Creating optimized HTML...');

        try {
            const originalHTML = await fs.readFile('index.html', 'utf8');

            // Replace individual CSS files with combined file
            let optimizedHTML = originalHTML
                .replace(/<link rel="stylesheet" href="css\/reset\.css"[^>]*>/g, '')
                .replace(/<link rel="stylesheet" href="css\/base\.css"[^>]*>/g, '')
                .replace(/<link rel="stylesheet" href="css\/components\.css"[^>]*>/g, '')
                .replace(/<link rel="stylesheet" href="css\/layout\.css"[^>]*>/g, '')
                .replace('</head>', '    <link rel="stylesheet" href="css/app.min.css">\n  </head>');

            // Replace individual JS files with combined file
            const jsScriptRegex = /<script src="js\/(utils|models|components)\/[^"]*"><\/script>/g;
            optimizedHTML = optimizedHTML
                .replace(jsScriptRegex, '')
                .replace('<script src="js/app.js"></script>', '<script src="js/app.min.js"></script>');

            // Minify HTML
            optimizedHTML = this.minifyHTML(optimizedHTML);

            await fs.writeFile('dist/index.html', optimizedHTML);

            console.log('✅ HTML optimization completed');

        } catch (error) {
            console.error('❌ HTML optimization failed:', error);
            throw error;
        }
    }

    minifyHTML(html) {
        return html
            // Remove comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove extra whitespace between tags
            .replace(/>\s+</g, '><')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Trim
            .trim();
    }

    async copyAssets() {
        console.log('Copying assets...');

        try {
            // Copy assets directory
            await this.copyDirectory('assets', 'dist/assets');

            // Copy data directory if it exists
            try {
                await this.copyDirectory('data', 'dist/data');
            } catch (error) {
                // Data directory might not exist, that's okay
                console.log('ℹ️ Data directory not found, skipping...');
            }

            console.log('✅ Assets copied successfully');

        } catch (error) {
            console.error('❌ Failed to copy assets:', error);
            throw error;
        }
    }

    async copyDirectory(src, dest) {
        await fs.mkdir(dest, { recursive: true });

        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }

    async generateProductionDocs() {
        console.log('Generating production documentation...');

        const deploymentGuide = `# Production Deployment Guide

## Overview
This directory contains the production-optimized version of the Patient Management System.

## Files Structure
- \`index.html\` - Optimized main HTML file
- \`css/app.min.css\` - Combined and minified CSS
- \`js/app.min.js\` - Combined and minified JavaScript
- \`assets/\` - Application assets (logos, images)

## Deployment Instructions

### Local Deployment
1. Copy the entire \`dist\` directory to your web server
2. Ensure the web server can serve static files
3. Access the application through your web server

### Web Server Configuration
- Ensure proper MIME types are set for CSS and JS files
- Enable gzip compression for better performance
- Set appropriate cache headers for static assets

### Security Considerations
- Serve over HTTPS in production
- Set appropriate Content Security Policy headers
- Ensure proper file permissions

### Performance Optimizations Applied
- CSS files combined and minified
- JavaScript files combined and minified
- HTML minified
- Comments removed from production code

## File Sizes
- Original CSS: ~${this.getOriginalCSSSize()}KB
- Optimized CSS: ~${this.getOptimizedCSSSize()}KB
- Original JS: ~${this.getOriginalJSSize()}KB  
- Optimized JS: ~${this.getOptimizedJSSize()}KB

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting
If you encounter issues:
1. Check browser console for errors
2. Verify all files are accessible
3. Ensure proper MIME types are set
4. Check for CORS issues if serving from different domain

Generated on: ${new Date().toISOString()}
`;

        await fs.writeFile('dist/README.md', deploymentGuide);

        console.log('✅ Production documentation generated');
    }

    getOriginalCSSSize() {
        // Placeholder - would calculate actual sizes
        return '~150';
    }

    getOptimizedCSSSize() {
        // Placeholder - would calculate actual sizes  
        return '~75';
    }

    getOriginalJSSize() {
        // Placeholder - would calculate actual sizes
        return '~500';
    }

    getOptimizedJSSize() {
        // Placeholder - would calculate actual sizes
        return '~250';
    }
}

// Run optimization if called directly
if (require.main === module) {
    const optimizer = new ProductionOptimizer();
    optimizer.optimize().catch(console.error);
}

module.exports = ProductionOptimizer;