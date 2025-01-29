// // Utility function to fetch JSON data
// function fetchData(url) {
//     return fetch(url)
//         .then(response => {
//             if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
//             return response.json();
//         })
//         .catch(error => {
//             console.error(`Error fetching data from ${url}:`, error);
//             return [];
//         });
// }

// // Display AGV Buttons
// function displayAGVButtons(data) {
//     const container = document.getElementById('agv-buttons');
//     container.innerHTML = ''; // Clear previous content

//     data.filter(agv => agv.d5004 > 0).forEach(agv => {
//         const button = document.createElement('button');
//         button.textContent = agv.agv_name;
//         button.className = 'btn btn-outline-light';
//         button.setAttribute('data-bs-toggle', 'tooltip');
//         button.setAttribute('data-bs-title', `AGV Name: ${agv.agvName}\nAlarm Code: ${agv.aalrmcode || 'No Alarm Code'}`);

//         // Add emergency icon
//         const img = document.createElement('img');
//         img.src = 'emergency.png';
//         img.alt = 'Emergency Icon';
//         img.style.width = '30px';
//         img.style.height = '30px';
//         img.style.marginRight = '8px';
//         button.prepend(img);

//         // Click event
//         button.addEventListener('click', () => {
//             const alarmID = agv.aalrmcode || agv.d5004;
//             if (alarmID) {
//                 window.location.href = `stat.html?alarmID=${alarmID}`;
//             } else {
//                 alert('Alarm ID is not available.');
//             }
//         });

//         container.appendChild(button);
//     });

//     // Enable Bootstrap tooltips
//     const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
//     tooltipTriggerList.forEach(tooltipTriggerEl => {
//         new bootstrap.Tooltip(tooltipTriggerEl);
//     });
// }


// // Display AGV Alarms in Table
// function displayAGVWithAlarms(data) {
//     const tableBody = document.getElementById('agv-alarms-rows');
//     tableBody.innerHTML = ''; // Clear previous content

//     data.filter(agv => agv.d5004 > 0).forEach(agv => {
//         const row = document.createElement('tr');

//         // Column 1: AGV Button
//         const agvCell = document.createElement('td');
//         const button = document.createElement('button');
//         button.textContent = agv.agv_name;
//         button.className = 'btn btn-outline-light ';
        
//         const img = document.createElement('img');
//         img.src = 'emergency.png';
//         img.alt = 'Emergency Icon';
//         img.style.width = '20px';
//         img.style.height = '20px';
//         img.style.marginRight = '8px';
//         button.prepend(img);
//         button.addEventListener('click', () => {
//             window.location.href = `stat.html?agvID=${agv.agvName}`;
//         });
//         agvCell.appendChild(button);
//         row.appendChild(agvCell);

//         // Column 2: Alarm Description
//         const alarmCell = document.createElement('td');
//         alarmCell.textContent = agv.aalrmdescription || 'No Alarm Data';
//         row.appendChild(alarmCell);

//         // Column 3: Status Icon
//         const statusCell = document.createElement('td');
//         const statusImg = document.createElement('img');
//         statusImg.src = agv.d5004 === 420 ? 'low.png' : 'full.png';
//         statusImg.alt = agv.d5004 === 420 ? 'Emergency Icon' : 'Normal Icon';
//         statusImg.style.width = '30px';
//         statusImg.style.height = '30px';
//         statusImg.style.display = 'block';
//         statusImg.style.margin = '0 auto';
//         statusCell.appendChild(statusImg);
//         row.appendChild(statusCell);

//         tableBody.appendChild(row);
//     });
// }

// // Fetch and Display Functions
// function updateAGVData() {
//     fetchData('http://10.7.9.51:6100/api/AGV/log/words').then(data => {
//         displayAGVButtons(data);
//         displayAGVWithAlarms(data);
//     });
// }

// function updateAGVNames() {
//     fetchData('http://10.7.9.51:6100/api/AGV/names').then(data => {
//         const buttonContainer = document.getElementById('buttonContainer');
//         buttonContainer.innerHTML = ''; // Clear old buttons

//         data.forEach(agv => {
//             const button = document.createElement('button');
//             button.textContent = agv.agv_name;
//             button.className = 'btn btn-outline-light';
//             button.onclick = () => {
//                 window.location.href = `detailagv.html?agv_number=${agv.agvName}`;
//             };
//             buttonContainer.appendChild(button);
//         });
//     });
// }

