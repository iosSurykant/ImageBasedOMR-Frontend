# OMR Scanner System — Project Documentation
### Version: 2.1.1 | Built with React 18

---

## 1. What is this Project?

This is a web-based **OMR (Optical Mark Recognition) Scanner Management System**.  
It allows institutions to:
- Design OMR answer sheet templates
- Scan physical OMR sheets and extract data in real-time
- Generate exam results with custom scoring rules
- Manage users, subscriptions, and server files

---

## 2. Tech Stack

| Category         | Technology                              |
|------------------|-----------------------------------------|
| Frontend         | React 18                                |
| UI Libraries     | MUI v7, Reactstrap, React Bootstrap     |
| Routing          | React Router DOM v6                     |
| HTTP Client      | Axios + JWT Interceptor                 |
| Authentication   | JWT (`jwt-decode`)                      |
| Real-time        | WebSocket (native browser API)          |
| Offline Storage  | IndexedDB (via `idb`)                   |
| Payment Gateway  | Cashfree Payments                       |
| File Manager     | Syncfusion File Manager                 |
| Charts           | Chart.js + react-chartjs-2              |
| Alerts           | SweetAlert2, React Toastify             |

---

## 3. Environment & Configuration

**Backend URL** is loaded from environment variable:

```
REACT_APP_BACKEND_URL=http://your-backend-ip/
```

Set this in `.env` file at the project root. The `BackendApi.js` service reads this value and all API endpoints are built on top of it dynamically via `InitializeURL.js`.

**Run the project:**
```bash
npm install
npm start        # Runs on port 5000
npm run build    # Production build
```

---

## 4. Project Folder Structure

```
src/
├── App.js                  → Root component, defines all top-level routes
├── index.js                → React entry point
│
├── auth/
│   ├── Login.js            → Login page
│   ├── Signup.js           → Signup/Register page
│   └── Profile.js          → User profile page
│
├── config/
│   ├── routes.js           → All sidebar routes with components and layouts
│   └── ProtectedRoute.js   → JWT-based route guard
│
├── layouts/
│   ├── Admin.js            → Admin layout (Sidebar + Navbar + Routes)
│   ├── Auth.js             → Auth layout (Login/Signup wrapper)
│   ├── Operator.js         → Operator layout (currently commented out)
│   └── Moderator.js        → Moderator layout (currently commented out)
│
├── features/
│   ├── Dashboard/          → Charts and stats
│   ├── TemplateManager/    → Create and edit OMR templates
│   ├── Scanner/            → Scan OMR sheets in real-time
│   ├── ScannedData/        → View and manage past scan records
│   ├── ResultGeneration/   → Generate exam results from CSVs
│   ├── MergeCsv/           → Merge two CSV files
│   ├── FolderManagement/   → Browse server folders
│   ├── UserManagement/     → Manage system users
│   └── Subscription/       → Pricing plans and payments
│
├── helper/
│   ├── api_helper.js       → Base GET/POST/PUT/DELETE functions
│   ├── url_helper.js       → Returns resolved URL object
│   ├── InitializeURL.js    → Builds all API endpoint URLs from base URL
│   ├── TemplateHelper.js   → Template API calls
│   ├── userManagment_helper.js → User API calls
│   ├── Pricing_helper.js   → Subscription & payment API calls
│   └── ResultGenerationHelper.js → CSV/result API calls
│
├── Interceptor/
│   └── axios.js            → Axios instance with auto JWT Bearer token header
│
├── context/
│   ├── DataContext.js      → Context definition for template state
│   ├── DataProvider.js     → Provides template state and all operations
│   ├── ImageContext.js     → Context for image data
│   ├── ImageProvider.js    → Provides image state
│   └── ScanningContext.jsx → Tracks scanning and pause state globally
│
└── services/
    ├── BackendApi.js       → Returns REACT_APP_BACKEND_URL
    ├── cashfreeService.js  → Opens Cashfree payment checkout modal
    ├── CloneTemplate.js    → Clones an existing template
    ├── Base64toFile.js     → Converts base64 string to File object
    └── ErrorWrap.js        → API error handling utility
```

