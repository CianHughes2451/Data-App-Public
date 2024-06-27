let currentAction = '';
let currentMode = '';
let currentDefinition = '';
let currentPlayer = '';
let secondPlayer = '';
let actionsLog = [];

let team1Goals = 0;
let team1Points = 0;
let team2Goals = 0;
let team2Points = 0;

let marker1 = { x: null, y: null };
let marker2 = { x: null, y: null };
let firstMarkerConfirmed = false;

let playerNames = {
    1: 'Player 1',
    2: 'Player 2',
    3: 'Player 3',
    4: 'Player 4',
    5: 'Player 5',
    6: 'Player 6',
    7: 'Player 7',
    8: 'Player 8',
    9: 'Player 9',
    10: 'Player 10',
    11: 'Player 11',
    12: 'Player 12',
    13: 'Player 13',
    14: 'Player 14',
    15: 'Player 15'
};

let coordinatesEnabled = false;

let currentCoordinates1 = '';
let currentCoordinates2 = '';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('action-buttons').classList.add('active');
    updateCounters();
    updatePlayerLabels(); // Ensure player labels are updated on page load
});

function selectAction(action) {
    currentAction = action;
    currentCoordinates1 = '';
    currentCoordinates2 = '';
    firstMarkerConfirmed = false; // Reset the marker confirmation for every action
    const actionScreenMap = {
        'Point - Score': 'mode-point-score',
        'Point - Miss': 'mode-point-miss',
        'Goal - Score': 'mode-goal-score',
        'Goal - Miss': 'mode-goal-miss',
        '45 Entry': 'mode-45-entry', // Added new action
        'Free Won': 'mode-free-won',
        'Ball - Won': 'mode-ball-won',
        'Ball - Lost': 'mode-ball-lost',
        'Goal - Against': 'mode-goal-against',
        'Point - Against': 'mode-point-against',
        'Miss - Against': 'mode-miss-against',
        'Kickout - For': 'mode-kickout-for',
        'Kickout - Against': 'mode-kickout-against',
        'Shot - Saved': 'mode-shot-saved',
        'Foul': 'mode-foul',
        'Carry': 'mode-carry'
    };

    if (actionScreenMap[action]) {
        switchScreen(actionScreenMap[action]);
    } else if ((action === 'Handpass' || action === 'Kickpass') && coordinatesEnabled) {
        switchScreen('coordinate-screen'); // Go to coordinate screen for Handpass or Kickpass if toggled
    } else {
        switchScreen('player-buttons');
    }
}

function selectMode(mode) {
    currentMode = mode;
    const actionDefinitionMap = {
        'Point - Miss': 'definition-point-miss',
        'Goal - Miss': 'definition-goal-miss',
        'Free Won': 'definition-free-won',
        'Kickout - For': 'definition-kickout-for',
        'Kickout - Against': 'definition-kickout-against',
        'Ball - Won': 'definition-ball-won',
        'Ball - Lost': 'definition-ball-lost',
        'Foul': 'definition-foul'
    };

    if (currentAction === '45 Entry') {
        logAction(); // Directly log the action for 45 Entry
    } else if (currentAction === 'Point - Against' || currentAction === 'Goal - Against') {
        if (mode === 'Mistake') {
            if (coordinatesEnabled) {
                switchScreen('coordinate-screen'); // Go to coordinate screen for Mistake
            } else {
                switchScreen('player-buttons');
            }
        } else {
            if (coordinatesEnabled) {
                switchScreen('coordinate-screen'); // Go to coordinate screen for No Mistake
            } else {
                logAction(); // Log action directly for No Mistake
            }
        }
    } else if (currentAction === 'Miss - Against') {
        if (coordinatesEnabled) {
            switchScreen('coordinate-screen'); // Go to coordinate screen for Miss - Against
        } else {
            logAction(); // Log action directly for Miss - Against
        }
    } else if (currentAction === 'Carry') {
        if (coordinatesEnabled) {
            switchScreen('coordinate-screen'); // Go to coordinate screen for Carry after mode screen
        } else {
            switchScreen('player-buttons');
        }
    } else if (actionDefinitionMap[currentAction]) {
        switchScreen(actionDefinitionMap[currentAction]);
    } else if (coordinatesEnabled && (currentAction === 'Point - Score' || currentAction === 'Goal - Score' || currentAction === '45 Entry')) {
        switchScreen('coordinate-screen'); // Go to coordinate screen for specified actions
    } else {
        switchScreen('player-buttons');
    }
}

function selectDefinition(definition) {
    currentDefinition = definition;

    if (coordinatesEnabled && (currentAction === 'Point - Miss' || currentAction === 'Goal - Miss' || currentAction === 'Ball - Won' || currentAction === 'Ball - Lost' || currentAction === 'Kickout - For' || currentAction === 'Kickout - Against' || currentAction === 'Free Won')) {
        switchScreen('coordinate-screen'); // Go to coordinate screen for specified actions after definition screen
    } else {
        switchScreen('player-buttons');
    }
}

