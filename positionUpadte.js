// Ensure calculateScaledPosition is imported or available here
function calculateScaledPosition(positionX, positionY, containerWidth, containerHeight, mapWidth = 1920, mapHeight = 1080) {
    const scale = Math.min(containerWidth / mapWidth, containerHeight / mapHeight);
    const scaledMapWidth = mapWidth * scale;
    const scaledMapHeight = mapHeight * scale;
    const offsetX = (containerWidth - scaledMapWidth) / 2;
    const offsetY = (containerHeight - scaledMapHeight) / 2;
    const scaledX = positionX * scale + offsetX;
    const scaledY = positionY * scale + offsetY;
    return { scaledX, scaledY };
}

// Function to display the marker on the `innerFrame`
function updateMarker(positionX, positionY) {
    const innerFrame = document.getElementById('innerFrame');
    const containerWidth = innerFrame.offsetWidth;
    const containerHeight = innerFrame.offsetHeight;

    // Calculate scaled position
    const { scaledX, scaledY } = calculateScaledPosition(positionX, positionY, containerWidth, containerHeight);

    // Clear existing marker
    let marker = document.getElementById('selected-marker');
    if (!marker) {
        marker = document.createElement('div');
        marker.id = 'selected-marker';
        marker.style.position = 'absolute';
        marker.style.width = '8px';
        marker.style.height = '8px';
        marker.style.backgroundColor = 'blue';
        marker.style.borderRadius = '50%';
        marker.style.zIndex = '10';
        innerFrame.appendChild(marker);
    }

    // Update marker position
    marker.style.left = `${scaledX - 7.5}px`; // Adjust for marker size
    marker.style.top = `${scaledY - 7.5}px`;
    marker.style.display = 'block';
}

// Function to handle select event
function handleSelect(tag_id, position_x, position_y) {
    console.log(`Selected: Tag ID=${tag_id}, X=${position_x}, Y=${position_y}`);
    updateMarker(position_x, position_y);
}

// Hook into mapagv.js data
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('data-table');
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            if (event.target && event.target.matches('button.btn-warning')) {
                const row = event.target.closest('tr');
                const tagId = row.getAttribute('data-tag-id');
                const positionX = parseFloat(row.querySelector('td:nth-child(3)').innerText);
                const positionY = parseFloat(row.querySelector('td:nth-child(4)').innerText);

                handleSelect(tagId, positionX, positionY);
            }
        });
    }
});






// ฟังก์ชันเมื่อกด Select
function populateForm(tag_id, position_x, position_y) {
    console.log(`populateForm called with: Tag ID=${tag_id}, Position X=${position_x}, Position Y=${position_y}`);

    document.getElementById('tag_id').value = tag_id;
    document.getElementById('position_x').value = position_x;
    document.getElementById('position_y').value = position_y;

    // อัปเดตตำแหน่ง Marker
    updateAGVMarker(position_x, position_y);
}

// ฟังก์ชันสำหรับค้นหา
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("search-input").addEventListener("keyup", function () {
        const filter = this.value.toLowerCase(); // ค่าที่พิมพ์ในช่องค้นหา
        const tbody = document.getElementById("data-table"); // tbody ที่เก็บแถวข้อมูล
        const rows = tbody.getElementsByTagName("tr"); // แถวทั้งหมดใน tbody

        // วนลูปเพื่อค้นหาแต่ละแถว
        Array.from(rows).forEach(row => {
            const cells = row.getElementsByTagName("td"); // คอลัมน์ในแต่ละแถว
            let match = false;

            // ตรวจสอบแต่ละคอลัมน์
            Array.from(cells).forEach(cell => {
                if (cell && cell.innerText.toLowerCase().includes(filter)) {
                    match = true; // พบคำที่ตรง
                }
            });

            // แสดงหรือซ่อนแถว
            row.style.display = match ? "" : "none";
        });
    });
});
// ฟังก์ชันลบตำแหน่ง
// Function to delete position
async function deletePosition(tag_id) {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
        const response = await fetch(`http://10.7.9.51:6100/api/AGV/tag`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tagId: tag_id })
        });

        if (response.ok) {
            alert('Position deleted successfully!');
            location.reload();
        } else {
            alert('Error deleting position.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    }
}

// ดึงข้อมูลจาก API และแสดงในตาราง
fetch('http://10.7.9.51:6100/api/AGV/tag?agvType=Outdoor')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('data-table');

        data.forEach(row => {
            // สร้างแถวข้อมูลในตาราง
            const tr = document.createElement('tr');
            tr.setAttribute('data-tag-id', row.tagId);
            tr.innerHTML = `
                <td>${row.tagId}</td>
                <td>${row.sequentId}</td>
                <td>${row.positionX}</td>
                <td>${row.positionY}</td>
                <td>
                    <button 
                        onclick="populateForm('${row.tagId}', ${row.positionX}, ${row.positionY})" 
                        class="btn btn-warning"
                    >
                        Select
                    </button>
                </td>
                <td>
                    <button onclick="deletePosition('${row.tagId}')" class="btn btn-danger">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
            
        });
    })
    .catch(error => console.error('Error fetching data:', error));

// ฟังก์ชันสำหรับการ Insert ข้อมูล
const insertForm = document.getElementById('insertForm');
insertForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // ป้องกันการ reload หน้าเว็บ

    const data = {
        tagId: document.getElementById('new_tag_id').value,
        positionX: document.getElementById('new_position_x').value,
        positionY: document.getElementById('new_position_y').value,
        sequentId: document.getElementById('sequent_id').value,
        agvRoute: document.getElementById('agv_route').value,
    };

    try {
        const response = await fetch('http://10.7.9.51:6100/api/AGV/tag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Position inserted successfully!');

            // เพิ่มข้อมูลในตารางโดยไม่ต้อง refresh
            const tableBody = document.getElementById('data-table');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.sequent_id}</td>
                <td>${data.tag_id}</td>
                <td>${data.agv_route}</td>
                <td>${data.position_x}</td>
                <td>${data.position_y}</td>
                <td>
                    <button 
                        onclick="populateForm('${data.tag_id}', ${data.position_x}, ${data.position_y})" 
                        class="btn btn-warning"
                    >
                        Select
                    </button>
                </td>
                <td>
                    <button onclick="deletePosition('${data.tag_id}')" class="btn btn-danger">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);

            // รีเซ็ตฟอร์ม
            insertForm.reset();
        } else {
            alert('Error inserting position.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    }
});
// ฟังก์ชันสำหรับอัปเดตตำแหน่ง AGV
const updateForm = document.getElementById('updateForm');
updateForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // ป้องกันการ reload หน้าเว็บ

    // เก็บข้อมูลจากฟอร์ม
    const data = {
        tag_id: document.getElementById('tag_id').value,
        position_x: parseFloat(document.getElementById('position_x').value),
        position_y: parseFloat(document.getElementById('position_y').value),
    };

    try {
        // ส่งข้อมูลไปยัง API
        const response = await fetch('http://10.7.3.76:1880/update-position', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Position updated successfully!');

            // อัปเดตตำแหน่ง Marker ทันที
            updateAGVMarker(data.position_x, data.position_y);

            // รีเฟรชข้อมูลในตาราง
            fetchUpdatedTable(); // ฟังก์ชันสำหรับดึงข้อมูลใหม่ในตาราง
        } else {
            alert('Error updating position.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


