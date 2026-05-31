# SSL Setup Helper — QR Code Matrix Generator

A Chrome/Edge extension that generates QR codes for SFCs (Shop Floor Controls) organized in configurable matrix layouts with multi-layer support. Integrates with MES Work Center for quick SFC lookup and navigation.

## Features

- Generate QR codes in a grid layout (rows × columns × layers)
- Zoomable QR codes with auto-sizing to fit the window
- Open and navigate to MES Work Center directly from the popup
- Batch SFC search on the MES Work Center page
- Copy SFC list to clipboard
- Configurable work stations, work sites, and URL templates
- Skip SFC items prefixed with `#` (treated as comments)
- Persistent storage of settings and SFC data between sessions

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project folder
5. The extension icon will appear in the toolbar

### Packaging

Run `package.bat` to create a `.zip` file ready for store upload or distribution.

---

## User Guide

### Popup Interface

When you click the extension icon, the popup provides:

#### 1. Work Center Selection

| Field | Description |
|-------|-------------|
| **Site** | Select the manufacturing site |
| **Select Work Center** | Choose a work center station from the configured list |
| **Open Work Center** | Opens the MES Work Center page for the selected station |

#### 2. Matrix Configuration

| Field | Description |
|-------|-------------|
| **Levels** | Number of layers (vertical stacking groups) |
| **Rows** | Number of rows per layer |
| **Columns** | Number of columns per layer |

#### 3. SFC Input

Enter SFC identifiers in the textarea, one per line:

```
1033273-257
1033544-268
1033600-100
```

- Lines starting with `#` are ignored (use as comments or to temporarily disable an SFC)
- Empty lines are skipped

#### 4. Actions

| Button | Action |
|--------|--------|
| **Generate QR Matrix** | Opens a new window with QR codes arranged in the configured layout |
| **Work Center Search** | Searches each SFC on the active MES Work Center page |
| **Copy SFC in order** | Copies the SFC list to clipboard |
| **Clear All** | Clears the SFC textarea and saved data |

### QR Code Output Window

After clicking **Generate QR Matrix**, a new window opens displaying:

- Layer headers (`Layer 1`, `Layer 2`, etc.)
- QR codes arranged in the configured grid
- Position number and SFC ID below each QR code
- A zoom toolbar with `+`, `-`, and reset (`↻`) buttons

The QR codes auto-resize when the window is resized.

### Settings Page

Access via the **Settings** link at the bottom of the popup (or right-click the extension icon → Options).

#### Work Stations Tab

- **Upload CSV File** — Import a CSV file with work center stations
- **Paste CSV content** — Manually enter station data in format: `Work_Center_ID,Station_Description`
- **Work Center URL Template** — Customize the MES URL pattern using `{SITE}` and `{Work_Center_ID}` placeholders

#### Work Sites Tab

- Define available sites in format: `SiteNumber,SiteName` (one per line)

### Work Center Search

1. Open the MES Work Center page in your browser
2. Open the extension popup
3. Enter SFCs in the textarea
4. Click **Work Center Search**
5. The extension will sequentially search each SFC on the MES page
6. A summary will report any SFCs that were not found

---

## Permissions

| Permission | Purpose |
|------------|---------|
| `tabs` | Detect if the active tab is a MES Work Center page |
| `activeTab` | Access the current tab for SFC search |
| `scripting` | Inject search scripts into the MES page |
| `storage` | Persist user settings and SFC data |
| `clipboardWrite` | Copy SFC list to clipboard |

## Project Structure

```
├── manifest.json          # Extension manifest (MV3)
├── popup.html / popup.js  # Main popup UI and logic
├── settings.html / settings.js  # Options page
├── styles.css             # Shared styles
├── js/
│   ├── constants.js       # Configuration constants
│   ├── qrGenerator.js     # QR layout generation and rendering
│   ├── qrcode.min.js      # QR code library
│   ├── stations.js        # Station data loading
│   ├── storage.js         # Chrome storage helpers
│   ├── utils.js           # Utility functions
│   └── workCenter.js      # Work center navigation and search
├── images/                # Extension icons
└── assets/                # Default station CSV
```

## License

Internal use only.