function selectPlayer(player) {
    currentPlayer = player;
    if (currentAction === 'Handpass' || currentAction === 'Kickpass') {
        switchScreen('player-buttons-second');
    } else {
        logAction();
    }
}

function selectSecondPlayer(player) {
    secondPlayer = player;
    logAction();
}

function logAction() {
    const entry = {
        action: currentAction,
        mode: currentMode,
        definition: currentDefinition,
        player: playerNames[currentPlayer] || currentPlayer,
        player2: playerNames[secondPlayer] || secondPlayer || '',
        coordinates1: currentCoordinates1 || '',
        coordinates2: currentCoordinates2 || ''
    };

    actionsLog.push(entry);
    updateSummary();

    if (currentAction === 'Point - Score') {
        team1Points++;
    } else if (currentAction === 'Goal - Score') {
        team1Goals++;
    } else if (currentAction === 'Point - Against') {
        team2Points++;
    } else if (currentAction === 'Goal - Against') {
        team2Goals++;
    }

    updateCounters();
    resetSelection();
    resetCoordinateScreen(); // Reset the coordinate screen after logging the action
    switchScreen('action-buttons'); // Ensure to return to Stats screen
    filterActions();
}

function logPointAgainst() {
    const entry = {
        action: currentAction,
        mode: currentMode,
        definition: currentDefinition,
        player: currentMode === 'Mistake' ? (playerNames[currentPlayer] || currentPlayer) : '', // Log player if Mistake
        player2: '',
        coordinates1: currentCoordinates1 || '',
        coordinates2: currentCoordinates2 || ''
    };
    actionsLog.push(entry);
    updateSummary();
    team2Points++;
    updateCounters();
    resetSelection();
    switchScreen('action-buttons'); // Return to Stats screen
}

function logGoalAgainst() {
    const entry = {
        action: currentAction,
        mode: currentMode,
        definition: currentDefinition,
        player: currentMode === 'Mistake' ? (playerNames[currentPlayer] || currentPlayer) : '', // Log player if Mistake
        player2: '',
        coordinates1: currentCoordinates1 || '',
        coordinates2: currentCoordinates2 || ''
    };
    actionsLog.push(entry);
    updateSummary();
    team2Goals++;
    updateCounters();
    resetSelection();
    switchScreen('action-buttons'); // Return to Stats screen
}

function logMissAgainst() {
    const entry = {
        action: currentAction,
        mode: currentMode,
        definition: currentDefinition,
        player: '', // Leave player column clear
        player2: ''
    };
    actionsLog.push(entry);
    updateSummary();
    updateCounters();
    resetSelection();
    switchScreen('action-buttons');
}

function returnToActionScreen() {
    resetSelection();
    switchScreen('action-buttons');
}

function returnToFirstPlayerScreen() {
    switchScreen('player-buttons');
}

function returnToModeScreen() {
    const actionModeMap = {
        'Point - Miss': 'mode-point-miss',
        'Goal - Miss': 'mode-goal-miss',
        'Free Won': 'mode-free-won',
        'Ball - Won': 'mode-ball-won',
        'Ball - Lost': 'mode-ball-lost',
        'Goal - Against': 'mode-goal-against',
        'Point - Against': 'mode-point-against',
        'Miss - Against': 'mode-miss-against',
        'Kickout - For': 'mode-kickout-for',
        'Kickout - Against': 'mode-kickout-against',
        'Shot - Saved': 'mode-shot-saved'
    };

    if (actionModeMap[currentAction]) {
        switchScreen(actionModeMap[currentAction]);
    } else {
        switchScreen('action-buttons');
    }
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        if (screenId === 'coordinate-screen') {
            drawPitch(); // Ensure the pitch is drawn when entering the coordinate screen
        }
    } else {
        console.error(`Screen with ID ${screenId} not found.`);
    }
}

