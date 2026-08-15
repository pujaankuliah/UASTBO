from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Definisi State & Transisi DFA Pemrosesan Sampah
TRANSITIONS = {
    'q0': {'item': 'q1'},
    'q1': {'o': 'q2', 'a': 'q3', 'm': 'q4', 'x': 'q5'},
    'q2': {'c': 'q6'},
    'q3': {'c': 'q6'},
    'q4': {'c': 'q6'},
    'q5': {},  # Reject State
    'q6': {}   # Final State
}

STATE_LABELS = {
    'q0': 'Standby / Idle',
    'q1': 'Detecting Item',
    'q2': 'Processing Organic',
    'q3': 'Sorting Anorganic',
    'q4': 'Sorting Metal',
    'q5': 'Reject / Error',
    'q6': 'Process Completed (Final)'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.get_json()
    sequence = data.get('sequence', [])
    
    current_state = 'q0'
    logs = []
    
    logs.append({
        'message': f"State Awal: {current_state} ({STATE_LABELS[current_state]})",
        'type': 'info',
        'state': current_state
    })
    
    for symbol in sequence:
        symbol = symbol.strip()
        if not symbol:
            continue
            
        next_state = TRANSITIONS.get(current_state, {}).get(symbol)
        
        if next_state:
            logs.append({
                'message': f"Input: '{symbol}' -> Transisi {current_state} ke {next_state}",
                'type': 'info',
                'state': next_state
            })
            current_state = next_state
            
            if current_state == 'q6':
                logs.append({
                    'message': 'SUCCESS: Sampah berhasil diproses & dikategorikan! (Accept State)',
                    'type': 'success',
                    'state': current_state
                })
            elif current_state == 'q5':
                logs.append({
                    'message': 'REJECT: Material anomali/error terdeteksi! (Reject State)',
                    'type': 'error',
                    'state': current_state
                })
        else:
            logs.append({
                'message': f"REJECT: Input '{symbol}' tidak valid pada state {current_state}!",
                'type': 'error',
                'state': current_state
            })
            break # Hentikan eksekusi jika input invalid
            
    return jsonify({
        'final_state': current_state,
        'state_label': STATE_LABELS.get(current_state, 'Unknown'),
        'is_accepted': current_state == 'q6',
        'logs': logs
    })

if __name__ == '__main__':
    app.run(debug=True)