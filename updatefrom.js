   // ฟังก์ชันเพื่อดึงข้อมูล AGV สำหรับการแก้ไข
   function getAgvNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('agvName');
}

function fetchAgvData() {
    const agvName = getAgvNameFromURL();
    console.log(agvName);
    const agvNameElement = document.getElementById("agvname");
    agvNameElement.innerText = "ฟอร์มแก้ไขข้อมูล AGV "+agvName;
    fetch(`http://10.7.3.76:1880/positionAgv?agv_name=${agvName}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const agv = data[0];
                document.getElementById('agv_name').value = agv.agv_name;
                document.getElementById('line').value = agv.line;
                document.getElementById('name').value = agv.name;
                document.getElementById('plant').value = agv.plant;

                // ตรวจสอบและแปลง frame ถ้ามีค่า
               
            } else {
                alert('ไม่พบข้อมูล AGV');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
        });
}

document.getElementById('editAgvForm').addEventListener('submit', function(event) {
    event.preventDefault(); // ป้องกันการส่งฟอร์มแบบปกติ
    const agvName = document.getElementById('agv_name').value;
    const line = document.getElementById('line').value;
    const name = document.getElementById('name').value;
    const plant = document.getElementById('plant').value;
   

    // เช็คว่า frameBase64 มีค่าหรือไม่
                const payload = {
                    agv_name: agvName,
                    line: line,
                    name: name,
                    plant: plant
                    
                };
                sendData(payload);
});

function sendData(payload) {
    fetch(`http://10.7.3.76:1880/updateagv`, {
        method: 'PUT', // ใช้ PUT สำหรับการแก้ไข
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
        alert('บันทึกการแก้ไขสำเร็จ!');
        window.location.href = 'addagv.html';

    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    });
}

     // เปลี่ยนเป็นชื่อ AGV ที่ต้องการแก้ไข
    fetchAgvData();