function updateSummary() {
    const summaryTableBody = document.getElementById('summary-table').querySelector('tbody');
    summaryTableBody.innerHTML = '';

    actionsLog.forEach((entry, index) => {
        const row = document.createElement('tr');

        const actionCell = document.createElement('td');
        const modeCell = document.createElement('td');
        const definitionCell = document.createElement('td');
        const playerCell = document.createElement('td');
        const player2Cell = document.createElement('td');
        const x1Cell = document.createElement('td'); // New cell for X_1
        const y1Cell = document.createElement('td'); // New cell for Y_1
        const x2Cell = document.createElement('td'); // New cell for X_2
        const y2Cell = document.createElement('td'); // New cell for Y_2

        actionCell.textContent = entry.action;
        modeCell.textContent = entry.mode;
        definitionCell.textContent = entry.definition;
        playerCell.textContent = entry.player;
        player2Cell.textContent = entry.player2;
        
        if (entry.coordinates1) {
            const [x1, y1] = entry.coordinates1.slice(1, -1).split(', ');
            x1Cell.textContent = x1;
            y1Cell.textContent = y1;
        }
        
        if (entry.coordinates2) {
            const [x2, y2] = entry.coordinates2.slice(1, -1).split(', ');
            x2Cell.textContent = x2;
            y2Cell.textContent = y2;
        }

        row.appendChild(actionCell);
        row.appendChild(modeCell);
        row.appendChild(definitionCell);
        row.appendChild(playerCell);
        row.appendChild(player2Cell);
        row.appendChild(x1Cell); // Append X_1 cell
        row.appendChild(y1Cell); // Append Y_1 cell
        row.appendChild(x2Cell); // Append X_2 cell
        row.appendChild(y2Cell); // Append Y_2 cell

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = '&times;';
        deleteButton.setAttribute('aria-label', 'Delete entry');
        deleteButton.onclick = () => {
            if (confirm('Are you sure you want to delete this entry?')) {
                deleteEntry(index);
            }
        };

        const deleteCell = document.createElement('td');
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        summaryTableBody.appendChild(row);
    });
}

function deleteEntry(index) {
    actionsLog.splice(index, 1);
    updateSummary();
}

function updateCounters() {
    document.getElementById('counter-team-1').textContent = `${team1Goals}-${team1Points.toString().padStart(2, '0')}`;
    document.getElementById('counter-team-2').textContent = `${team2Goals}-${team2Points.toString().padStart(2, '0')}`;
}

function resetSelection() {
    currentAction = '';
    currentMode = '';
    currentDefinition = '';
    currentPlayer = '';
    secondPlayer = '';
    currentCoordinates1 = '';
    currentCoordinates2 = '';
    marker1 = { x: null, y: null };
    marker2 = { x: null, y: null };
    firstMarkerConfirmed = false;
}

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'review') {
        refreshReviewTab();  // Call the refresh function when the review tab is shown
    }
}

function showRenameInput(team) {
    if (team === '1') {
        document.getElementById('rename-team-1-input').style.display = 'inline';
        document.getElementById('confirm-rename-button-1').style.display = 'inline';
    } else if (team === '2') {
        document.getElementById('rename-team-2-input').style.display = 'inline';
        document.getElementById('confirm-rename-button-2').style.display = 'inline';
    }
}

function renameTeam(team) {
    if (team === '1') {
        const newName = document.getElementById('rename-team-1-input').value;
        if (newName.trim() !== '') {
            document.querySelectorAll('.counter-container .team-name')[0].textContent = `${newName}:`;
            document.getElementById('rename-team-1-input').style.display = 'none';
            document.getElementById('confirm-rename-button-1').style.display = 'none';
            document.getElementById('rename-team-1-input').value = ''; // Clear the input box
        } else {
            alert('Please enter a valid team name.');
        }
    } else if (team === '2') {
        const newName = document.getElementById('rename-team-2-input').value;
        if (newName.trim() !== '') {
            document.querySelectorAll('.counter-container .team-name')[1].textContent = `${newName}:`;
            document.getElementById('rename-team-2-input').style.display = 'none';
            document.getElementById('confirm-rename-button-2').style.display = 'none';
            document.getElementById('rename-team-2-input').value = ''; // Clear the input box
        } else {
            alert('Please enter a valid team name.');
        }
    }
}

function updatePlayerLabels() {
    for (let i = 1; i <= 15; i++) {
        document.querySelectorAll(`.player-button[aria-label="Select Player ${i}"]`).forEach(button => {
            button.textContent = playerNames[i];
        });
        document.querySelectorAll(`.player-button[aria-label="Select Receiver ${i}"]`).forEach(button => {
            button.textContent = playerNames[i];
        });
        document.getElementById(`player-${i}-button`).textContent = playerNames[i]; // Update home screen buttons
    }
}

function confirmChanges() {
    // Update team names
    const team1NewName = document.getElementById('rename-team-1-button').textContent.trim();
    const team2NewName = document.getElementById('rename-team-2-button').textContent.trim();

    if (team1NewName !== '') {
        document.querySelectorAll('.counter-container .team-name')[0].textContent = `${team1NewName}:`;
    } else {
        alert('Please enter a valid name for Team 1.');
        return;
    }

    if (team2NewName !== '') {
        document.querySelectorAll('.counter-container .team-name')[1].textContent = `${team2NewName}:`;
    } else {
        alert('Please enter a valid name for Team 2.');
        return;
    }

    // Update player names
    for (let i = 1; i <= 15; i++) {
        const button = document.getElementById(`player-${i}-button`);
        const newName = button.textContent.trim();
        if (newName !== '') {
            playerNames[i] = newName;
        } else {
            alert(`Please enter a valid name for Player ${i}.`);
            return;
        }
    }
    updatePlayerLabels();
    alert('Changes confirmed.');
}