---

## 5. User Roles

| Role      | Access Level                                              | Default Redirect   |
|-----------|-----------------------------------------------------------|--------------------|
| Admin     | Full access to all features                               | `/admin/index`     |
| Moderator | Limited access (layout defined, routes not active yet)    | `/moderator/index` |
| Operator  | Scan sheets and assigned data entry tasks                 | `/operator/index`  |

---

## 6. Authentication Flow

**Files:** `Login.js` → `ProtectedRoute.js` → `axios.js`

```
User enters Email + Password
        ↓
API call → GET /api/userAuth/LoginForm?uname=&pwd=
        ↓
Backend returns JWT token
        ↓
jwtDecode(token) → extracts { role, empid, phone, email, userName }
        ↓
localStorage.setItem("token", ...)
localStorage.setItem("userData", JSON.stringify({...}))
        ↓
Redirect based on Role:
  Admin    → /admin/index
  Operator → /operator/index
  Moderator→ /moderator/index
```

**Every API request** automatically attaches the token:
```
axios interceptor → config.headers.Authorization = `Bearer ${token}`
```

**ProtectedRoute** checks on every protected page load:
1. No token → redirect to `/auth/login`
2. Token expired → clear localStorage → redirect to `/auth/login`
3. Wrong role → redirect to correct dashboard
4. All OK → render the page

---

## 7. Routing Map

### Auth Routes (`/auth/*`)
| Route           | Component   | Description        |
|-----------------|-------------|--------------------|
| `/auth/login`   | `Login.js`  | Login page         |
| `/auth/signup`  | `Signup.js` | Registration page  |

### Admin Routes (`/admin/*`) — Protected: Admin role only
| Route                                      | Component              | Sidebar |
|--------------------------------------------|------------------------|---------|
| `/admin/index`                             | Dashboard              | Yes     |
| `/admin/template`                          | Template Manager       | Yes     |
| `/admin/template/create-template/:Id`      | Template Editor        | No      |
| `/admin/user-managment`                    | User Management        | Yes     |
| `/admin/job-queue`                         | Scan Page (setup)      | Yes     |
| `/admin/job-queue/adminscanjobnew`         | Admin Scan Job (live)  | No      |
| `/admin/scaned-list`                       | Scanned Data List      | Yes     |
| `/admin/server-folder`                     | Folder Management      | Yes     |
| `/admin/result-generation`                 | Result Generation      | Yes     |
| `/admin/mergecsv`                          | Merge CSV              | Yes     |
| `/admin/pricing`                           | Subscription Plans     | Yes     |
| `/admin/Subscription/create`               | Create Package         | No      |
| `/admin/payment-status`                    | Payment Status         | No      |
| `/admin/result-table`                      | Result Table View      | No      |
| `/admin/imageuploader`                     | Image Uploader         | Admin   |
| `/admin/csvuploader`                       | CSV Uploader           | Admin   |
| `/admin/datamatching`                      | Data Entry / Matching  | Yes     |

---

## 8. API Layer — How It Works

```
Feature Component
      ↓
helper/TemplateHelper.js  (or Pricing_helper, etc.)
      ↓
helper/url_helper.js → getUrls()
      ↓
helper/InitializeURL.js → builds endpoint using REACT_APP_BACKEND_URL
      ↓
helper/api_helper.js → get() / post() / put() / del()
      ↓
Interceptor/axios.js → attaches Bearer token automatically
      ↓
Backend API
```

**All API Endpoints (from InitializeURL.js):**

