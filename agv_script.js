function fetchDataWithBackup(url, storageKey) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
            return response.json();
        })
        .then(data => {
            // บันทึกข้อมูลล่าสุดลงใน localStorage เพื่อสำรอง
            localStorage.setItem(storageKey, JSON.stringify(data)); 
            return data;
        })
        .catch(error => {
            console.error(`Error fetching data from ${url}:`, error);
            
            // หากเกิดข้อผิดพลาด ให้โหลดข้อมูลสำรองจาก localStorage
            const backupData = localStorage.getItem(storageKey);
            return backupData ? JSON.parse(backupData) : []; // คืนค่าข้อมูลสำรองถ้ามี
        });
}

// ฟังก์ชันอัปเดตข้อมูล AGV จาก API พร้อมระบบสำรองข้อมูล
function updateAGVData() {
    fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/log/words', 'agvWordsBackup')
        .then(data => {
            displayAGVButtons(data); // แสดงปุ่ม AGV
            displayAGVWithAlarms(data); // แสดงตาราง AGV Alarm
        });
}

// ฟังก์ชันอัปเดตรายชื่อ AGV จาก API พร้อมระบบสำรองข้อมูล
function updateAGVNames() {
    fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/names', 'agvNamesBackup')
        .then(data => {
            const buttonContainer = document.getElementById('buttonContainer');
            buttonContainer.innerHTML = ''; // ล้างข้อมูลเก่า
            
            // สร้างปุ่มสำหรับแต่ละ AGV
            data.forEach(agv => {
                const button = document.createElement('button');
                button.textContent = agv.agv_name;
                button.className = 'btn btn-outline-light';
                
                // เมื่อกดปุ่มจะนำไปยังหน้าแสดงรายละเอียด AGV
                button.onclick = () => {
                    window.location.href = `detailagv.html?agv_number=${agv.agvName}`;
                };
                
                buttonContainer.appendChild(button);
            });
        });
}

// อัปเดตข้อมูล AGV และรายชื่อ AGV ทันทีที่โหลดหน้าเว็บ
updateAGVData();
updateAGVNames();

// ตั้งค่าการอัปเดตข้อมูลอัตโนมัติทุก 10 วินาที
setInterval(() => {
    updateAGVData();
    updateAGVNames();
}, 10000);
