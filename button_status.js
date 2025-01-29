// async function fetchAGVStatus() {
//     try {
//         const response = await fetch('http://10.7.3.76:1880/getstatusagv');
//         // const response = await fetch('http://10.7.9.51:6100/api/AGV/names');
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const agvDetails = await response.json();
//         displayAGVStatus(agvDetails);
//     } catch (error) {
//         console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
//     }
// }

// // ฟังก์ชันเพื่อแสดงข้อมูล AGV ในรูปแบบตาราง
// function displayAGVStatus(agvDetails) {
//     const panelContainer = document.getElementById('panelContainer');

//     // สร้างตาราง
//     const table = document.createElement('tableฺstatus');
//     table.classList.add('tableฺstatus', 'tableฺstatus', 'table-hover');

//     // สร้างแถวหัวตาราง
//     const thead = document.createElement('thead');
//     const headerRow = document.createElement('tr');
//     headerRow.innerHTML = `
//         <th style="text-align:left;width:2%;">AGV Name</th>
//         <th style="text-align:left;width:10%;">สถานะ</th>
//         <th style="text-align:left;width:10%;">รายละเอียด</th>
//         <th style="text-align:left;width:10%;">วันเวลา</th>
//     `;
//     thead.appendChild(headerRow);
//     table.appendChild(thead);

//     // สร้าง tbody
//     const tbody = document.createElement('tbody');

//     agvDetails.forEach(agv => {
//         const row = document.createElement('tr');

//         // สร้างเซลล์สำหรับ AGV Name
//         const nameCell = document.createElement('td');
//         nameCell.textContent = agv.agv_name;

//         // สร้างเซลล์สำหรับสถานะ
//         const statusCell = document.createElement('td');
//         const statusIndicator = document.createElement('span');
//         statusIndicator.style.display = 'inline-block';
        
//         // กำหนดสถานะ LED ตามค่า status
//         if (agv.status === 0) {
//             statusIndicator.classList.add('led-red');
//             statusIndicator.title = 'AGV Offline: Please check the system.'; // Tooltip // สำหรับ status 0
//         } else if (agv.status === 1) {
//             statusIndicator.classList.add('led-green'); // สำหรับ status 1
//             statusIndicator.title = 'AGV Online and operating normally.';
//         } else {
//             statusIndicator.classList.add('led-dark'); // สำหรับสถานะที่ไม่รู้จัก
//             statusIndicator.title = 'Unknown status'; // Tooltip
//         }
//         statusCell.appendChild(statusIndicator);

//         // สร้างเซลล์สำหรับรายละเอียด
//         const detailCell = document.createElement('td');
//         detailCell.textContent = agv.datadetail ? agv.datadetail : ' - ';

//         // สร้างเซลล์สำหรับวันเวลา
//         const timestampCell = document.createElement('td');
//         timestampCell.textContent = agv.log_datetime ? new Date(agv.log_datetime).toLocaleString('th-TH') : '-';

//         // เพิ่มเซลล์ในแถว
//         row.appendChild(nameCell);
//         row.appendChild(statusCell);
//         row.appendChild(detailCell);
//         row.appendChild(timestampCell);
//         tbody.appendChild(row);
//     });

//     // เพิ่ม tbody ลงในตาราง
//     table.appendChild(tbody);
//     panelContainer.innerHTML = ''; // ล้างข้อมูลเก่า
//     panelContainer.appendChild(table); // เพิ่มตารางใหม่ลงใน container
// }

// // เรียกฟังก์ชันเพื่อดึงข้อมูล AGV และอัปเดตทุก 10 วินาที
// fetchAGVStatus(); // เรียกครั้งแรกเพื่อโหลดข้อมูลทันที
// setInterval(fetchAGVStatus, 10000); // อัปเดตข้อมูลทุก 10 วินาที (10000 ms)
// async function fetchAndMapAGVData() {
//     try {
//         // ดึงข้อมูลจาก API ทั้งสอง
//         const [namesResponse, bitsResponse] = await Promise.all([
//             fetch('http://10.7.9.51:6100/api/AGV/names'),
//             fetch('http://10.7.9.51:6100/api/AGV/bits')
//         ]);