| Endpoint Key          | URL Pattern                                     |
|-----------------------|-------------------------------------------------|
| LOGIN                 | `api/userAuth/LoginForm`                        |
| CREATE_USER           | `api/userAuth/SignUp`                           |
| UPDATE_USER           | `api/userAuth/Update`                           |
| GET_USERS             | `api/userAuth/GetList`                          |
| DELETE_USER           | `api/userAuth/DeleteEmp`                        |
| GET_ALL_TEMPLATE      | `api/Template/List_ImeTemp`                     |
| CREATE_TEMPLATE       | `api/Template/Create_ImeTemp`                   |
| UPDATE_TEMPLATE       | `api/Template/Update_ImeTemp`                   |
| DELETE_TEMPLATE       | `api/Template/Del_ImeTemp`                      |
| SCAN_FILES            | `api/OmrProcessing/process-omr`                 |
| PAUSE_SCAN            | `api/OmrProcessing/pause-processing`            |
| RESUME_SCAN           | `api/OmrProcessing/resume-processing`           |
| GETCSVHEADER          | `api/OmrProcessing/GetCSVHeader`                |
| GENERATE_RESULT       | `api/AmityDemand/GenerateResultExcel`           |
| MERGECSV              | `api/AmityDemand/MargeCSV`                      |
| GET_DB_DATA           | `api/showRecord/GetDB_Rec`                      |
| DELETE_DB_DATA        | `api/showRecord/Delete_Rec`                     |
| ADD_PACKAGE           | `api/Wallet/AddPackage`                         |
| GET_PACKAGES          | `api/Wallet/ListPackages`                       |
| DELETE_PACKAGE        | `api/Wallet/DeletePackage`                      |
| PAYMENT               | `api/Payments/create-order`                     |
| PAYMENT_VERIFICATION  | `api/Payments/verify/:orderId`                  |

---

## 9. Features — Detailed Working

---

### 9.1 Dashboard
**Route:** `/admin/index`  
**File:** `src/features/Dashboard/Index.js`

- Shows a **Line Chart** (Scanning value — Month / Week toggle)
- Shows a **Bar Chart** (Total Jobs Completed)
- Uses Chart.js with custom chart options from `charts.js`

---

### 9.2 Template Manager
**Route:** `/admin/template`  
**Files:** `Template.js`, `TemplateEditor.js`, `FormData.js`

**How it works:**

```
Open Template Manager
        ↓
Fetch all templates (GET api/Template/List_ImeTemp)
+ Fetch all users (GET api/userAuth/GetList)
        ↓
Match empId from fileName (format: "templateName##empId")
        ↓
Admin → sees all templates
Others → see only their own (matched by empId)
        ↓
Actions: Create / Edit / Delete
```

**Creating a template:**
1. Enter template name + upload an image of the OMR sheet
2. API call creates the template and returns an `id`
3. Redirects to `/admin/template/create-template/:id` (Template Editor)

**Template Editor (`TemplateEditor.js`):**
- Loads the template image from backend
- User draws draggable/resizable field boxes on top of the image
- Each box represents a region on the OMR sheet (question fields, form fields, etc.)
- Supports: **Add Box**, **Copy** (Ctrl+C), **Paste** (Ctrl+V), **Duplicate** (Ctrl+D), **Delete** (Delete key), **Zoom In/Out**
- Supports **Linking (Merge)** — link multiple boxes with the same field name across sections
- Supports **Reference Boxes** — mark corner points for skew correction (min 2 required)
- Arrow keys move the selected box by 1 pixel
- On Save: bubble coordinates are calculated mathematically, JSON is built and sent to backend via `PUT api/Template/Update_ImeTemp`

---

### 9.3 User Management
**Route:** `/admin/user-managment`  
**File:** `src/features/UserManagement/UserManagment.js`

- Only Admin can create, edit, and delete users
- Lists all users: Name, Email, Phone, Role
- **Create user** — form with email, username, phone (international format), role, password + confirm password
- **Edit user** — click row → pre-fills form → update via `PUT api/userAuth/Update`
- **Delete user** — confirm dialog → `DELETE api/userAuth/DeleteEmp?id=`
- Roles available: `admin`, `moderator`, `operator`

