/**
 * Comprehensive Test Runner for Patient Management System
 * Orchestrates all test suites and provides detailed reporting
 */

class ComprehensiveTestRunner {
    constructor() {
        this.testSuites = {};
        this.overallResults = {
            unit: { passed: 0, failed: 0, total: 0, duration: 0 },
            integration: { passed: 0, failed: 0, total: 0, duration: 0 },
            endToEnd: { passed: 0, failed: 0, total: 0, duration: 0 },
            performance: { passed: 0, failed: 0, total: 0, duration: 0 },
            errorScenario: { passed: 0, failed: 0, total: 0, duration: 0 }
        };
        this.startTime = Date.now();
        this.performanceMetrics = {};
    }

    /**
     * Initialize all test suites
     */
    async initializeTestSuites() {
        try {
            // Load test suites (in a real environment, these would be imported)
            this.testSuites = {
                unit: new UnitTestSuite(),
                integration: new IntegrationTestSuite(),
                endToEnd: new EndToEndTestSuite(),
                performance: new PerformanceTestSuite(),
                errorScenario: new ErrorScenarioTestSuite()
            };

            console.log('✅ All test suites initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize test suites:', error);
            return false;
        }
    }

    /**
     * Run all test suites
     */
    async runAllTests(options = {}) {
        console.log('🧪 Starting Comprehensive Test Suite for Patient Management System');
        console.log('='.repeat(80));
        console.log(`Test execution started at: ${new Date().toISOString()}`);
        console.log('='.repeat(80));

        const {
            skipUnit = false,
            skipIntegration = false,
            skipEndToEnd = false,
            skipPerformance = false,
            skipErrorScenario = false,
            verbose = true
        } = options;

        try {
            // Initialize test suites
            const initialized = await this.initializeTestSuites();
            if (!initialized) {
                throw new Error('Failed to initialize test suites');
            }

            // Run Unit Tests
            if (!skipUnit) {
                await this.runTestSuite('unit', 'Unit Tests', verbose);
            }

            // Run Integration Tests
            if (!skipIntegration) {
                await this.runTestSuite('integration', 'Integration Tests', verbose);
            }

            // Run End-to-End Tests
            if (!skipEndToEnd) {
                await this.runTestSuite('endToEnd', 'End-to-End Tests', verbose);
            }

            // Run Performance Tests
            if (!skipPerformance) {
                await this.runTestSuite('performance', 'Performance Tests', verbose);
            }

            // Run Error Scenario Tests
            if (!skipErrorScenario) {
                await this.runTestSuite('errorScenario', 'Error Scenario Tests', verbose);
            }

            // Generate comprehensive report
            this.generateComprehensiveReport();

            return this.calculateOverallSuccess();

        } catch (error) {
            console.error('❌ Test suite execution failed:', error);
            return false;
        }
    }

