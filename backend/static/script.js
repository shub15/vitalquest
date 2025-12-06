async function sendRequest(endpoint, payload) {
    const output = document.getElementById('output');
    output.textContent = "Loading...";

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data, null, 2));
        }

        output.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        output.textContent = "Error:\n" + error.message;
    }
}

function getLog() {
    try {
        return JSON.parse(document.getElementById('jsonInput').value);
    } catch (e) {
        alert("Invalid JSON");
        return null;
    }
}

function analyzeRecovery() {
    const log = getLog();
    if (log) sendRequest('/analyze/recovery', log);
}

function analyzeBattle() {
    const log = getLog();
    if (log) sendRequest('/analyze/battle', log);
}

function getCoach(context) {
    const log = getLog();
    if (log) {
        // Wrapper for body param
        sendRequest('/analyze/coach', { log: log, context: context });
    }
}
