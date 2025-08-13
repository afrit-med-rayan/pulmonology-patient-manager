/**
 * Test script for intelligent logout system components
 * Run this in the browser console to test functionality
 */

console.log('=== Testing Intelligent Logout System Components ===');

// Test 1: Check if components are loaded
console.log('\n1. Testing component loading...');
try {
    const changeTracker = new ChangeTracker();
    console.log('✓ ChangeTracker loaded successfully');

    const modalManager = new ModalManager();
    console.log('✓ ModalManager loaded successfully');

    const formManager = new FormManager();
    console.log('✓ FormManager loaded successfully');
} catch (error) {
    console.error('✗ Error loading components:', error);
}

// Test 2: Test ChangeTracker functionality
console.log('\n2. Testing ChangeTracker...');
try {
    const tracker = new ChangeTracker();

    // Test basic functionality
    console.log('Initial state - has changes:', tracker.hasUnsavedChanges());

    // Test component tracking
    tracker.trackComponent('test-component', {
        displayName: 'Test Component',
        description: 'Test component for logout'
    });

    tracker.markComponentChanged('test-component', true);
    console.log('After marking component changed:', tracker.hasUnsavedChanges());

    const details = tracker.getUnsavedChangesDetails();
    console.log('Change details:', details);

    tracker.markComponentAsSaved('test-component');
    console.log('After marking saved:', tracker.hasUnsavedChanges());

    console.log('✓ ChangeTracker functionality working');
} catch (error) {
    console.error('✗ ChangeTracker error:', error);
}

// Test 3: Test ModalManager functionality
console.log('\n3. Testing ModalManager...');
try {
    const modal = new ModalManager();

    // Test basic modal creation
    console.log('Modal manager initialized');
    console.log('Has open modals:', modal.hasOpenModals());

    console.log('✓ ModalManager basic functionality working');
} catch (error) {
    console.error('✗ ModalManager error:', error);
}

// Test 4: Test logout confirmation modal (visual test)
console.log('\n4. Testing logout confirmation modal...');
async function testLogoutModal() {
    try {
        const modal = new ModalManager();

        console.log('Showing logout confirmation modal...');
        const result = await modal.showLogoutConfirmation({
            changesDetails: ['Test Form', 'Another Form']
        });

        console.log('User selected:', result);
        return result;
    } catch (error) {
        console.error('✗ Logout modal error:', error);
    }
}

// Test 5: Integration test
console.log('\n5. Testing integration...');
function testIntegration() {
    try {
        const tracker = new ChangeTracker();
        const modal = new ModalManager();

        // Simulate the logout process
        tracker.trackComponent('integration-test', {
            displayName: 'Integration Test',
            description: 'Testing integration'
        });

        tracker.markComponentChanged('integration-test', true);

        const hasChanges = tracker.hasUnsavedChanges();
        console.log('Integration test - has changes:', hasChanges);

        if (hasChanges) {
            const details = tracker.getUnsavedChangesDetails();
            console.log('Integration test - change details:', details);
            console.log('✓ Integration test passed');
        }

    } catch (error) {
        console.error('✗ Integration test error:', error);
    }
}

testIntegration();

console.log('\n=== Component Tests Complete ===');
console.log('To test the logout modal visually, run: testLogoutModal()');