document.querySelectorAll('button[contenteditable="true"]').forEach(button => {
    button.addEventListener('keydown', function(e) {
        if (e.key === ' ') {
            document.execCommand('insertHTML', false, ' ');
            e.preventDefault();
        }
    });
});

const canvas = document.getElementById('pitch');
const ctx = canvas.getContext('2d');
const confirmCoordinatesButton = document.getElementById('confirmCoordinatesButton');

let marker = { x: null, y: null };

// Draw the pitch lines
const drawLine = (startX, startY, endX, endY) => {
    ctx.beginPath();
    ctx.moveTo(mapX(startX), mapY(startY));
    ctx.lineTo(mapX(endX), mapY(endY));
    ctx.stroke();
};

// Map pitch coordinates to canvas coordinates
const mapX = x => (x / 80) * canvas.width;
const mapY = y => canvas.height - (y / 140) * canvas.height;

const drawPitch = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the pitch lines
    drawLine(0, 0, 80, 0);
    drawLine(0, 0, 0, 140);
    drawLine(0, 140, 80, 140);
    drawLine(80, 0, 80, 140);
    drawLine(0, 14, 80, 14);
    drawLine(0, 21, 80, 21);
    drawLine(0, 45, 80, 45);
    drawLine(0, 65, 80, 65);
    drawLine(0, 75, 80, 75);
    drawLine(0, 95, 80, 95);
    drawLine(0, 119, 80, 119);
    drawLine(0, 126, 80, 126);
    drawLine(35, 70, 45, 70);
    drawLine(32.5, 0, 32.5, 5);
    drawLine(47.5, 0, 47.5, 5);
    drawLine(32.5, 5, 47.5, 5);
    drawLine(30, 0, 30, 14);
    drawLine(50, 0, 50, 14);
    drawLine(32.5, 140, 32.5, 135);
    drawLine(47.5, 140, 47.5, 135);
    drawLine(32.5, 135, 47.5, 135);
    drawLine(30, 140, 30, 126);
    drawLine(50, 140, 50, 126);
    drawLine(36.5, 0, 36.5, -3);
    drawLine(43.5, 0, 43.5, -3);
    drawLine(36.5, -3, 43.5, -3);
    drawLine(36.5, 140, 36.5, 143);
    drawLine(43.5, 140, 43.5, 143);
    drawLine(36.5, 143, 43.5, 143);
    // Draw the rotated semicircle
    drawRotatedSemicircle(rotatedSemicircle);
    // Draw the clockwise rotated semicircle
    drawClockwiseRotatedSemicircle(clockwiseRotatedSemicircle);
}

function generateRotatedSemicircle(centerX, centerY, radius, points) {
    const theta = Array.from({ length: points }, (_, i) => Math.PI + (i / (points - 1)) * Math.PI);
    const x = theta.map(t => centerX + radius * Math.cos(t));
    const y = theta.map(t => centerY + radius * Math.sin(t));
    return x.map((xi, i) => ({ x: xi, y: y[i] }));
}

// Generate rotated semicircle coordinates
const rotatedSemicircle = generateRotatedSemicircle(40, 119, 13, 100);

// Function to draw the rotated semicircle
function drawRotatedSemicircle(semicircle) {
    ctx.beginPath();
    semicircle.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(mapX(point.x), mapY(point.y));
        } else {
            ctx.lineTo(mapX(point.x), mapY(point.y));
        }
    });
    ctx.stroke();
}

function generateClockwiseRotatedSemicircle(centerX, centerY, radius, points) {
    const theta = Array.from({ length: points }, (_, i) => Math.PI + (i / (points - 1)) * Math.PI);
    const x = theta.map(t => centerX - radius * Math.cos(t));
    const y = theta.map(t => centerY - radius * Math.sin(t));
    return x.map((xi, i) => ({ x: xi, y: y[i] }));
}

// Generate clockwise rotated semicircle coordinates
const clockwiseRotatedSemicircle = generateClockwiseRotatedSemicircle(40, 21, 13, 100);

// Function to draw the clockwise rotated semicircle
function drawClockwiseRotatedSemicircle(semicircle) {
    ctx.beginPath();
    semicircle.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(mapX(point.x), mapY(point.y));
        } else {
            ctx.lineTo(mapX(point.x), mapY(point.y));
        }
    });
    ctx.stroke();
}

