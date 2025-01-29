// const agvFilter = document.getElementById('agvFilter');

// let latestAGVList = []; // เก็บค่า AGV ล่าสุด
// let latestAlarmData = []; // เก็บค่าข้อมูล Alarm ล่าสุด
// let latestAGVData = []; // เก็บค่าข้อมูล AGV ล่าสุด
// let chartInstance = null; // เก็บตัวแปรของกราฟ

// // ฟังก์ชันเพิ่มตัวเลือก Dropdown พร้อมตรวจสอบ AGV ใหม่
// async function populateDropdown() {
//     try {
//         const mappedData = await mapAGVData();
//         if (!mappedData) return;

//         const uniqueAGVs = [...new Set(mappedData.map(data => data.agv_name))].sort();

//         // ตรวจสอบว่ามี AGV ใหม่หรือไม่ ถ้าไม่มี ไม่ต้องอัปเดต Dropdown
//         if (JSON.stringify(uniqueAGVs) === JSON.stringify(latestAGVList)) return;
//         latestAGVList = uniqueAGVs; // อัปเดตรายการล่าสุด

//         agvFilter.innerHTML = `<option value="all">All AGVs</option>`;
//         uniqueAGVs.forEach(agvName => {
//             const option = document.createElement('option');
//             option.value = agvName;
//             option.textContent = agvName;
//             agvFilter.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error populating dropdown:', error);
//     }
// }

// // ฟังก์ชันหลักที่ดึงข้อมูลและแสดงผล
// async function fetchData3() {
//     try {
//         const selectedAGV = agvFilter.value;
//         const mappedData = await mapAGVData();
//         if (!mappedData) return;

//         const filteredData = selectedAGV === 'all'
//             ? mappedData
//             : mappedData.filter(entry => entry.agv_name === selectedAGV);

//         // ถ้าข้อมูลยังเหมือนเดิม ไม่ต้องอัปเดตซ้ำ
//         if (JSON.stringify(filteredData) === JSON.stringify(latestAGVData)) return;
//         latestAGVData = filteredData; // อัปเดตข้อมูลล่าสุด

//         // นับจำนวน Alarm
//         const alarmCounts = filteredData.reduce((countMap, entry) => {
//             countMap[entry.d5004] = (countMap[entry.d5004] || 0) + 1;
//             return countMap;
//         }, {});

//         // ใช้ข้อมูล Alarm ที่ดึงมาก่อนหน้า
//         const result = latestAlarmData.map(alarm => ({
//             alarmID: alarm.alarmCode,
//             alarmName: alarm.description || `Alarm ${alarm.alarmCode}`,
//             errorCount: alarmCounts[alarm.alarmCode] || 0
//         }));

//         const sortedData = result.sort((a, b) => b.errorCount - a.errorCount).slice(0, 10);
//         displayData2(sortedData, latestAlarmData);
//     } catch (error) {
//         console.error('Error fetching data:', error);
//     }
// }

// // ฟังก์ชันดึงข้อมูล AGV และ Alarm (ลด API Call ซ้ำซ้อน)
// async function mapAGVData() {
//     try {
//         const wordsResponse = await fetch('http://10.7.9.51:6100/api/AGV/log/words');
//         const wordsData = await wordsResponse.json();

//         // ถ้าข้อมูลยังเหมือนเดิม ไม่ต้องอัปเดต
//         if (JSON.stringify(wordsData) === JSON.stringify(latestAGVData)) return latestAGVData;

//         latestAGVData = wordsData; // อัปเดตข้อมูลล่าสุด

//         return wordsData.map(word => ({
//             log_id: word.wordsUuid,
//             log_datetime: word.logDatetime,
//             agv_name: word.agvName,
//             d5004: word.d4
//         }));
//     } catch (error) {
//         console.error('Error mapping AGV data:', error);
//     }
// }

// // ฟังก์ชันดึงข้อมูล Alarm (ลด API Call ซ้ำซ้อน)
// async function fetchAlarmData() {
//     try {
//         const alarmResponse = await fetch('http://10.7.9.51:6100/api/AGV/alarm?agvType=OutDoor');
//         const alarmData = await alarmResponse.json();

//         // ถ้าข้อมูลยังเหมือนเดิม ไม่ต้องอัปเดต
//         if (JSON.stringify(alarmData) === JSON.stringify(latestAlarmData)) return;
//         latestAlarmData = alarmData; // อัปเดตข้อมูลล่าสุด
//     } catch (error) {
//         console.error('Error fetching alarm data:', error);
//     }
// }

