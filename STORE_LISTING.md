# QR Code Matrix Generator — Store Publishing Guide

## Visibility: Unlisted / Private

This extension is intended for internal/private use only.

---

## Chrome Web Store (Unlisted)

1. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time $5 developer registration fee (if not already registered)
3. Click **New Item** → upload the `.zip` from `package.bat`
4. Fill in the listing:
   - **Name:** QR Code Matrix Generator
   - **Description:** Generate QR codes for SFCs organized in configurable matrix layouts with multi-layer support. Integrates with MES Work Center for quick SFC lookup.
   - **Category:** Productivity
   - **Language:** English
5. Upload screenshots (1280×800 or 640×400):
   - Popup with SFC input and matrix settings
   - Generated QR code layout in new window
6. Under **Visibility** → select **Unlisted**
   - Unlisted means only users with the direct link can find and install it
7. Under **Distribution** → select the regions or leave as all
8. Submit for review

## Edge Add-ons Store (Private)

1. Go to [Edge Partner Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge)
2. Sign in with a Microsoft account
3. Click **Create new extension** → upload the same `.zip`
4. Fill in the listing (same info as Chrome above)
5. Upload screenshots (1280×800)
6. Under **Availability** → select **Hidden** (equivalent to unlisted)
   - Or use **Private** if distributing to specific Azure AD groups
7. Submit for review

## Required Store Assets

| Asset | Size | Notes |
|-------|------|-------|
| Icon (small) | 16×16 | ✅ `images/icon-16.png` |
| Icon (medium) | 48×48 | ✅ `images/icon-48.png` |
| Icon (large) | 128×128 | ✅ `images/icon-128.png` |
| Screenshot 1 | 1280×800 | Popup UI |
| Screenshot 2 | 1280×800 | QR matrix output |
| Promo tile (Chrome) | 440×280 | Optional but recommended |

## Permissions Justification (for store review)

| Permission | Reason |
|------------|--------|
| `tabs` | Read active tab URL to detect MES Work Center page |
| `tabGroups` | Manage tab organization |
| `activeTab` | Access current tab for SFC search injection |
| `scripting` | Execute scripts on MES page for SFC search automation |
| `storage` | Persist user settings (rows, cols, work center, SFCs) |
| `clipboardWrite` | Copy SFC list to clipboard |
| `host_permissions` (MES URL) | Interact with the MES Work Center application |

## Sharing the Unlisted Extension

After approval, share the direct Chrome Web Store / Edge Add-ons link with your team.
Only people with the link can install it — it won't appear in store search results.
