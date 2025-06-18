from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime, timedelta, time

app = Flask(__name__)

# Custom Jinja2 filters
@app.template_filter('format_datetime')
def format_datetime(date_string):
    """Format datetime string for display"""
    try:
        dt = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        # Use %I instead of %-I for cross-platform compatibility
        return dt.strftime('%b %d, %I:%M %p')
    except:
        return date_string

@app.template_filter('days_ago')
def days_ago(date_string):
    """Calculate how many days ago"""
    try:
        dt = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        now = datetime.now()
        if dt.date() == now.date():
            return "Today"
        elif dt.date() == (now - timedelta(days=1)).date():
            return "Yesterday"
        else:
            diff = (now.date() - dt.date()).days
            return f"{diff} days ago"
    except:
        return "Unknown"

@app.template_filter('format_time')
def format_time(time_string):
    """Format time string for display"""
    try:
        # Parse time string (format: "HH:MM")
        time_obj = datetime.strptime(time_string, '%H:%M').time()
        return time_obj.strftime('%I:%M %p')
    except:
        return time_string

# Data file to store spray locations and history
DATA_FILE = 'spray_data.json'

# Default mouth spray locations (numbered 1-3 for easy rotation)
DEFAULT_LOCATIONS = {
    1: {"name": "Left of Mouth", "position": "left-mouth", "used": False, "last_used": None},
    2: {"name": "Right of Mouth", "position": "right-mouth", "used": False, "last_used": None},
    3: {"name": "Under the Tongue", "position": "under-tongue", "used": False, "last_used": None}
}

# Default schedule configuration
DEFAULT_SCHEDULE = {
    "enabled": False,
    "start_time": "07:00",  # 7:00 AM
    "end_time": "23:59",    # 11:59 PM (midnight)
    "interval_hours": 4,    # Every 4 hours
    "interval_minutes": 0   # No additional minutes
}

def load_data():
    """Load spray data from JSON file"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                # Ensure all locations exist (for app updates)
                for loc_id in DEFAULT_LOCATIONS:
                    if str(loc_id) not in data.get('locations', {}):
                        data.setdefault('locations', {})[str(loc_id)] = DEFAULT_LOCATIONS[loc_id].copy()
                
                # Ensure schedule exists (for app updates)
                if 'schedule' not in data:
                    data['schedule'] = DEFAULT_SCHEDULE.copy()
                    
                return data
        except (json.JSONDecodeError, KeyError):
            pass
    
    # Return default data structure
    return {
        'locations': {str(k): v.copy() for k, v in DEFAULT_LOCATIONS.items()},
        'history': [],
        'total_sprays': 0,
        'current_cycle': 1,
        'schedule': DEFAULT_SCHEDULE.copy()
    }

def save_data(data):
    """Save spray data to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_schedule_times(schedule):
    """Calculate all scheduled spray times for today"""
    if not schedule.get('enabled', False):
        return []
    
    try:
        start_time = datetime.strptime(schedule['start_time'], '%H:%M').time()
        end_time = datetime.strptime(schedule['end_time'], '%H:%M').time()
        interval = timedelta(hours=schedule.get('interval_hours', 4), 
                           minutes=schedule.get('interval_minutes', 0))
        
        # Start with today's start time
        today = datetime.now().date()
        current_dt = datetime.combine(today, start_time)
        end_dt = datetime.combine(today, end_time)
        
        # Handle case where end time is past midnight
        if end_time < start_time:
            end_dt = datetime.combine(today + timedelta(days=1), end_time)
        
        scheduled_times = []
        while current_dt <= end_dt:
            scheduled_times.append(current_dt)
            current_dt += interval
            
        return scheduled_times
    except (ValueError, KeyError):
        return []

def get_schedule_status(data):
    """Get current schedule status and next spray time"""
    schedule = data.get('schedule', {})
    if not schedule.get('enabled', False):
        return {
            'enabled': False,
            'next_spray_time': None,
            'is_overdue': False,
            'minutes_until_next': None,
            'scheduled_times': [],
            'completed_times': []
        }
    
    scheduled_times = calculate_schedule_times(schedule)
    now = datetime.now()
    
    # Get today's spray history
    today_history = []
    for entry in data.get('history', []):
        try:
            entry_dt = datetime.fromisoformat(entry['timestamp'])
            if entry_dt.date() == now.date():
                today_history.append(entry_dt)
        except:
            continue
    
    # Find completed scheduled times (within 30 minutes of scheduled time)
    completed_times = []
    for scheduled_time in scheduled_times:
        for spray_time in today_history:
            time_diff = abs((spray_time - scheduled_time).total_seconds() / 60)
            if time_diff <= 30:  # Within 30 minutes
                completed_times.append(scheduled_time)
                break
    
    # Find next spray time
    next_spray_time = None
    is_overdue = False
    minutes_until_next = None
    
    # First, look for future scheduled times that haven't been completed
    for scheduled_time in scheduled_times:
        if scheduled_time > now and scheduled_time not in completed_times:
            next_spray_time = scheduled_time
            minutes_until_next = int((scheduled_time - now).total_seconds() / 60)
            break
    
    # If no future times found, look for overdue times (past times not completed)
    if next_spray_time is None:
        for scheduled_time in scheduled_times:
            if scheduled_time <= now and scheduled_time not in completed_times:
                # This time has passed and wasn't completed - it's overdue
                next_spray_time = scheduled_time
                is_overdue = True
                minutes_until_next = int((now - scheduled_time).total_seconds() / 60)
                break
    
    return {
        'enabled': True,
        'next_spray_time': next_spray_time,
        'is_overdue': is_overdue,
        'minutes_until_next': minutes_until_next,
        'scheduled_times': scheduled_times,
        'completed_times': completed_times,
        'total_scheduled': len(scheduled_times),
        'total_completed': len(completed_times)
    }