// Draw the marker
const drawMarker = (x, y, color) => {
    ctx.beginPath();
    ctx.arc(mapX(x), mapY(y), 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
};

// Initial draw
drawPitch();

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 80;
    const y = 140 - ((e.clientY - rect.top) / canvas.height) * 140;
    
    if (!firstMarkerConfirmed) {
        marker1.x = x.toFixed(2);
        marker1.y = y.toFixed(2);
        drawPitch();
        drawMarker(marker1.x, marker1.y, 'blue'); // First marker in blue
        document.getElementById('coordinate-display-1').textContent = `X1: ${marker1.x}, Y1: ${marker1.y}`;
    } else {
        marker2.x = x.toFixed(2);
        marker2.y = y.toFixed(2);
        drawPitch();
        drawMarker(marker1.x, marker1.y, 'blue'); // Redraw the first marker
        drawMarker(marker2.x, marker2.y, 'red'); // Second marker in red
        document.getElementById('coordinate-display-2').textContent = `X2: ${marker2.x}, Y2: ${marker2.y}`;
    }
});

confirmCoordinatesButton.addEventListener('click', () => {
    if (currentAction === 'Handpass' || currentAction === 'Kickpass' || currentAction === 'Carry') {
        if (!firstMarkerConfirmed) {
            if (marker1.x !== null && marker1.y !== null) {
                currentCoordinates1 = `(${marker1.x}, ${marker1.y})`;
                firstMarkerConfirmed = true;
                document.getElementById('coordinate-display-2').style.display = 'block'; // Show second coordinate display
            } else {
                alert('Please place a marker on the pitch.');
            }
        } else {
            if (marker2.x !== null && marker2.y !== null) {
                currentCoordinates2 = `(${marker2.x}, ${marker2.y})`;
                switchScreen('player-buttons'); // Go to first player selection screen after confirming the second marker
            } else {
                alert('Please place the second marker on the pitch.');
            }
        }
    } else {
        if (marker1.x !== null && marker1.y !== null) {
            currentCoordinates1 = `(${marker1.x}, ${marker1.y})`;

            if ((currentAction === 'Point - Against' || currentAction === 'Goal - Against') && currentMode !== 'Mistake') {
                logAction(); // Log action directly for No Mistake
                switchScreen('action-buttons'); // Return to main stats screen
            } else if (currentAction === 'Miss - Against') {
                logAction(); // Log action directly for Miss - Against
                switchScreen('action-buttons'); // Return to main stats screen
            } else {
                switchScreen('player-buttons'); // Go to player selection screen for other actions
            }
        } else {
            alert('Please place a marker on the pitch.');
        }
    }
});

function toggleCoordinates() {
    coordinatesEnabled = document.getElementById('toggle-coordinates').checked;
}

function resetCoordinateScreen() {
    marker1 = { x: null, y: null };
    marker2 = { x: null, y: null };
    firstMarkerConfirmed = false;
    document.getElementById('coordinate-display-1').textContent = 'X1: -, Y1: -';
    document.getElementById('coordinate-display-2').textContent = 'X2: -, Y2: -';
    document.getElementById('coordinate-display-2').style.display = 'none';
    drawPitch(); // Redraw the pitch to clear markers
}

function exportSummaryToCSV() {
    const rows = [];
    const summaryTable = document.getElementById('summary-table');

    // Get the headers
    const headers = [];
    summaryTable.querySelectorAll('thead th').forEach(th => {
        headers.push(th.textContent);
    });
    rows.push(headers.join(','));

    // Get the rows
    summaryTable.querySelectorAll('tbody tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('td').forEach(td => {
            cells.push(td.textContent);
        });
        rows.push(cells.join(','));
    });

    // Create CSV string
    const csvContent = rows.join('\n');

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Get team names
    const team1Name = document.querySelectorAll('.counter-container .team-name')[0].textContent.slice(0, -1);
    const team2Name = document.querySelectorAll('.counter-container .team-name')[1].textContent.slice(0, -1);

    // Create a link to download the Blob
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${team1Name} - ${team2Name}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const reviewCanvas = document.getElementById('review-pitch');
const reviewCtx = reviewCanvas.getContext('2d');

