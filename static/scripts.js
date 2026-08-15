document.addEventListener('DOMContentLoaded', () => {
  const btnRun = document.getElementById('btnRunSequence');
  const btnReset = document.getElementById('btnReset');
  const stringInput = document.getElementById('stringInput');
  const logConsole = document.getElementById('logConsole');
  const currentStateText = document.getElementById('currentStateText');

  function highlightState(stateId) {
    const allNodes = ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
    allNodes.forEach(id => {
      const el = document.getElementById(`node-${id}`);
      if (el) el.classList.remove('state-active', 'state-final-active', 'state-error-active');
    });

    const activeEl = document.getElementById(`node-${stateId}`);
    if (activeEl) {
      if (stateId === 'q6') activeEl.classList.add('state-final-active');
      else if (stateId === 'q5') activeEl.classList.add('state-error-active');
      else activeEl.classList.add('state-active');
    }
  }

  function appendLog(msg, type = 'info') {
    const span = document.createElement('span');
    if (type === 'error') span.className = 'text-[#b91c1c] font-bold';
    else if (type === 'success') span.className = 'text-[#15803d] font-bold';
    else span.className = 'text-[#5d0d18]';

    span.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logConsole.appendChild(span);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  async function runSimulation() {
    const rawVal = stringInput.value.trim();
    if (!rawVal) return;

    logConsole.innerHTML = '';
    const sequence = rawVal.split(',').map(s => s.trim());

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence })
      });

      const resData = await response.json();
      
      // Animasi transisi step-by-step
      let delay = 0;
      resData.logs.forEach((log) => {
        setTimeout(() => {
          appendLog(log.message, log.type);
          if (log.state) {
            highlightState(log.state);
            currentStateText.innerText = log.state;
          }
        }, delay);
        delay += 700; // Delay animasi 700ms tiap step
      });

    } catch (err) {
      appendLog('Error koneksi ke server Flask!', 'error');
    }
  }

  btnRun.addEventListener('click', runSimulation);

  btnReset.addEventListener('click', () => {
    highlightState('q0');
    currentStateText.innerText = 'q0 (Standby)';
    logConsole.innerHTML = '<span class="text-[#5d0d18]/70">[System] Mesin direset ke q0.</span>';
  });

  window.setAndRun = function(seqStr) {
    stringInput.value = seqStr;
    runSimulation();
  };
});