// ดึงชื่อ AGV จาก URL
function getAGVNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('agv_name');
}

// ฟังก์ชันแปลงรูปแบบวันที่และเวลา
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "วันที่ไม่ถูกต้อง";

    return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Bangkok"
    });
}

// ฟังก์ชันดึงข้อมูลตำแหน่ง AGV
async function fetchAGVPosition(agvName) {
    try {
        //const response = await fetch(`http://10.7.3.76:1880/positionAgv?agv_name=${agvName}`);
        const response = await fetch(`http://10.7.9.51:6100/api/AGV/names`);
        const data = await response.json();
        console.log("data", data);

        const filterData = data.filter(a => a.agvName === agvName);
        const mapfilterData = filterData.map(item => ({
            agv_name: item.agvName,
            create_date: item.createDate,
            line: item.line,
            name: item.name,
            plant: "EG1",
            frame: {
                type: "Buffer",
                data: []
            }
        }));

        console.log("mapfilterData", mapfilterData);


        if (data.length > 0) {
            const { agv_name, line, name, plant, frame } = data[0];
            displayPositionData({ agv_name, line, name, plant });
            displayImageFromFrame(frame);
        } else {
            document.getElementById('agv-position-info').innerHTML = `<h4>ไม่มีข้อมูลตำแหน่ง</h4>`;
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่ง AGV:", error);
    }
}

// ฟังก์ชันแสดงข้อมูลตำแหน่ง AGV
function displayPositionData({ agv_name, line, name, plant }) {
    document.getElementById('agv-position-info').innerHTML = `
        <h3>ชื่อ AGV: ${agvName}</h3>
        <h5>line: ${line}</h5>
        <h5>name: ${name}</h5>
        <h5>plant: ${line}</h5>
    `;
}

// ฟังก์ชันแสดงภาพจากข้อมูล frame
function displayImageFromFrame(frame) {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const parsedFrame = typeof frame === 'string' ? JSON.parse(frame) : frame;

    if (parsedFrame?.type === 'Buffer' && parsedFrame.data.length > 0) {
        const buffer = new Uint8Array(parsedFrame.data);
        const blob = new Blob([buffer], { type: 'image/png' });
        const img = new Image();

        img.src = URL.createObjectURL(blob);
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000000";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ไม่มีภาพ", canvas.width / 2, canvas.height / 2);
    }
}

