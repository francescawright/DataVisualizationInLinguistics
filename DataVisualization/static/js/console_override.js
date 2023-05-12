// this works fine and when browser is closed its deleted
let userConsoleOutputs = {};

// Read existing console output from sessionStorage
const existingConsoleOutput = sessionStorage.getItem('consoleOutput');
if (existingConsoleOutput) {
  try {
    userConsoleOutputs = JSON.parse(existingConsoleOutput);
  } catch (err) {
    console.error('Error parsing console output from sessionStorage', err);
  }
}

// Override console.log to capture output from specific users
const origConsoleLog = console.log;
console.log = function(...args) {
  const username = user.split('/')[2];
  const message = args.map(arg => String(arg)).join(' '); // concatenate all parameters to a single string
  if (username && username.trim() !== '') {
    if (!userConsoleOutputs[username]) {
      userConsoleOutputs[username] = '';
    }
    userConsoleOutputs[username] += message + '\n';
  }
  // Also log to the original console
  origConsoleLog.apply(console, args);
};

// Save console output to sessionStorage on page unload
window.addEventListener('beforeunload', function() {
  sessionStorage.setItem('consoleOutput', JSON.stringify(userConsoleOutputs));
});

// Download console output as text files
function saveConsoleOutput() {
  for (const username in userConsoleOutputs) {
    const blob = new Blob([userConsoleOutputs[username]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `console-output-${username}.txt`;
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

