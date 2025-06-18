// Offline Spray Tracker - Complete Client-Side Application
class SprayTracker {
    constructor() {
        this.storageKey = 'sprayTrackerData';
        this.data = this.loadData();
        this.init();
    }

    // Default data structure
    getDefaultData() {
        return {
            locations: {
                '1': { name: "Left of Mouth", position: "left-mouth", used: false, last_used: null },
                '2': { name: "Right of Mouth", position: "right-mouth", used: false, last_used: null },
                '3': { name: "Under the Tongue", position: "under-tongue", used: false, last_used: null }
            },
            history: [],
            total_sprays: 0,
            current_cycle: 1,
            schedule: {
                enabled: false,
                start_time: "07:00",
                end_time: "23:59",
                interval_hours: 4,
                interval_minutes: 0
            }
        };
    }

    // Load data from localStorage
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                // Ensure all required properties exist
                const defaultData = this.getDefaultData();
                return { ...defaultData, ...data };
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
        return this.getDefaultData();
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    // Initialize the application
    init() {
        this.renderDashboard();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    // Get next location to spray
    getNextLocation() {
        const locations = this.data.locations;
        const unused = Object.keys(locations).filter(id => !locations[id].used);
        
        if (unused.length > 0) {
            return unused.sort((a, b) => parseInt(a) - parseInt(b))[0];
        } else {
            // Reset cycle
            Object.values(locations).forEach(loc => loc.used = false);
            this.data.current_cycle++;
            this.saveData();
            return '1';
        }
    }

    // Record a spray
    recordSpray(locationId) {
        const location = this.data.locations[locationId];
        if (!location) return;

        // Update location
        location.used = true;
        location.last_used = new Date().toISOString();

        // Add to history
        const historyEntry = {
            location_id: locationId,
            location_name: location.name,
            timestamp: new Date().toISOString(),
            cycle: this.data.current_cycle
        };
        this.data.history.push(historyEntry);
        this.data.total_sprays++;

        this.saveData();
        this.renderDashboard();
        this.showToast(`Spray recorded at ${location.name}`);
    }

    // Calculate schedule times
    calculateScheduleTimes(schedule) {
        if (!schedule.enabled) return [];

        const times = [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const [startHour, startMin] = schedule.start_time.split(':').map(Number);
        const [endHour, endMin] = schedule.end_time.split(':').map(Number);
        
        let current = new Date(today);
        current.setHours(startHour, startMin, 0, 0);
        
        const end = new Date(today);
        end.setHours(endHour, endMin, 0, 0);
        if (end < current) end.setDate(end.getDate() + 1);
        
        const intervalMs = (schedule.interval_hours * 60 + schedule.interval_minutes) * 60 * 1000;
        
        while (current <= end) {
            times.push(new Date(current));
            current = new Date(current.getTime() + intervalMs);
        }
        
        return times;
    }

    // Get schedule status
    getScheduleStatus() {
        const schedule = this.data.schedule;
        if (!schedule.enabled) {
            return { enabled: false, next_spray_time: null, is_overdue: false };
        }

        const scheduledTimes = this.calculateScheduleTimes(schedule);
        const now = new Date();
        const today = now.toDateString();
        
        // Get today's sprays
        const todayHistory = this.data.history.filter(entry => {
            return new Date(entry.timestamp).toDateString() === today;
        }).map(entry => new Date(entry.timestamp));

        // Find completed times (within 30 minutes)
        const completedTimes = scheduledTimes.filter(scheduledTime => {
            return todayHistory.some(sprayTime => {
                const diffMinutes = Math.abs(sprayTime - scheduledTime) / (1000 * 60);
                return diffMinutes <= 30;
            });
        });

        // Find next spray time
        let nextSprayTime = null;
        let isOverdue = false;

        // First look for future times
        for (const scheduledTime of scheduledTimes) {
            if (scheduledTime > now && !completedTimes.includes(scheduledTime)) {
                nextSprayTime = scheduledTime;
                break;
            }
        }

        // If no future times, look for overdue
        if (!nextSprayTime) {
            for (const scheduledTime of scheduledTimes) {
                if (scheduledTime <= now && !completedTimes.includes(scheduledTime)) {
                    nextSprayTime = scheduledTime;
                    isOverdue = true;
                    break;
                }
            }
        }

        return {
            enabled: true,
            next_spray_time: nextSprayTime,
            is_overdue: isOverdue,
            scheduled_times: scheduledTimes,
            completed_times: completedTimes
        };
    }

    // Format datetime
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // Format time
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // Render dashboard
    renderDashboard() {
        const nextLocationId = this.getNextLocation();
        const nextLocation = this.data.locations[nextLocationId];
        const scheduleStatus = this.getScheduleStatus();
        
        // Update next location
        document.getElementById('next-location-name').textContent = nextLocation.name;
        document.getElementById('next-location-id').textContent = nextLocationId;
        
        // Update statistics
        document.getElementById('total-sprays').textContent = this.data.total_sprays;
        document.getElementById('current-cycle').textContent = this.data.current_cycle;
        
        const usedCount = Object.values(this.data.locations).filter(loc => loc.used).length;
        document.getElementById('locations-used').textContent = `${usedCount}/3`;
        
        // Update schedule status
        this.updateScheduleStatus(scheduleStatus);
        
        // Update location buttons
        this.updateLocationButtons(nextLocationId);
        
        // Update recent history
        this.updateRecentHistory();
    }

    // Update schedule status display
    updateScheduleStatus(status) {
        const statusElement = document.getElementById('schedule-status');
        if (!statusElement) return;

        if (!status.enabled) {
            statusElement.innerHTML = '<div class="alert alert-info">Schedule is disabled</div>';
            return;
        }

        if (!status.next_spray_time) {
            statusElement.innerHTML = '<div class="alert alert-success">All scheduled sprays completed for today!</div>';
            return;
        }

        const timeStr = status.next_spray_time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (status.is_overdue) {
            const overdueMins = Math.floor((new Date() - status.next_spray_time) / (1000 * 60));
            statusElement.innerHTML = `
                <div class="alert alert-warning">
                    <strong>Overdue!</strong> Scheduled spray was at ${timeStr} (${overdueMins} minutes ago)
                </div>
            `;
        } else {
            const untilMins = Math.floor((status.next_spray_time - new Date()) / (1000 * 60));
            statusElement.innerHTML = `
                <div class="alert alert-info">
                    Next scheduled spray: ${timeStr} (in ${untilMins} minutes)
                </div>
            `;
        }
    }

    // Update location buttons
    updateLocationButtons(nextLocationId) {
        Object.keys(this.data.locations).forEach(id => {
            const button = document.getElementById(`spray-btn-${id}`);
            if (button) {
                const location = this.data.locations[id];
                const isNext = id === nextLocationId;
                
                button.className = `btn btn-location ${isNext ? 'btn-primary' : 'btn-outline-secondary'}`;
                if (location.used) {
                    button.classList.add('used');
                }
            }
        });
    }

    // Update recent history
    updateRecentHistory() {
        const historyElement = document.getElementById('recent-history');
        if (!historyElement) return;

        const recentHistory = this.data.history.slice(-5).reverse();
        
        if (recentHistory.length === 0) {
            historyElement.innerHTML = '<p class="text-muted">No recent sprays</p>';
            return;
        }

        historyElement.innerHTML = recentHistory.map(entry => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${entry.location_name}</span>
                <small class="text-muted">${this.formatDateTime(entry.timestamp)}</small>
            </div>
        `).join('');
    }

    // Setup event listeners
    setupEventListeners() {
        // Location buttons
        Object.keys(this.data.locations).forEach(id => {
            const button = document.getElementById(`spray-btn-${id}`);
            if (button) {
                button.addEventListener('click', () => this.recordSpray(id));
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '3') {
                e.preventDefault();
                this.recordSpray(e.key);
            }
        });

        // Reset cycle button
        const resetBtn = document.getElementById('reset-cycle-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCycle());
        }

        // Schedule form
        const scheduleForm = document.getElementById('schedule-form');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateSchedule();
            });
        }

        // Navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage(link.dataset.page);
            });
        });
    }

    // Reset cycle
    resetCycle() {
        Object.values(this.data.locations).forEach(loc => loc.used = false);
        this.data.current_cycle++;
        this.saveData();
        this.renderDashboard();
        this.showToast('Cycle reset!');
    }

    // Update schedule
    updateSchedule() {
        const form = document.getElementById('schedule-form');
        const formData = new FormData(form);
        
        this.data.schedule = {
            enabled: formData.get('enabled') === 'on',
            start_time: formData.get('start_time'),
            end_time: formData.get('end_time'),
            interval_hours: parseInt(formData.get('interval_hours')),
            interval_minutes: parseInt(formData.get('interval_minutes'))
        };
        
        this.saveData();
        this.renderDashboard();
        this.showToast('Schedule updated!');
    }

    // Show page
    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        
        // Show selected page
        const page = document.getElementById(`${pageName}-page`);
        if (page) {
            page.style.display = 'block';
            
            // Render page content
            if (pageName === 'history') {
                this.renderHistoryPage();
            } else if (pageName === 'schedule') {
                this.renderSchedulePage();
            }
        }
    }

    // Render history page
    renderHistoryPage() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentHistory = this.data.history.filter(entry => {
            return new Date(entry.timestamp) >= thirtyDaysAgo;
        });
        
        const today = new Date().toDateString();
        const todayCount = recentHistory.filter(entry => {
            return new Date(entry.timestamp).toDateString() === today;
        }).length;
        
        // Update stats
        document.getElementById('history-total').textContent = recentHistory.length;
        document.getElementById('history-today').textContent = todayCount;
        
        // Update history list
        const historyList = document.getElementById('history-list');
        if (historyList) {
            if (recentHistory.length === 0) {
                historyList.innerHTML = '<p class="text-center text-muted">No history in the last 30 days</p>';
            } else {
                historyList.innerHTML = recentHistory.reverse().map((entry, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${entry.location_name}</td>
                        <td>${this.formatDateTime(entry.timestamp)}</td>
                        <td>Cycle ${entry.cycle}</td>
                    </tr>
                `).join('');
            }
        }
    }

    // Render schedule page
    renderSchedulePage() {
        const schedule = this.data.schedule;
        
        // Populate form
        document.getElementById('schedule-enabled').checked = schedule.enabled;
        document.getElementById('schedule-start').value = schedule.start_time;
        document.getElementById('schedule-end').value = schedule.end_time;
        document.getElementById('schedule-hours').value = schedule.interval_hours;
        document.getElementById('schedule-minutes').value = schedule.interval_minutes;
    }

    // Show toast notification
    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 9999;
            font-weight: bold;
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 2 seconds
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }

    // Auto refresh
    startAutoRefresh() {
        setInterval(() => {
            this.renderDashboard();
        }, 30000); // Refresh every 30 seconds
    }

    // Clear all data
    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.removeItem(this.storageKey);
            this.data = this.getDefaultData();
            this.renderDashboard();
            this.showToast('All data cleared!');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sprayTracker = new SprayTracker();
}); 