//         if (!namesResponse.ok || !bitsResponse.ok) {
//             throw new Error('Failed to fetch one or more APIs');
//         }

//         const namesData = await namesResponse.json();
//         const bitsData = await bitsResponse.json();

//         // รวมข้อมูลจาก API ทั้งสอง
//         const currentTime = new Date();

//         const mappedData = namesData.map(nameEntry => {
//             const matchingBit = bitsData.find(bit => bit.agvName === nameEntry.agvName) || {};

//             let status = 0; // Unknown Status
//             let logDatetime = matchingBit.logDatetime ? new Date(matchingBit.logDatetime) : null;

//             if (matchingBit.m1 === false) {
//                 status = 1; // Green - Online
//             } else if (matchingBit.m1 === null) {
//                 status = 3; // Red - Offline
//             }

//             // ตรวจสอบว่าช่วงเวลาห่างกันเกิน 15 นาทีหรือไม่
//             if (logDatetime && Math.abs(currentTime - logDatetime) > 15 * 60 * 1000) {
//                 status = 2; // Yellow - Stale Data
//             }

//             return {
//                 agv_name: nameEntry.agvName,
//                 status,
//                 datadetail: matchingBit.m1 !== undefined ? (nameEntry.agvType === 'OutDoor' ? 'AGV LINK ONLINE' : 'AGV LINK OFFLINE') : '-',
//                 log_datetime: matchingBit.logDatetime || '-'
//             };
//         });

//         // แสดงผลข้อมูลในตาราง
//         displayAGVStatus(mappedData);
//     } catch (error) {
//         console.error('เกิดข้อผิดพลาดในการดึงหรือประมวลผลข้อมูล:', error);
//     }
// }

// function displayAGVStatus(agvDetails) {
//     const panelContainer = document.getElementById('panelContainer');
//     //'tableฺstatus', 'tableฺstatus', 'table-hover'
//     const table = document.createElement('table');
//     table.classList.add('tableฺstatus', 'tableฺstatus', 'table-hover');

//     const thead = document.createElement('thead');
//     const headerRow = document.createElement('tr');
//     headerRow.innerHTML = `
//          <th style="text-align:left;width:2%;">AGV Name</th>
//         <th style="text-align:left;width:10%;">สถานะ</th>
//         <th style="text-align:left;width:10%;">รายละเอียด</th>
//         <th style="text-align:left;width:10%;">วันเวลา</th>
//     `;
//     thead.appendChild(headerRow);
//     table.appendChild(thead);

//     const tbody = document.createElement('tbody');

//     agvDetails.forEach(agv => {
//         const row = document.createElement('tr');

//         const nameCell = document.createElement('td');
//         nameCell.textContent = agv.agv_name;

//         const statusCell = document.createElement('td');
//         const statusIndicator = document.createElement('span');
//         statusIndicator.style.display = 'inline-block';

//         if (agv.status === 1) {
//             statusIndicator.classList.add('led-green'); // สถานะออนไลน์
//             statusIndicator.title = 'AGV Online';
//         } else if (agv.status === 3) {
//             statusIndicator.classList.add('led-red'); // สถานะไม่ออนไลน์
//             statusIndicator.title = 'AGV Offline';
//         } else if (agv.status === 2) {
//             statusIndicator.classList.add('led-yellow'); // ข้อมูลเก่า
//             statusIndicator.title = 'Stale Data';
//         } else {
//             statusIndicator.classList.add('led-dark'); // สถานะไม่ทราบ
//             statusIndicator.title = 'Unknown Status';
//         }
//         statusCell.appendChild(statusIndicator);

//         const detailCell = document.createElement('td');
//         detailCell.textContent = agv.datadetail;
//         if (agv.status === 2) {
//             detailCell.textContent = 'Updating...';
//         } else {
//             detailCell.textContent = agv.datadetail;
//         }


//         const timestampCell = document.createElement('td');
//         timestampCell.textContent = agv.log_datetime !== '-' ? new Date(agv.log_datetime).toLocaleString('th-TH') : '-';

//         row.appendChild(nameCell);
//         row.appendChild(statusCell);
//         row.appendChild(detailCell);
//         row.appendChild(timestampCell);
//         tbody.appendChild(row);
//     });

