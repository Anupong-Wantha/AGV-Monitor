const urlParams = new URLSearchParams(window.location.search);
const agvID = urlParams.get('agvID');

// เรียกใช้ API และแสดงข้อมูลใน DataTable
async function loadAGVLog() {
    try {
        const response = await fetch(`http://10.7.3.76:1880/get-all-agv-word-log?agvID=${agvID}`);
        const data = await response.json();
        document.getElementById("agvID").innerHTML = agvID;

        // แปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย และจัดการกับค่า d5004, aalrmcode และ aalrmdescription
        const formattedData = data.map(item => {
            const date = new Date(item.log_datetime);
            const optionsDate = { year: 'numeric', month: 'short', day: '2-digit' };
            const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };
            const formattedDate = `${date.toLocaleDateString('en-GB', optionsDate)} ${date.toLocaleTimeString('en-GB', optionsTime)}`;

            // Logic สำหรับการแสดงค่าตามเงื่อนไข
            let displayDescription;

            if (item.aalrmdescription !== null) {
                displayDescription = item.aalrmdescription; // ใช้ aalrmdescription หากไม่เป็น null
            } else if (item.d5004 !== null && item.aalrmcode !== null) {
                displayDescription = `Code: ${item.aalrmcode}`; // ใช้ aalrmcode หาก aalrmdescription เป็น null และ d5004, aalrmcode มีค่า
            } else {
                displayDescription = "Normal"; // ค่าเริ่มต้น
            }

            return {
                ...item,
                stamp_date: formattedDate, // ใช้วันที่ที่แปลงแล้ว
                aalrmdescription: displayDescription // แสดงค่าที่จัดการแล้ว
            };
        });

        // แสดงข้อมูลใน DataTable
        $('#agvTable').DataTable({
            data: formattedData,
            columns: [
                { data: 'agv_name' },
                { data: 'aalrmdescription' }, // ใช้ค่าใหม่ที่จัดการแล้ว
                { data: 'd5000' },
                { data: 'description' },
                { data: 'stamp_date' }
            ],
            "order": [[1, "desc"]] // เรียงข้อมูลตามวันที่จากใหม่ไปเก่า
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

loadAGVLog();




