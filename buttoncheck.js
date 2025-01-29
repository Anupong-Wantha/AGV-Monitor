// // Utility function to fetch data from an API
// async function fetchData(url) {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error(`Error fetching data from ${url}:`, error);
//     return []; // Return an empty array if an error occurs
//   }
// }

// // Function to create AGV buttons based on provided data and configuration
// function createButtons(containerId, agvData, statusData, statusCheck, urlPath) {
//   const container = document.getElementById(containerId);
//   if (!container) {
//     console.error(`${containerId} container not found.`);
//     return;
//   }

//   container.innerHTML = ''; // Clear container to avoid duplicate buttons

//   agvData.forEach(agv => {
//     const button = document.createElement('button');
//     button.classList.add('btn', 'btn-outline-light', 'm-2');
//     button.type = 'button';
//     button.textContent = agv.agv_name + " ";

//     // Add tooltip (title attribute) if the status indicates an alert
//     if (statusCheck(statusData, agv.agv_name)) {
//       button.title = 'Emergency Stop has been triggered. Check AGV for possible obstruction or fault.';
//     } else {
//       button.title = 'AGV is operating normally.';
//     }

//     // Determine the indicator status based on the statusCheck function
//     const indicator = document.createElement('div');
//     indicator.style.display = 'inline-block';
//     indicator.classList.add(statusCheck(statusData, agv.agv_name) ? 'led-red' : 'led-green');
//     button.appendChild(indicator);

//     // Set the button click event to navigate to the detail page
//     button.onclick = () => {
//       window.location.href = `${urlPath}?agv_number=${agv.agv_name}`;
//     };

//     container.appendChild(button);
//   });
// }

// // Function to check if there is a d5004 value for the AGV
// function isAlertStatus(latestData, agvName) {
//   return latestData.some(item => item.agv_name === agvName && item.d5004);
// }

// // Function to check if the status bit is 1 for the AGV
// function isStatusBitActive(statusData, agvName) {
//   const statusItem = statusData.find(item => item.agv_name === agvName);
//   return statusItem && statusItem.status === 1;
// }

// // Main function to fetch data and create buttons
// async function setupAGVButtons() {
//   const [agvData, latestAGVWord, latestStatus] = await Promise.all([
//     fetchData('http://10.7.3.76:1880/agvdata'),
//     fetchData('http://10.7.3.76:1880/get-latest-agv-word'),
//     fetchData('http://10.7.3.76:1880/get-latest-agv-bit')
//   ]);

//   if (!Array.isArray(agvData) || !agvData.length) {
//     console.error('Failed to fetch or process AGV data.');
//     return;
//   }

//   createButtons('agv-buttons', agvData, latestAGVWord, isAlertStatus, 'detailagv.html');
//   createButtons('agv-button-panel', agvData, latestStatus, isStatusBitActive, 'detailagv.html');
// }

// // Initialize AGV button setup on page load
// window.onload = setupAGVButtons;
// Utility function to fetch data with backup support
async function fetchDataWithBackup(url, storageKey) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    localStorage.setItem(storageKey, JSON.stringify(data)); // Store latest data
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    const backupData = localStorage.getItem(storageKey);
    return backupData ? JSON.parse(backupData) : []; // Load backup data if available
  }
}

// Function to create AGV buttons based on provided data and configuration
function createButtons(containerId, agvData, statusData, statusCheck, urlPath) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`${containerId} container not found.`);
    return;
  }

  container.innerHTML = ''; // Clear container to avoid duplicate buttons

  agvData.forEach(agv => {
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-light', 'm-2');
    button.type = 'button';
    button.textContent = agv.agv_name + " ";

    // Add tooltip (title attribute) if the status indicates an alert
    if (statusCheck(statusData, agv.agv_name)) {
      button.title = 'Emergency Stop has been triggered. Check AGV for possible obstruction or fault.';
    } else {
      button.title = 'AGV is operating normally.';
    }

    // Determine the indicator status based on the statusCheck function
    const indicator = document.createElement('div');
    indicator.style.display = 'inline-block';
    indicator.classList.add(statusCheck(statusData, agv.agv_name) ? 'led-red' : 'led-green');
    button.appendChild(indicator);

    // Set the button click event to navigate to the detail page
    button.onclick = () => {
      window.location.href = `${urlPath}?agv_number=${agv.agv_name}`;
    };

    container.appendChild(button);
  });
}

// Function to check if there is a d5004 value for the AGV
function isAlertStatus(latestData, agvName) {
  return latestData.some(item => item.agv_name === agvName && item.d5004);
}

// Function to check if the status bit is 1 for the AGV
function isStatusBitActive(statusData, agvName) {
  const statusItem = statusData.find(item => item.agv_name === agvName);
  return statusItem && statusItem.status === 1;
}

// Main function to fetch data and create buttons with backup support
async function setupAGVButtons() {
  const [agvData, latestAGVWord, latestStatus] = await Promise.all([
    fetchDataWithBackup('http://10.7.3.76:1880/agvdata', 'agvDataBackup'),
    fetchDataWithBackup('http://10.7.3.76:1880/get-latest-agv-word', 'latestAGVWordBackup'),
    fetchDataWithBackup('http://10.7.3.76:1880/get-latest-agv-bit', 'latestAGVBitBackup')
  ]);

  if (!Array.isArray(agvData) || !agvData.length) {
    console.error('Failed to fetch or process AGV data.');
    return;
  }

  createButtons('agv-buttons', agvData, latestAGVWord, isAlertStatus, 'detailagv.html');
  createButtons('agv-button-panel', agvData, latestStatus, isStatusBitActive, 'detailagv.html');
}

// Initialize AGV button setup on page load with periodic updates
setupAGVButtons();
setInterval(setupAGVButtons, 3000);
