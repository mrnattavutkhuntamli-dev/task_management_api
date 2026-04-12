# 📝 Task Management API

> 🚧 **อยู่ระหว่างการพัฒนา (Work In Progress)**

รวม Concept ทุกอย่างที่เรียนมาสร้างเป็น **Production-ready REST API** สำหรับระบบจัดการงาน (Task Management) พัฒนาด้วย TypeScript และ Vue

---

## 🚀 Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Backend API | TypeScript |
| Frontend | Vue |
| Architecture | REST API |

---

## 📁 โครงสร้างโปรเจค

```
task_management_api/
├── task_management_api_/   # Backend REST API (TypeScript)
├── nak-drive/               # (โมดูลเพิ่มเติม)
└── README.md
```

---

## 🎯 เป้าหมายของโปรเจค

โปรเจคนี้สร้างขึ้นเพื่อฝึกและรวม concept ต่างๆ ที่เรียนมาให้ครบ เป็น Production-ready API ได้แก่:

- ✅ RESTful API Design
- ✅ TypeScript Typing & Interface
- ✅ Authentication & Authorization
- ✅ Database Integration
- ✅ Error Handling
- ✅ Validation
- 🔄 Testing (กำลังพัฒนา)

---

## ⚙️ การติดตั้งและรัน

### ความต้องการเบื้องต้น

- [Node.js](https://nodejs.org/) >= 18
- npm หรือ yarn

### 1. Clone โปรเจค

```bash
git clone https://github.com/mrnattavutkhuntamli-dev/task_management_api.git
cd task_management_api
```

### 2. ติดตั้ง Dependencies

```bash
cd task_management_api_
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env
# แก้ไขค่าใน .env ให้เหมาะสม
```

### 4. รัน Development Server

```bash
npm run dev
```

---

## 📡 API Endpoints

> ⚠️ อยู่ระหว่างพัฒนา รายละเอียด Endpoint อาจมีการเปลี่ยนแปลง

| Method | Endpoint | คำอธิบาย |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | สมัครสมาชิก |
| `POST` | `/api/auth/login` | เข้าสู่ระบบ |
| `GET` | `/api/tasks` | ดึงรายการงานทั้งหมด |
| `POST` | `/api/tasks` | สร้างงานใหม่ |
| `GET` | `/api/tasks/:id` | ดูรายละเอียดงาน |
| `PUT` | `/api/tasks/:id` | อัปเดตงาน |
| `DELETE` | `/api/tasks/:id` | ลบงาน |

---

## 🗺️ Roadmap

- [x] โครงสร้างโปรเจคเบื้องต้น
- [x] REST API พื้นฐาน
- [ ] Authentication (JWT)
- [ ] Database Integration
- [ ] Unit Testing
- [ ] API Documentation (Swagger)
- [ ] CI/CD Pipeline

---

## 👤 ผู้พัฒนา

**Nattavut Khuntamli**
- GitHub: [@mrnattavutkhuntamli-dev](https://github.com/mrnattavutkhuntamli-dev)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> 💡 **หมายเหตุ:** โปรเจคนี้ยังอยู่ระหว่างการพัฒนา ข้อมูลใน README จะถูกอัปเดตเมื่อมีความคืบหน้า
