/**
 * Integration Verification Script
 * Verifies all components are properly integrated and working together
 */

class IntegrationVerifier {
    constructor() {
        this.verificationResults = [];
        this.criticalIssues = [];
        this.warnings = [];
    }

    async verifyIntegration() {
        console.log('🔍 Starting integration verification...');

        try {
            // Core Application Verification
            await this.verifyApplicationCore();

            // Component Integration Verification
            await this.verifyComponentIntegration();

            // Data Flow Verification
            await this.verifyDataFlow();

            // Security Integration Verification
            await this.verifySecurityIntegration();

            // UI Integration Verification
            await this.verifyUIIntegration();

            // Performance Integration Verification
            await this.verifyPerformanceIntegration();

            // Generate final report
            this.generateIntegrationReport();

        } catch (error) {
            console.error('❌ Integration verification failed:', error);
            this.criticalIssues.push(`Integration verification failed: ${error.message}`);
        }
    }

    async verifyApplicationCore() {
        console.log('Verifying application core...');

        // Check if App class exists and is properly defined
        if (typeof App === 'undefined') {
            this.criticalIssues.push('App class is not defined');
            return;
        }

        // Check if app instance exists
        if (!window.app) {
            this.warnings.push('App instance not found in global scope');
        }

        // Check if app is initialized
        if (window.app && !window.app.isInitialized) {
            this.warnings.push('App is not initialized');
        }

        this.verificationResults.push({
            category: 'Application Core',
            status: 'PASSED',
            details: 'App class exists and is properly defined'
        });
    }

    async verifyComponentIntegration() {
        console.log('Verifying component integration...');

        const requiredComponents = [
            'errorHandler',
            'changeTracker',
            'modalManager',
            'logoManager',
            'uiRouter',
            'authManager',
            'formManager',
            'dataStorage',
            'patientManager',
            'performanceOptimizer'
        ];

        const missingComponents = [];
        const availableComponents = [];

        if (window.app && window.app.components) {
            requiredComponents.forEach(component => {
                if (window.app.components[component]) {
                    availableComponents.push(component);
                } else {
                    missingComponents.push(component);
                }
            });
        } else {
            this.criticalIssues.push('App components not initialized');
            return;
        }

        if (missingComponents.length > 0) {
            this.criticalIssues.push(`Missing components: ${missingComponents.join(', ')}`);
        }

        this.verificationResults.push({
            category: 'Component Integration',
            status: missingComponents.length === 0 ? 'PASSED' : 'FAILED',
            details: `Available: ${availableComponents.length}/${requiredComponents.length} components`,
            availableComponents,
            missingComponents
        });
    }

    async verifyDataFlow() {
        console.log('Verifying data flow...');

        try {
            // Check if data storage is working
            if (!window.app?.components?.dataStorage) {
                this.criticalIssues.push('DataStorage component not available');
                return;
            }

            // Check if patient manager is working
            if (!window.app?.components?.patientManager) {
                this.criticalIssues.push('PatientManager component not available');
                return;
            }

            // Test localStorage availability
            try {
                localStorage.setItem('integration_test', 'test');
                localStorage.removeItem('integration_test');
            } catch (error) {
                this.criticalIssues.push('localStorage not available');
            }

            this.verificationResults.push({
                category: 'Data Flow',
                status: 'PASSED',
                details: 'Data storage and patient management components are available'
            });

        } catch (error) {
            this.criticalIssues.push(`Data flow verification failed: ${error.message}`);
        }
    }

    async verifySecurityIntegration() {
        console.log('Verifying security integration...');

        // Check if security hardening is loaded
        if (!window.securityHardening) {
            this.criticalIssues.push('Security hardening not initialized');
        }

        // Check CSP headers
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
            this.warnings.push('Content Security Policy header not found');
        }

