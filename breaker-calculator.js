// breaker-calculator.js
document.addEventListener('DOMContentLoaded', function() {
    const calculateBreakerBtn = document.getElementById('calculate-breaker');
    const breakerResultsDiv = document.getElementById('breaker-results');
    
    // Standard circuit breaker sizes in Singapore (in amperes)
    const standardBreakerSizes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    
    // MCB types and their trip characteristics
    const mcbTypes = {
        'B': { instantaneousTrip: 3, description: 'For resistive loads with low inrush current (lighting, heating)' },
        'C': { instantaneousTrip: 5, description: 'For slightly inductive loads (small motors, computers)' },
        'D': { instantaneousTrip: 10, description: 'For highly inductive loads with high inrush current (transformers, motors)' }
    };
    
    calculateBreakerBtn.addEventListener('click', function() {
        // Get input values
        const application = document.getElementById('breaker-application').value;
        const loadType = document.getElementById('load-type').value;
        const isContinuous = document.getElementById('continuous-load').checked;
        let loadPower = parseFloat(document.getElementById('load-power').value);
        const powerUnit = document.getElementById('power-unit').value;
        const voltage = parseFloat(document.getElementById('breaker-voltage').value);
        const powerFactor = parseFloat(document.getElementById('power-factor').value);
        
        // Validate inputs
        if (!loadPower || !voltage || !powerFactor) {
            breakerResultsDiv.innerHTML = '<p class="result-warning">Please fill in all required fields.</p>';
            return;
        }
        
        // Convert kW to W if needed
        if (powerUnit === 'kW') {
            loadPower *= 1000;
        }
        
        // Calculate current
        let current;
        if (voltage <= 240) { // Single phase
            current = loadPower / (voltage * powerFactor);
        } else { // Three phase
            current = loadPower / (Math.sqrt(3) * voltage * powerFactor);
        }
        
        // Apply continuous load factor (125% for loads operating continuously for 3+ hours)
        const designCurrent = isContinuous ? current * 1.25 : current;
        
        // Determine MCB type based on load type
        let mcbType;
        switch (loadType) {
            case 'lighting':
                mcbType = 'B';
                break;
            case 'power':
            case 'heating':
                mcbType = 'C';
                break;
            case 'motor':
            case 'aircon':
                mcbType = 'D';
                break;
            default:
                mcbType = 'C';
        }
        
        // Find suitable breaker size
        let suitableSize = null;
        for (const size of standardBreakerSizes) {
            if (size >= designCurrent) {
                suitableSize = size;
                break;
            }
        }
        
        // Display results
        if (suitableSize) {
            const html = `
                <div class="result-item">
                    <span class="result-label">Calculated Load Current:</span>
                    <span class="result-value">${current.toFixed(2)} A</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Design Current (with factors):</span>
                    <span class="result-value">${designCurrent.toFixed(2)} A</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Recommended Breaker Size:</span>
                    <span class="result-value result-highlight">${suitableSize} A</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Recommended MCB Type:</span>
                    <span class="result-value">Type ${mcbType}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">MCB Characteristics:</span>
                    <span class="result-value">Trips at ${mcbTypes[mcbType].instantaneousTrip}x rated current</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Application Note:</span>
                    <span class="result-value">${mcbTypes[mcbType].description}</span>
                </div>
            `;
            
            breakerResultsDiv.innerHTML = html;
        } else {
            breakerResultsDiv.innerHTML = `
                <p class="result-warning">
                    The calculated current (${designCurrent.toFixed(2)} A) exceeds standard MCB ratings.
                    Consider using an MCCB or splitting the load across multiple circuits.
                </p>
            `;
        }
    });
});
