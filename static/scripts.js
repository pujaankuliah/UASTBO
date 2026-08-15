const transitions = {
  'q0': { 'item': 'q1' },
  'q1': { 'o': 'q2', 'a': 'q3', 'm': 'q4', 'x': 'q5' },
  'q2': { 'c': 'q6' },
  'q3': { 'c': 'q6' },
  'q4': { 'c': 'q6' },
  'q5': {}, 
  'q6': {}  
};

const stateLabels = {
  'q0': 'Standby / Idle',
  'q1': 'Detecting Item',
  'q2': 'Processing Organic',
  'q3': 'Sorting Anorganic',
  'q4': 'Sorting Metal',
  'q5': 'Reject / Error',
  'q6': 'Process Completed (Final)'
};

let currentState = 'q0';

function updateUI() {
  document.getElementById('currentStateText').innerText = `${currentState} (${stateLabels[currentState]})`;

  const allNodes = ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
  allNodes.forEach(nodeId => {
    const el = document.getElementById(`node-${nodeId}`);
    if (el) {
      el.classList.remove('state-active', 'state-final-active', 'state-error-active');
    }
  });

  const activeEl = document.getElementById(`node-${currentState}`);
  if (activeEl) {
    if (currentState === 'q6') {
      activeEl.classList.add('state-final-active');
    } else if (currentState === 'q5') {
      activeEl.classList.add('state-error-active');
    } else {
      activeEl.classList.add('state-active');
    }
  }
}

function appendLog(msg, type = 'info') {
  const logConsole = document.getElementById('logConsole');
  const span = document.createElement('span');
  
  if (type === 'error') span.className = 'text-[#b91c1c] font-bold';
  else if (type === 'success') span.className = 'text-[#15803d] font-bold';
  else span.className = 'text-[#5d0d18]';

  span.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logConsole.appendChild(span);
  logConsole.scrollTop = logConsole.scrollHeight;
}

function sendInput(inputSymbol) {
  const nextState = transitions[currentState][inputSymbol];

  if (nextState) {
    appendLog(`Input: '${inputSymbol}' -> Transisi dari ${currentState} ke ${nextState}`);
    currentState = nextState;
    updateUI();

    if (currentState === 'q6') {
      appendLog('SUCCESS: Sampah berhasil diproses dan dikategorikan! (Accept State)', 'success');
    } else if (currentState === 'q5') {
      appendLog('REJECT: Material tidak dikenali atau mesin mengalami error! (Reject State)', 'error');
    }
  } else {
    appendLog(`REJECT: Input '${inputSymbol}' tidak valid pada state ${currentState}!`, 'error');
  }
}

function runSequence() {
  const inputVal = document.getElementById('stringInput').value.trim();
  if (!inputVal) return;

  resetFSA();
  const sequence = inputVal.split(',').map(s => s.trim());
  appendLog(`Menjalankan Sequence: [${sequence.join(', ')}]`);

  let delay = 0;
  sequence.forEach((symbol) => {
    setTimeout(() => {
      sendInput(symbol);
    }, delay);
    delay += 800;
  });
}

function resetFSA() {
  currentState = 'q0';
  updateUI();
  appendLog('--- Mesin Direset Ke State Awal (q0) ---');
}

updateUI();