        // Check other security headers
        const securityHeaders = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Referrer-Policy'
        ];

        const missingHeaders = [];
        securityHeaders.forEach(header => {
            const meta = document.querySelector(`meta[http-equiv="${header}"]`);
            if (!meta) {
                missingHeaders.push(header);
            }
        });

        if (missingHeaders.length > 0) {
            this.warnings.push(`Missing security headers: ${missingHeaders.join(', ')}`);
        }

        this.verificationResults.push({
            category: 'Security Integration',
            status: window.securityHardening ? 'PASSED' : 'FAILED',
            details: `Security hardening: ${window.securityHardening ? 'Available' : 'Missing'}`,
            missingHeaders
        });
    }

    async verifyUIIntegration() {
        console.log('Verifying UI integration...');

        // Check if main HTML elements exist
        const requiredElements = [
            'app',
            'main-content',
            'toast-container',
            'modal-container'
        ];

        const missingElements = [];
        requiredElements.forEach(elementId => {
            if (!document.getElementById(elementId)) {
                missingElements.push(elementId);
            }
        });

        if (missingElements.length > 0) {
            this.criticalIssues.push(`Missing HTML elements: ${missingElements.join(', ')}`);
        }

        // Check if CSS files are loaded
        const cssLoaded = document.querySelectorAll('link[rel="stylesheet"]').length > 0;
        if (!cssLoaded) {
            this.criticalIssues.push('No CSS files loaded');
        }

        // Check if UI router is working
        if (!window.app?.components?.uiRouter) {
            this.warnings.push('UI Router not available');
        }

        this.verificationResults.push({
            category: 'UI Integration',
            status: missingElements.length === 0 && cssLoaded ? 'PASSED' : 'FAILED',
            details: `HTML elements: ${requiredElements.length - missingElements.length}/${requiredElements.length}, CSS loaded: ${cssLoaded}`,
            missingElements
        });
    }

    async verifyPerformanceIntegration() {
        console.log('Verifying performance integration...');

        // Check if performance optimizer is available
        const hasPerformanceOptimizer = window.app?.components?.performanceOptimizer;

        // Check memory usage
        const memoryInfo = performance.memory;
        const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;

        // Check load time
        const loadTime = performance.now();

        if (memoryUsage > 100) { // 100MB threshold
            this.warnings.push(`High memory usage: ${Math.round(memoryUsage)}MB`);
        }

        if (loadTime > 5000) { // 5 second threshold
            this.warnings.push(`Slow load time: ${Math.round(loadTime)}ms`);
        }

        this.verificationResults.push({
            category: 'Performance Integration',
            status: hasPerformanceOptimizer ? 'PASSED' : 'WARNING',
            details: `Performance optimizer: ${hasPerformanceOptimizer ? 'Available' : 'Missing'}`,
            metrics: {
                memoryUsage: Math.round(memoryUsage) + 'MB',
                loadTime: Math.round(loadTime) + 'ms'
            }
        });
    }

    generateIntegrationReport() {
        console.log('\n🔍 Integration Verification Report');
        console.log('=====================================');

        // Summary
        const totalChecks = this.verificationResults.length;
        const passedChecks = this.verificationResults.filter(r => r.status === 'PASSED').length;
        const failedChecks = this.verificationResults.filter(r => r.status === 'FAILED').length;
        const warningChecks = this.verificationResults.filter(r => r.status === 'WARNING').length;

        console.log(`Total Checks: ${totalChecks}`);
        console.log(`Passed: ${passedChecks}`);
        console.log(`Failed: ${failedChecks}`);
        console.log(`Warnings: ${warningChecks}`);
        console.log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`);

        console.log('\n📋 Detailed Results:');
        this.verificationResults.forEach(result => {
            const status = result.status === 'PASSED' ? '✅' :
                result.status === 'FAILED' ? '❌' : '⚠️';
            console.log(`${status} ${result.category}: ${result.details}`);

            if (result.missingComponents && result.missingComponents.length > 0) {
                console.log(`   Missing: ${result.missingComponents.join(', ')}`);
            }

            if (result.metrics) {
                console.log(`   Metrics: ${JSON.stringify(result.metrics)}`);
            }
        });

        // Critical Issues
        if (this.criticalIssues.length > 0) {
            console.log('\n🚨 Critical Issues:');
            this.criticalIssues.forEach(issue => {
                console.log(`❌ ${issue}`);
            });
        }

        // Warnings
        if (this.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            this.warnings.forEach(warning => {
                console.log(`⚠️ ${warning}`);
            });
        }

        // Final Assessment
        console.log('\n🎯 Final Assessment:');
        if (this.criticalIssues.length === 0) {
            if (this.warnings.length === 0) {
                console.log('✅ Integration verification PASSED - All systems are properly integrated');
            } else {
                console.log('⚠️ Integration verification PASSED with warnings - Review warnings before deployment');
            }
        } else {
            console.log('❌ Integration verification FAILED - Critical issues must be resolved');
        }

        // Recommendations
        console.log('\n💡 Recommendations:');
        if (this.criticalIssues.length > 0) {
            console.log('1. Resolve all critical issues before deployment');
            console.log('2. Re-run integration verification after fixes');
        }

        if (this.warnings.length > 0) {
            console.log('3. Review and address warnings for optimal performance');
        }

        console.log('4. Run comprehensive test suite before deployment');
        console.log('5. Perform manual testing on target browsers');

        return {
            passed: this.criticalIssues.length === 0,
            summary: {
                totalChecks,
                passedChecks,
                failedChecks,
                warningChecks,
                successRate: Math.round((passedChecks / totalChecks) * 100)
            },
            results: this.verificationResults,
            criticalIssues: this.criticalIssues,
            warnings: this.warnings
        };
    }

    exportReport() {
        const report = this.generateIntegrationReport();
        const reportData = JSON.stringify(report, null, 2);

        const blob = new Blob([reportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `integration-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📄 Integration report exported');
    }
}

// Auto-run verification when script loads
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for app to initialize
    setTimeout(async () => {
        const verifier = new IntegrationVerifier();
        await verifier.verifyIntegration();

        // Make verifier available globally for manual use
        window.integrationVerifier = verifier;
    }, 2000);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationVerifier;
}