// // อัปเดต Dropdown และข้อมูล Alarm ทุก 10 วินาที
// setInterval(populateDropdown, 10000);
// setInterval(fetchAlarmData, 10000);
// setInterval(fetchData3, 10000);

// // เรียกข้อมูลเริ่มต้น
// populateDropdown();
// fetchAlarmData();
// fetchData3();
// agvFilter.addEventListener('change', fetchData3);








const agvFilter = document.getElementById('agvFilter');

// ฟังก์ชันเดิมที่ใช้สำหรับเพิ่มตัวเลือกใน Dropdown
async function populateDropdown() {
    try {
        const mappedData = await mapAGVData(); // ดึงข้อมูลจากฟังก์ชัน mapAGVData

        // ดึงชื่อ AGV ที่ไม่ซ้ำกันและเรียงลำดับตามตัวอักษร
        const uniqueAGVs = [...new Set(mappedData.map(data => data.agv_name))].sort(); // เพิ่ม .sort() เพื่อเรียงลำดับ

        agvFilter.innerHTML = ''; // ล้าง Dropdown
        agvFilter.innerHTML = `<option value="all">All AGVs</option>`; // เพิ่มตัวเลือก All AGVs
        uniqueAGVs.forEach(agvName => {
            const option = document.createElement('option');
            option.value = agvName;
            option.textContent = agvName;
            agvFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating dropdown:', error);
    }
}


// เรียกข้อมูลและจัดการ Dropdown
populateDropdown();

async function fetchData3() {
    try {
        const selectedAGV = agvFilter.value; // ค่า AGV ที่เลือก
        const mappedData = await mapAGVData(); // Use the mapped data from the mapAGVData function

        // กรองข้อมูลตาม AGV ที่เลือก
        const filteredData = selectedAGV === 'all'
            ? mappedData
            : mappedData.filter(entry => entry.agv_name === selectedAGV);

        // นับจำนวนครั้งของ Alarm
        const alarmCounts = filteredData.reduce((countMap, entry) => {
            const alarmID = entry.d5004;
            countMap[alarmID] = (countMap[alarmID] || 0) + 1;
            return countMap;
        }, {});

        // Fetch alarm data เพื่อดึงคำอธิบาย
        const alarmResponse = await fetch('http://10.7.9.51:6100/api/AGV/alarm?agvType=OutDoor');
        const alarmData = await alarmResponse.json();

        // รวมข้อมูลคำอธิบายกับจำนวนครั้งที่เกิด Alarm
        const result = alarmData.map(alarm => ({
            alarmID: alarm.alarmCode,
            alarmName: alarm.description || `Alarm ${alarm.alarmCode}`,
            errorCount: alarmCounts[alarm.alarmCode] || 0
        }));

        // จัดเรียงข้อมูล Error Count แบบลดลำดับ
        const sortedData = result.sort((a, b) => b.errorCount - a.errorCount).slice(0, 10); // เลือกเฉพาะ 10 รายการแรก

        // สร้างกราฟโดยเรียก displayData2
        displayData2(sortedData, alarmData); // ส่ง alarmData เข้าไปด้วย
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('apiDataContainer').innerText = 'Failed to load data.';
    }
}


async function mapAGVData() {
  try {
    // Fetch data from APIs
    const wordsResponse = await fetch('http://10.7.9.51:6100/api/AGV/log/words');
    const wordsData = await wordsResponse.json();

    const alarmResponse = await fetch('http://10.7.9.51:6100/api/AGV/alarm?agvType=OutDoor');
    const alarmData = await alarmResponse.json();

    // Map the data to the required format
    const mappedData = wordsData.map((word) => {
      // Check if d5004 matches any alarmCode in alarmData
      const alarmMatch = alarmData.find(alarm => alarm.alarmCode === word.d4);

      return {
        log_id: word.wordsUuid, // Assuming wordsUuid can be used as log_id
        log_datetime: word.logDatetime,
        agv_name: word.agvName,
        d5004: word.d4
      };
    });

    
    return mappedData;
  } catch (error) {
    console.error('Error mapping AGV data:', error);
  }
}

let chartInstance = null; // ตัวแปรสำหรับเก็บอินสแตนซ์ของกราฟ

async function displayData2(data, alarmData) {
    const labels = [];
    const dataset = [];
    const backgroundColors = [];

    const predefinedColors = [
        '#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA500',
        '#FFD700', '#ADFF2F', '#7FFF00', '#00FF00', '#32CD32'
    ];

    // จัดการข้อมูลสำหรับกราฟ
    for (const [index, item] of data.entries()) {
        labels.push(item.alarmID); // ใช้ alarmID แทน description
        dataset.push(item.errorCount);
        backgroundColors.push(predefinedColors[index] || '#32CD32');
    }

    // ลบกราฟเก่า (ถ้ามี)
    if (chartInstance) {
        chartInstance.destroy();
    }

    // สร้างกราฟใหม่
    const ctx = document.getElementById('myChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // ใช้ labels ที่แก้ไขแล้ว
            datasets: [{
                label: `Error Count for ${agvFilter.value === 'all' ? 'All AGVs' : agvFilter.value}`,
                data: dataset,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                        font: { size: 12 }
                    },
                    title: {
                        display: true,
                        text: 'Alarm Code',
                        color: 'white'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Error Count',
                        color: 'white'
                    },
                    ticks: {
                        stepSize: 1,
                        color: 'white'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const alarmID = data[index].alarmID;
                            const errorCount = data[index].errorCount;

                            // หา description จาก alarmData ที่ตรงกับ alarmID
                            const description = alarmData.find(alarm => alarm.alarmCode === alarmID)?.description || 'ไม่มีคำอธิบาย';

                            return [
                                `คำอธิบาย: ${description}`,
                                `รหัส: ${alarmID}`,
                                `Error Count: ${errorCount}`
                            ];
                        }
                    }
                }
            }
        }
    });
}