---

### 9.4 OMR Scanner
**Routes:** `/admin/job-queue` → `/admin/job-queue/adminscanjobnew`  
**Files:** `ScanPage.js`, `AdminScanJob.js`, hooks in `Scanner/hooks/`

**Step 1 — Setup (ScanPage.js):**
```
User selects a server folder (via DirectoryPicker modal)
User selects a template (only their own templates shown)
Click Confirm → saves folderName + templateId to localStorage
        ↓
Navigate to AdminScanJob
```

**Step 2 — Live Scanning (AdminScanJob.js):**

```
Page loads → fetch last scanned records for this template
           → fetch template JSON (field layout) from backend
           → connect WebSocket: ws://backend/ws?token=JWT
                    ↓
User clicks START
           ↓
API: POST api/OmrProcessing/process-omr (folderName + templateId)
           ↓
WebSocket starts receiving scanned rows in real-time
           ↓
Each message → parsed as JSON row → added to grid
           ↓
Accuracy calculated: (trueCount / totalCount) * 100
           ↓
Records batched every 300ms before updating UI (performance)
           ↓
When visible rows > MAX_VISIBLE → older rows saved to IndexedDB
           ↓
User can: PAUSE → api/OmrProcessing/pause-processing
          RESUME → api/OmrProcessing/resume-processing
          RESET/STOP → api/OmrProcessing/stop-processing
          REFRESH → clears visible grid + IndexedDB
```

**Hooks used:**
| Hook                | Responsibility                                          |
|---------------------|---------------------------------------------------------|
| `useWebSocket`      | Connect WS, parse messages, batch updates every 300ms  |
| `useScanControls`   | Start / Pause / Resume / Reset scan API calls          |
| `useRecordBuffer`   | Manage visible rows + IndexedDB overflow storage       |
| `useGridScroll`     | Load older records from IndexedDB on scroll to top     |

**Grid features:**
- Click a row → opens the scanned image in the side panel
- Click a cell → highlights the corresponding bubble region on the image
- Syncfusion Grid used for high-performance rendering

---

### 9.5 Scanned Data
**Route:** `/admin/scaned-list`  
**File:** `src/features/ScannedData/ScanedData.js`

```
Page loads → fetch all templates + all users + all DB records
           ↓
Match each record to its template name and user via templateId/empId
           ↓
Admin → sees all records
Operator → sees only records matching their empId
           ↓
Search bar with 300ms debounce filters records in real-time
           ↓
Click row → opens full data modal
           ↓
Download button → generates CSV from modal data and triggers download
           ↓
Delete → SweetAlert confirm → DELETE api/showRecord/Delete_Rec
```

---

### 9.6 Folder Management
**Route:** `/admin/server-folder`  
**File:** `src/features/FolderManagement/FolderStructure.js`

- Full file manager UI using **Syncfusion FileManagerComponent**
- Connects to backend file manager API endpoints with JWT auth header injected via `beforeSend` event
- Supports: Browse, Upload, Download, Rename, Cut, Copy, Paste, Delete, New Folder

---

### 9.7 Result Generation
**Route:** `/admin/result-generation`  
**File:** `src/features/ResultGeneration/ResultGeneration.js`

**3-Step process:**

```
STEP 1 — Upload Files
  Upload Student CSV → auto-extract headers (POST api/OmrProcessing/GetCSVHeader)
  Upload Answer Key CSV → auto-extract question headers (Q1, Q2...)

STEP 2 — Define Scoring Rules
  Subject name
  Start Question (e.g. Q1) → End Question (e.g. Q30)
  Correct marks / Negative marks
  Select Key Column (which column is the answer key)
  Toggle: Include Percentage / Grade
  Click "+ Add Table" to add multiple subjects

STEP 3 — Select Output Headers
  Choose which student CSV columns to include in result

Click "Press Result"
  → POST api/AmityDemand/GenerateResultExcel (multipart form data)
  → Response: CSV blob
  → Parse CSV → convert to JSON table
  → Navigate to /admin/result-table with table data
  → User can view and download the result
```

