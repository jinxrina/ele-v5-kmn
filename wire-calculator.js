// wire-calculator.js
document.addEventListener('DOMContentLoaded', function() {
    const calculateWireBtn = document.getElementById('calculate-wire');
    const wireResultsDiv = document.getElementById('wire-results');
    
    // Singapore CP5 wire sizing data (simplified for demonstration)
    const wireSizingData = {
        pvc: {
            copper: {
                conduit: {
                    '1.5': { maxCurrent: 17.5, voltageDropPerAmpMeter: 0.0290 },
                    '2.5': { maxCurrent: 24, voltageDropPerAmpMeter: 0.0175 },
                    '4': { maxCurrent: 32, voltageDropPerAmpMeter: 0.0110 },
                    '6': { maxCurrent: 41, voltageDropPerAmpMeter: 0.0073 },
                    '10': { maxCurrent: 57, voltageDropPerAmpMeter: 0.0044 },
                    '16': { maxCurrent: 76, voltageDropPerAmpMeter: 0.0028 },
                    '25': { maxCurrent: 101, voltageDropPerAmpMeter: 0.0018 },
                    '35': { maxCurrent: 125, voltageDropPerAmpMeter: 0.0013 },
                    '50': { maxCurrent: 151, voltageDropPerAmpMeter: 0.0009 },
                    '70': { maxCurrent: 192, voltageDropPerAmpMeter: 0.0006 },
                    '95': { maxCurrent: 232, voltageDropPerAmpMeter: 0.0005 },
                    '120': { maxCurrent: 269, voltageDropPerAmpMeter: 0.0004 }
                },
                trunking: {
                    '1.5': { maxCurrent: 18.5, voltageDropPerAmpMeter: 0.0290 },
                    '2.5': { maxCurrent: 25, voltageDropPerAmpMeter: 0.0175 },
                    '4': { maxCurrent: 34, voltageDropPerAmpMeter: 0.0110 },
                    '6': { maxCurrent: 43, voltageDropPerAmpMeter: 0.0073 },
                    '10': { maxCurrent: 60, voltageDropPerAmpMeter: 0.0044 },
                    '16': { maxCurrent: 80, voltageDropPerAmpMeter: 0.0028 },
                    '25': { maxCurrent: 106, voltageDropPerAmpMeter: 0.0018 },
                    '35': { maxCurrent: 131, voltageDropPerAmpMeter: 0.0013 },
                    '50': { maxCurrent: 158, voltageDropPerAmpMeter: 0.0009 },
                    '70': { maxCurrent: 202, voltageDropPerAmpMeter: 0.0006 },
                    '95': { maxCurrent: 245, voltageDropPerAmpMeter: 0.0005 },
                    '120': { maxCurrent: 282, voltageDropPerAmpMeter: 0.0004 }
                },
                'direct-burial': {
                    '1.5': { maxCurrent: 22, voltageDropPerAmpMeter: 0.0290 },
                    '2.5': { maxCurrent: 29, voltageDropPerAmpMeter: 0.0175 },
                    '4': { maxCurrent: 38, voltageDropPerAmpMeter: 0.0110 },
                    '6': { maxCurrent: 47, voltageDropPerAmpMeter: 0.0073 },
                    '10': { maxCurrent: 64, voltageDropPerAmpMeter: 0.0044 },
                    '16': { maxCurrent: 85, voltageDropPerAmpMeter: 0.0028 },
                    '25': { maxCurrent: 112, voltageDropPerAmpMeter: 0.0018 },
                    '35': { maxCurrent: 138, voltageDropPerAmpMeter: 0.0013 },
                    '50': { maxCurrent: 168, voltageDropPerAmpMeter: 0.0009 },
                    '70': { maxCurrent: 213, voltageDropPerAmpMeter: 0.0006 },
                    '95': { maxCurrent: 258, voltageDropPerAmpMeter: 0.0005 },
                    '120': { maxCurrent: 299, voltageDropPerAmpMeter: 0.0004 }
                },
                'free-air': {
                    '1.5': { maxCurrent: 20, voltageDropPerAmpMeter: 0.0290 },
                    '2.5': { maxCurrent: 27, voltageDropPerAmpMeter: 0.0175 },
                    '4': { maxCurrent: 37, voltageDropPerAmpMeter: 0.0110 },
                    '6': { maxCurrent: 47, voltageDropPerAmpMeter: 0.0073 },
                    '10': { maxCurrent: 65, voltageDropPerAmpMeter: 0.0044 },
                    '16': { maxCurrent: 87, voltageDropPerAmpMeter: 0.0028 },
                    '25': { maxCurrent: 114, voltageDropPerAmpMeter: 0.0018 },
                    '35': { maxCurrent: 141, voltageDropPerAmpMeter: 0.0013 },
                    '50': { maxCurrent: 182, voltageDropPerAmpMeter: 0.0009 },
                    '70': { maxCurrent: 234, voltageDropPerAmpMeter: 0.0006 },
                    '95': { maxCurrent: 284, voltageDropPerAmpMeter: 0.0005 },
                    '120': { maxCurrent: 330, voltageDropPerAmpMeter: 0.0004 }
                }
            }
        }
    };
    
    // Temperature correction factors
    const tempCorrectionFactors = {
        30: 1.0,
        35: 0.94,
        40: 0.87,
        45: 0.79,
        50: 0.71,
        55: 0.61,
        60: 0.50
    };
    
    calculateWireBtn.addEventListener('click', function() {
        // Get input values
        const applicationType = document.getElementById('application-type').value;
        const loadCurrent = parseFloat(document.getElementById('load-current').value);
        const voltage = parseFloat(document.getElementById('voltage').value);
        const cableLength = parseFloat(document.getElementById('cable-length').value);
        const installationMethod = document.getElementById('installation-method').value;
        const ambientTemp = parseInt(document.getElementById('ambient-temp').value);
        
        // Validate inputs
        if (!loadCurrent || !voltage || !cableLength) {
            wireResultsDiv.innerHTML = '<p class="result-warning">Please fill in all required fields.</p>';
            return;
        }
        
        // Apply temperature correction factor
        const nearestTemp = Object.keys(tempCorrectionFactors)
            .map(Number)
            .reduce((prev, curr) => 
                Math.abs(curr - ambientTemp) < Math.abs(prev - ambientTemp) ? curr : prev
            );
        const tempFactor = tempCorrectionFactors[nearestTemp];
        
        // Calculate design current with safety factor
        const designCurrent = loadCurrent * 1.25 / tempFactor;
        
        // Find suitable cable size
        let suitableSizes = [];
        let selectedSize = null;
        
        for (const [size, data] of Object.entries(wireSizingData.pvc.copper[installationMethod])) {
            if (data.maxCurrent >= designCurrent) {
                suitableSizes.push({
                    size: parseFloat(size),
                    maxCurrent: data.maxCurrent,
                    voltageDropPerAmpMeter: data.voltageDropPerAmpMeter
                });
            }
        }
        
        // Sort by size (smallest first)
        suitableSizes.sort((a, b) => a.size - b.size);
        
        if (suitableSizes.length > 0) {
            // Check voltage drop for each suitable size
            for (const cable of suitableSizes) {
                const voltageDrop = loadCurrent * cableLength * cable.voltageDropPerAmpMeter;
                const voltageDropPercent = (voltageDrop / voltage) * 100;
                
                // In Singapore, typically 2.5% voltage drop is acceptable for final circuits
                // and 1.5% for submains
                const maxAllowedDrop = applicationType === 'industrial' ? 5 : 
                                      (applicationType === 'commercial' || applicationType === 'office') ? 3 : 2.5;
                
                if (voltageDropPercent <= maxAllowedDrop) {
                    selectedSize = {
                        size: cable.size,
                        maxCurrent: cable.maxCurrent,
                        voltageDrop: voltageDrop.toFixed(2),
                        voltageDropPercent: voltageDropPercent.toFixed(2)
                    };
                    break;
                }
            }
            
            // If no size meets voltage drop requirements, select the largest one
            // and show warning
            if (!selectedSize && suitableSizes.length > 0) {
                const largestCable = suitableSizes[suitableSizes.length - 1];
                const voltageDrop = loadCurrent * cableLength * largestCable.voltageDropPerAmpMeter;
                const voltageDropPercent = (voltageDrop / voltage) * 100;
                
                selectedSize = {
                    size: largestCable.size,
                    maxCurrent: largestCable.maxCurrent,
                    voltageDrop: voltageDrop.toFixed(2),
                    voltageDropPercent: voltageDropPercent.toFixed(2),
                    warning: true
                };
            }
        }
        
        // Display results
        if (selectedSize) {
            let html = `
                <div class="result-item">
                    <span class="result-label">Design Current:</span>
                    <span class="result-value">${designCurrent.toFixed(2)} A</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Recommended Cable Size:</span>
                    <span class="result-value result-highlight">${selectedSize.size} mm²</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Maximum Current Capacity:</span>
                    <span class="result-value">${selectedSize.maxCurrent} A</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Voltage Drop:</span>
                    <span class="result-value">${selectedSize.voltageDrop} V (${selectedSize.voltageDropPercent}%)</span>
                </div>
            `;
            
            if (selectedSize.warning) {
                html += `
                    <div class="result-warning">
                        Warning: Even the largest standard cable size exceeds recommended voltage drop limits.
                        Consider using parallel cables or a higher voltage system.
                    </div>
                `;
            }
            
            wireResultsDiv.innerHTML = html;
        } else {
            wireResultsDiv.innerHTML = '<p class="result-warning">No suitable cable size found for the given parameters.</p>';
        }
    });
});
