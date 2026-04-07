# Setup Guide

## MongoDB Setup

VSRMS requires a running MongoDB instance. You can either use MongoDB Atlas (Cloud) or run MongoDB locally.

### Ubuntu

Ensure the MongoDB daemon (`mongod`) is active before connecting.

1. **Start the service:**
   ```bash
   sudo systemctl start mongod
   ```

2. **Verify status:**
   Check that it says `active (running)`.
   ```bash
   sudo systemctl status mongod
   ```

3. **Enable on boot (Optional):**
   To have MongoDB start automatically whenever you turn on your computer:
   ```bash
   sudo systemctl enable mongod
   ```

### Windows

1. Open **Services** (Press `Win + R`, type `services.msc`, and press Enter).
2. Find **MongoDB Server (MongoDB)** in the list.
3. If the status is not **Running**, right-click it and select **Start**.
4. To ensure it starts automatically, right-click, select **Properties**, and set **Startup type** to **Automatic**.
