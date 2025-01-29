let cycleTimeChart;

async function fetchData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch data from ${apiUrl}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        return [];
    }
}

// Populate the dropdown with AGV names
async function populateDropdown() {
    const agvNamesData = await fetchData('http://10.7.9.51:6100/api/AGV/names');
    const dropdown = document.getElementById('agvSelector');

    dropdown.innerHTML = '<option value="ALL">All AGVs</option>';
    agvNamesData.forEach(agv => {
        const option = document.createElement('option');
        option.value = agv.agvName;
        option.textContent = agv.agvName;
        dropdown.appendChild(option);
    });
}

// Calculate cycle times grouped by AGV
async function calculateCycleTime() {
    const wordsData = await fetchData('http://10.7.9.51:6100/api/AGV/log/words');
    const tagData = await fetchData('http://10.7.9.51:6100/api/AGV/tag?agvType=Outdoor');
    const agvNamesData = await fetchData('http://10.7.9.51:6100/api/AGV/names');

    // เรียงลำดับข้อมูลตามเวลา
    wordsData.sort((a, b) => new Date(a.logDatetime) - new Date(b.logDatetime));

    const groupedCycleTimes = {};

    agvNamesData.forEach(agv => {
        const agvRounds = [];
        let currentRound = [];
        let lastRoundEndTime = null; // เก็บเวลาสิ้นสุดของรอบล่าสุด

        wordsData.filter(word => word.agvName === agv.agvName).forEach(word => {
            const tag = tagData.find(tag => tag.tagId === word.d0);

            if (tag) {
                let startTag;

                // กำหนด startTag ตามเส้นทาง
                if (tag.agvRoute === "head") {
                    startTag = 1161;
                } else if (tag.agvRoute === "block_way1" || tag.agvRoute === "block_way2") {
                    startTag = 1020;
                }

                if (tag.tagId === startTag) {
                    // หากเจอ startTag ใหม่ที่เกิดหลังจากรอบก่อนหน้า
                    const currentTime = new Date(word.logDatetime);
                    if (!lastRoundEndTime || currentTime > lastRoundEndTime) {
                        if (currentRound.length > 0) {
                            // คำนวณรอบที่เสร็จสิ้นก่อนหน้า
                            const startTime = new Date(currentRound[0].logDatetime);
                            const endTime = new Date(currentRound[currentRound.length - 1].logDatetime);
                            const duration = (endTime - startTime) / 1000;

                            if (duration > 0) {
                                agvRounds.push({
                                    agvName: agv.agvName,
                                    startTag: startTag,
                                    duration,
                                    startTime: currentRound[0].logDatetime,
                                    endTime: currentRound[currentRound.length - 1].logDatetime,
                                    route: tag.agvRoute,
                                });
                            }

                            // อัปเดตเวลาสิ้นสุดของรอบ
                            lastRoundEndTime = endTime;
                        }

                        // เริ่มต้นรอบใหม่
                        currentRound = [];
                    }

                    // เพิ่มแท็กปัจจุบันลงในรอบใหม่
                    currentRound.push(word);
                } else if (currentRound.length > 0) {
                    // ระหว่างรอบ
                    currentRound.push(word);
                }
            }
        });

        // คำนวณรอบสุดท้ายที่ยังไม่ถูกบันทึก
        if (currentRound.length > 0) {
            const startTime = new Date(currentRound[0].logDatetime);
            const endTime = new Date(currentRound[currentRound.length - 1].logDatetime);
            const duration = (endTime - startTime) / 1000;

            if (duration > 0) {
                agvRounds.push({
                    agvName: agv.agvName,
                    startTag: currentRound[0].d0,
                    duration,
                    startTime: currentRound[0].logDatetime,
                    endTime: currentRound[currentRound.length - 1].logDatetime,
                    route: tagData.find(tag => tag.tagId === currentRound[0].d0)?.agvRoute || "",
                });
            }
        }

        // บันทึกข้อมูลรอบทั้งหมดของ AGV
        if (agvRounds.length > 0) {
            groupedCycleTimes[agv.agvName] = agvRounds;
        }
    });

    return groupedCycleTimes;
}