// ฟังก์ชันดึงข้อมูล Log ของ AGV
// ฟังก์ชันสำหรับดึงค่าพารามิเตอร์จาก URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ฟังก์ชันสำหรับดึงข้อมูล Log AGV
async function fetchAGVLogs() {
    try {
        // อ่านค่าพารามิเตอร์ agv_name จาก URL
        const agvName = getQueryParam('agv_name');

        if (!agvName) {
            console.error("ไม่พบพารามิเตอร์ agv_name ใน URL");
            document.getElementById('databit').innerHTML = `<h4>ไม่มีข้อมูล Log</h4>`;
            return;
        }

        // ดึงข้อมูลจาก API ใหม่
        const response = await fetch(`http://10.7.9.51:6100/api/AGV/bits?agv_name=${encodeURIComponent(agvName)}`);
        const data = await response.json();

        if (data.length > 0) {
            displayLogData(data[0]);
        } else {
            document.getElementById('databit').innerHTML = `<h4>ไม่มีข้อมูล Log</h4>`;
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Log:", error);
    }
}

// ฟังก์ชันแสดงข้อมูล Log AGV
// ฟังก์ชันสำหรับดึงค่าพารามิเตอร์จาก URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ฟังก์ชันสำหรับดึงข้อมูล Log AGV
async function fetchAGVLogs() {
    try {
        const agvName = getAGVNameFromURL();
        console.log("Fetching logs for AGV:", agvName);

        if (!agvName) {
            console.error("ไม่พบพารามิเตอร์ agv_name ใน URL");
            document.getElementById('databit').innerHTML = `<h4>ไม่มีข้อมูล Log</h4>`;
            return;
        }

        // เรียก API
        const response = await fetch(`http://10.7.9.51:6100/api/AGV/bits`);
        const data = await response.json();
        console.log("Log API Response:", data);

        // ✅ กรองข้อมูลให้ตรงกับ AGV ที่เลือก
        const filterLogData = data.filter(log => log.agvName === agvName);
        console.log("Filtered Log Data:", filterLogData);

        if (filterLogData.length > 0) {
            // ✅ ใช้ข้อมูลที่ถูกต้องของ AGV03 (เลือก index ล่าสุด)
            displayLogData(filterLogData[0]);
        } else {
            document.getElementById('databit').innerHTML = `<h4>ไม่มีข้อมูล Log</h4>`;
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Log:", error);
    }
}



// ฟังก์ชันแสดงข้อมูล Log AGV
function displayLogData(log) {
    const { logDatetime, agvName, m0, m1, m2, m4 } = log;
    const formattedDateTime = new Date(logDatetime).toLocaleString();

    // แสดงข้อมูลเวลา
    document.getElementById('agv-log-info').innerHTML = `
        <h6>AGV Name: ${agvName}</h6>
        <h6>Log Time: ${formattedDateTime}</h6>
    `;

    // กำหนดสีสำหรับแต่ละสถานะ
    const linkOnlineStyle = m0 ? 'background-color: green; color: white;' : 'background-color: red; color: white;';
    const systemAGVStyle = m1 ? 'background-color: red; color: white;' : 'background-color: green; color: white;';
    const statusAGVStyle = m2 ? 'background-color: green; color: white;' : 'background-color: lightgray; color: black;';
    const areaSensorStyle = m4 ? 'background-color: green; color: white;' : 'background-color: red; color: white;';

    // แสดงข้อมูลสถานะ
    document.getElementById('databit').innerHTML = `
        <h6 style="${linkOnlineStyle}">link Online: ${m0 ? "on" : "off"}</h6>
        <h6 style="${systemAGVStyle}">System AGV: ${m1 ? "ERROR" : "NORMAL"}</h6>
        <h6 style="${statusAGVStyle}">Status AGV: ${m2 ? "Running" : "Paused"}</h6>
        <h6 style="${areaSensorStyle}">Area sensor: ${m4 ? "on" : "off"}</h6>
    `;
}

// เรียกฟังก์ชัน fetchAGVLogs เมื่อโหลดหน้า
window.onload = fetchAGVLogs;




// ฟังก์ชันดึงข้อมูล Sequence ของ AGV
async function fetchAGVSequence(agvName) {
    try {
        console.log("Fetching sequence for AGV:", agvName);

        const wordsResponse = await fetch(`http://10.7.9.51:6100/api/AGV/words`);
        const wordsData = await wordsResponse.json();
        console.log("Words API Response:", wordsData);

        const sequenceResponse = await fetch('http://10.7.9.51:6100/api/AGV/sequence?agvType=OutDoor');
        const sequenceData = await sequenceResponse.json();
        console.log("Sequence API Response:", sequenceData);

        // ✅ กรองเฉพาะ AGV ที่ต้องการ
        const filteredWords = wordsData.filter(log => log.agvName === agvName);
        console.log("Filtered Words Data:", filteredWords);

        if (filteredWords.length > 0 && sequenceData.length > 0) {
            const latestWord = filteredWords[0]; // ✅ ใช้ข้อมูลล่าสุดของ AGV03
            const d1 = latestWord.d1;
            console.log("Matching d1 value:", d1);

            if (d1 === undefined || d1 === null) {
                console.warn("ค่า d1 เป็น null หรือ undefined");
                return;
            }

            const sequenceMatch = sequenceData.find(seq => seq.seqNo === d1);
            console.log("Sequence Match:", sequenceMatch);

            if (sequenceMatch) {
                const { description } = sequenceMatch;
                const logDatetime = latestWord.logDatetime;
                const formattedDateTime = new Date(logDatetime).toLocaleString();
                document.getElementById('agv-seq').innerHTML = `${formattedDateTime}: ${description}`;
            } else {
                document.getElementById('agv-seq').innerHTML = `<h4>ไม่มีข้อมูลลำดับที่ตรงกัน</h4>`;
            }
        } else {
            document.getElementById('agv-seq').innerHTML = `<h4>ไม่มีข้อมูลลำดับ</h4>`;
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Sequence:", error);
    }
}


// เรียกฟังก์ชันเมื่อโหลดหน้า
const agvName = getAGVNameFromURL();
if (agvName) {
    fetchAGVPosition(agvName);
    fetchAGVLogs(agvName);
    fetchAGVSequence(agvName);
} else {
    console.error("ไม่พบชื่อ AGV ใน URL");
    document.getElementById('agv-position-info').innerHTML = `<h4 style="color:red;">กรุณาระบุชื่อ AGV ใน URL</h4>`;
}