async function checkErrorCount() {
    try {
        // ดึงข้อมูลจาก API
        const mappedData = await mapAGVData(); // ดึงข้อมูลรวมจาก mapAGVData
        const alarmResponse = await fetch('http://10.7.9.51:6100/api/AGV/alarm?agvType=OutDoor');
        const alarmData = await alarmResponse.json();

        // นับจำนวน Error Count ของ Alarm
        const errorCountMap = mappedData.reduce((countMap, entry) => {
            const alarmID = entry.d5004;
            countMap[alarmID] = (countMap[alarmID] || 0) + 1;
            return countMap;
        }, {});

        // รวมข้อมูลคำอธิบาย Alarm และ Error Count
        const result = alarmData.map(alarm => ({
            alarmID: alarm.alarmCode,
            alarmName: alarm.description || `Alarm ${alarm.alarmCode}`,
            errorCount: errorCountMap[alarm.alarmCode] || 0
        }));

    } catch (error) {
        console.error('Error checking error count:', error);
    }
}

// เรียกฟังก์ชันตรวจสอบ
checkErrorCount();

// เรียกข้อมูลและจัดการ Dropdown
populateDropdown();
agvFilter.addEventListener('change', fetchData3);
fetchData3();
setInterval(fetchData3, 10000);






// const agvFilter = document.getElementById('agvFilter');

// // ฟังก์ชันเดิมที่ใช้สำหรับเพิ่มตัวเลือกใน Dropdown
// async function populateDropdown() {
//     try {
//         const response = await fetch('http://10.7.3.76:1880/get-agv-list'); // API สำหรับรายชื่อ AGV
//         const agvList = await response.json();

//         agvFilter.innerHTML = ''; // ล้าง Dropdown
//         agvFilter.innerHTML = `<option value="all">All AGVs</option>`;
//         agvList.forEach(agv => {
//             const option = document.createElement('option');
//             option.value = agv.agv_name;
//             option.textContent = agv.agv_name;
//             agvFilter.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error populating dropdown:', error);
//     }
// }

// // เรียกข้อมูลและจัดการ Dropdown
// populateDropdown();


// async function fetchData3() {
//     try {
//         const selectedAGV = agvFilter.value; // ค่า AGV ที่เลือก
//         const response1 = await fetch('http://10.7.3.76:1880/Aalrmdata');
//         const api1Data = await response1.json();

//         const response2 = await fetch('http://10.7.3.76:1880/get-all-agv-chart');
//         const api2Data = await response2.json();

//         // กรองข้อมูลตาม AGV ที่เลือก
//         const filteredData = selectedAGV === 'all'
            // ? api2Data
