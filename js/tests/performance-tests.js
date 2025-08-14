/**
 * Performance Tests for Patient Management System
 * Tests system performance with large datasets and stress scenarios
 */

class PerformanceTestSuite {
    constructor() {
        this.testResults = { passed: 0, failed: 0, total: 0 };
        this.performanceMetrics = {};
    }

    /**
     * Run all performance tests
     */
    async runAllPerformanceTests() {
        console.log('⚡ Running Performance Tests...');
        console.log('='.repeat(50));

        const tests = [
            () => this.testLargeDatasetHandling(),
            () => this.testSearchPerformance(),
            () => this.testMemoryUsage(),
            () => this.testFileOperationPerformance(),
            () => this.testConcurrentOperations(),
            () => this.testUIResponsiveness()
        ];

        for (const test of tests) {
            try {
                await test();
                this.testResults.passed++;
                console.log('✅ Performance test passed');
            } catch (error) {
                console.error(`❌ Performance test failed: ${error.message}`);
                this.testResults.failed++;
            }
            this.testResults.total++;
        }

        this.printResults();
        this.printPerformanceMetrics();
        return this.testResults.failed === 0;
    }

    /**
     * Test handling of large datasets
     */
    async testLargeDatasetHandling() {
        console.log('Testing Large Dataset Handling...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        const LARGE_DATASET_SIZE = 500; // Create 500 patients
        const startTime = Date.now();

        console.log(`Creating ${LARGE_DATASET_SIZE} patients...`);

        // Create large dataset
        const patientPromises = [];
        for (let i = 0; i < LARGE_DATASET_SIZE; i++) {
            const patientData = {
                firstName: `Patient${i.toString().padStart(3, '0')}`,
                lastName: `TestSuite${Math.floor(i / 100)}`,
                dateOfBirth: `19${50 + (i % 50)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
                placeOfResidence: `City${i % 20}`,
                gender: i % 2 === 0 ? 'male' : 'female',
                visits: this.generateRandomVisits(Math.floor(Math.random() * 5) + 1)
            };

            patientPromises.push(patientManager.createPatient(patientData));
        }

        const createResults = await Promise.all(patientPromises);
        const creationTime = Date.now() - startTime;

        // Verify all patients were created
        const successfulCreations = createResults.filter(result => result.success);
        this.assert(successfulCreations.length === LARGE_DATASET_SIZE,
            `Should create all ${LARGE_DATASET_SIZE} patients`);

        // Performance assertion: Should create 500 patients in under 30 seconds
        this.assert(creationTime < 30000,
            `Should create ${LARGE_DATASET_SIZE} patients in under 30 seconds (took ${creationTime}ms)`);

        this.performanceMetrics.largeDatasetCreation = {
            patientsCreated: LARGE_DATASET_SIZE,
            timeMs: creationTime,
            patientsPerSecond: Math.round((LARGE_DATASET_SIZE / creationTime) * 1000)
        };

        console.log(`✓ Created ${LARGE_DATASET_SIZE} patients in ${creationTime}ms (${this.performanceMetrics.largeDatasetCreation.patientsPerSecond} patients/sec)`);

        // Test retrieval performance with large dataset
        const retrievalStartTime = Date.now();
        const allPatients = await patientManager.getAllPatients();
        const retrievalTime = Date.now() - retrievalStartTime;

        this.assert(allPatients.length >= LARGE_DATASET_SIZE, 'Should retrieve all patients');
        this.assert(retrievalTime < 5000, `Should retrieve all patients in under 5 seconds (took ${retrievalTime}ms)`);

        this.performanceMetrics.largeDatasetRetrieval = {
            patientsRetrieved: allPatients.length,
            timeMs: retrievalTime
        };

        console.log(`✓ Retrieved ${allPatients.length} patients in ${retrievalTime}ms`);

        // Test statistics performance with large dataset
        const statsStartTime = Date.now();
        const stats = await patientManager.getPatientStatistics();
        const statsTime = Date.now() - statsStartTime;

        this.assert(stats.totalPatients >= LARGE_DATASET_SIZE, 'Statistics should include all patients');
        this.assert(statsTime < 2000, `Statistics should be calculated in under 2 seconds (took ${statsTime}ms)`);

        this.performanceMetrics.largeDatasetStats = {
            totalPatients: stats.totalPatients,
            timeMs: statsTime
        };

        console.log(`✓ Calculated statistics for ${stats.totalPatients} patients in ${statsTime}ms`);

        // Clean up (test deletion performance)
        const deletionStartTime = Date.now();
        const patientIds = createResults.map(result => result.patientId);

        const deletePromises = patientIds.map(id => patientManager.deletePatient(id));
        await Promise.all(deletePromises);

        const deletionTime = Date.now() - deletionStartTime;
        this.assert(deletionTime < 20000, `Should delete all patients in under 20 seconds (took ${deletionTime}ms)`);

        this.performanceMetrics.largeDatasetDeletion = {
            patientsDeleted: LARGE_DATASET_SIZE,
            timeMs: deletionTime,
            deletionsPerSecond: Math.round((LARGE_DATASET_SIZE / deletionTime) * 1000)
        };

        console.log(`✓ Deleted ${LARGE_DATASET_SIZE} patients in ${deletionTime}ms`);
    }

    /**
     * Test search performance with various scenarios
     */
    async testSearchPerformance() {
        console.log('Testing Search Performance...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Create test dataset for search
        const SEARCH_DATASET_SIZE = 200;
        const searchTestPatients = [];

        for (let i = 0; i < SEARCH_DATASET_SIZE; i++) {
            const patientData = {
                firstName: this.generateRandomName(),
                lastName: this.generateRandomLastName(),
                dateOfBirth: `19${60 + (i % 40)}-01-01`,
                placeOfResidence: this.generateRandomCity(),
                gender: i % 2 === 0 ? 'male' : 'female'
            };

            const result = await patientManager.createPatient(patientData);
            if (result.success) {
                searchTestPatients.push({ ...patientData, id: result.patientId });
            }
        }

        console.log(`Created ${searchTestPatients.length} patients for search testing`);

        // Test various search scenarios
        const searchScenarios = [
            { term: 'John', description: 'Common first name' },
            { term: 'Smith', description: 'Common last name' },
            { term: 'New York', description: 'City name' },
            { term: 'Jo', description: 'Partial name (2 chars)' },
            { term: 'xyz', description: 'No results expected' },
            { term: '', description: 'Empty search (all results)' }
        ];

        const searchMetrics = [];

        for (const scenario of searchScenarios) {
            const searchStartTime = Date.now();
            const results = await patientManager.searchPatients(scenario.term);
            const searchTime = Date.now() - searchStartTime;

            // Performance assertion: Each search should complete in under 1 second
            this.assert(searchTime < 1000,
                `Search for "${scenario.term}" should complete in under 1 second (took ${searchTime}ms)`);

            searchMetrics.push({
                term: scenario.term,
                description: scenario.description,
                resultsCount: results.length,
                timeMs: searchTime
            });

            console.log(`✓ Search "${scenario.term}" (${scenario.description}): ${results.length} results in ${searchTime}ms`);
        }

        this.performanceMetrics.searchPerformance = searchMetrics;

        // Test rapid consecutive searches (stress test)
        console.log('Testing rapid consecutive searches...');
        const rapidSearchStartTime = Date.now();
        const rapidSearchPromises = [];

        for (let i = 0; i < 50; i++) {
            const searchTerm = searchTestPatients[i % searchTestPatients.length].firstName;
            rapidSearchPromises.push(patientManager.searchPatients(searchTerm));
        }

        const rapidSearchResults = await Promise.all(rapidSearchPromises);
        const rapidSearchTime = Date.now() - rapidSearchStartTime;

        this.assert(rapidSearchTime < 10000,
            `50 rapid searches should complete in under 10 seconds (took ${rapidSearchTime}ms)`);

        this.performanceMetrics.rapidSearches = {
            searchCount: 50,
            totalTimeMs: rapidSearchTime,
            averageTimeMs: Math.round(rapidSearchTime / 50)
        };

        console.log(`✓ Completed 50 rapid searches in ${rapidSearchTime}ms (avg: ${this.performanceMetrics.rapidSearches.averageTimeMs}ms per search)`);

        // Clean up
        for (const patient of searchTestPatients) {
            await patientManager.deletePatient(patient.id);
        }
    }

    /**
     * Test memory usage patterns
     */
    async testMemoryUsage() {
        console.log('Testing Memory Usage...');

        // Check if performance.memory is available
        if (typeof performance === 'undefined' || !performance.memory) {
            console.log('⚠️ Performance.memory not available, skipping detailed memory tests');
            return;
        }

        const initialMemory = performance.memory.usedJSHeapSize;
        console.log(`Initial memory usage: ${Math.round(initialMemory / 1024 / 1024)}MB`);

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Create memory-intensive patient objects
        const MEMORY_TEST_SIZE = 100;
        const patients = [];
        const patientIds = [];

        for (let i = 0; i < MEMORY_TEST_SIZE; i++) {
            const patientData = {
                firstName: `MemoryTest${i}`,
                lastName: `Patient${i}`,
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'Memory Test City',
                gender: 'male',
                visits: this.generateLargeVisitHistory(20) // 20 visits per patient
            };

            const patient = new Patient(patientData);
            patients.push(patient);

            const result = await patientManager.createPatient(patientData);
            if (result.success) {
                patientIds.push(result.patientId);
            }
        }

        const afterCreationMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = afterCreationMemory - initialMemory;

        console.log(`Memory after creating ${MEMORY_TEST_SIZE} patients: ${Math.round(afterCreationMemory / 1024 / 1024)}MB`);
        console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);

        // Memory assertion: Should not use more than 100MB for 100 patients with extensive visit history
        this.assert(memoryIncrease < 100 * 1024 * 1024,
            `Memory usage should be reasonable (used ${Math.round(memoryIncrease / 1024 / 1024)}MB)`);

        // Test memory usage during operations
        const operationStartMemory = performance.memory.usedJSHeapSize;

        // Perform memory-intensive operations
        for (let i = 0; i < 10; i++) {
            await patientManager.getAllPatients();
            await patientManager.searchPatients('MemoryTest');
            await patientManager.getPatientStatistics();
        }

        const operationEndMemory = performance.memory.usedJSHeapSize;
        const operationMemoryIncrease = operationEndMemory - operationStartMemory;

        console.log(`Memory increase during operations: ${Math.round(operationMemoryIncrease / 1024 / 1024)}MB`);

        // Memory should not increase significantly during operations (indicating memory leaks)
        this.assert(operationMemoryIncrease < 50 * 1024 * 1024,
            'Operations should not cause significant memory increase (potential memory leak)');

        this.performanceMetrics.memoryUsage = {
            initialMemoryMB: Math.round(initialMemory / 1024 / 1024),
            afterCreationMemoryMB: Math.round(afterCreationMemory / 1024 / 1024),
            memoryIncreaseMB: Math.round(memoryIncrease / 1024 / 1024),
            operationMemoryIncreaseMB: Math.round(operationMemoryIncrease / 1024 / 1024),
            patientsCreated: MEMORY_TEST_SIZE
        };

        // Clean up and test memory cleanup
        patients.length = 0; // Clear patient array

        for (const patientId of patientIds) {
            await patientManager.deletePatient(patientId);
        }

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        const cleanupMemory = performance.memory.usedJSHeapSize;
        console.log(`Memory after cleanup: ${Math.round(cleanupMemory / 1024 / 1024)}MB`);

        this.performanceMetrics.memoryUsage.afterCleanupMemoryMB = Math.round(cleanupMemory / 1024 / 1024);
    }

    /**
     * Test file operation performance
     */
    async testFileOperationPerformance() {
        console.log('Testing File Operation Performance...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        // Test single large patient save/load
        const largePatientData = {
            id: 'perf-test-large',
            firstName: 'Performance',
            lastName: 'TestLarge',
            dateOfBirth: '1990-01-01',
            placeOfResidence: 'Performance Test City',
            gender: 'male',
            visits: this.generateLargeVisitHistory(100), // 100 visits
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Test save performance
        const saveStartTime = Date.now();
        const saveResult = await dataStorage.savePatient(largePatientData);
        const saveTime = Date.now() - saveStartTime;

        this.assert(saveResult.success, 'Large patient should be saved successfully');
        this.assert(saveTime < 2000, `Large patient save should complete in under 2 seconds (took ${saveTime}ms)`);

        console.log(`✓ Saved large patient (100 visits) in ${saveTime}ms`);

        // Test load performance
        const loadStartTime = Date.now();
        const loadedPatient = await dataStorage.loadPatient('perf-test-large');
        const loadTime = Date.now() - loadStartTime;

        this.assert(loadedPatient !== null, 'Large patient should be loaded successfully');
        this.assert(loadedPatient.visits.length === 100, 'All visits should be loaded');
        this.assert(loadTime < 1000, `Large patient load should complete in under 1 second (took ${loadTime}ms)`);

        console.log(`✓ Loaded large patient (100 visits) in ${loadTime}ms`);

        // Test batch operations
        const BATCH_SIZE = 50;
        const batchPatients = [];

        for (let i = 0; i < BATCH_SIZE; i++) {
            batchPatients.push({
                id: `batch-test-${i}`,
                firstName: `Batch${i}`,
                lastName: 'Test',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'Batch Test City',
                gender: i % 2 === 0 ? 'male' : 'female',
                visits: this.generateRandomVisits(5),
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }

        // Test batch save performance
        const batchSaveStartTime = Date.now();
        const batchSavePromises = batchPatients.map(patient => dataStorage.savePatient(patient));
        const batchSaveResults = await Promise.all(batchSavePromises);
        const batchSaveTime = Date.now() - batchSaveStartTime;

        const successfulSaves = batchSaveResults.filter(result => result.success);
        this.assert(successfulSaves.length === BATCH_SIZE, 'All batch patients should be saved');
        this.assert(batchSaveTime < 10000, `Batch save should complete in under 10 seconds (took ${batchSaveTime}ms)`);

        console.log(`✓ Batch saved ${BATCH_SIZE} patients in ${batchSaveTime}ms`);

        // Test batch load performance
        const batchLoadStartTime = Date.now();
        const batchLoadPromises = batchPatients.map(patient => dataStorage.loadPatient(patient.id));
        const batchLoadResults = await Promise.all(batchLoadPromises);
        const batchLoadTime = Date.now() - batchLoadStartTime;

        const successfulLoads = batchLoadResults.filter(patient => patient !== null);
        this.assert(successfulLoads.length === BATCH_SIZE, 'All batch patients should be loaded');
        this.assert(batchLoadTime < 5000, `Batch load should complete in under 5 seconds (took ${batchLoadTime}ms)`);

        console.log(`✓ Batch loaded ${BATCH_SIZE} patients in ${batchLoadTime}ms`);

        this.performanceMetrics.fileOperations = {
            largeSaveTimeMs: saveTime,
            largeLoadTimeMs: loadTime,
            batchSaveTimeMs: batchSaveTime,
            batchLoadTimeMs: batchLoadTime,
            batchSize: BATCH_SIZE
        };

        // Clean up
        await dataStorage.deletePatient('perf-test-large');
        for (const patient of batchPatients) {
            await dataStorage.deletePatient(patient.id);
        }
    }

    /**
     * Test concurrent operations
     */
    async testConcurrentOperations() {
        console.log('Testing Concurrent Operations...');

        const dataStorage = new DataStorageManager();
        await dataStorage.initializeStorage();

        const patientManager = new PatientManager();
        await patientManager.initialize(dataStorage);

        // Test concurrent patient creation
        const CONCURRENT_OPERATIONS = 20;
        const concurrentStartTime = Date.now();

        const concurrentPromises = [];

        // Mix of different operations running concurrently
        for (let i = 0; i < CONCURRENT_OPERATIONS; i++) {
            if (i % 4 === 0) {
                // Create patient
                concurrentPromises.push(
                    patientManager.createPatient({
                        firstName: `Concurrent${i}`,
                        lastName: 'Test',
                        dateOfBirth: '1990-01-01',
                        placeOfResidence: 'Concurrent City',
                        gender: 'male'
                    })
                );
            } else if (i % 4 === 1) {
                // Search patients
                concurrentPromises.push(patientManager.searchPatients('Concurrent'));
            } else if (i % 4 === 2) {
                // Get statistics
                concurrentPromises.push(patientManager.getPatientStatistics());
            } else {
                // Get all patients
                concurrentPromises.push(patientManager.getAllPatients());
            }
        }

        const concurrentResults = await Promise.all(concurrentPromises);
        const concurrentTime = Date.now() - concurrentStartTime;

        // Verify all operations completed successfully
        const successfulOperations = concurrentResults.filter(result => {
            return result && (result.success !== false);
        });

        this.assert(successfulOperations.length === CONCURRENT_OPERATIONS,
            'All concurrent operations should complete successfully');
        this.assert(concurrentTime < 15000,
            `Concurrent operations should complete in under 15 seconds (took ${concurrentTime}ms)`);

        console.log(`✓ Completed ${CONCURRENT_OPERATIONS} concurrent operations in ${concurrentTime}ms`);

        this.performanceMetrics.concurrentOperations = {
            operationCount: CONCURRENT_OPERATIONS,
            totalTimeMs: concurrentTime,
            averageTimeMs: Math.round(concurrentTime / CONCURRENT_OPERATIONS)
        };

        // Clean up created patients
        const createdPatients = concurrentResults.filter(result => result && result.patientId);
        for (const result of createdPatients) {
            await patientManager.deletePatient(result.patientId);
        }
    }

    /**
     * Test UI responsiveness simulation
     */
    async testUIResponsiveness() {
        console.log('Testing UI Responsiveness...');

        const formManager = new FormManager();
        const changeTracker = new ChangeTracker();
        const router = new UIRouter();

        // Test form operations performance
        const FORM_OPERATIONS = 100;
        const formStartTime = Date.now();

        for (let i = 0; i < FORM_OPERATIONS; i++) {
            const formData = {
                firstName: `UITest${i}`,
                lastName: 'Responsive',
                dateOfBirth: '1990-01-01',
                placeOfResidence: 'UI Test City',
                gender: 'male'
            };

            // Simulate form validation
            formManager.validateForm(formData, 'patient');

            // Simulate change tracking
            changeTracker.trackChange('test-form', 'firstName', '', formData.firstName);
            changeTracker.trackChange('test-form', 'lastName', '', formData.lastName);

            // Clear changes
            changeTracker.clearChanges('test-form');
        }

        const formTime = Date.now() - formStartTime;

        this.assert(formTime < 5000,
            `${FORM_OPERATIONS} form operations should complete in under 5 seconds (took ${formTime}ms)`);

        console.log(`✓ Completed ${FORM_OPERATIONS} form operations in ${formTime}ms`);

        // Test navigation performance
        const NAVIGATION_OPERATIONS = 50;
        const navStartTime = Date.now();

        const routes = ['/patients', '/create', '/patient/123', '/edit/123'];

        for (let i = 0; i < NAVIGATION_OPERATIONS; i++) {
            const route = routes[i % routes.length];
            router.navigateTo(route);
            router.getCurrentRoute();
        }

        const navTime = Date.now() - navStartTime;

        this.assert(navTime < 2000,
            `${NAVIGATION_OPERATIONS} navigation operations should complete in under 2 seconds (took ${navTime}ms)`);

        console.log(`✓ Completed ${NAVIGATION_OPERATIONS} navigation operations in ${navTime}ms`);

        this.performanceMetrics.uiResponsiveness = {
            formOperations: FORM_OPERATIONS,
            formTimeMs: formTime,
            navigationOperations: NAVIGATION_OPERATIONS,
            navigationTimeMs: navTime
        };
    }

    /**
     * Generate random visits for testing
     */
    generateRandomVisits(count) {
        const visits = [];
        const medications = ['Albuterol', 'Prednisone', 'Fluticasone', 'Tiotropium', 'Montelukast'];
        const observations = [
            'Patient showing improvement',
            'Stable condition',
            'Mild symptoms persist',
            'Significant improvement noted',
            'Condition well controlled'
        ];

        for (let i = 0; i < count; i++) {
            visits.push({
                id: generateId(),
                visitDate: `2024-01-${String(1 + (i % 28)).padStart(2, '0')}`,
                medications: medications[i % medications.length],
                observations: observations[i % observations.length],
                additionalComments: `Visit ${i + 1} comments`,
                createdAt: Date.now() - (i * 24 * 60 * 60 * 1000) // Spread visits over time
            });
        }

        return visits;
    }

    /**
     * Generate large visit history for memory testing
     */
    generateLargeVisitHistory(count) {
        const visits = [];

        for (let i = 0; i < count; i++) {
            visits.push({
                id: generateId(),
                visitDate: `2024-01-${String(1 + (i % 28)).padStart(2, '0')}`,
                medications: `Detailed medication list for visit ${i + 1}: ` + 'A'.repeat(100),
                observations: `Comprehensive observations for visit ${i + 1}: ` + 'B'.repeat(200),
                additionalComments: `Extensive additional comments for visit ${i + 1}: ` + 'C'.repeat(150),
                createdAt: Date.now() - (i * 24 * 60 * 60 * 1000)
            });
        }

        return visits;
    }

    /**
     * Generate random names for testing
     */
    generateRandomName() {
        const names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Ashley'];
        return names[Math.floor(Math.random() * names.length)];
    }

    /**
     * Generate random last names for testing
     */
    generateRandomLastName() {
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        return lastNames[Math.floor(Math.random() * lastNames.length)];
    }

    /**
     * Generate random cities for testing
     */
    generateRandomCity() {
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
        return cities[Math.floor(Math.random() * cities.length)];
    }

    /**
     * Assert helper function
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Performance Test Results:');
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
    }

    /**
     * Print detailed performance metrics
     */
    printPerformanceMetrics() {
        console.log('\n' + '='.repeat(50));
        console.log('📈 Performance Metrics:');
        console.log('='.repeat(50));

        if (this.performanceMetrics.largeDatasetCreation) {
            const metrics = this.performanceMetrics.largeDatasetCreation;
            console.log(`\n📊 Large Dataset Creation:`);
            console.log(`  Patients Created: ${metrics.patientsCreated}`);
            console.log(`  Total Time: ${metrics.timeMs}ms`);
            console.log(`  Rate: ${metrics.patientsPerSecond} patients/second`);
        }

        if (this.performanceMetrics.searchPerformance) {
            console.log(`\n🔍 Search Performance:`);
            this.performanceMetrics.searchPerformance.forEach(search => {
                console.log(`  "${search.term}" (${search.description}): ${search.resultsCount} results in ${search.timeMs}ms`);
            });
        }

        if (this.performanceMetrics.rapidSearches) {
            const metrics = this.performanceMetrics.rapidSearches;
            console.log(`\n⚡ Rapid Searches:`);
            console.log(`  Search Count: ${metrics.searchCount}`);
            console.log(`  Total Time: ${metrics.totalTimeMs}ms`);
            console.log(`  Average Time: ${metrics.averageTimeMs}ms per search`);
        }

        if (this.performanceMetrics.memoryUsage) {
            const metrics = this.performanceMetrics.memoryUsage;
            console.log(`\n💾 Memory Usage:`);
            console.log(`  Initial Memory: ${metrics.initialMemoryMB}MB`);
            console.log(`  After Creation: ${metrics.afterCreationMemoryMB}MB`);
            console.log(`  Memory Increase: ${metrics.memoryIncreaseMB}MB`);
            console.log(`  Operation Increase: ${metrics.operationMemoryIncreaseMB}MB`);
            if (metrics.afterCleanupMemoryMB) {
                console.log(`  After Cleanup: ${metrics.afterCleanupMemoryMB}MB`);
            }
        }

        if (this.performanceMetrics.fileOperations) {
            const metrics = this.performanceMetrics.fileOperations;
            console.log(`\n💾 File Operations:`);
            console.log(`  Large Save: ${metrics.largeSaveTimeMs}ms`);
            console.log(`  Large Load: ${metrics.largeLoadTimeMs}ms`);
            console.log(`  Batch Save (${metrics.batchSize}): ${metrics.batchSaveTimeMs}ms`);
            console.log(`  Batch Load (${metrics.batchSize}): ${metrics.batchLoadTimeMs}ms`);
        }

        if (this.performanceMetrics.concurrentOperations) {
            const metrics = this.performanceMetrics.concurrentOperations;
            console.log(`\n🔄 Concurrent Operations:`);
            console.log(`  Operation Count: ${metrics.operationCount}`);
            console.log(`  Total Time: ${metrics.totalTimeMs}ms`);
            console.log(`  Average Time: ${metrics.averageTimeMs}ms per operation`);
        }

        if (this.performanceMetrics.uiResponsiveness) {
            const metrics = this.performanceMetrics.uiResponsiveness;
            console.log(`\n🖥️ UI Responsiveness:`);
            console.log(`  Form Operations (${metrics.formOperations}): ${metrics.formTimeMs}ms`);
            console.log(`  Navigation Operations (${metrics.navigationOperations}): ${metrics.navigationTimeMs}ms`);
        }

        console.log('='.repeat(50));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceTestSuite;
}