// // ดึงค่า AGV จาก URL หรือ LocalStorage
// const urlParams = new URLSearchParams(window.location.search);
// console.log('urlParams.get', urlParams.get('agv_name'));
// console.log('localStorage.getItem', localStorage.getItem('selectedAGV'));

// let selectedAGV = urlParams.get('agv_name') || localStorage.getItem('selectedAGV');

// // Log ค่า AGV ที่เลือก
// console.log('Selected AGV:', selectedAGV);

// // ฟังก์ชันโหลดข้อมูลจาก API และแสดงจุด AGV
// async function loadAGVData() {
//     const apiWords = "http://10.7.9.51:6100/api/AGV/words";
//     const apiAgvNames = "http://10.7.9.51:6100/api/AGV/names";
//     const apiTags = "http://10.7.9.51:6100/api/AGV/tag?agvType=Outdoor";

//     try {
//         const [wordsResponse, agvNamesResponse, tagsResponse] = await Promise.all([
//             fetch(apiWords),
//             fetch(apiAgvNames),
//             fetch(apiTags)
//         ]);

//         const wordsData = await wordsResponse.json();
//         const agvNamesData = await agvNamesResponse.json();
//         const tagsData = await tagsResponse.json();

//         const agvData = wordsData.find(word => word.agvName === selectedAGV);

//         if (agvData) {
//             const tagData = tagsData.find(tag => tag.tagId === agvData.d0);
//             const frameWidth = document.getElementById('innerFrame').offsetWidth;
//             const frameHeight = document.getElementById('innerFrame').offsetHeight;
//             const mapOriginalWidth = 1920; // ความกว้างของแผนที่ต้นฉบับ
//             const mapOriginalHeight = 1080; // ความสูงของแผนที่ต้นฉบับ

//             const scaleX = frameWidth / mapOriginalWidth;
//             const scaleY = frameHeight / mapOriginalHeight;

//             if (tagData) {
//                 const marker = document.createElement('div');
//                 marker.style.position = 'absolute';
//                 marker.style.left = `${tagData.positionX * scaleX}px`;
//                 marker.style.top = `${tagData.positionY * scaleY}px`;
//                 marker.style.width = '10px';
//                 marker.style.height = '10px';
//                 marker.style.backgroundColor = 'green';
//                 marker.style.borderRadius = '50%';
//                 document.getElementById('innerFrame').appendChild(marker);
//             } else {
//                 console.warn(`Tag data not found for AGV: ${selectedAGV}`);
//             }
//         } else {
//             console.warn(`ไม่พบข้อมูลของ AGV: ${selectedAGV}`);
//         }
//     } catch (error) {
//         console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล AGV:", error);
//     }
// }

// // ตัวแปรเก็บสถานะการซูม
// let currentScale = 1;
// let currentX = 0;
// let currentY = 0;

// // ฟังก์ชันอัปเดตการแสดงผล
// function updateTransform() {
//     const innerFrame = document.getElementById('innerFrame');
//     innerFrame.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
//     innerFrame.style.transformOrigin = 'top left';
// }

// // ฟังก์ชัน Zoom In
// function zoomIn() {
//     currentScale = Math.min(currentScale + 0.1, 5); // จำกัดการซูมสูงสุดที่ 5x
//     updateTransform();
// }

// // ฟังก์ชัน Zoom Out
// function zoomOut() {
//     currentScale = Math.max(currentScale - 0.1, 0.5); // จำกัดการซูมต่ำสุดที่ 0.5x
//     updateTransform();
// }

// // ฟังก์ชัน Reset Zoom
// function resetImage() {
//     currentScale = 1;
//     currentX = 0;
//     currentY = 0;
//     updateTransform();
// }

// // เพิ่มปุ่มสำหรับ Zoom In, Zoom Out, และ Reset
// window.onload = function() {
//     const controlPanel = document.createElement('div');
//     controlPanel.style.position = 'absolute';
//     controlPanel.style.top = '10px';
//     controlPanel.style.right = '10px';
//     controlPanel.style.zIndex = '1000';
//     controlPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
//     controlPanel.style.padding = '10px';
//     controlPanel.style.borderRadius = '5px';