---

### 9.8 Merge CSV
**Route:** `/admin/mergecsv`  
**File:** `src/features/MergeCsv/mergecsv.js`

```
Upload CSV File 1 → auto-extract headers
Upload CSV File 2 → auto-extract headers
Select Key Column for CSV1 (e.g. EnrollNo)
Select Key Column for CSV2 (must match CSV1 key)
Optionally: select columns to ignore / enter filter key
Click "Merge CSV"
  → POST api/AmityDemand/MargeCSV (multipart)
  → Response: blob → parse as JSON array
  → Navigate to /admin/result-table with merged data
```

---

### 9.9 Subscription / Pricing
**Routes:** `/admin/pricing`, `/admin/Subscription/create`, `/admin/payment-status`  
**Files:** `PricingHome.js`, `PricingCard.js`, `CreateSubscription.js`, `PaymentStatus.js`

**Viewing Plans:**
```
Page loads → GET api/Wallet/ListPackages
           ↓
Renders cards (middle card = "Most Popular" highlighted)
Admin → sees Delete button on each card
All users → see "Purchase" button
```

**Admin — Create Package:**
```
Fill: Package Name, Description, Credit Limit, Amount, Bullet Points (max 5)
Click "Save Package"
  → POST api/Wallet/AddPackage
  → Navigate back to pricing page
```

**User — Purchase Plan (Payment Flow):**
```
Click "Purchase" on a plan
        ↓
POST api/Payments/create-order
  → returns { payment_session_id, order_id }
        ↓
openCashfreeCheckout(payment_session_id)
  → loads Cashfree SDK in sandbox mode
  → opens payment modal
        ↓
After payment modal closes
  → GET api/Payments/verify/:orderId
        ↓
If status === "SUCCESS" → subscription activated
Else → show error
```

---

## 10. Global State (Context)

| Context File         | What it holds                                          |
|----------------------|--------------------------------------------------------|
| `DataContext.js`     | Template list, all template CRUD operations            |
| `DataProvider.js`    | Implements all template state handlers                 |
| `ScanningContext.jsx`| `isScanning` and `isPaused` — shared across components |
| `ImageContext.js`    | Image data used in template editing                    |

---

## 11. localStorage Keys Used

| Key            | Value                                             |
|----------------|---------------------------------------------------|
| `token`        | JWT token string                                  |
| `userData`     | `{ role, empid, phone, email, userName }` (JSON) |
| `folderName`   | Selected scan folder path                         |
| `templateId`   | Selected template ID for scanning                 |
| `templateName` | Selected template name for display                |
| `lastSerialNo` | Last serial number in the scan grid               |

---

## 12. Keyboard Shortcuts (Template Editor)

| Shortcut     | Action                          |
|--------------|---------------------------------|
| `Ctrl + C`   | Copy selected field box         |
| `Ctrl + V`   | Paste copied field box          |
| `Ctrl + D`   | Duplicate question field        |
| `Delete`     | Delete selected field/ref box   |
| `Arrow Keys` | Move selected box by 1px        |

---

## 13. Notes

- Template file names follow the pattern `templateName##empId` — used to track ownership and filter by user
- The backend URL is set via `REACT_APP_BACKEND_URL` in `.env` — no rebuild needed if changed before build
- WebSocket connection uses the same JWT token for authentication: `ws://host/ws?token=JWT`
- Older scan records are stored in **IndexedDB** to avoid memory overload during large scans — loaded back on scroll
- `WebData/` folder is a separate internal module and is excluded from this documentation
- Operator and Moderator layouts exist in code but are currently commented out pending route configuration
