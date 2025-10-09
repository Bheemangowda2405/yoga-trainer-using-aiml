# PoseDurationTracker Unit Tests

## Overview

This directory contains unit tests for the `PoseDurationTracker` class, which is responsible for tracking pose hold duration and confidence readings in the yoga pose detection system.

## Running the Tests

### Browser-Based Tests

1. Start your Flask application:
   ```bash
   python app.py
   ```

2. Open the test runner in your browser:
   ```
   http://localhost:5000/static/js/tests/test-runner.html
   ```

3. Click the "Run All Tests" button to execute all tests

4. Review the results:
   - ✅ Green tests passed
   - ❌ Red tests failed (with error details)

## Test Coverage

The test suite covers all requirements (2.1, 2.2, 2.3, 2.4, 2.5):

### Constructor Tests
- Verifies proper initialization of all properties

### start() Method Tests
- Tests timestamp setting (current and custom)
- Verifies confidence reset on start

### update() Method Tests
- Tests confidence accumulation
- Verifies behavior when tracking not started
- Tests multiple confidence updates

### getDuration() Method Tests
- Tests duration calculation at various time intervals
- Verifies floor behavior (not rounding)
- Tests edge cases (0 seconds, 2 seconds, etc.)

### getAverageConfidence() Method Tests
- Tests average calculation with no readings
- Tests single and multiple readings
- Verifies accuracy of average calculation

### meetsMinimumDuration() Method Tests
- Tests 2-second threshold validation
- Tests edge cases (< 2s, = 2s, > 2s)

### reset() Method Tests
- Verifies all properties are reset
- Tests ability to restart after reset

### getSummary() Method Tests
- Tests summary generation in various states
- Verifies all summary fields are correct

### Integration Tests
- Complete pose hold cycle (3 seconds)
- Rapid transition scenario (< 2 seconds)
- Long pose hold scenario (30 seconds)

## Expected Results

All tests should pass (✅). If any tests fail, check:

1. The `PoseDurationTracker` class implementation in `js-webcam.js`
2. Browser console for any JavaScript errors
3. Test timing issues (some tests depend on `Date.now()`)

## Test Statistics

- **Total Tests**: 30+
- **Test Suites**: 9
- **Coverage**: All public methods and integration scenarios

## Requirements Validation

- ✅ **Requirement 2.1**: Start time tracking validated
- ✅ **Requirement 2.2**: Duration updates validated
- ✅ **Requirement 2.3**: Final duration saving validated
- ✅ **Requirement 2.4**: Minimum 2-second threshold validated
- ✅ **Requirement 2.5**: Valid pose logging (>= 2s) validated
