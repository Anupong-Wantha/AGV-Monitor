   // ฟังก์ชันเพื่อดึงข้อมูล AGV
   function fetchAGVData() {
    fetch('http://10.7.9.51:6100/api/AGV/names')
        .then(response => response.json())
        .then(data => {
            const agvTableBody = document.getElementById('agvTable').querySelector('tbody');
            agvTableBody.innerHTML = ''; // ล้างข้อมูลเก่า

            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.agvName}</td>
                    <td>${item.line}</td>
                    <td>${item.name}</td>
                    <td>${item.agvType}</td>
                    <td>${new Date(item.createDate).toLocaleString('th-TH')}</td>
                    <td>
                        <button class="btn btn-warning" onclick="editAGV('${item.agvName}')">แก้ไข</button>
                        <button  class="btn btn-danger" onclick="deleteAGV('${item.agvName}')">ลบ</button>
                    </td>
                `;
                agvTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
            
        });
}

// ฟังก์ชันเพื่อแก้ไข AGV
function editAGV(agvName) {
    // คุณสามารถเพิ่มฟังก์ชันแก้ไข AGV ที่นี่
    window.location.href = 'updateagv.html?agvName=' + encodeURIComponent(agvName);
    // ตัวอย่างการตั้งค่าฟอร์มด้วยข้อมูล AGV ที่จะทำการแก้ไข
}

// ฟังก์ชันเพื่อลบ AGV
function deleteAGV(agvName) {
    // คุณสามารถเพิ่มการลบ AGV ที่นี่

    if (confirm('คุณแน่ใจว่าต้องการลบ ' + agvName + ' ?')) {
        fetch(`http://10.7.3.76:1880/delagv/${agvName}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('ลบข้อมูลสำเร็จ');
                fetchAGVData(); // เรียกดูข้อมูลใหม่
            } else {
                throw new Error('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        })
        .catch(error => {
            console.error('Error deleting data:', error);
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        });
    }
}

document.getElementById('agvForm').addEventListener('submit', function(event) {
    event.preventDefault(); // ป้องกันการส่งฟอร์มแบบปกติ

    const agvName = document.getElementById('agv_name').value;

    // ตรวจสอบ agv_name ว่าซ้ำหรือไม่
    fetch(`http://10.7.3.76:1880/positionAgv?agv_name=${encodeURIComponent(agvName)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) { // ถ้ามีข้อมูลซ้ำ
                alert('ชื่อ AGV นี้มีอยู่แล้วในระบบ!');
            } else {
                // ดึงค่าจากฟอร์ม
                const line = document.getElementById('line').value;
                const name = document.getElementById('name').value;
                const plant = document.getElementById('plant').value;
               
                
                        const payload = {
                            agv_name: agvName,
                            line: line,
                            name: name,
                            plant: plant,
                        };

                        // ส่งข้อมูลไปยัง API
                        fetch('http://10.7.3.76:1880/add-agvname', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        })
                        .then(response => {
                            if (response.ok) {
                                return response.json();
                            }
                            throw new Error('Network response was not ok.');
                        })
                        .then(data => {
                            console.log('Success:', data);
                            alert('บันทึกข้อมูลสำเร็จ!');
                            fetchAGVData(); // เรียกดูข้อมูลใหม่
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                        });
                    };
                 
                
            
        })
        .catch(error => {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการตรวจสอบชื่อ AGV');
        });
});
document.addEventListener("DOMContentLoaded", function () {
    // ตรวจสอบว่า localStorage มีค่าของแท็บที่เลือกไว้หรือไม่
    const savedTab = localStorage.getItem("selectedTab");
    if (savedTab) {
        // เอาเฉพาะ ID (ไม่รวม #)
        const tabId = savedTab.replace('#', '');
        const tab = document.querySelector(`[href="#${tabId}"]`);
        const tabContent = document.querySelector(`#${tabId}`);

        // ล้าง class active/show จากแท็บอื่น
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));

        // ตั้งค่าแท็บที่เลือกให้แสดง
        if (tab && tabContent) {
            tab.classList.add("active");
            tabContent.classList.add("show", "active");
        }
    }

    // เพิ่ม event listener เพื่อบันทึกแท็บที่เลือก
    const tabs = document.querySelectorAll('#agvTabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            const tabId = this.getAttribute("href"); // ดึง ID ของแท็บที่เลือก
            localStorage.setItem("selectedTab", tabId); // บันทึกใน localStorage
        });
    });
});
// ดึงข้อมูล AGV เมื่อโหลดหน้าเว็บ
window.onload = fetchAGVData;