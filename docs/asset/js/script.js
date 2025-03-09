// Enhanced Analytics, A/B Testing, and Video Animation for Edge Case Studies

// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Analytics helper functions
const EdgeAnalytics = {
    // Track page views with custom dimensions
    trackPageView: function(pageName, pageCategory) {
        dataLayer.push({
            'event': 'page_view',
            'page_name': pageName || document.title,
            'page_category': pageCategory || 'case_study',
            'page_path': window.location.pathname
        });
    },
    
    // Track case study engagement
    trackCaseStudyView: function(caseStudyName, caseStudyIndustry) {
        dataLayer.push({
            'event': 'case_study_view',
            'case_study_name': caseStudyName,
            'case_study_industry': caseStudyIndustry
        });
    },
    
    // Track clicks on call-to-action buttons
    trackCTAClick: function(ctaText, ctaLocation) {
        dataLayer.push({
            'event': 'cta_click',
            'cta_text': ctaText,
            'cta_location': ctaLocation
        });
    },
    
    // Track video interactions
    trackVideoInteraction: function(videoName, action, progress) {
        dataLayer.push({
            'event': 'video_' + action,
            'video_name': videoName,
            'video_progress': progress
        });
    },
    
    // Track downloads
    trackDownload: function(fileName, fileType) {
        dataLayer.push({
            'event': 'file_download',
            'file_name': fileName,
            'file_type': fileType
        });
    }
};

// A/B Testing framework
const EdgeABTesting = {
    // Current active tests
    activeTests: {},
    
    // Initialize an A/B test
    initTest: function(testName, variants, weightings) {
        // Default to equal weightings if not provided
        if (!weightings) {
            weightings = variants.map(() => 1 / variants.length);
        }
        
        // Check for existing test assignment in localStorage
        const storedVariant = localStorage.getItem('abtest_' + testName);
        let assignedVariant;
        
        if (storedVariant && variants.includes(storedVariant)) {
            // Use the stored variant if valid
            assignedVariant = storedVariant;
        } else {
            // Assign a variant based on weightings
            const random = Math.random();
            let cumulativeWeight = 0;
            
            for (let i = 0; i < variants.length; i++) {
                cumulativeWeight += weightings[i];
                if (random <= cumulativeWeight) {
                    assignedVariant = variants[i];
                    break;
                }
            }
            
            // Store the assignment for consistency
            localStorage.setItem('abtest_' + testName, assignedVariant);
        }
        
        // Track the assignment in analytics
        dataLayer.push({
            'event': 'ab_test_assignment',
            'test_name': testName,
            'test_variant': assignedVariant
        });
        
        // Store the active test
        this.activeTests[testName] = assignedVariant;
        
        return assignedVariant;
    },
    
    // Get the variant for a specific test
    getVariant: function(testName) {
        return this.activeTests[testName];
    },
    
    // Track a conversion for a specific test
    trackConversion: function(testName, conversionType) {
        if (this.activeTests[testName]) {
            dataLayer.push({
                'event': 'ab_test_conversion',
                'test_name': testName,
                'test_variant': this.activeTests[testName],
                'conversion_type': conversionType
            });
        }
    }
};

