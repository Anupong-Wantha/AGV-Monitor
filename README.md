# AGV MONITOR Web App - ระบบติดตาม AGV ด้วย IOT

## 📌 ภาพรวม
AGV Monitor เป็นระบบที่ใช้ในการติดตามสถานะและตำแหน่งของ AGV (Automated Guided Vehicle) โดยระบบนี้ใช้ **XAMPP** ในการรัน **Web Application** และใช้ **PostgreSQL** เป็นฐานข้อมูลหลักสำหรับจัดเก็บข้อมูลการทำงานของ AGV รวมถึงสถานะ, ข้อผิดพลาด, และตำแหน่งในโรงงาน นอกจากนี้ยังใช้ **Node-RED** เพื่อดึงข้อมูลจาก **PLC ผ่าน Modbus** และเก็บในฐานข้อมูล **PostgreSQL และ InfluxDB**

---

## 📖 สารบัญ (Table of Contents)
1. [ขั้นตอนการติดตั้งเครื่องมือที่ใช้](#ขั้นตอนการติดตั้งเครื่องมือที่ใช้)
2. [การติดตั้ง XAMPP และ PostgreSQL](#การติดตั้ง-xampp-และ-postgresql)
3. [การติดตั้ง Node-RED บน Raspberry Pi และ Windows Server](#การติดตั้ง-node-red-บน-raspberry-pi-และ-windows-server)
4. [การติดตั้ง InfluxDB](#การติดตั้ง-influxdb)
5. [โครงสร้างฐานข้อมูลและความสัมพันธ์](#โครงสร้างฐานข้อมูลและความสัมพันธ์)
6. [Flow การทำงานของระบบ](#flow-การทำงานของระบบ)
7. [การตั้งค่า Firewall และ Network](#การตั้งค่า-firewall-และ-network)
8. [การดูแลรักษาระบบ](#การดูแลรักษาระบบ)
9. [การใช้งานระบบ](#การใช้งานระบบ)
10. [คำสั่ง SQL สำคัญ](#คำสั่ง-sql-สำคัญ)
11. [การสำรองและกู้คืนฐานข้อมูล](#การสำรองและกู้คืนฐานข้อมูล)
12. [สรุป](#สรุป)

---

## 🔧 ขั้นตอนการติดตั้งเครื่องมือที่ใช้

### **ติดตั้ง XAMPP บน Windows**
1. ดาวน์โหลด XAMPP จาก [Apache Friends](https://www.apachefriends.org/)
2. เปิดตัวติดตั้งและเลือก **Apache และ PHP**
3. กด **Next** และรอให้ติดตั้งเสร็จสิ้น
4. เปิด **XAMPP Control Panel** และกด **Start** ที่ **Apache**
5. ทดสอบโดยเปิดเบราว์เซอร์เข้าไปที่ `http://localhost/`

### **ติดตั้ง PostgreSQL บน Windows**
1. ดาวน์โหลด PostgreSQL จาก [PostgreSQL Download](https://www.postgresql.org/download/)
2. ติดตั้ง PostgreSQL และ pgAdmin4
3. สร้างฐานข้อมูล `agv_db` และผู้ใช้ `agv_user`
4. ตรวจสอบการเชื่อมต่อโดยรันคำสั่ง:
   ```sh
   psql -U agv_user -d agv_db -W
   SELECT version();
   ```

---

## 🚀 การติดตั้ง Node-RED บน Raspberry Pi และ Windows Server

### **ติดตั้ง Node-RED บน Raspberry Pi**
```sh
sudo apt update && sudo apt upgrade -y
bash <(curl -sL https://raw.githubusercontent.com/node-red/linux-installers/master/deb/update-nodejs-and-nodered)
sudo systemctl enable nodered.service
sudo systemctl start nodered
```
**เข้าถึง Node-RED ผ่านเว็บ:** `http://<IP Raspberry Pi>:1880`

### **ติดตั้ง Node-RED บน Windows Server**
```powershell
npm install -g --unsafe-perm node-red
node-red
```
**ใช้ PM2 เพื่อให้ Node-RED ทำงานอัตโนมัติ:**
```powershell
npm install -g pm2
pm2 start node-red --name "node-red"
pm2 save
pm2 startup
```

---

## 💾 การติดตั้ง InfluxDB บน Raspberry Pi
```sh
wget -qO- https://repos.influxdata.com/influxdb.key | sudo tee /etc/apt/trusted.gpg.d/influxdb.asc > /dev/null
echo "deb https://repos.influxdata.com/debian stable main" | sudo tee /etc/apt/sources.list.d/influxdb.list
sudo apt update
sudo apt install influxdb -y
sudo systemctl start influxdb
sudo systemctl enable influxdb
```

---

## 📊 โครงสร้างฐานข้อมูลและความสัมพันธ์
### **ตารางหลัก:**
- `tbl_bit_agv_logs` → บันทึกค่าบิตของ AGV จาก PLC
- `tbl_word_agv_logs` → บันทึกค่าคำสั่งจาก PLC
- `tbl_agvname` → รายชื่อ AGV
- `tbl_alarm` → รหัสข้อผิดพลาดของ AGV
- `tbl_sequence` → ลำดับการทำงานของ AGV
- `map_images` → ภาพแผนที่

---

## 🔄 Flow การทำงานของระบบ
1. **PLC** → ส่งข้อมูลผ่าน **Modbus TCP** ไปยัง **Node-RED** บน **Raspberry Pi**
2. **Node-RED** → ประมวลผลข้อมูลและบันทึกลง **PostgreSQL และ InfluxDB**
3. **Web App (XAMPP + PHP)** → ดึงข้อมูลจาก API ของ Node-RED และแสดงผล
4. **แสดงข้อมูลในรูปแบบตาราง, กราฟ, และแผนที่**

---

## 🛠 การดูแลรักษาระบบ
- ตรวจสอบข้อมูลที่ไม่ได้ซิงค์:
```sql
SELECT * FROM sync_tbl_bit_agv_logs_queue WHERE synced = false;
```
- Backup PostgreSQL:
```sh
pg_dump -U agv_user -d agv_db -F c -b -v -f agv_backup.sql
```

---

## 📜 คำสั่ง SQL สำคัญ
```sql
SELECT * FROM tbl_bit_agv_logs WHERE log_datetime >= NOW() - INTERVAL '7 days';
```

---

## 🔄 การสำรองและกู้คืนฐานข้อมูล
**สำรองข้อมูล:**
```sh
pg_dump -U agv_user -d agv_db -F c -b -v -f backup.sql
```
**กู้คืนข้อมูล:**
```sh
pg_restore -U agv_user -d agv_db -v backup.sql
```

---

## 🔚 สรุป
ระบบ **AGV Monitor** รองรับ **XAMPP + PostgreSQL** เชื่อมต่อกับ **Node-RED และ PLC** เพื่อให้สามารถติดตามสถานะ AGV ได้อย่างแม่นยำและมีประสิทธิภาพ 🚀