// Display cycle times in the chart
async function displayCycleTime() {
    const selectedAGV = document.getElementById('agvSelector').value;
    const groupedCycleTimes = await calculateCycleTime();

    const cycleTimes = selectedAGV === 'ALL'
        ? Object.values(groupedCycleTimes).flat()
        : groupedCycleTimes[selectedAGV] || [];

    // แสดงแค่ 10 ตัวล่าสุด
    const latestCycleTimes = cycleTimes.slice(0, 10);

    const labels = latestCycleTimes.map(item => `${item.agvName}: ${item.startTag} -> ${item.startTag}`);
    const data = latestCycleTimes.map(item => item.duration);

    if (cycleTimeChart) cycleTimeChart.destroy();

    const ctx = document.getElementById('cycleTimeChart').getContext('2d');
    cycleTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Cycle Time (Seconds) for ${selectedAGV === 'ALL' ? 'All AGVs' : selectedAGV}`,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                },
            },
        },
    });
    console.log(latestCycleTimes);
}

// Initialize dropdown and chart
populateDropdown();
displayCycleTime();

// Update chart every 3 seconds
setInterval(() => {
    displayCycleTime();
}, 10000);




// const agvFilter = document.getElementById('agvFilter');

// // ฟังก์ชันเรียกข้อมูลจาก API พร้อมระบบสำรองข้อมูล (Backup)
// async function fetchDataWithBackup(url, storageKey) {
//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         localStorage.setItem(storageKey, JSON.stringify(data)); // บันทึกข้อมูลล่าสุดใน localStorage
//         return data;
//     } catch (error) {
//         console.error(`Error fetching data from ${url}:`, error);
//         const backupData = localStorage.getItem(storageKey);
//         return backupData ? JSON.parse(backupData) : []; // โหลดข้อมูลสำรองถ้ามี
//     }
// }

// // ฟังก์ชันเดิมที่ใช้สำหรับเพิ่มตัวเลือกใน Dropdown
// async function populateDropdown() {
//     try {
//         const mappedData = await fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/names', 'agvNamesBackup');

//         // ดึงชื่อ AGV ที่ไม่ซ้ำกันและเรียงลำดับตามตัวอักษร
//         const uniqueAGVs = [...new Set(mappedData.map(data => data.agv_name))].sort();

//         agvFilter.innerHTML = ''; // ล้าง Dropdown
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

// // เรียกข้อมูลและจัดการ Dropdown
// populateDropdown();

// // ฟังก์ชันกำหนดสีกราฟ
// const predefinedColors = [
//     '#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA500',
//     '#FFD700', '#ADFF2F', '#7FFF00', '#00FF00', '#32CD32',
//     '#8A2BE2', '#4B0082', '#9400D3', '#BA55D3', '#FF1493'
// ];

// async function fetchData3() {
//     try {
//         const selectedAGV = agvFilter.value;
//         const mappedData = await fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/log/words', 'wordsDataBackup');
//         const alarmData = await fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/alarm?agvType=OutDoor', 'alarmDataBackup');

//         // กรองข้อมูลตาม AGV ที่เลือก
//         const filteredData = selectedAGV === 'all'
//             ? mappedData
//             : mappedData.filter(entry => entry.agv_name === selectedAGV);

//         // นับจำนวนครั้งของ Alarm
//         const alarmCounts = filteredData.reduce((countMap, entry) => {
//             const alarmID = entry.d5004;
//             countMap[alarmID] = (countMap[alarmID] || 0) + 1;
//             return countMap;
//         }, {});

//         // รวมข้อมูลคำอธิบายกับจำนวนครั้งที่เกิด Alarm
//         const result = alarmData.map(alarm => ({
//             alarmID: alarm.alarmCode,
//             alarmName: alarm.description || `Alarm ${alarm.alarmCode}`,
//             errorCount: alarmCounts[alarm.alarmCode] || 0
//         }));

//         // บันทึกค่าล่าสุดลงใน localStorage
//         localStorage.setItem('latestAlarmData', JSON.stringify(result));

//         // จัดเรียงข้อมูล Error Count แบบลดลำดับ
//         const sortedData = result.sort((a, b) => b.errorCount - a.errorCount).slice(0, 10);

//         // สร้างกราฟโดยเรียก displayData2
//         displayData2(sortedData, alarmData);
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         document.getElementById('apiDataContainer').innerText = 'Failed to load data.';
//     }
// }

// async function checkErrorCount() {
//     try {
//         const mappedData = await fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/log/words', 'wordsDataBackup');
//         const alarmData = await fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/alarm?agvType=OutDoor', 'alarmDataBackup');

//         const errorCountMap = mappedData.reduce((countMap, entry) => {
//             const alarmID = entry.d5004;
//             countMap[alarmID] = (countMap[alarmID] || 0) + 1;
//             return countMap;
//         }, {});

//         const result = alarmData.map(alarm => ({
//             alarmID: alarm.alarmCode,
//             alarmName: alarm.description || `Alarm ${alarm.alarmCode}`,
//             errorCount: errorCountMap[alarm.alarmCode] || 0
//         }));

//         // บันทึกค่าล่าสุดลงใน localStorage
//         localStorage.setItem('latestErrorCount', JSON.stringify(result));

//         console.log('ตรวจสอบข้อมูล Error Count:', result);
//         return result;
//     } catch (error) {
//         console.error('Error checking error count:', error);
//     }
// }

// // เรียกฟังก์ชันตรวจสอบ
// checkErrorCount();

// // อัปเดตข้อมูลทุก 10 วินาที
// agvFilter.addEventListener('change', fetchData3);
// fetchData3();
// setInterval(fetchData3, 3000);
