// async function loadAGVTable() {
//     try {
//         const response = await fetch('http://10.7.9.51:6100/api/AGV/names');
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const agvNames = await response.json();
//         console.log('AGV Names from API:', agvNames);

//         const tableBody = document.getElementById('colorSettingTable'); // ใช้ id เฉพาะสำหรับ Color Setting
//         if (!tableBody) {
//             console.error('Element with ID "colorSettingTable" not found in DOM');
//             return;
//         }

//         tableBody.innerHTML = ''; // ลบข้อมูลเดิม

//         agvNames.forEach(agv => {
//             const row = document.createElement('tr');

//             // คอลัมน์ AGV Name
//             const agvNameCell = document.createElement('td');
//             agvNameCell.textContent = agv.agvName || 'N/A';
//             row.appendChild(agvNameCell);

//             // คอลัมน์ Current Color
//             const currentColorCell = document.createElement('td');
//             currentColorCell.textContent = agv.markerColor || 'Not Set';
//             row.appendChild(currentColorCell);

//             // คอลัมน์ New Color
//             const newColorCell = document.createElement('td');
//             const colorInput = document.createElement('input');
//             colorInput.type = 'color';
//             colorInput.value = agv.markerColor || '#ffffff';
//             newColorCell.appendChild(colorInput);
//             row.appendChild(newColorCell);

//             // คอลัมน์ Action
//             const actionCell = document.createElement('td');
//             const saveButton = document.createElement('button');
//             saveButton.textContent = 'Save';
//             saveButton.classList.add('btn', 'btn-outline-light'); // เพิ่ม class

//             // เพิ่ม Event Listener ให้ปุ่ม Save
//             saveButton.addEventListener('click', async () => {
//                 const newColor = colorInput.value;

//                 try {
//                     const updateResponse = await fetch('http://10.7.3.76:1880/update-marker-color', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify({
//                             agvName: agv.agvName,
//                             markerColor: newColor
//                         })
//                     });

//                     if (!updateResponse.ok) {
//                         throw new Error(`HTTP error! status: ${updateResponse.status}`);
//                     }

//                     const result = await updateResponse.json();
//                     alert(result.message || 'Color updated successfully!');

//                     // อัปเดตสีในตาราง
//                     currentColorCell.textContent = newColor;
//                 } catch (error) {
//                     console.error('Error updating color:', error);
//                     alert('Failed to update marker color. Please try again.');
//                 }
//             });

//             actionCell.appendChild(saveButton);
//             row.appendChild(actionCell);

//             tableBody.appendChild(row);
//         });
//     } catch (error) {
//         console.error('Error loading AGV data:', error);
//         alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
//     }
// }

// // เรียกฟังก์ชันเมื่อ DOM โหลดเสร็จ
// document.addEventListener('DOMContentLoaded', () => {
//     loadAGVTable();
// });
async function loadAGVTable() {
    try {
        const response = await fetch('http://10.7.9.51:6100/api/AGV/names');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const agvNames = await response.json();
        console.log('AGV Names from API:', agvNames);

        // บันทึกข้อมูลล่าสุดใน localStorage
        localStorage.setItem('agvNamesBackup', JSON.stringify(agvNames));

        updateAGVTable(agvNames);
    } catch (error) {
        console.error('Error loading AGV data:', error);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
        
        // ใช้ข้อมูลสำรองจาก localStorage หากมี
        const backupData = localStorage.getItem('agvNamesBackup');
        if (backupData) {
            console.log('Loading AGV data from backup');
            updateAGVTable(JSON.parse(backupData));
        }
    }
}

function updateAGVTable(agvNames) {
    const tableBody = document.getElementById('colorSettingTable');
    if (!tableBody) {
        console.error('Element with ID "colorSettingTable" not found in DOM');
        return;
    }

    tableBody.innerHTML = '';

    agvNames.forEach(agv => {
        const row = document.createElement('tr');

        // คอลัมน์ AGV Name
        const agvNameCell = document.createElement('td');
        agvNameCell.textContent = agv.agvName || 'N/A';
        row.appendChild(agvNameCell);

        // คอลัมน์ Current Color
        const currentColorCell = document.createElement('td');
        currentColorCell.textContent = agv.markerColor || 'Not Set';
        row.appendChild(currentColorCell);

        // คอลัมน์ New Color
        const newColorCell = document.createElement('td');
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = agv.markerColor || '#ffffff';
        newColorCell.appendChild(colorInput);
        row.appendChild(newColorCell);

        // คอลัมน์ Action
        const actionCell = document.createElement('td');
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.classList.add('btn', 'btn-outline-light');

        saveButton.addEventListener('click', async () => {
            const newColor = colorInput.value;

            try {
                const updateResponse = await fetch('http://10.7.3.76:1880/update-marker-color', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        agvName: agv.agvName,
                        markerColor: newColor
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error(`HTTP error! status: ${updateResponse.status}`);
                }

                const result = await updateResponse.json();
                alert(result.message || 'Color updated successfully!');

                // อัปเดตสีในตาราง
                currentColorCell.textContent = newColor;

                // อัปเดตข้อมูลใน localStorage
                const updatedAGVNames = JSON.parse(localStorage.getItem('agvNamesBackup')) || [];
                const updatedData = updatedAGVNames.map(item =>
                    item.agvName === agv.agvName ? { ...item, markerColor: newColor } : item
                );
                localStorage.setItem('agvNamesBackup', JSON.stringify(updatedData));
            } catch (error) {
                console.error('Error updating color:', error);
                alert('Failed to update marker color. Please try again.');
            }
        });

        actionCell.appendChild(saveButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// เรียกฟังก์ชันเมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    loadAGVTable();
});
