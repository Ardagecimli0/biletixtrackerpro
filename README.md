# Biletix Tracker Pro

## Overview

Biletix Tracker Pro is a Chrome Extension designed to help ticket sellers, agencies, and operational teams automatically capture and manage ticket transaction data from Biletix confirmation pages.

Instead of manually copying reference numbers, customer details, or ticket information after each transaction, the extension automatically detects and stores all important sales information directly inside the browser.

The project focuses on simplifying:

- Reference code tracking
- Refund and cancellation workflows
- Historical transaction management
- Ticket operation monitoring
- Data archiving and quick search

---

# Features

## Automatic Transaction Capture

The extension automatically detects Biletix confirmation pages and captures:

- Reference numbers
- Customer information
- Payment totals
- Ticket details
- Seat and block information
- Service fees
- Transaction timestamps

No manual copy-paste process is required.

---

## Historical Transaction Archive

All captured transactions are securely stored using `chrome.storage`.

Users can:

- View previous sales
- Search by reference number
- Access old transaction records instantly
- Track operation history
- Review timestamps for every transaction

---

## Refund & Cancellation Support

By preserving transaction references and ticket details, the extension helps users:

- Speed up refund processes
- Handle cancellations more efficiently
- Avoid losing important confirmation data
- Reduce operational mistakes

---

## Smart Popup Dashboard

The popup interface provides a lightweight management panel for:

- Quick search
- Transaction history
- Fast data access
- Operational tracking

---

# Technologies Used

- JavaScript
- HTML5
- CSS3
- Chrome Extension Manifest V3
- Chrome Storage API
- Content Scripts
- Service Workers

---

# Project Structure

```bash
├── manifest.json
├── background.js
├── content.js
├── popup.js
├── popup.html
├── style.css
└── assets/
```

---

# How It Works

1. User completes a ticket transaction on Biletix.
2. The extension detects the confirmation page.
3. Transaction data is automatically parsed.
4. Information is stored locally inside the browser.
5. Users can access records anytime through the popup interface.

---

# Installation

## Developer Mode Installation

1. Download or clone the repository
2. Open Chrome and navigate to:

```bash
chrome://extensions/
```

3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the project folder

The extension is now ready to use.

---

# Use Cases

- Ticket agencies
- Event operation teams
- Customer support workflows
- Refund/cancellation management
- Sales tracking
- Internal operational archiving

---

# Future Improvements

- Export transactions as CSV/Excel
- Cloud synchronization
- Analytics dashboard
- Multi-platform ticket support
- Advanced filtering
- Notification system

---

# License

Licensed under the Apache License 2.0.
