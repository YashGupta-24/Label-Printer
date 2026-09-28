# System Agents & Architecture (Label POS Application)

This document outlines the primary agents, modules, and services interacting within the Label Printing POS system. 

## 1. Human Agents
* **The Operator (End User):** The primary user of the POS dashboard (e.g., store owner/staff). Interacts with a simplified UI to select products, specify print quantities, and execute 1-click printing. Requires low-friction workflows and high error protection.

## 2. Frontend Application Agents (Client-Side)
* **React POS Dashboard (`Home.jsx`):** The central command hub. Manages local state for product selection, template switching, and print copy quantities (capped at 500 to prevent memory leaks).
* **Template Engine (`Template1.jsx`, `Template2.jsx`, `Template3.jsx`, `Template4.jsx`):** The rendering agents responsible for generating millimeter-perfect (75mm x 50mm) HTML/Tailwind layouts that mimic exact Canva designs. Utilizes CSS `flex`, `shrink-0`, and `page-break` rules to protect grid integrity during rendering.
* **AutoFitText Agent (`AutoFitText.jsx`):** A smart typography engine. It calculates container bounds (width/height) and iteratively scales down font sizes (mapping Canva `pt` equivalents to web `px`) to prevent text overflow. It intelligently decides when to force a single line versus wrapping text.
* **Date Logic Module (`dateLogic.js`):** A utility agent that automatically calculates current batch numbers and packaging dates based on the current system time.

## 3. Data & Backend Agents
* **Firebase Firestore (Cloud DB):** The central source of truth for inventory. Stores JSON-like documents containing `productName`, `netWeight`, `mrp`, `ingredients`, and `nutritionalFacts`.
* **Duplicate Prevention Validator (`AddItem.jsx`):** A pre-save interceptor. Before committing new data to Firestore, this agent queries the database to ensure no existing product shares the exact same Name, Net Weight, and MRP combination, preventing polluted inventory data.
* **Data Hydration Agent (`EditItem.jsx`):** Retrieves existing product data by ID, populates the frontend form for user modification, and pushes safe updates back to Firestore.

## 4. Print & Hardware Layer
* **Browser Print Engine (Chrome):** Acts as the bridge between the React DOM and the operating system. Utilizes `@media print` and `.print-only` CSS to strip away the POS dashboard UI and isolate the label templates for the print spooler.
* **Mobile Print Service (Current State):** Android's native print spooler paired with standard OTG Print apps (e.g., NokoPrint). Captures the browser's PDF output and translates the visual data into raw thermal printer commands (TSPL/Zebra emulation) over a USB OTG connection.
* **Hardware Agent (TSC TTP-244 Pro):** The physical endpoint. A 203 DPI direct thermal printer connected via USB OTG. It processes the translated raster/ZPL data and outputs the physical 75x50mm stickers.

## 5. Security Agents
* **Environment Variables (`.env` & Vite):** Secures the Firebase configuration keys (`VITE_FIREBASE_API_KEY`, etc.) preventing sensitive credentials from being exposed in source control (GitHub).