# AGV-Monitor
เป็นโปรแกรมที่ถูกสร้างมาเพื่อดึงข้อมูล จาก PLC ของตัวรถ AGV โดย ใช้ โปรโตคอลกลาง ชื่อ ว่า Modbus ใน Node-red ที่อยู่ในเครื่อง Rasberry-pi ดึงข้อมูลมาเก็บไว้ใน database ที่ชื่อ Postgresql และมีข้อมูล Buffer ด้วย InfluxDB แสดงผล โดย ใช้ api จาก Node-red ส่งค่าไปยัง Web app เพื่อแสดงผล 
