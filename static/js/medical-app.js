// Medical Tongue Spray Tracker JavaScript

// Global variables for alert management
let lastAlertTime = null;
let alertCheckInterval = null;
let hasShownNotificationPermission = false;

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
    
    // Initialize schedule alerts
    initializeScheduleAlerts();
}

// Initialize schedule alerts
function initializeScheduleAlerts() {
    // Request notification permission
    requestNotificationPermission();
    
    // Start checking for schedule alerts every minute
    alertCheckInterval = setInterval(checkScheduleAlerts, 60000);
    
    // Check immediately
    setTimeout(checkScheduleAlerts, 2000);
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }
    
    if (Notification.permission === 'default' && !hasShownNotificationPermission) {
        hasShownNotificationPermission = true;
        try {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        } catch (error) {
            console.log('Error requesting notification permission:', error);
        }
    }
}

// Check for schedule alerts
async function checkScheduleAlerts() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        // Update status display
        updateStatusDisplay(data);
        
        // Check if we need to show an alert
        if (data.schedule && data.schedule.enabled) {
            const scheduleStatus = data.schedule_status;
            
            if (scheduleStatus && scheduleStatus.next_spray_time) {
                const nextSprayTime = new Date(scheduleStatus.next_spray_time);
                const now = new Date();
                
                // Check if it's time for an alert (within 5 minutes or overdue)
                const minutesUntilSpray = (nextSprayTime - now) / (1000 * 60);
                const shouldAlert = scheduleStatus.is_overdue || (minutesUntilSpray <= 5 && minutesUntilSpray >= 0);
                
                if (shouldAlert) {
                    const alertKey = nextSprayTime.toISOString();
                    
                    // Only show alert once per scheduled time
                    if (lastAlertTime !== alertKey) {
                        lastAlertTime = alertKey;
                        showScheduleAlert(scheduleStatus);
                    }
                }
            }
        }
    } catch (error) {
        console.log('Schedule alert check failed (this is normal if offline)');
    }
}

// Show schedule alert
function showScheduleAlert(scheduleStatus) {
    const nextSprayTime = new Date(scheduleStatus.next_spray_time);
    const timeString = nextSprayTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let title, message;
    
    if (scheduleStatus.is_overdue) {
        title = '⏰ Spray Overdue!';
        message = `Your scheduled spray at ${timeString} is overdue. Time to take your medication!`;
    } else {
        title = '🔔 Spray Reminder';
        message = `Time for your scheduled spray at ${timeString}!`;
    }
    
    // Try to show browser notification first
    if (showBrowserNotification(title, message)) {
        console.log('Browser notification shown');
    } else {
        // Fallback to visual alert
        showVisualAlert(title, message);
    }
    
    // Also show toast notification
    showNotification('info', message);
    
    // Play notification sound if available
    playNotificationSound();
}

// Show browser notification
function showBrowserNotification(title, message) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false;
    }
    
    try {
        const notification = new Notification(title, {
            body: message,
            icon: '/static/manifest.json', // You can add a proper icon later
            badge: '/static/manifest.json',
            requireInteraction: true,
            tag: 'spray-reminder'
        });
        
        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);
        
        // Handle click
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        return true;
    } catch (error) {
        console.error('Error showing browser notification:', error);
        return false;
    }
}

// Show visual alert
function showVisualAlert(title, message) {
    // Create alert overlay
    const alertOverlay = document.createElement('div');
    alertOverlay.className = 'schedule-alert-overlay';
    alertOverlay.innerHTML = `
        <div class="schedule-alert-modal">
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <h5 class="alert-heading">${title}</h5>
                <p class="mb-3">${message}</p>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-primary btn-sm" onclick="dismissScheduleAlert()">
                        <i class="fas fa-check me-1"></i>Got it!
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="snoozeScheduleAlert()">
                        <i class="fas fa-clock me-1"></i>Snooze 5min
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .schedule-alert-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-in;
        }
        
        .schedule-alert-modal {
            max-width: 400px;
            margin: 20px;
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(alertOverlay);
    
    // Auto-dismiss after 30 seconds
    setTimeout(() => {
        if (document.body.contains(alertOverlay)) {
            dismissScheduleAlert();
        }
    }, 30000);
}

// Dismiss schedule alert
function dismissScheduleAlert() {
    const overlay = document.querySelector('.schedule-alert-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Snooze schedule alert
function snoozeScheduleAlert() {
    dismissScheduleAlert();
    // Reset last alert time to allow re-alerting in 5 minutes
    setTimeout(() => {
        lastAlertTime = null;
    }, 5 * 60 * 1000);
}

// Play notification sound
function playNotificationSound() {
    try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.log('Could not play notification sound:', error);
    }
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
    } else if (type === 'info') {
        alert('🔔 ' + message);
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
window.dismissScheduleAlert = dismissScheduleAlert;
window.snoozeScheduleAlert = snoozeScheduleAlert;

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