// ฟังก์ชันสำหรับเปิด/ปิด Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger-menu');

    // Toggle Sidebar และ Hamburger Menu
    const isOpen = sidebar.classList.toggle('open');
    hamburger.classList.toggle('active');

    // บันทึกสถานะของ Sidebar ลงใน localStorage
    localStorage.setItem('sidebarOpen', isOpen ? 'true' : 'false');

    // ปรับตำแหน่ง Hamburger Menu
    hamburger.style.left = isOpen ? '260px' : '10px';
}

// ฟังก์ชันสำหรับตรวจสอบสถานะ Sidebar เมื่อโหลดหน้า
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger-menu');

    // ดึงสถานะ Sidebar จาก localStorage
    const isSidebarOpen = localStorage.getItem('sidebarOpen') === 'true';

    if (isSidebarOpen) {
        sidebar.classList.add('open');
        hamburger.classList.add('active');
        hamburger.style.left = '260px'; // ระยะของ Sidebar
    } else {
        sidebar.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.style.left = '10px'; // กลับไปมุมซ้ายเดิม
    }
}

// เรียกใช้ฟังก์ชัน initializeSidebar เมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', initializeSidebar);
