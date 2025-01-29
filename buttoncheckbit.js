// // ฟังก์ชันเรียกข้อมูลจาก API ตัวแรกเพื่อดึงข้อมูล AGV
// async function retrieveAGVDetails() {
//     try {
//       const response = await fetch('http://10.7.3.76:1880/agvdata');
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       return await response.json();
//     } catch (error) {
//       console.error('Error fetching AGV details:', error);
//       return [];
//     }
//   }
  
//   // ฟังก์ชันเรียกข้อมูลจาก API ตัวที่สองเพื่อดึงข้อมูลล่าสุดและตรวจสอบสถานะ
//   async function retrieveLatestAGVStatus() {
//     try {
//       const response = await fetch('http://10.7.3.76:1880/get-latest-agv-status');
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       return await response.json();
//     } catch (error) {
//       console.error('Error fetching latest AGV status:', error);
//       return [];
//     }
//   }
  
//   // ฟังก์ชันหลักที่ใช้ในการสร้างปุ่มและตรวจสอบข้อมูล
//   async function setupAGVButtons() {
//     try {
//       let agvDetails = await retrieveAGVDetails();
//       let latestStatus = await retrieveLatestAGVStatus();
  
//       if (!Array.isArray(agvDetails) || !agvDetails.length || !Array.isArray(latestStatus) || !latestStatus.length) {
//         console.error('Failed to fetch or process data.');
//         return;
//       }
  
//       let panelContainer = document.getElementById('agv-button-panel');
  
//       if (!panelContainer) {
//         console.error('agv-button-panel container not found.');
//         return;
//       }
  
//       panelContainer.innerHTML = '';
  
//       agvDetails.forEach(agv => {
//         const agvContainer = document.createElement('div');
//         agvContainer.classList.add('agv-item', 'd-flex', 'align-items-center', 'mb-2');
  
//         // สร้างปุ่ม AGV
//         const buttonElement = document.createElement('button');
//         buttonElement.classList.add('btn', 'btn-outline-secondary', 'me-3');
//         buttonElement.type = 'button';
//         buttonElement.textContent = agv.agv_number;
  
//         // สร้างสัญลักษณ์สถานะ
//         const agvBitStatus = latestStatus.find(item => item.agv_number === agv.agv_number);
//         const statusIndicator = document.createElement('span');
//         statusIndicator.style.display = 'inline-block';
//         statusIndicator.classList.add('ms-2', agvBitStatus && agvBitStatus.status === 1 ? 'led-warning' : 'led-stable');
//         buttonElement.appendChild(statusIndicator);
  
//         // สร้างข้อความแสดงสถานะล่าสุด
//         const statusText = document.createElement('span');
//         statusText.classList.add('status-text', 'ms-3');
//         statusText.textContent = agvBitStatus && agvBitStatus.status_message ? agvBitStatus.status_message : 'Unknown';
  
//         // สร้างข้อความแสดงวันเวลา
//         const timestampText = document.createElement('span');
//         timestampText.classList.add('timestamp-text', 'ms-3');
//         timestampText.textContent = agvBitStatus && agvBitStatus.timestamp ? new Date(agvBitStatus.timestamp).toLocaleString() : 'No timestamp';
  
//         // เพิ่มองค์ประกอบลงใน agvContainer
//         agvContainer.appendChild(buttonElement);
//         agvContainer.appendChild(statusText);
//         agvContainer.appendChild(timestampText);
//         panelContainer.appendChild(agvContainer);
//       });
//     } catch (error) {
//       console.error('Error setting up AGV buttons:', error);
//     }
//   }
  
//   window.onload = setupAGVButtons;
// ฟังก์ชันเรียกข้อมูลจาก API พร้อมระบบสำรองข้อมูล (Backup)
async function fetchDataWithBackup(url, storageKey) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      localStorage.setItem(storageKey, JSON.stringify(data)); // บันทึกข้อมูลล่าสุดใน localStorage
      return data;
  } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      const backupData = localStorage.getItem(storageKey);
      return backupData ? JSON.parse(backupData) : []; // โหลดข้อมูลสำรองถ้ามี
  }
}

// ฟังก์ชันเรียกข้อมูลจาก API ตัวแรกเพื่อดึงข้อมูล AGV
async function retrieveAGVDetails() {
  return fetchDataWithBackup('http://10.7.3.76:1880/agvdata', 'agvDetailsBackup');
}

// ฟังก์ชันเรียกข้อมูลจาก API ตัวที่สองเพื่อดึงข้อมูลล่าสุดและตรวจสอบสถานะ
async function retrieveLatestAGVStatus() {
  return fetchDataWithBackup('http://10.7.3.76:1880/get-latest-agv-status', 'latestAGVStatusBackup');
}

// ฟังก์ชันหลักที่ใช้ในการสร้างปุ่มและตรวจสอบข้อมูล
async function setupAGVButtons() {
  try {
      let agvDetails = await retrieveAGVDetails();
      let latestStatus = await retrieveLatestAGVStatus();

      if (!Array.isArray(agvDetails) || !agvDetails.length || !Array.isArray(latestStatus) || !latestStatus.length) {
          console.error('Failed to fetch or process data.');
          return;
      }

      let panelContainer = document.getElementById('agv-button-panel');

      if (!panelContainer) {
          console.error('agv-button-panel container not found.');
          return;
      }

      panelContainer.innerHTML = '';

      agvDetails.forEach(agv => {
          const agvContainer = document.createElement('div');
          agvContainer.classList.add('agv-item', 'd-flex', 'align-items-center', 'mb-2');

          // สร้างปุ่ม AGV
          const buttonElement = document.createElement('button');
          buttonElement.classList.add('btn', 'btn-outline-secondary', 'me-3');
          buttonElement.type = 'button';
          buttonElement.textContent = agv.agv_number;

          // สร้างสัญลักษณ์สถานะ
          const agvBitStatus = latestStatus.find(item => item.agv_number === agv.agv_number);
          const statusIndicator = document.createElement('span');
          statusIndicator.style.display = 'inline-block';
          statusIndicator.classList.add('ms-2', agvBitStatus && agvBitStatus.status === 1 ? 'led-warning' : 'led-stable');
          buttonElement.appendChild(statusIndicator);

          // สร้างข้อความแสดงสถานะล่าสุด
          const statusText = document.createElement('span');
          statusText.classList.add('status-text', 'ms-3');
          statusText.textContent = agvBitStatus && agvBitStatus.status_message ? agvBitStatus.status_message : 'Unknown';

          // สร้างข้อความแสดงวันเวลา
          const timestampText = document.createElement('span');
          timestampText.classList.add('timestamp-text', 'ms-3');
          timestampText.textContent = agvBitStatus && agvBitStatus.timestamp ? new Date(agvBitStatus.timestamp).toLocaleString() : 'No timestamp';

          // เพิ่มองค์ประกอบลงใน agvContainer
          agvContainer.appendChild(buttonElement);
          agvContainer.appendChild(statusText);
          agvContainer.appendChild(timestampText);
          panelContainer.appendChild(agvContainer);
      });
  } catch (error) {
      console.error('Error setting up AGV buttons:', error);
  }
}

// อัปเดตข้อมูลทุก 10 วินาที
setupAGVButtons();
setInterval(setupAGVButtons, 3000);

  
  