const drawReviewPitch = () => {
    reviewCtx.clearRect(0, 0, reviewCanvas.width, reviewCanvas.height);

    const drawReviewLine = (startX, startY, endX, endY) => {
        reviewCtx.beginPath();
        reviewCtx.moveTo(mapX(startX), mapYReview(startY));
        reviewCtx.lineTo(mapX(endX), mapYReview(endY));
        reviewCtx.strokeStyle = 'black';  // Ensure the line color is black
        reviewCtx.stroke();
    };

    drawReviewLine(0, 0, 80, 0);
    drawReviewLine(0, 0, 0, 140);
    drawReviewLine(0, 140, 80, 140);
    drawReviewLine(80, 0, 80, 140);
    drawReviewLine(0, 14, 80, 14);
    drawReviewLine(0, 21, 80, 21);
    drawReviewLine(0, 45, 80, 45);
    drawReviewLine(0, 65, 80, 65);
    drawReviewLine(0, 75, 80, 75);
    drawReviewLine(0, 95, 80, 95);
    drawReviewLine(0, 119, 80, 119);
    drawReviewLine(0, 126, 80, 126);
    drawReviewLine(35, 70, 45, 70);
    drawReviewLine(32.5, 0, 32.5, 5);
    drawReviewLine(47.5, 0, 47.5, 5);
    drawReviewLine(32.5, 5, 47.5, 5);
    drawReviewLine(30, 0, 30, 14);
    drawReviewLine(50, 0, 50, 14);
    drawReviewLine(32.5, 140, 32.5, 135);
    drawReviewLine(47.5, 140, 47.5, 135);
    drawReviewLine(32.5, 135, 47.5, 135);
    drawReviewLine(30, 140, 30, 126);
    drawReviewLine(50, 140, 50, 126);
    drawReviewLine(36.5, 0, 36.5, -3);
    drawReviewLine(43.5, 0, 43.5, -3);
    drawReviewLine(36.5, -3, 43.5, -3);
    drawReviewLine(36.5, 140, 36.5, 143);
    drawReviewLine(43.5, 140, 43.5, 143);
    drawReviewLine(36.5, 143, 43.5, 143);

    drawReviewRotatedSemicircle(rotatedSemicircle);
    drawReviewClockwiseRotatedSemicircle(clockwiseRotatedSemicircle);
};

const drawReviewRotatedSemicircle = (semicircle) => {
    reviewCtx.beginPath();
    semicircle.forEach((point, index) => {
        if (index === 0) {
            reviewCtx.moveTo(mapX(point.x), mapYReview(point.y));
        } else {
            reviewCtx.lineTo(mapX(point.x), mapYReview(point.y));
        }
    });
    reviewCtx.strokeStyle = 'black';  // Ensure the line color is black
    reviewCtx.stroke();
};

const drawReviewClockwiseRotatedSemicircle = (semicircle) => {
    reviewCtx.beginPath();
    semicircle.forEach((point, index) => {
        if (index === 0) {
            reviewCtx.moveTo(mapX(point.x), mapYReview(point.y));
        } else {
            reviewCtx.lineTo(mapX(point.x), mapYReview(point.y));
        }
    });
    reviewCtx.strokeStyle = 'black';  // Ensure the line color is black
    reviewCtx.stroke();
};

const mapYReview = y => reviewCanvas.height - (y / 140) * reviewCanvas.height;

let reviewMarkers = []; // Store marker positions

const drawReviewMarker = (x, y, color, entry, actionType) => {
    reviewCtx.beginPath();
    reviewCtx.arc(mapX(x), mapYReview(y), 5, 0, Math.PI * 2);
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
    reviewCtx.strokeStyle = color;
    reviewCtx.stroke();

    reviewMarkers.push({ x, y, entry, color });
};

const filterActions = () => {
    const showOwnShots = document.getElementById('toggle-own-shots').checked;
    const showFoulsWon = document.getElementById('toggle-fouls-won').checked;
    const showHandpasses = document.getElementById('toggle-handpasses').checked;
    const showKickpasses = document.getElementById('toggle-kickpasses').checked;
    const showCarries = document.getElementById('toggle-carries').checked;
    const showUnforcedErrors = document.getElementById('toggle-unforced-errors').checked;
    const showForcedErrors = document.getElementById('toggle-forced-errors').checked;

    // Clear the pitch and remove any existing markers
    drawReviewPitch();
    reviewMarkers = []; // Clear existing markers

    // Iterate over actionsLog and display markers based on toggle states
    actionsLog.forEach(entry => {
        const [x1, y1] = entry.coordinates1.slice(1, -1).split(', ').map(Number);
        const [x2, y2] = entry.coordinates2 ? entry.coordinates2.slice(1, -1).split(', ').map(Number) : [];

        if (showOwnShots) {
            if (entry.action === 'Point - Score') {
                drawReviewMarker(x1, y1, 'blue', entry, 'Point - Score');
            } else if (entry.action === 'Point - Miss') {
                drawReviewMarker(x1, y1, 'red', entry, 'Point - Miss');
            } else if (entry.action === 'Goal - Score') {
                drawReviewMarker(x1, y1, 'green', entry, 'Goal - Score');
            } else if (entry.action === 'Goal - Miss') {
                drawReviewMarker(x1, y1, 'orange', entry, 'Goal - Miss');
            }
        }

        if (showFoulsWon && entry.action === 'Free Won') {
            drawReviewMarker(x1, y1, 'purple', entry, 'Free Won');
        }

        if (showHandpasses && entry.action === 'Handpass') {
            drawPassMarkersAndArrow(x1, y1, x2, y2, 'black', entry);
        }

        if (showKickpasses && entry.action === 'Kickpass') {
            drawPassMarkersAndArrow(x1, y1, x2, y2, 'navy', entry, 'Kickpass');
        }

        if (showCarries && entry.action === 'Carry') {
            drawPassMarkersAndArrow(x1, y1, x2, y2, 'white', entry, 'Carry');
        }

        if (showUnforcedErrors && entry.action === 'Ball - Lost' && entry.mode === 'Unforced') {
            drawReviewMarker(x1, y1, 'pink', entry, 'Ball - Lost');
        }

        if (showForcedErrors && entry.action === 'Ball - Lost' && entry.mode === 'Forced') {
            drawReviewMarker(x1, y1, 'white', entry, 'Ball - Lost');
        }
    });
};

