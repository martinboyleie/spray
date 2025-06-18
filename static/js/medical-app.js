// Medical Tongue Spray Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 Tongue Spray Tracker loaded successfully!');
    initializeApp();
});

function initializeApp() {
    // Initialize tooltips if using Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Add keyboard navigation
    addKeyboardNavigation();
    
    // Auto-refresh status every 30 seconds
    setInterval(updateStatus, 30000);
}

// Record spray function (called from templates)
async function recordSpray(locationId) {
    const button = document.querySelector(`[onclick="recordSpray('${locationId}')"]`);
    
    // Add loading state
    if (button) {
        button.classList.add('loading');
        button.disabled = true;
    }
    
    try {
        const response = await fetch(`/spray/${locationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success notification
            showNotification('success', data.message);
            
            // Add visual feedback
            if (button) {
                button.innerHTML = '<i class="fas fa-check me-2"></i>Recorded!';
                button.classList.remove('btn-outline-primary', 'btn-warning');
                button.classList.add('btn-success');
            }
            
            // Reload page after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification('error', data.message);
        }
    } catch (error) {
        console.error('Error recording spray:', error);
        showNotification('error', 'Failed to record spray. Please try again.');
    } finally {
        // Remove loading state
        if (button) {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

// Show notification function
function showNotification(type, message) {
    // Try to use Bootstrap toast first
    const toastElement = document.getElementById('successToast');
    if (toastElement) {
        const toastMessage = document.getElementById('toastMessage');
        if (toastMessage) {
            toastMessage.textContent = message;
        }
        
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        return;
    }
    
    // Fallback to browser notification
    if (type === 'success') {
        alert('✅ ' + message);
    } else {
        alert('❌ ' + message);
    }
}

// Update status function
async function updateStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        // Update any status displays on the page
        updateStatusDisplay(data);
    } catch (error) {
        console.log('Status update failed (this is normal if offline)');
    }
}

// Update status display
function updateStatusDisplay(data) {
    // Update next location if element exists
    const nextLocationElement = document.querySelector('.next-location-name');
    if (nextLocationElement && data.next_location_name) {
        nextLocationElement.textContent = data.next_location_name;
    }
    
    // Update total sprays count
    const totalSpraysElements = document.querySelectorAll('.total-sprays-count');
    totalSpraysElements.forEach(element => {
        if (data.total_sprays !== undefined) {
            element.textContent = data.total_sprays;
        }
    });
    
    // Update current cycle
    const currentCycleElements = document.querySelectorAll('.current-cycle-count');
    currentCycleElements.forEach(element => {
        if (data.current_cycle !== undefined) {
            element.textContent = data.current_cycle;
        }
    });
}

// Keyboard navigation
function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Number keys (1-3) to quickly record spray
        if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const target = e.target;
            // Don't trigger if user is typing in an input field
            if (target.tagName.toLowerCase() === 'input' || 
                target.tagName.toLowerCase() === 'textarea' ||
                target.contentEditable === 'true') {
                return;
            }
            
            e.preventDefault();
            const locationId = e.key;
            
            // Confirm before recording
            if (confirm(`Record spray at Location ${locationId}?`)) {
                recordSpray(locationId);
            }
        }
        
        // Space bar to record spray at recommended location
        if (e.code === 'Space' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const target = e.target;
            // Don't trigger if user is typing in an input field or clicking buttons
            if (target.tagName.toLowerCase() === 'input' || 
                target.tagName.toLowerCase() === 'textarea' ||
                target.tagName.toLowerCase() === 'button' ||
                target.contentEditable === 'true') {
                return;
            }
            
            e.preventDefault();
            
            // Find the next recommended location button
            const nextLocationButton = document.querySelector('.btn-warning[onclick*="recordSpray"]');
            if (nextLocationButton) {
                const match = nextLocationButton.getAttribute('onclick').match(/recordSpray\('(\d+)'\)/);
                if (match) {
                    const locationId = match[1];
                    if (confirm(`Record spray at recommended location (Location ${locationId})?`)) {
                        recordSpray(locationId);
                    }
                }
            }
        }
    });
}

// Format dates for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } else if (diffDays === 1) {
        return 'Yesterday ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}

// Export functions for global access
window.recordSpray = recordSpray;
window.showNotification = showNotification;
window.formatDate = formatDate;

// Service Worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/static/service-worker.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// PWA Install prompt (future enhancement)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Optionally show install button
    const installButton = document.getElementById('install-app-button');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
            });
        });
    }
});

console.log('📱 Medical app JavaScript loaded - Keyboard shortcuts: 1-3 for locations, Space for recommended location'); 