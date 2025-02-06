# AGV MONITOR Web App - ระบบติดตาม AGV ด้วย IoT

## 📌 ภาพรวม
AGV Monitor เป็นระบบติดตามสถานะและตำแหน่งของ AGV (Automated Guided Vehicle) โดยใช้ **XAMPP** สำหรับรัน **Web Application** และ **PostgreSQL** เป็นฐานข้อมูลหลัก ระบบดึงข้อมูลจาก **PLC ผ่าน Modbus** โดยใช้ **Node-RED** และบันทึกลง **PostgreSQL และ InfluxDB**

---

## 📖 สารบัญ
1. [การติดตั้งเครื่องมือ](#การติดตั้งเครื่องมือ)
2. [การติดตั้ง XAMPP และ PostgreSQL](#การติดตั้ง-xampp-และ-postgresql)
3. [การติดตั้ง Node-RED](#การติดตั้ง-node-red)
4. [การติดตั้ง InfluxDB](#การติดตั้ง-influxdb)
5. [โครงสร้างฐานข้อมูล](#โครงสร้างฐานข้อมูล)
6. [Flow การทำงาน](#flow-การทำงาน)
7. [การดูแลรักษาระบบ](#การดูแลรักษาระบบ)
8. [คำสั่ง SQL สำคัญ](#คำสั่ง-sql-สำคัญ)
9. [การสำรองและกู้คืนฐานข้อมูล](#การสำรองและกู้คืนฐานข้อมูล)
10. [สรุป](#สรุป)

---

## 🔧 การติดตั้งเครื่องมือ

### **XAMPP บน Windows**
1. ดาวน์โหลดจาก [Apache Friends](https://www.apachefriends.org/)
2. ติดตั้งและเลือก **Apache และ PHP**
3. เปิด **XAMPP Control Panel** และกด **Start** ที่ **Apache**
4. ทดสอบโดยเข้า `http://localhost/`

### **PostgreSQL บน Windows**
1. ดาวน์โหลดจาก [PostgreSQL](https://www.postgresql.org/download/)
2. ติดตั้งพร้อม **pgAdmin4**
3. สร้างฐานข้อมูล `agv_db` และผู้ใช้ `agv_user`
4. ตรวจสอบการเชื่อมต่อ:
   ```sh
   psql -U agv_user -d agv_db -W
   SELECT version();
   ```

---

## 🚀 การติดตั้ง Node-RED

### **บน Raspberry Pi**
```sh
sudo apt update && sudo apt upgrade -y
bash <(curl -sL https://raw.githubusercontent.com/node-red/linux-installers/master/deb/update-nodejs-and-nodered)
sudo systemctl enable nodered.service
sudo systemctl start nodered
```
**เข้าถึงผ่านเว็บ:** `http://<IP Raspberry Pi>:1880`

### **บน Windows Server**
```powershell
npm install -g --unsafe-perm node-red
node-red
```
**ตั้งค่าให้ทำงานอัตโนมัติด้วย PM2:**
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

## 📊 โครงสร้างฐานข้อมูล
### **ตารางหลัก**
- `tbl_bit_agv_logs` → บันทึกค่าบิตของ AGV จาก PLC
- `tbl_word_agv_logs` → บันทึกค่าคำสั่งจาก PLC
- `tbl_agvname` → รายชื่อ AGV
- `tbl_alarm` → รหัสข้อผิดพลาดของ AGV
- `tbl_sequence` → ลำดับการทำงานของ AGV
- `tag_agv` → สำหรับบอกตำแหน่งในแผนที่
- `map_images` → ภาพแผนที่

---

## 🔄 Flow การทำงาน
1. **PLC** → ส่งข้อมูลผ่าน **Modbus TCP** ไปยัง **Node-RED** บน **Raspberry Pi**
2. **Node-RED** → ประมวลผลและบันทึกลง **PostgreSQL และ InfluxDB**
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