const handleCanvasClick = (e) => {
    const rect = reviewCanvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / reviewCanvas.width) * 80;
    const clickY = 140 - ((e.clientY - rect.top) / reviewCanvas.height) * 140;

    let clickedMarker = null;

    reviewMarkers.forEach(marker => {
        const { x, y, entry, color } = marker;
        if (Math.abs(clickX - x) < 2 && Math.abs(clickY - y) < 2) {
            clickedMarker = { x, y, entry, color };
        }
    });

    // Remove any existing summary box
    const existingSummaryBox = document.getElementById('summary-box');
    if (existingSummaryBox) {
        existingSummaryBox.remove();
    }

    if (clickedMarker) {
        showSummaryBox(e.clientX, e.clientY, clickedMarker.entry, clickedMarker.color);
        e.stopPropagation(); // Prevent click event from propagating
    }
};

function showSummaryBox(x, y, entry, color) {
    const summaryBox = document.createElement('div');
    summaryBox.id = 'summary-box';
    summaryBox.style.position = 'absolute';
    summaryBox.style.left = `${x}px`;
    summaryBox.style.top = `${y}px`;
    summaryBox.style.padding = '10px';
    summaryBox.style.border = `2px solid ${color}`;
    summaryBox.style.backgroundColor = 'white';
    summaryBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    summaryBox.style.zIndex = '1000';

    const [coordX1, coordY1] = entry.coordinates1.slice(1, -1).split(', ');
    const [coordX2, coordY2] = entry.coordinates2 ? entry.coordinates2.slice(1, -1).split(', ') : [];
    const distance = coordX2 && coordY2 ? calculateDistance(coordX1, coordY1, coordX2, coordY2) : '';

    if (entry.action === 'Point - Score') {
        summaryBox.innerHTML = `
            <p><strong>Player:</strong> ${entry.player}</p>
            <p><strong>Action:</strong> Point - Score</p>
            <p><strong>Type:</strong> ${entry.mode}</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords:</strong> (${coordX1}, ${coordY1})</p>
        `;
    } else if (entry.action === 'Point - Miss') {
        summaryBox.innerHTML = `
            <p><strong>Player:</strong> ${entry.player}</p>
            <p><strong>Action:</strong> Point - Miss</p>
            <p><strong>Type:</strong> ${entry.definition}</p>
            <p><strong>How:</strong> ${entry.mode}</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords:</strong> (${coordX1}, ${coordY1})</p>
        `;
    } else if (entry.action === 'Goal - Score') {
        summaryBox.innerHTML = `
            <p><strong>Player:</strong> ${entry.player}</p>
            <p><strong>Action:</strong> Goal - Score</p>
            <p><strong>Type:</strong> ${entry.mode}</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords:</strong> (${coordX1}, ${coordY1})</p>
        `;
    } else if (entry.action === 'Goal - Miss') {
        summaryBox.innerHTML = `
            <p><strong>Player:</strong> ${entry.player}</p>
            <p><strong>Action:</strong> Goal - Miss</p>
            <p><strong>Type:</strong> ${entry.definition}</p>
            <p><strong>How:</strong> ${entry.mode}</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords:</strong> (${coordX1}, ${coordY1})</p>
        `;
    } else if (entry.action === 'Free Won') {
        summaryBox.innerHTML = `
            <p><strong>Player:</strong> ${entry.player}</p>
            <p><strong>Action:</strong> Free Won</p>
            <p><strong>Type:</strong> ${entry.mode}</p>
            <p><strong>Card:</strong> ${entry.definition}</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords:</strong> (${coordX1}, ${coordY1})</p>
        `;
    } else if (entry.action === 'Handpass') {
        summaryBox.innerHTML = `
            <p><strong>Action:</strong> Handpass</p>
            <p><strong>Pass:</strong> ${entry.player}</p>
            <p><strong>To:</strong> ${entry.player2}</p>
            <p><strong>Dist:</strong> ${distance}m</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords_1:</strong> (${coordX1}, ${coordY1})</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords_2:</strong> (${coordX2}, ${coordY2})</p>
        `;
    } else if (entry.action === 'Kickpass') {
        summaryBox.innerHTML = `
            <p><strong>Action:</strong> Kickpass</p>
            <p><strong>Pass:</strong> ${entry.player}</p>
            <p><strong>To:</strong> ${entry.player2}</p>
            <p><strong>Dist:</strong> ${distance}m</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords_1:</strong> (${coordX1}, ${coordY1})</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords_2:</strong> (${coordX2}, ${coordY2})</p>
        `;
    } else if (entry.action === 'Carry') {
        summaryBox.innerHTML = `
            <p><strong>Action:</strong> Carry</p>
            <p><strong>Run:</strong> ${entry.mode}</p>
            <p><strong>Player:</strong> ${entry.player}</p>
            <p><strong>Dist:</strong> ${distance}m</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords_1:</strong> (${coordX1}, ${coordY1})</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords_2:</strong> (${coordX2}, ${coordY2})</p>
        `;
    } else if (entry.action === 'Ball - Lost' && entry.mode === 'Unforced') {
        summaryBox.innerHTML = `
            <p><strong>Action:</strong> Ball - Lost</p>
            <p><strong>Type:</strong> Unforced</p>
            <p><strong>How:</strong> ${entry.definition}</p>
            <p><strong>Player:</strong> ${entry.player}</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords:</strong> (${coordX1}, ${coordY1})</p>
        `;
    } else if (entry.action === 'Ball - Lost' && entry.mode === 'Forced') {
        summaryBox.innerHTML = `
            <p><strong>Action:</strong> Ball - Lost</p>
            <p><strong>Type:</strong> Forced</p>
            <p><strong>How:</strong> ${entry.definition}</p>
            <p><strong>Player:</strong> ${entry.player}</p>
            <p style="font-size: small; margin-top: 10px;"><strong>Coords:</strong> (${coordX1}, ${coordY1})</p>
        `;
    }

    document.body.appendChild(summaryBox);

    // Remove any existing event listener to prevent duplication
    document.removeEventListener('click', handleDocumentClick);

    function handleDocumentClick(event) {
        const isClickInsideSummaryBox = summaryBox.contains(event.target);
        if (!isClickInsideSummaryBox) {
            summaryBox.remove();
            document.removeEventListener('click', handleDocumentClick);
        }
    }

    document.addEventListener('click', handleDocumentClick);
}

