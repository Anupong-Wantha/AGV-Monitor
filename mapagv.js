
const frame = document.getElementById('imageFrame');
const innerFrame = document.getElementById('innerFrame');
let scale = 1; // ระดับการซูม
let posX = 0; // ตำแหน่ง X
let posY = 0; // ตำแหน่ง Y
let isDragging = false; // สถานะการลาก
let startX = 0; // ตำแหน่งเริ่มต้น X
let startY = 0; // ตำแหน่งเริ่มต้น Y

// ใส่ภาพเริ่มต้นจาก Local Storage
const savedFrameBackground = localStorage.getItem('frameBackgroundImage');
if (savedFrameBackground) {
    innerFrame.style.backgroundImage = `url('${savedFrameBackground}')`;
    innerFrame.style.backgroundSize = 'contain';
    innerFrame.style.backgroundRepeat = 'no-repeat';
    innerFrame.style.backgroundPosition = 'center';
} else {
    alert('ยังไม่ได้ตั้งค่าภาพพื้นหลังในระบบ!');
}

// ฟังก์ชันอัปเดตการแสดงผล
function updateTransform() {
    innerFrame.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// ฟังก์ชัน Zoom In
window.zoomIn = function zoomIn() {
    scale = Math.min(scale + 0.1, 5); // จำกัดซูมสูงสุดที่ 5x
    updateTransform();
};

window.zoomOut = function zoomOut() {
    scale = Math.max(scale - 0.1, 1); // จำกัดซูมต่ำสุดที่ 1x
    updateTransform();
};

window.resetImage = function resetImage() {
    scale = 1;
    posX = 0;
    posY = 0;
    updateTransform();
};

// เริ่มต้นลาก
innerFrame.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX - posX;
    startY = event.clientY - posY;
    innerFrame.style.cursor = 'grabbing'; // เปลี่ยน cursor
});

// การลากภาพ
window.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    posX = event.clientX - startX;
    posY = event.clientY - startY;
    updateTransform();
});

// หยุดลาก
window.addEventListener('mouseup', () => {
    isDragging = false;
    innerFrame.style.cursor = 'grab'; // คืนค่า cursor
});

// หยุดลากเมื่อเมาส์ออกจากกรอบ
frame.addEventListener('mouseleave', () => {
    isDragging = false;
});


// ฟังก์ชันล้างจุดเก่าใน innerFrame
function clearMarkers() {
    const markers = innerFrame.querySelectorAll('div'); // เลือก div ที่เป็นจุดทั้งหมด
    markers.forEach(marker => marker.remove()); // ลบ div ทั้งหมด
}