//     const zoomInButton = document.createElement('button');
//     zoomInButton.innerText = 'Zoom In';
//     zoomInButton.onclick = zoomIn;
//     controlPanel.appendChild(zoomInButton);

//     const zoomOutButton = document.createElement('button');
//     zoomOutButton.innerText = 'Zoom Out';
//     zoomOutButton.style.marginLeft = '5px';
//     zoomOutButton.onclick = zoomOut;
//     controlPanel.appendChild(zoomOutButton);

//     const resetButton = document.createElement('button');
//     resetButton.innerText = 'Reset';
//     resetButton.style.marginLeft = '5px';
//     resetButton.onclick = resetImage;
//     controlPanel.appendChild(resetButton);

//     document.body.appendChild(controlPanel);
// };

// // โหลดข้อมูลเมื่อเปิดหน้า
// loadAGVData();

// // ตั้งค่าให้โหลดข้อมูลใหม่ทุก 5 วินาที
// setInterval(loadAGVData, 5000);
const frame = document.getElementById('imageFrame');
const innerFrame = document.getElementById('innerFrame');
let scale = 1;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

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

// ดึงค่า AGV จาก URL หรือ LocalStorage
const urlParams = new URLSearchParams(window.location.search);
let selectedAGV = urlParams.get('agv_name') || localStorage.getItem('selectedAGV');

// Log ค่า AGV ที่เลือก
console.log('Selected AGV:', selectedAGV);

function updateTransform() {
    innerFrame.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

window.zoomIn = function zoomIn() {
    scale = Math.min(scale + 0.1, 5);
    updateTransform();
};

window.zoomOut = function zoomOut() {
    scale = Math.max(scale - 0.1, 1);
    updateTransform();
};

window.resetImage = function resetImage() {
    scale = 1;
    posX = 0;
    posY = 0;
    updateTransform();
};

innerFrame.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX - posX;
    startY = event.clientY - posY;
    innerFrame.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    posX = event.clientX - startX;
    posY = event.clientY - startY;
    updateTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    innerFrame.style.cursor = 'grab';
});

frame.addEventListener('mouseleave', () => {
    isDragging = false;
});

function clearMarkers() {
    const markers = innerFrame.querySelectorAll('div');
    markers.forEach(marker => marker.remove());
}

async function fetchDataWithBackup(url, storageKey) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        localStorage.setItem(storageKey, JSON.stringify(data)); // บันทึกข้อมูลล่าสุด
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        const backupData = localStorage.getItem(storageKey);
        return backupData ? JSON.parse(backupData) : [];
    }
}

async function loadAGVData() {
    const wordsData = await fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/words', 'agvWordsBackup');
    const agvNamesData = await fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/names', 'agvNamesBackup');
    const tagsData = await fetchDataWithBackup('http://10.7.9.51:6100/api/AGV/tag?agvType=Outdoor', 'agvTagsBackup');

    const agvData = wordsData.find(word => word.agvName === selectedAGV);

    if (agvData) {
        const tagData = tagsData.find(tag => tag.tagId === agvData.d0);
        const frameWidth = innerFrame.offsetWidth;
        const frameHeight = innerFrame.offsetHeight;
        const mapOriginalWidth = 1920;
        const mapOriginalHeight = 1080;

        const scaleX = frameWidth / mapOriginalWidth;
        const scaleY = frameHeight / mapOriginalHeight;

        if (tagData) {
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.left = `${tagData.positionX * scaleX}px`;
            marker.style.top = `${tagData.positionY * scaleY}px`;
            marker.style.width = '10px';
            marker.style.height = '10px';
            marker.style.backgroundColor = 'green';
            marker.style.borderRadius = '50%';
            innerFrame.appendChild(marker);
        } else {
            console.warn(`Tag data not found for AGV: ${selectedAGV}`);
        }
    } else {
        console.warn(`ไม่พบข้อมูลของ AGV: ${selectedAGV}`);
    }

    // บันทึกข้อมูล AGV ล่าสุด
    localStorage.setItem('latestAGVData', JSON.stringify(wordsData));
}

loadAGVData();
setInterval(loadAGVData, 5000);
