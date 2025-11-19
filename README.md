# Resourcely
Group 08 project for Y3 S1
This repository contains both the **frontend** (React + Vite) and **backend** (ASP.NET) for the project.  

---

## 🚀 Tech Stack

- **Frontend:** React, Vite  
- **Backend:** ASP.NET (.NET 8 LTS recommended)  
- **Package Manager:** npm  
- **Database:** Configurable via ASP.NET (SQL Server by default)  

---

## 📂 Repository  Structure
```bash
.
├─ frontend/ # React + Vite app 
│ ├─ src/
│  ├─ app/          
│  ├─ assets/       
│  ├─ components/  
│  ├─ lib/          
│  ├─ pages/        
│  └─ styles/        
│ ├─ public/
│ ├─ package.json
│ └─ vite.config.ts|js
├─ backend/ # ASP.NET Web API
│ ├─ Controllers/
│ ├─ Data/
│ ├─ Models/
│ ├─ Properties/
│ ├─ Program.cs
│ └─ Resourcely.csproj
└─ README.md
```

---

## ✅ Prerequisites

- **Node.js** 18+ (LTS) or 20+  
- **npm** 9+  
- **.NET SDK** 8.0+  
- **Git**  

Check versions:
bash
node -v
npm -v
dotnet --version

## ⚡ Quick Start

Get the project running in **5 minutes** 🚀

### 1. Clone the repo
```bash
git clone https://github.com/nipunmeegoda/Resourcely.git
cd Resourcely
```
### 2. Frontend Setup (React + Vite)
```bash
cd Frontend-Resourcely
npm install
npm run dev
```
### 3. Backend Setup (ASP.NET)
```bash
cd Backend-Resourcely/Backend-Resourcely
dotnet restore
dotnet build
dotnet run

```
### 4. Running Both Together
Open Terminal 1 → start frontend:
```bash
cd Frontend-Resourcely
npm run dev
```
Open Terminal 2 → start frontend:
```bash
cd Backend-Resourcely/Backend-Resourcely
dotnet run

```







