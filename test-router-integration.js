/**
 * Test script to verify UIRouter integration
 * Run this in the browser console on the main application
 */

// Test UIRouter integration
function testRouterIntegration() {
    console.log('=== UIRouter Integration Test ===');

    // Check if app exists
    if (!window.app) {
        console.error('❌ App instance not found');
        return false;
    }

    // Check if UIRouter component exists
    if (!window.app.components.uiRouter) {
        console.error('❌ UIRouter component not found');
        return false;
    }

    const router = window.app.components.uiRouter;
    console.log('✅ UIRouter component found');

    // Test basic router methods
    try {
        // Test getCurrentRoute
        const currentRoute = router.getCurrentRoute();
        console.log('✅ getCurrentRoute works:', currentRoute);

        // Test route registration check
        const hasRoutes = router.routes && router.routes.size > 0;
        console.log('✅ Routes registered:', hasRoutes, 'Count:', router.routes.size);

        // List registered routes
        if (router.routes) {
            console.log('📋 Registered routes:');
            for (const [route, config] of router.routes) {
                console.log(`  - ${route}: ${config.title}`);
            }
        }

        // Test navigation history
        console.log('📚 Navigation history length:', router.navigationHistory?.length || 0);

        return true;

    } catch (error) {
        console.error('❌ Router method test failed:', error);
        return false;
    }
}

// Test navigation functionality
async function testNavigation() {
    console.log('=== Navigation Test ===');

    if (!window.app?.components?.uiRouter) {
        console.error('❌ UIRouter not available');
        return;
    }

    const router = window.app.components.uiRouter;

    try {
        // Test navigation to different routes
        const testRoutes = ['dashboard', 'create-patient', 'search-patients', 'patient-list'];

        for (const route of testRoutes) {
            console.log(`🧪 Testing navigation to: ${route}`);
            const success = await router.navigateTo(route);
            console.log(`${success ? '✅' : '❌'} Navigation to ${route}: ${success ? 'success' : 'failed'}`);

            // Wait a bit between navigations
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Test navigation with parameters
        console.log('🧪 Testing navigation with parameters');
        const paramSuccess = await router.navigateTo('patient-detail', { patientId: 'test-123' });
        console.log(`${paramSuccess ? '✅' : '❌'} Navigation with params: ${paramSuccess ? 'success' : 'failed'}`);

    } catch (error) {
        console.error('❌ Navigation test failed:', error);
    }
}

// Test unsaved changes detection
function testUnsavedChanges() {
    console.log('=== Unsaved Changes Test ===');

    if (!window.app?.components?.uiRouter) {
        console.error('❌ UIRouter not available');
        return;
    }

    const router = window.app.components.uiRouter;

    try {
        // Test checkUnsavedChanges method
        router.checkUnsavedChanges().then(hasChanges => {
            console.log('✅ checkUnsavedChanges works:', hasChanges);
        }).catch(error => {
            console.error('❌ checkUnsavedChanges failed:', error);
        });

        // Test getUnsavedChangesDetails method
        const details = router.getUnsavedChangesDetails();
        console.log('✅ getUnsavedChangesDetails works:', details);

    } catch (error) {
        console.error('❌ Unsaved changes test failed:', error);
    }
}

// Test modal integration
async function testModalIntegration() {
    console.log('=== Modal Integration Test ===');

    if (!window.app?.components?.modalManager) {
        console.error('❌ ModalManager not available');
        return;
    }

    const modalManager = window.app.components.modalManager;

    try {
        // Test navigation confirmation modal
        console.log('🧪 Testing navigation confirmation modal');

        // This will show the modal - user needs to interact with it
        const choice = await modalManager.showNavigationConfirmation({
            changesDetails: {
                descriptions: ['Test form data', 'Sample patient information']
            }
        });

        console.log('✅ Navigation confirmation modal works. User choice:', choice);

    } catch (error) {
        console.error('❌ Modal integration test failed:', error);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting UIRouter Integration Tests...');

    const integrationTest = testRouterIntegration();
    if (!integrationTest) {
        console.log('❌ Integration test failed, stopping other tests');
        return;
    }

    testUnsavedChanges();

    // Wait a bit before navigation tests
    setTimeout(async () => {
        await testNavigation();

        // Modal test requires user interaction, so we'll skip it in automated tests
        console.log('ℹ️ Modal test skipped (requires user interaction)');
        console.log('✅ All automated tests completed');
    }, 1000);
}

// Export functions for manual testing
window.testRouterIntegration = testRouterIntegration;
window.testNavigation = testNavigation;
window.testUnsavedChanges = testUnsavedChanges;
window.testModalIntegration = testModalIntegration;
window.runAllTests = runAllTests;

console.log('🔧 UIRouter test functions loaded. Run runAllTests() to start testing.');