//             : api2Data.filter(entry => entry.agv_name === selectedAGV);

//         // สร้างแผนที่ข้อมูล Alarm
//         const alarmMap = filteredData.reduce((map, entry) => {
//             const alarmID = entry.d5004;
//             if (!map[alarmID]) {
//                 map[alarmID] = [];
//             }
//             map[alarmID].push({
//                 AGVID: entry.agv_name,
//                 timestamp: entry.log_datetime
//             });
//             return map;
//         }, {});

//         // รวมข้อมูลเพื่อแสดงในกราฟ
//         const result = api1Data.map(alarm => ({
//             alarmID: alarm.aalrmcode,
//             alarmName: alarm.aalrmdescription,
//             data: alarmMap[alarm.aalrmcode] || []
//         }));

//         // สร้างกราฟโดยเรียก displayData2
//         displayData2(result);
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         document.getElementById('apiDataContainer').innerText = 'Failed to load data.';
//     }
// }

// async function fetchErrorCount(alarmID) {
//     try {
//         const response = await fetch(`http://10.7.3.76:1880/get-all-agv-word?alamID=${alarmID}`);
//         const data = await response.json();
//         return data[0]?.error_count || 0;
//     } catch (error) {
//         console.error('Error fetching error count:', error);
//         return 0;
//     }
// }

// let chartInstance = null; // ตัวแปรสำหรับเก็บอินสแตนซ์ของกราฟ

// async function displayData2(data) {
//     const labels = [];
//     const dataset = [];
//     const backgroundColors = [];
//     const errorCountArray = [];

//     const predefinedColors = [
//         '#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA500',
//         '#FFD700', '#ADFF2F', '#7FFF00', '#00FF00', '#32CD32'
//     ];

//     // จัดการข้อมูลสำหรับกราฟ
//     for (const item of data) {
//         const errorCount = item.data.length; // นับจำนวนข้อผิดพลาดของแต่ละ Alarm

//         errorCountArray.push({
//             label: item.alarmName,
//             alarmID: item.alarmID,
//             errorCount: errorCount
//         });
//     }

//     // จัดเรียงข้อมูล Error Count แบบลดลำดับ
//     errorCountArray.sort((a, b) => b.errorCount - a.errorCount);
//     const top10 = errorCountArray.slice(0, 10); // เลือกเฉพาะ 10 รายการแรก

//     for (const [index, item] of top10.entries()) {
//         labels.push(item.alarmID);
//         dataset.push(item.errorCount);
//         backgroundColors.push(predefinedColors[index] || '#32CD32');
//     }

//     // ลบกราฟเก่า (ถ้ามี)
//     if (chartInstance) {
//         chartInstance.destroy();
//     }

//     // สร้างกราฟใหม่
//     const ctx = document.getElementById('myChart').getContext('2d');
//     chartInstance = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: `Error Count for ${agvFilter.value === 'all' ? 'All AGVs' : agvFilter.value}`,
//                 data: dataset,
//                 backgroundColor: backgroundColors,
//                 borderColor: backgroundColors,
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 x: {
//                     ticks: {
//                         color: 'white',
//                         font: { size: 12 }
//                     },
//                     title: {
//                         display: true,
//                         text: 'Alarm Code',
//                         color: 'white'
//                     }
//                 },
//                 y: {
//                     beginAtZero: true,
//                     title: {
//                         display: true,
//                         text: 'Error Count',
//                         color: 'white'
//                     },
//                     ticks: {
//                         stepSize: 1,
//                         color: 'white'
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     labels: {
//                         color: 'white'
//                     }
//                 },
//                 tooltip: {
//                     callbacks: {
//                         label: function (tooltipItem) {
//                             const index = tooltipItem.dataIndex;
//                             const description = top10[index].label || 'ไม่มีคำอธิบาย';
//                             const code = top10[index].alarmID;
//                             const errorCount = top10[index].errorCount;

//                             return [
//                                 `คำอธิบาย: ${description}`,
//                                 `รหัส: ${code}`,
//                                 `Error Count: ${errorCount}`
//                             ];
//                         }
//                     }
//                 }
//             }
//         }
//     });
// }



// // เรียกข้อมูลและจัดการ Dropdown
// populateDropdown();
// agvFilter.addEventListener('change', fetchData3);
// fetchData3();
// setInterval(fetchData3, 10000);

