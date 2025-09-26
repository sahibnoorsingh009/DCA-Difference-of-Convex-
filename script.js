class DCOptimizationVisualization {
    constructor() {
        this.step = 0;
        this.isAnimating = false;
        this.chart = null;
        
        // DC Algorithm steps for f(x) = x² - |x|
        this.dcaSteps = [
            { point: 1.0, description: "Start at x₀ = 1.0" },
            { point: 0.5, description: "Minimum of convex approx → x₁ = 0.5" },
            { point: 0.25, description: "New minimum → x₂ = 0.25" },
            { point: 0.125, description: "Converging → x₃ = 0.125" },
            { point: 0.0625, description: "Near optimal → x₄ ≈ 0.06" },
            { point: 0, description: "Converged to x* = 0 (global minimum!)" }
        ];
        
        this.initializeChart();
        this.setupEventListeners();
        this.updateStep();
    }
    
    // Define functions
    f(x) { return x * x - Math.abs(x); }  // Original function
    g(x) { return x * x; }                // Convex component
    h(x) { return Math.abs(x); }          // Convex component
    
    // Subgradient of |x|
    hSubgradient(x0) {
        if (x0 > 0) return 1;
        if (x0 < 0) return -1;
        return 0;
    }
    
    // Linear approximation of h(x) at x0
    hLinear(x, x0) {
        const subgrad = this.hSubgradient(x0);
        return Math.abs(x0) + subgrad * (x - x0);
    }
    
    // Convex approximation: g(x) - h_linear(x, x0)
    fApprox(x, x0) {
        return this.g(x) - this.hLinear(x, x0);
    }
    
    generateData() {
        const data = [];
        const currentX = this.dcaSteps[this.step].point;
        
        for (let x = -2; x <= 2; x += 0.05) {
            data.push({
                x: x,
                original: this.f(x),
                h_function: this.h(x),
                linear_approx: this.hLinear(x, currentX),
                convex_approx: this.fApprox(x, currentX)
            });
        }
        return data;
    }
    
    initializeChart() {
        const ctx = document.getElementById('dcChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'f(x) = x² - |x| [NON-CONVEX]',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'transparent',
                        borderWidth: 4,
                        pointRadius: 0,
                        tension: 0
                    },
                    {
                        label: 'h(x) = |x| [CONVEX]',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [8, 4],
                        pointRadius: 0,
                        tension: 0
                    },
                    {
                        label: 'Linear Approximation',
                        data: [],
                        borderColor: '#9b59b6',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderDash: [10, 5],
                        pointRadius: 0,
                        tension: 0
                    },
                    {
                        label: 'Convex Approximation',
                        data: [],
                        borderColor: '#27ae60',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        pointRadius: 0,
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'DCA Visualization: f(x) = x² - |x|',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        min: -2,
                        max: 2,
                        title: {
                            display: true,
                            text: 'x'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        title: {
                            display: true,
                            text: 'f(x)'
                        }
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });
    }
    
    updateChart() {
        const data = this.generateData();
        
        this.chart.data.datasets[0].data = data.map(d => ({x: d.x, y: d.original}));
        this.chart.data.datasets[1].data = data.map(d => ({x: d.x, y: d.h_function}));
        this.chart.data.datasets[2].data = data.map(d => ({x: d.x, y: d.linear_approx}));
        this.chart.data.datasets[3].data = data.map(d => ({x: d.x, y: d.convex_approx}));
        
        this.chart.update('none');
    }
    
    updateStep() {
        const currentStep = this.dcaSteps[this.step];
        const currentX = currentStep.point;
        
        // Update step info
        document.getElementById('stepTitle').textContent = `Step ${this.step + 1}`;
        document.getElementById('stepDescription').textContent = currentStep.description;
        
        // Update current values
        document.getElementById('currentPoint').textContent = `x = ${currentX.toFixed(4)}`;
        document.getElementById('currentValue').textContent = `f(x) = ${this.f(currentX).toFixed(4)}`;
        document.getElementById('subgradient').textContent = `∂h(x) = ${this.hSubgradient(currentX)}`;
        
        // Update chart
        this.updateChart();
        
        // Update button states
        document.getElementById('prevBtn').disabled = this.step === 0 || this.isAnimating;
        document.getElementById('nextBtn').disabled = this.step === this.dcaSteps.length - 1 || this.isAnimating;
        document.getElementById('animateBtn').disabled = this.isAnimating;
    }
    
    setupEventListeners() {
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.step > 0) {
                this.step--;
                this.updateStep();
            }
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.step < this.dcaSteps.length - 1) {
                this.step++;
                this.updateStep();
            }
        });
        
        document.getElementById('animateBtn').addEventListener('click', () => {
            this.startAnimation();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.step = 0;
        this.updateStep();
        
        const animationInterval = setInterval(() => {
            if (this.step < this.dcaSteps.length - 1) {
                this.step++;
                this.updateStep();
            } else {
                this.isAnimating = false;
                this.updateStep();
                clearInterval(animationInterval);
            }
        }, 2000);
    }
    
    reset() {
        this.isAnimating = false;
        this.step = 0;
        this.updateStep();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DCOptimizationVisualization();
});