//     table.appendChild(tbody);
//     panelContainer.innerHTML = ''; // ล้างข้อมูลเก่า
//     panelContainer.appendChild(table); // เพิ่มตารางใหม่ลงใน container
// }

// // เรียกฟังก์ชันเพื่อโหลดข้อมูล
// fetchAndMapAGVData();
async function fetchAndMapAGVData() {
    try {
        // ดึงข้อมูลจาก API ทั้งสอง พร้อมสำรองข้อมูลใน localStorage
        const [namesData, bitsData] = await Promise.all([
            fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/names', 'agvNamesBackup'),
            fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/bits', 'agvBitsBackup')
        ]);

        // รวมข้อมูลจาก API ทั้งสอง
        const currentTime = new Date();

        const mappedData = namesData.map(nameEntry => {
            const matchingBit = bitsData.find(bit => bit.agvName === nameEntry.agvName) || {};

            let status = 0; // Unknown Status
            let logDatetime = matchingBit.logDatetime ? new Date(matchingBit.logDatetime) : null;

            if (matchingBit.m1 === false) {
                status = 1; // Green - Online
            } else if (matchingBit.m1 === null) {
                status = 3; // Red - Offline
            }

            // ตรวจสอบว่าช่วงเวลาห่างกันเกิน 15 นาทีหรือไม่
            if (logDatetime && Math.abs(currentTime - logDatetime) > 15 * 60 * 1000) {
                status = 2; // Yellow - Stale Data
            }

            return {
                agv_name: nameEntry.agvName,
                status,
                datadetail: matchingBit.m1 !== undefined ? (nameEntry.agvType === 'OutDoor' ? 'AGV LINK ONLINE' : 'AGV LINK OFFLINE') : '-',
                log_datetime: matchingBit.logDatetime || '-'
            };
        });

        // แสดงผลข้อมูลในตาราง
        displayAGVStatus(mappedData);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงหรือประมวลผลข้อมูล:', error);
    }
}

function displayAGVStatus(agvDetails) {
    const panelContainer = document.getElementById('panelContainer');
    const table = document.createElement('table');
    table.classList.add('tableฺstatus', 'tableฺstatus', 'table-hover');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
         <th style="text-align:left;width:2%;">AGV Name</th>
        <th style="text-align:left;width:10%;">สถานะ</th>
        <th style="text-align:left;width:10%;">รายละเอียด</th>
        <th style="text-align:left;width:10%;">วันเวลา</th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    agvDetails.forEach(agv => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = agv.agv_name;

        const statusCell = document.createElement('td');
        const statusIndicator = document.createElement('span');
        statusIndicator.style.display = 'inline-block';

        if (agv.status === 1) {
            statusIndicator.classList.add('led-green'); // สถานะออนไลน์
            statusIndicator.title = 'AGV Online';
        } else if (agv.status === 3) {
            statusIndicator.classList.add('led-red'); // สถานะไม่ออนไลน์
            statusIndicator.title = 'AGV Offline';
        } else if (agv.status === 2) {
            statusIndicator.classList.add('led-yellow'); // ข้อมูลเก่า
            statusIndicator.title = 'Stale Data';
        } else {
            statusIndicator.classList.add('led-dark'); // สถานะไม่ทราบ
            statusIndicator.title = 'Unknown Status';
        }
        statusCell.appendChild(statusIndicator);

        const detailCell = document.createElement('td');
        detailCell.textContent = agv.status === 2 ? 'Updating...' : agv.datadetail;

        const timestampCell = document.createElement('td');
        timestampCell.textContent = agv.log_datetime !== '-' ? new Date(agv.log_datetime).toLocaleString('th-TH') : '-';

        row.appendChild(nameCell);
        row.appendChild(statusCell);
        row.appendChild(detailCell);
        row.appendChild(timestampCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    panelContainer.innerHTML = ''; // ล้างข้อมูลเก่า
    panelContainer.appendChild(table); // เพิ่มตารางใหม่ลงใน container
}

// อัปเดตข้อมูลทุก 10 วินาที
fetchAndMapAGVData();
setInterval(fetchAndMapAGVData, 3000);