const drawPassMarkersAndArrow = (x1, y1, x2, y2, color, entry, actionType) => {
    // Draw the start marker
    drawReviewMarker(x1, y1, color, entry, `${actionType} Start`);

    // Draw the end marker
    drawReviewMarker(x2, y2, color, entry, `${actionType} End`);

    // Draw the arrow connecting the two markers
    reviewCtx.beginPath();
    reviewCtx.moveTo(mapX(x1), mapYReview(y1));
    reviewCtx.lineTo(mapX(x2), mapYReview(y2));
    reviewCtx.strokeStyle = color;
    reviewCtx.stroke();

    // Draw the filled arrowhead
    const headlen = 15; // length of head in pixels
    const angle = Math.atan2(mapYReview(y2) - mapYReview(y1), mapX(x2) - mapX(x1));
    reviewCtx.beginPath();
    reviewCtx.moveTo(mapX(x2), mapYReview(y2));
    reviewCtx.lineTo(mapX(x2) - headlen * Math.cos(angle - Math.PI / 6), mapYReview(y2) - headlen * Math.sin(angle - Math.PI / 6));
    reviewCtx.lineTo(mapX(x2) - headlen * Math.cos(angle + Math.PI / 6), mapYReview(y2) - headlen * Math.sin(angle + Math.PI / 6));
    reviewCtx.lineTo(mapX(x2), mapYReview(y2));
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
};

reviewCanvas.addEventListener('click', handleCanvasClick);

// Event listeners for toggles
document.getElementById('toggle-own-shots').addEventListener('change', filterActions);
document.getElementById('toggle-fouls-won').addEventListener('change', filterActions);
document.getElementById('toggle-handpasses').addEventListener('change', filterActions);
document.getElementById('toggle-kickpasses').addEventListener('change', filterActions);
document.getElementById('toggle-carries').addEventListener('change', filterActions);
document.getElementById('toggle-unforced-errors').addEventListener('change', filterActions);
document.getElementById('toggle-forced-errors').addEventListener('change', filterActions);

// Call filterActions on load to ensure markers are managed based on initial state
filterActions();

const refreshReviewTab = () => {
    filterActions();
};

const calculateDistance = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy).toFixed(2);
};