// Video Animation Controller
const VideoAnimator = {
    // Initialize a video with animated results
    initVideoWithResults: function(videoId, resultsData, options = {}) {
        const videoElement = document.getElementById(videoId);
        if (!videoElement) return;
        
        // Default options
        const defaultOptions = {
            animationDuration: 1500,
            animationEasing: 'ease-out',
            showPercentage: true,
            chartType: 'bar', // 'bar', 'line', 'circle'
            chartColors: ['#0D47A1', '#1976D2', '#2196F3', '#64B5F6', '#BBDEFB']
        };
        
        // Merge defaults with provided options
        const settings = {...defaultOptions, ...options};
        
        // Track video load
        EdgeAnalytics.trackVideoInteraction(videoId, 'load', 0);
        
        // Set up video event listeners
        videoElement.addEventListener('play', () => {
            EdgeAnalytics.trackVideoInteraction(videoId, 'play', 
                Math.round((videoElement.currentTime / videoElement.duration) * 100));
        });
        
        videoElement.addEventListener('pause', () => {
            EdgeAnalytics.trackVideoInteraction(videoId, 'pause', 
                Math.round((videoElement.currentTime / videoElement.duration) * 100));
        });
        
        videoElement.addEventListener('ended', () => {
            EdgeAnalytics.trackVideoInteraction(videoId, 'complete', 100);
            this.animateResults(videoId, resultsData, settings);
        });
        
        // Add progress tracking
        const trackProgress = () => {
            const progress = Math.round((videoElement.currentTime / videoElement.duration) * 100);
            // Track at 25%, 50%, 75% points
            if (progress === 25 || progress === 50 || progress === 75) {
                EdgeAnalytics.trackVideoInteraction(videoId, 'progress', progress);
            }
        };
        
        // Check progress every second
        videoElement.addEventListener('timeupdate', trackProgress);
        
        // Create container for results if it doesn't exist
        let resultsContainer = document.getElementById(videoId + '-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = videoId + '-results';
            resultsContainer.className = 'video-results-container';
            videoElement.parentNode.insertBefore(resultsContainer, videoElement.nextSibling);
        }
        
        // Hide results container initially
        resultsContainer.style.opacity = '0';
        resultsContainer.style.height = '0';
        resultsContainer.style.overflow = 'hidden';
        resultsContainer.style.transition = `all ${settings.animationDuration/1000}s ${settings.animationEasing}`;
    },
    
    // Animate the results after video completion
    animateResults: function(videoId, resultsData, settings) {
        const resultsContainer = document.getElementById(videoId + '-results');
        if (!resultsContainer) return;
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Show container
        resultsContainer.style.opacity = '1';
        resultsContainer.style.height = 'auto';
        
        // Create title
        const title = document.createElement('h3');
        title.className = 'results-title';
        title.textContent = 'Key Results';
        resultsContainer.appendChild(title);
        
        // Create results based on chart type
        switch(settings.chartType) {
            case 'bar':
                this.createBarChart(resultsContainer, resultsData, settings);
                break;
            case 'line':
                this.createLineChart(resultsContainer, resultsData, settings);
                break;
            case 'circle':
                this.createCircleChart(resultsContainer, resultsData, settings);
                break;
            default:
                this.createBarChart(resultsContainer, resultsData, settings);
        }
    },
    
    // Create animated bar chart
    createBarChart: function(container, data, settings) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'bar-chart-container';
        
        data.forEach((item, index) => {
            // Create bar container
            const barContainer = document.createElement('div');
            barContainer.className = 'bar-container';
            
            // Create label
            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = item.label;
            
            // Create bar
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.backgroundColor = settings.chartColors[index % settings.chartColors.length];
            bar.style.width = '0%';
            bar.style.transition = `width ${settings.animationDuration/1000}s ${settings.animationEasing}`;
            
            // Create value
            const value = document.createElement('div');
            value.className = 'bar-value';
            value.textContent = '0' + (settings.showPercentage ? '%' : '');
            
            // Add to container
            barContainer.appendChild(label);
            barContainer.appendChild(bar);
            barContainer.appendChild(value);
            chartContainer.appendChild(barContainer);
            
            // Animate after short delay
            setTimeout(() => {
                bar.style.width = item.value + '%';
                value.textContent = item.value + (settings.showPercentage ? '%' : '');
            }, 100 + (index * 200));
        });
        
        container.appendChild(chartContainer);
    },
    
    // Create animated line chart
    createLineChart: function(container, data, settings) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'line-chart-container';
        
        // Create SVG element
        const svgContainer = document.createElement('div');
        svgContainer.className = 'svg-container';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '200');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');
        
        // Create path for line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', settings.chartColors[0]);
        path.setAttribute('stroke-width', '2');
        
        // Calculate points
        const pointCount = data.length;
        const step = 100 / (pointCount - 1);
        
        let pathData = '';
        data.forEach((item, index) => {
            const x = index * step;
            const y = 100 - item.value;
            
            if (index === 0) {
                pathData = `M ${x},${y}`;
            } else {
                pathData += ` L ${x},${y}`;
            }
            
            // Add point
            const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            point.setAttribute('cx', x);
            point.setAttribute('cy', y);
            point.setAttribute('r', '2');
            point.setAttribute('fill', settings.chartColors[0]);
            point.setAttribute('opacity', '0');
            
            // Animate point appearance
            setTimeout(() => {
                point.setAttribute('opacity', '1');
            }, 100 + (index * 200));
            
            svg.appendChild(point);
            
            // Add label
            const label = document.createElement('div');
            label.className = 'line-label';
            label.textContent = item.label;
            label.style.left = `${x}%`;
            label.style.opacity = '0';
            label.style.transition = `opacity ${settings.animationDuration/1000}s`;
            
            // Animate label appearance
            setTimeout(() => {
                label.style.opacity = '1';
            }, 100 + (index * 200));
            
            svgContainer.appendChild(label);
        });
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke-dasharray', path.getTotalLength());
        path.setAttribute('stroke-dashoffset', path.getTotalLength());
        
        // Animate path
        setTimeout(() => {
            path.style.transition = `stroke-dashoffset ${settings.animationDuration/1000}s ${settings.animationEasing}`;
            path.style.strokeDashoffset = '0';
        }, 100);
        
        svg.appendChild(path);
        svgContainer.appendChild(svg);
        chartContainer.appendChild(svgContainer);
        container.appendChild(chartContainer);
    },
    
    // Create animated circle chart
    createCircleChart: function(container, data, settings) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'circle-chart-container';
        
        data.forEach((item, index) => {
            // Create circle container
            const circleContainer = document.createElement('div');
            circleContainer.className = 'circle-container';
            
            // Create SVG element
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '120');
            svg.setAttribute('height', '120');
            svg.setAttribute('viewBox', '0 0 120 120');
            
            // Background circle
            const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bgCircle.setAttribute('cx', '60');
            bgCircle.setAttribute('cy', '60');
            bgCircle.setAttribute('r', '54');
            bgCircle.setAttribute('fill', 'none');
            bgCircle.setAttribute('stroke', '#eee');
            bgCircle.setAttribute('stroke-width', '12');
            
            // Progress circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '60');
            circle.setAttribute('cy', '60');
            circle.setAttribute('r', '54');
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', settings.chartColors[index % settings.chartColors.length]);
            circle.setAttribute('stroke-width', '12');
            circle.setAttribute('stroke-dasharray', '339.292');
            circle.setAttribute('stroke-dashoffset', '339.292');
            circle.setAttribute('transform', 'rotate(-90 60 60)');
            
            // Text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '60');
            text.setAttribute('y', '60');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('font-size', '28');
            text.setAttribute('font-weight', 'bold');
            text.textContent = '0' + (settings.showPercentage ? '%' : '');
            
            // Label
            const label = document.createElement('div');
            label.className = 'circle-label';
            label.textContent = item.label;
            
            // Add to SVG
            svg.appendChild(bgCircle);
            svg.appendChild(circle);
            svg.appendChild(text);
            
            // Add to container
            circleContainer.appendChild(svg);
            circleContainer.appendChild(label);
            chartContainer.appendChild(circleContainer);
            
            // Animate after short delay
            setTimeout(() => {
                const circumference = 2 * Math.PI * 54;
                const offset = circumference - (item.value / 100 * circumference);
                circle.style.transition = `stroke-dashoffset ${settings.animationDuration/1000}s ${settings.animationEasing}`;
                circle.setAttribute('stroke-dashoffset', offset);
                
                // Animate count
                const duration = settings.animationDuration;
                const start = 0;
                const end = item.value;
                const range = end - start;
                const startTime = performance.now();
                
                const updateCount = (timestamp) => {
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const value = Math.round(start + (range * progress));
                    text.textContent = value + (settings.showPercentage ? '%' : '');
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    }
                };
                
                requestAnimationFrame(updateCount);
            }, 100 + (index * 200));
        });
        
        container.appendChild(chartContainer);
    }
};