// ฟังก์ชันโหลดข้อมูลจาก API และแสดงจุด AGV
async function loadAGVData() {
    const apiWords = "http://10.7.9.51:6100/api/AGV/words";
    const apiAgvNames = "http://10.7.9.51:6100/api/AGV/names";
    const apiTags = "http://10.7.9.51:6100/api/AGV/tag?agvType=Outdoor";
    const apiSequence = "http://10.7.9.51:6100/api/AGV/sequence?agvType=OutDoor";
    const apiAlarm = "http://10.7.9.51:6100/api/AGV/alarm?agvType=OutDoor";

    try {
        // Fetch ข้อมูลจาก API
        const [wordsResponse, agvNamesResponse, tagsResponse, sequenceResponse, alarmResponse] = await Promise.all([
            fetch(apiWords),
            fetch(apiAgvNames),
            fetch(apiTags),
            fetch(apiSequence),
            fetch(apiAlarm)
        ]);

        const wordsData = await wordsResponse.json();
        const agvNamesData = await agvNamesResponse.json();
        const tagsData = await tagsResponse.json();
        const sequenceData = await sequenceResponse.json();
        const alarmData = await alarmResponse.json();

        localStorage.setItem('agvWordsBackup', JSON.stringify(wordsData));
        localStorage.setItem('agvNamesBackup', JSON.stringify(agvNamesData));
        localStorage.setItem('agvTagsBackup', JSON.stringify(tagsData));
        localStorage.setItem('agvSequenceBackup', JSON.stringify(sequenceData));
        localStorage.setItem('agvAlarmBackup', JSON.stringify(alarmData));

        // จับคู่ข้อมูลจาก API
        const result = wordsData.map(word => {
            const agvNameData = agvNamesData.find(agv => agv.agvName === word.agvName);
            const tagData = tagsData.find(tag => tag.tagId === word.d0);
            const sequence = sequenceData.find(seq => seq.seqNo === word.d1);
            const alarm = alarmData.find(alrm => alrm.alarmCode === word.d4);

            return {
                logDatetime: word.logDatetime,
                agvName: word.agvName,
                marker_color: agvNameData ? agvNameData.markerColor : "#000000",
                position_x: tagData ? tagData.positionX : null,
                position_y: tagData ? tagData.positionY : null,
                seqDescription: sequence ? sequence.description : "No Description",
                alarmDescription: alarm ? alarm.description : "No Alarm"
            };
        });

        // ล้างจุดเก่าก่อนเพิ่มจุดใหม่
        clearMarkers();

        // แสดงจุด AGV บนภาพ
        result.forEach(agv => {
            if (agv.position_x !== null && agv.position_y !== null) {
                const marker = document.createElement('div');
                const tooltip = document.createElement('div');

                // ปรับตำแหน่ง Marker
                const actualImageWidth = 1920; // ขนาดจริงของภาพ
                const actualImageHeight = 1080; // ขนาดจริงของภาพ
                const scaleFactorX = innerFrame.offsetWidth / actualImageWidth;
                const scaleFactorY = innerFrame.offsetHeight / actualImageHeight;

                marker.style.position = 'absolute';
                marker.style.left = `${agv.position_x * scaleFactorX}px`;
                marker.style.top = `${agv.position_y * scaleFactorY}px`;
                marker.style.width = '10px';
                marker.style.height = '10px';
                marker.style.backgroundColor = agv.marker_color;
                marker.style.borderRadius = '50%';
                marker.style.cursor = 'pointer';

                // กำหนด Tooltip
                // Assuming `agv.logDatetime` is in ISO format or a valid date string
                const formatDate = (datetime) => {
                    const date = new Date(datetime);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                    const year = date.getFullYear() + 543; // Convert to Thai Buddhist calendar
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                };

                tooltip.innerHTML = `
                    <h6 style="color:white;">${agv.agvName}</h6>
                    <p style="color:white; margin: 0;">Time: ${formatDate(agv.logDatetime)}</p>
                    <p style="color:white; margin: 0;">Sequence: ${agv.seqDescription}</p>
                    <p style="color:white; margin: 0;">Alarm: ${agv.alarmDescription }</p>
                `;

                tooltip.style.position = 'absolute';
                tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                tooltip.style.padding = '5px'; // ลด Padding ให้เล็กลง
                tooltip.style.borderRadius = '3px'; // ลดความโค้งมุม
                tooltip.style.display = 'none'; // ซ่อน Tooltip เริ่มต้น
                tooltip.style.zIndex = '100';
                tooltip.style.pointerEvents = 'none'; // ไม่ให้ Tooltip รบกวนเมาส์
                tooltip.style.fontSize = '12px'; // ลดขนาดตัวอักษร
                tooltip.style.maxWidth = '150px'; // กำหนดความกว้างสูงสุด
                

                // แสดง/ซ่อน Tooltip
                marker.addEventListener('mouseenter', () => {
                    tooltip.style.display = 'block';
                    tooltip.style.left = `${agv.position_x * scaleFactorX + 15}px`;
                    tooltip.style.top = `${agv.position_y * scaleFactorY + 15}px`;
                });

                marker.addEventListener('mouseleave', () => {
                    tooltip.style.display = 'none';
                });;
                
                // เพิ่ม Marker และ Tooltip ลงใน innerFrame
                innerFrame.appendChild(marker);
                innerFrame.appendChild(tooltip);
                marker.addEventListener('click', () => {
                    window.location.href = `detailagv.html?agv_name=${encodeURIComponent(agv.agvName)}`;
                    localStorage.setItem('selectedAGV', agv.agvName); // เก็บชื่อ AGV ใน Local Storage
                    console.log("Navigating to:", agvURL);
                    window.location.href = agvURL;
                });
                
            } else {
                console.warn(`Invalid position for ${agv.agvName}: (${agv.position_x}, ${agv.position_y})`);
            }
        });

    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงหรือประมวลผลข้อมูล:", error);
                // ใช้ข้อมูลสำรองจาก localStorage หากมี
                const wordsBackup = JSON.parse(localStorage.getItem('agvWordsBackup') || '[]');
                const namesBackup = JSON.parse(localStorage.getItem('agvNamesBackup') || '[]');
                const tagsBackup = JSON.parse(localStorage.getItem('agvTagsBackup') || '[]');
                const sequenceBackup = JSON.parse(localStorage.getItem('agvSequenceBackup') || '[]');
                const alarmBackup = JSON.parse(localStorage.getItem('agvAlarmBackup') || '[]');
        
                console.log('Loading AGV data from backup');
                updateAGVMarkers(wordsBackup, namesBackup, tagsBackup, sequenceBackup, alarmBackup);
    }
}



// เรียกฟังก์ชันเพื่อโหลดและแสดงข้อมูล AGV ครั้งแรก
loadAGVData();

// ตั้งค่าให้โหลดข้อมูลใหม่ทุก 5 วินาที
setInterval(loadAGVData, 5000);