// // Periodic Updates
// updateAGVData();
// updateAGVNames();
// setInterval(() => {
//     updateAGVData();
//     updateAGVNames();
// }, 10000);
// Utility function to fetch JSON data with backup support
function fetchDataWithBackup(url, storageKey) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
            return response.json();
        })
        .then(data => {
            localStorage.setItem(storageKey, JSON.stringify(data)); // Store latest data
            return data;
        })
        .catch(error => {
            console.error(`Error fetching data from ${url}:`, error);
            const backupData = localStorage.getItem(storageKey);
            return backupData ? JSON.parse(backupData) : []; // Load backup data if available
        });
}

// Display AGV Buttons
function displayAGVButtons(data) {
    const container = document.getElementById('agv-buttons');
    // container.innerHTML = ''; // Clear previous content

    data.filter(agv => agv.d5004 > 0).forEach(agv => {
        const button = document.createElement('button');
        button.textContent = agv.agv_name;
        button.className = 'btn btn-outline-light';
        button.setAttribute('data-bs-toggle', 'tooltip');
        button.setAttribute('data-bs-title', `AGV Name: ${agv.agvName}\nAlarm Code: ${agv.aalrmcode || 'No Alarm Code'}`);

        // Add emergency icon
        const img = document.createElement('img');
        img.src = 'emergency.png';
        img.alt = 'Emergency Icon';
        img.style.width = '30px';
        img.style.height = '30px';
        img.style.marginRight = '8px';
        button.prepend(img);

        // Click event
        button.addEventListener('click', () => {
            const alarmID = agv.aalrmcode || agv.d5004;
            if (alarmID) {
                window.location.href = `stat.html?alarmID=${alarmID}`;
            } else {
                alert('Alarm ID is not available.');
            }
        });

        container.appendChild(button);
    });

    // Enable Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Display AGV Alarms in Table
function displayAGVWithAlarms(data) {
    const tableBody = document.getElementById('agv-alarms-rows');
    tableBody.innerHTML = ''; // Clear previous content

    data.filter(agv => agv.d5004 > 0).forEach(agv => {
        const row = document.createElement('tr');

        // Column 1: AGV Button
        const agvCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = agv.agv_name;
        button.className = 'btn btn-outline-light ';
        
        const img = document.createElement('img');
        img.src = 'emergency.png';
        img.alt = 'Emergency Icon';
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.marginRight = '8px';
        button.prepend(img);
        button.addEventListener('click', () => {
            window.location.href = `stat.html?agvID=${agv.agvName}`;
        });
        agvCell.appendChild(button);
        row.appendChild(agvCell);

        // Column 2: Alarm Description
        const alarmCell = document.createElement('td');
        alarmCell.textContent = agv.aalrmdescription || 'No Alarm Data';
        row.appendChild(alarmCell);

        // Column 3: Status Icon
        const statusCell = document.createElement('td');
        const statusImg = document.createElement('img');
        statusImg.src = agv.d5004 === 420 ? 'low.png' : 'full.png';
        statusImg.alt = agv.d5004 === 420 ? 'Emergency Icon' : 'Normal Icon';
        statusImg.style.width = '30px';
        statusImg.style.height = '30px';
        statusImg.style.display = 'block';
        statusImg.style.margin = '0 auto';
        statusCell.appendChild(statusImg);
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    });
}

// Fetch and Display Functions
function updateAGVData() {
    fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/log/words', 'agvWordsBackup')
        .then(data => {
            displayAGVButtons(data);
            displayAGVWithAlarms(data);
        });
}

function updateAGVNames() {
    fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/names', 'agvNamesBackup')
        .then(data => {
            const buttonContainer = document.getElementById('buttonContainer');
            // buttonContainer.innerHTML = ''; // Clear old buttons

            data.forEach(agv => {
                const button = document.createElement('button');
                button.textContent = agv.agv_name;
                button.className = 'btn btn-outline-light';
                button.onclick = () => {
                    window.location.href = `detailagv.html?agv_number=${agv.agvName}`;
                };
                buttonContainer.appendChild(button);
            });
        });
}

// Periodic Updates
updateAGVData();
updateAGVNames();
setInterval(() => {
    updateAGVData();
    updateAGVNames();
}, 10000);
