let savedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
const savedFrameBackground = localStorage.getItem('frameBackgroundImage');

// ฟังก์ชันอัปเดตพื้นหลัง
function updateFrameBackground(imageUrl) {
    const frame = document.getElementById('imageFrame');
    frame.style.backgroundImage = `url('${imageUrl}')`;
    localStorage.setItem('frameBackgroundImage', imageUrl);
}

// โหลดภาพพื้นหลังที่บันทึกไว้ครั้งแรก
if (savedFrameBackground) {
    updateFrameBackground(savedFrameBackground);
}

// ฟังก์ชันแสดง dropdown
function displayDropdown(files) {
    const dropdown = document.getElementById('backgroundDropdown');
    dropdown.innerHTML = '<option value="">Select Background</option>';
    files.forEach((file, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = file.name; // แสดงชื่อไฟล์
        dropdown.appendChild(option);
    });
}

// แสดง dropdown เมื่อโหลดหน้า
displayDropdown(savedFiles);

// ฟังก์ชันอัปโหลดไฟล์
document.getElementById('backgroundFile').addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            savedFiles.push({ url: imageUrl, name: file.name }); // เก็บ URL และชื่อไฟล์
            localStorage.setItem('uploadedFiles', JSON.stringify(savedFiles)); // บันทึกใน Local Storage
            displayDropdown(savedFiles); // อัปเดต dropdown
        };
        reader.readAsDataURL(file);
    });
});

// ฟังก์ชันเลือกพื้นหลังจาก dropdown
function selectBackground() {
    const dropdown = document.getElementById('backgroundDropdown');
    const selectedIndex = dropdown.value;
    if (selectedIndex !== "") {
        const selectedFile = savedFiles[selectedIndex].url; // ดึง URL จากออบเจกต์
        updateFrameBackground(selectedFile); // อัปเดตพื้นหลัง
    }
}

// ฟังก์ชันลบไฟล์ที่เลือก
function deleteSelectedBackground() {
    const dropdown = document.getElementById('backgroundDropdown');
    const selectedIndex = dropdown.value;
    if (selectedIndex !== "") {
        const currentFrameBackground = localStorage.getItem('frameBackgroundImage');
        if (savedFiles[selectedIndex].url === currentFrameBackground) {
            resetBackground(); // รีเซ็ตพื้นหลังหากไฟล์ที่ลบคือภาพปัจจุบัน
        }
        savedFiles.splice(selectedIndex, 1); // ลบไฟล์ที่เลือก
        localStorage.setItem('uploadedFiles', JSON.stringify(savedFiles)); // อัปเดต Local Storage
        displayDropdown(savedFiles); // อัปเดต dropdown
    }
}

// ฟังก์ชันรีเซ็ตพื้นหลัง
function resetBackground() {
    const frame = document.getElementById('imageFrame');
    localStorage.removeItem('frameBackgroundImage');
    frame.style.backgroundImage = '';
}