// Initialize on document ready
document.addEventListener('DOMContentLoaded', function() {
    // Track page view on load
    EdgeAnalytics.trackPageView();
    
    // Initialize A/B test for case study layout
    const layout = EdgeABTesting.initTest('case_study_layout', ['standard', 'extended'], [0.5, 0.5]);
    document.body.classList.add('layout-' + layout);
    
    // Add tracking to CTA buttons
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function() {
            EdgeAnalytics.trackCTAClick(this.textContent, this.closest('section').id || 'unknown');
            EdgeABTesting.trackConversion('case_study_layout', 'cta_click');
        });
    });
    
    // Track case study views
    document.querySelectorAll('.case-study').forEach(study => {
        const studyName = study.getAttribute('data-study-name') || 'Unknown Case Study';
        const studyIndustry = study.getAttribute('data-study-industry') || 'Unknown Industry';
        
        // Use Intersection Observer to track when case study is viewed
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    EdgeAnalytics.trackCaseStudyView(studyName, studyIndustry);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(study);
    });
    
    // Track file downloads
    document.querySelectorAll('a[download]').forEach(link => {
        link.addEventListener('click', function() {
            const fileName = this.getAttribute('download') || this.href.split('/').pop();
            const fileType = fileName.split('.').pop();
            EdgeAnalytics.trackDownload(fileName, fileType);
        });
    });
});