def get_next_location(data):
    """Get the next location to spray based on rotation logic"""
    locations = data['locations']
    
    # Find unused locations in current cycle
    unused = [loc_id for loc_id, loc in locations.items() if not loc['used']]
    
    if unused:
        # Return the lowest numbered unused location
        return min(unused, key=int)
    else:
        # All locations used, start new cycle
        # Reset all locations and start with location 1
        for loc in locations.values():
            loc['used'] = False
        data['current_cycle'] += 1
        save_data(data)
        return '1'

@app.route('/')
def dashboard():
    """Main dashboard showing tongue map and next location"""
    data = load_data()
    next_location_id = get_next_location(data)
    next_location = data['locations'][next_location_id]
    schedule_status = get_schedule_status(data)
    
    # Get recent history (last 10 sprays)
    recent_history = data['history'][-10:] if data['history'] else []
    
    return render_template('dashboard.html', 
                         locations=data['locations'],
                         next_location_id=next_location_id,
                         next_location=next_location,
                         recent_history=recent_history,
                         total_sprays=data['total_sprays'],
                         current_cycle=data['current_cycle'],
                         schedule=data['schedule'],
                         schedule_status=schedule_status)

@app.route('/schedule')
def schedule_page():
    """Schedule configuration page"""
    data = load_data()
    schedule_status = get_schedule_status(data)
    return render_template('schedule.html', 
                         schedule=data['schedule'],
                         schedule_status=schedule_status)

@app.route('/schedule', methods=['POST'])
def update_schedule():
    """Update schedule configuration"""
    data = load_data()
    
    try:
        # Get form data
        enabled = request.form.get('enabled') == 'on'
        start_time = request.form.get('start_time', '07:00')
        end_time = request.form.get('end_time', '23:59')
        interval_hours = int(request.form.get('interval_hours', 4))
        interval_minutes = int(request.form.get('interval_minutes', 0))
        
        # Validate time format
        datetime.strptime(start_time, '%H:%M')
        datetime.strptime(end_time, '%H:%M')
        
        # Validate interval
        if interval_hours < 0 or interval_minutes < 0:
            raise ValueError("Interval must be positive")
        if interval_hours == 0 and interval_minutes == 0:
            raise ValueError("Interval must be greater than 0")
        
        # Update schedule
        data['schedule'] = {
            'enabled': enabled,
            'start_time': start_time,
            'end_time': end_time,
            'interval_hours': interval_hours,
            'interval_minutes': interval_minutes
        }
        
        save_data(data)
        return redirect(url_for('schedule_page'))
        
    except (ValueError, KeyError) as e:
        # Handle validation errors
        return render_template('schedule.html', 
                             schedule=data['schedule'],
                             schedule_status=get_schedule_status(data),
                             error=str(e))

@app.route('/spray/<location_id>', methods=['POST'])
def record_spray(location_id):
    """Record a spray at the specified location"""
    data = load_data()
    
    if location_id in data['locations']:
        # Update location data
        data['locations'][location_id]['used'] = True
        data['locations'][location_id]['last_used'] = datetime.now().isoformat()
        
        # Add to history
        history_entry = {
            'location_id': location_id,
            'location_name': data['locations'][location_id]['name'],
            'timestamp': datetime.now().isoformat(),
            'cycle': data['current_cycle']
        }
        data['history'].append(history_entry)
        data['total_sprays'] += 1
        
        save_data(data)
        return jsonify({'success': True, 'message': f'Spray recorded at {data["locations"][location_id]["name"]}'})
    
    return jsonify({'success': False, 'message': 'Invalid location'}), 400

@app.route('/history')
def history():
    """Show detailed spray history (last 30 days)"""
    data = load_data()
    
    # Calculate date 30 days ago
    thirty_days_ago = datetime.now().date() - timedelta(days=30)
    today = datetime.now().date()
    
    # Filter history to last 30 days
    recent_history = []
    today_sprays = 0
    total_recent_sprays = 0
    
    for entry in data['history']:
        try:
            entry_date = datetime.fromisoformat(entry['timestamp']).date()
            if entry_date >= thirty_days_ago:
                recent_history.append(entry)
                total_recent_sprays += 1
                if entry_date == today:
                    today_sprays += 1
        except:
            continue
    
    return render_template('history.html', 
                         history=recent_history, 
                         total_sprays=total_recent_sprays,
                         today_sprays=today_sprays)

@app.route('/reset', methods=['POST'])
def reset_cycle():
    """Reset the current cycle (mark all locations as unused)"""
    data = load_data()
    for loc in data['locations'].values():
        loc['used'] = False
    data['current_cycle'] += 1
    save_data(data)
    return redirect(url_for('dashboard'))

@app.route('/api/status')
def api_status():
    """API endpoint for current status"""
    data = load_data()
    next_location_id = get_next_location(data)
    schedule_status = get_schedule_status(data)
    
    return jsonify({
        'next_location_id': next_location_id,
        'next_location_name': data['locations'][next_location_id]['name'],
        'total_sprays': data['total_sprays'],
        'current_cycle': data['current_cycle'],
        'locations_used_this_cycle': sum(1 for loc in data['locations'].values() if loc['used']),
        'total_locations': len(data['locations']),
        'schedule_status': schedule_status
    })

@app.route('/static/service-worker.js')
def service_worker():
    """Serve service worker with correct MIME type"""
    return app.send_static_file('service-worker.js'), 200, {'Content-Type': 'application/javascript'}

@app.route('/static/manifest.json')
def manifest():
    """Serve manifest with correct MIME type"""
    return app.send_static_file('manifest.json'), 200, {'Content-Type': 'application/json'}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 