    /**
     * Run a specific test suite
     */
    async runTestSuite(suiteKey, suiteName, verbose = true) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 Running ${suiteName}...`);
        console.log(`${'='.repeat(60)}`);

        const startTime = Date.now();
        let success = false;

        try {
            const testSuite = this.testSuites[suiteKey];

            if (!testSuite) {
                throw new Error(`Test suite ${suiteKey} not found`);
            }

            // Run the appropriate test method based on suite type
            switch (suiteKey) {
                case 'unit':
                    success = await testSuite.runAllUnitTests();
                    break;
                case 'integration':
                    success = await testSuite.runAllIntegrationTests();
                    break;
                case 'endToEnd':
                    success = await testSuite.runAllEndToEndTests();
                    break;
                case 'performance':
                    success = await testSuite.runAllPerformanceTests();
                    // Capture performance metrics
                    if (testSuite.performanceMetrics) {
                        this.performanceMetrics[suiteKey] = testSuite.performanceMetrics;
                    }
                    break;
                case 'errorScenario':
                    success = await testSuite.runAllErrorScenarioTests();
                    break;
                default:
                    throw new Error(`Unknown test suite: ${suiteKey}`);
            }

            const duration = Date.now() - startTime;

            // Capture results
            if (testSuite.testResults) {
                this.overallResults[suiteKey] = {
                    passed: testSuite.testResults.passed,
                    failed: testSuite.testResults.failed,
                    total: testSuite.testResults.total,
                    duration: duration
                };
            }

            if (success) {
                console.log(`✅ ${suiteName} completed successfully in ${duration}ms`);
            } else {
                console.log(`❌ ${suiteName} completed with failures in ${duration}ms`);
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ ${suiteName} failed with error: ${error.message}`);

            this.overallResults[suiteKey] = {
                passed: 0,
                failed: 1,
                total: 1,
                duration: duration,
                error: error.message
            };
        }
    }

    /**
     * Run specific test categories
     */
    async runUnitTestsOnly() {
        return await this.runAllTests({
            skipIntegration: true,
            skipEndToEnd: true,
            skipPerformance: true,
            skipErrorScenario: true
        });
    }

    async runIntegrationTestsOnly() {
        return await this.runAllTests({
            skipUnit: true,
            skipEndToEnd: true,
            skipPerformance: true,
            skipErrorScenario: true
        });
    }

    async runPerformanceTestsOnly() {
        return await this.runAllTests({
            skipUnit: true,
            skipIntegration: true,
            skipEndToEnd: true,
            skipErrorScenario: true
        });
    }

    /**
     * Run smoke tests (quick validation)
     */
    async runSmokeTests() {
        console.log('🚀 Running Smoke Tests (Quick Validation)...');

        try {
            // Initialize core components
            const dataStorage = new DataStorageManager();
            await dataStorage.initializeStorage();

            const patientManager = new PatientManager();
            await patientManager.initialize(dataStorage);

            const authManager = new AuthenticationManager();

            // Test 1: Authentication
            console.log('Testing authentication...');
            const loginResult = await authManager.login('dr.sahboub', 'pneumo2024');
            this.assert(loginResult, 'Authentication should work');
            authManager.logout();

            // Test 2: Patient Creation
            console.log('Testing patient creation...');
            const patientData = {
                firstName: 'Smoke',
                lastName: 'Test',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'Test City',
                gender: 'male'
            };

            const createResult = await patientManager.createPatient(patientData);
            this.assert(createResult.success, 'Patient creation should work');

            // Test 3: Patient Retrieval
            console.log('Testing patient retrieval...');
            const retrievedPatient = await patientManager.getPatient(createResult.patientId);
            this.assert(retrievedPatient !== null, 'Patient retrieval should work');

            // Test 4: Patient Search
            console.log('Testing patient search...');
            const searchResults = await patientManager.searchPatients('Smoke');
            this.assert(searchResults.length > 0, 'Patient search should work');

            // Test 5: Patient Deletion
            console.log('Testing patient deletion...');
            const deleteResult = await patientManager.deletePatient(createResult.patientId);
            this.assert(deleteResult.success, 'Patient deletion should work');

            console.log('✅ All smoke tests passed!');
            return true;

        } catch (error) {
            console.error('❌ Smoke tests failed:', error.message);
            return false;
        }
    }

    /**
     * Generate comprehensive test report
     */
    generateComprehensiveReport() {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;

        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE TEST RESULTS REPORT');
        console.log('='.repeat(80));
        console.log(`Test execution completed at: ${new Date().toISOString()}`);
        console.log(`Total execution time: ${(totalDuration / 1000).toFixed(2)} seconds`);
        console.log('='.repeat(80));

        // Test Suite Results
        let totalPassed = 0;
        let totalFailed = 0;
        let totalTests = 0;

        Object.keys(this.overallResults).forEach(suiteKey => {
            const results = this.overallResults[suiteKey];
            const suiteName = this.formatSuiteName(suiteKey);

            if (results.total > 0) {
                const successRate = ((results.passed / results.total) * 100).toFixed(1);
                const duration = (results.duration / 1000).toFixed(2);

                console.log(`\n📋 ${suiteName}:`);
                console.log(`  ✅ Passed: ${results.passed}`);
                console.log(`  ❌ Failed: ${results.failed}`);
                console.log(`  📊 Total: ${results.total}`);
                console.log(`  📈 Success Rate: ${successRate}%`);
                console.log(`  ⏱️  Duration: ${duration}s`);

                if (results.error) {
                    console.log(`  🚨 Error: ${results.error}`);
                }

                totalPassed += results.passed;
                totalFailed += results.failed;
                totalTests += results.total;
            }
        });

        // Overall Summary
        const overallSuccessRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';

        console.log('\n' + '='.repeat(80));
        console.log('🎯 OVERALL SUMMARY:');
        console.log('='.repeat(80));
        console.log(`📊 Total Tests: ${totalTests}`);
        console.log(`✅ Total Passed: ${totalPassed}`);
        console.log(`❌ Total Failed: ${totalFailed}`);
        console.log(`📈 Overall Success Rate: ${overallSuccessRate}%`);
        console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

        // Performance Metrics Summary
        if (Object.keys(this.performanceMetrics).length > 0) {
            console.log('\n' + '='.repeat(80));
            console.log('⚡ PERFORMANCE METRICS SUMMARY:');
            console.log('='.repeat(80));

            Object.keys(this.performanceMetrics).forEach(suiteKey => {
                const metrics = this.performanceMetrics[suiteKey];
                console.log(`\n📈 ${this.formatSuiteName(suiteKey)} Performance:`);

                if (metrics.largeDatasetCreation) {
                    console.log(`  📊 Large Dataset: ${metrics.largeDatasetCreation.patientsPerSecond} patients/sec`);
                }

                if (metrics.searchPerformance) {
                    const avgSearchTime = metrics.searchPerformance.reduce((sum, search) => sum + search.timeMs, 0) / metrics.searchPerformance.length;
                    console.log(`  🔍 Average Search Time: ${avgSearchTime.toFixed(1)}ms`);
                }

                if (metrics.memoryUsage) {
                    console.log(`  💾 Memory Usage: ${metrics.memoryUsage.memoryIncreaseMB}MB increase`);
                }
            });
        }

        // Test Quality Assessment
        console.log('\n' + '='.repeat(80));
        console.log('🏆 TEST QUALITY ASSESSMENT:');
        console.log('='.repeat(80));

        if (overallSuccessRate >= 95) {
            console.log('🟢 EXCELLENT: Test suite passes with flying colors!');
        } else if (overallSuccessRate >= 85) {
            console.log('🟡 GOOD: Test suite passes with minor issues to address.');
        } else if (overallSuccessRate >= 70) {
            console.log('🟠 FAIR: Test suite has significant issues that need attention.');
        } else {
            console.log('🔴 POOR: Test suite has major failures that must be fixed.');
        }

        // Recommendations
        console.log('\n📝 RECOMMENDATIONS:');

        if (totalFailed === 0) {
            console.log('  ✨ All tests passed! The application is ready for production.');
        } else {
            console.log(`  🔧 Fix ${totalFailed} failing test(s) before deployment.`);

            Object.keys(this.overallResults).forEach(suiteKey => {
                const results = this.overallResults[suiteKey];
                if (results.failed > 0) {
                    console.log(`  - Address ${results.failed} issue(s) in ${this.formatSuiteName(suiteKey)}`);
                }
            });
        }

        console.log('='.repeat(80));
    }

    /**
     * Calculate overall success
     */
    calculateOverallSuccess() {
        let totalPassed = 0;
        let totalTests = 0;

        Object.values(this.overallResults).forEach(results => {
            totalPassed += results.passed;
            totalTests += results.total;
        });

        return totalTests > 0 && totalPassed === totalTests;
    }

    /**
     * Format suite name for display
     */
    formatSuiteName(suiteKey) {
        const names = {
            unit: 'Unit Tests',
            integration: 'Integration Tests',
            endToEnd: 'End-to-End Tests',
            performance: 'Performance Tests',
            errorScenario: 'Error Scenario Tests'
        };

        return names[suiteKey] || suiteKey;
    }

    /**
     * Generate test report in different formats
     */
    generateReport(format = 'console') {
        switch (format) {
            case 'json':
                return this.generateJSONReport();
            case 'html':
                return this.generateHTMLReport();
            case 'csv':
                return this.generateCSVReport();
            default:
                return this.generateConsoleReport();
        }
    }

    /**
     * Generate JSON report
     */
    generateJSONReport() {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            totalDuration: Date.now() - this.startTime,
            results: this.overallResults,
            performanceMetrics: this.performanceMetrics,
            summary: {
                totalTests: Object.values(this.overallResults).reduce((sum, r) => sum + r.total, 0),
                totalPassed: Object.values(this.overallResults).reduce((sum, r) => sum + r.passed, 0),
                totalFailed: Object.values(this.overallResults).reduce((sum, r) => sum + r.failed, 0),
                overallSuccess: this.calculateOverallSuccess()
            }
        }, null, 2);
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport() {
        const totalTests = Object.values(this.overallResults).reduce((sum, r) => sum + r.total, 0);
        const totalPassed = Object.values(this.overallResults).reduce((sum, r) => sum + r.passed, 0);
        const totalFailed = Object.values(this.overallResults).reduce((sum, r) => sum + r.failed, 0);
        const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient Management System - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .suite { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .metrics { background: #f8f8f8; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Patient Management System - Test Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        <p>Duration: ${((Date.now() - this.startTime) / 1000).toFixed(2)} seconds</p>
    </div>
    
    <div class="summary">
        <h2>Overall Summary</h2>
        <p>Total Tests: ${totalTests}</p>
        <p class="passed">Passed: ${totalPassed}</p>
        <p class="failed">Failed: ${totalFailed}</p>
        <p>Success Rate: ${successRate}%</p>
    </div>
    
    ${Object.keys(this.overallResults).map(suiteKey => {
            const results = this.overallResults[suiteKey];
            if (results.total === 0) return '';

            return `
        <div class="suite">
            <h3>${this.formatSuiteName(suiteKey)}</h3>
            <p>Passed: <span class="passed">${results.passed}</span></p>
            <p>Failed: <span class="failed">${results.failed}</span></p>
            <p>Duration: ${(results.duration / 1000).toFixed(2)}s</p>
            ${results.error ? `<p class="failed">Error: ${results.error}</p>` : ''}
        </div>
        `;
        }).join('')}
    
</body>
</html>
        `;
    }

    /**
     * Generate CSV report
     */
    generateCSVReport() {
        const rows = [
            ['Test Suite', 'Passed', 'Failed', 'Total', 'Success Rate', 'Duration (s)']
        ];

        Object.keys(this.overallResults).forEach(suiteKey => {
            const results = this.overallResults[suiteKey];
            if (results.total > 0) {
                const successRate = ((results.passed / results.total) * 100).toFixed(1);
                const duration = (results.duration / 1000).toFixed(2);

                rows.push([
                    this.formatSuiteName(suiteKey),
                    results.passed.toString(),
                    results.failed.toString(),
                    results.total.toString(),
                    successRate + '%',
                    duration
                ]);
            }
        });

        return rows.map(row => row.join(',')).join('\n');
    }

    /**
     * Assert helper function
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComprehensiveTestRunner;
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
    const testRunner = new ComprehensiveTestRunner();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};

    if (args.includes('--unit-only')) {
        testRunner.runUnitTestsOnly().then(success => process.exit(success ? 0 : 1));
    } else if (args.includes('--integration-only')) {
        testRunner.runIntegrationTestsOnly().then(success => process.exit(success ? 0 : 1));
    } else if (args.includes('--performance-only')) {
        testRunner.runPerformanceTestsOnly().then(success => process.exit(success ? 0 : 1));
    } else if (args.includes('--smoke')) {
        testRunner.runSmokeTests().then(success => process.exit(success ? 0 : 1));
    } else {
        // Run all tests
        if (args.includes('--skip-unit')) options.skipUnit = true;
        if (args.includes('--skip-integration')) options.skipIntegration = true;
        if (args.includes('--skip-e2e')) options.skipEndToEnd = true;
        if (args.includes('--skip-performance')) options.skipPerformance = true;
        if (args.includes('--skip-error')) options.skipErrorScenario = true;

        testRunner.runAllTests(options).then(success => {
            // Generate report in requested format
            if (args.includes('--json')) {
                console.log('\n' + testRunner.generateReport('json'));
            } else if (args.includes('--html')) {
                console.log('\n' + testRunner.generateReport('html'));
            } else if (args.includes('--csv')) {
                console.log('\n' + testRunner.generateReport('csv'));
            }

            process.exit(success ? 0 : 1);
        });
    }
}