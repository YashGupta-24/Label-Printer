// src/utils/webUsbPrinter.js

/**
 * Checks if WebUSB API is supported by the current browser.
 */
export function isWebUsbSupported() {
  return typeof navigator !== 'undefined' && 'usb' in navigator;
}

/**
 * Prompts user to select a USB printer (TSC TTP-244 Pro or generic USB printer).
 */
export async function requestUsbPrinter() {
  if (!isWebUsbSupported()) {
    throw new Error("WebUSB is not supported in this browser. Please use Google Chrome or Microsoft Edge on Android/PC.");
  }

  // Request all USB devices so user can select their connected printer
  const device = await navigator.usb.requestDevice({
    filters: []
  });

  return device;
}

/**
 * Gets previously paired USB devices if available.
 */
export async function getPairedPrinters() {
  if (!isWebUsbSupported()) return [];
  try {
    return await navigator.usb.getDevices();
  } catch (err) {
    console.error("Error getting paired USB devices:", err);
    return [];
  }
}

/**
 * Sends a TSPL binary payload directly to a USB thermal printer.
 */
export async function printTsplBufferViaUsb(device, tsplBuffer) {
  if (!device) {
    throw new Error("No USB device provided.");
  }

  let targetInterfaceNumber = null;

  try {
    if (!device.opened) {
      await device.open();
    }

    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    // Find the USB interface that has an OUT endpoint
    let targetEndpointNumber = 1;
    let found = false;

    for (const iface of device.configuration.interfaces) {
      for (const alternate of iface.alternates) {
        for (const endpoint of alternate.endpoints) {
          if (endpoint.direction === 'out') {
            targetInterfaceNumber = iface.interfaceNumber;
            targetEndpointNumber = endpoint.endpointNumber;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    if (!found || targetInterfaceNumber === null) {
      throw new Error("Could not find a valid USB OUT endpoint for writing to the printer.");
    }

    // Only claim if not already claimed
    const targetIface = device.configuration?.interfaces?.find(i => i.interfaceNumber === targetInterfaceNumber);
    if (!targetIface?.claimed) {
      await device.claimInterface(targetInterfaceNumber);
    }

    // Send payload in chunks (e.g. 16KB per transfer) to prevent buffer overflows
    const chunkSize = 16384;
    for (let offset = 0; offset < tsplBuffer.length; offset += chunkSize) {
      const chunk = tsplBuffer.subarray(offset, Math.min(offset + chunkSize, tsplBuffer.length));
      await device.transferOut(targetEndpointNumber, chunk);
    }

    return { success: true };
  } catch (error) {
    console.error("USB Print Error:", error);
    try {
      if (device.opened && targetInterfaceNumber !== null) {
        await device.releaseInterface(targetInterfaceNumber);
      }
    } catch (_) {}
    throw error;
  } finally {
    // Always release the interface after transmission so subsequent prints or other apps are not blocked
    try {
      if (device.opened && targetInterfaceNumber !== null) {
        await device.releaseInterface(targetInterfaceNumber);
      }
    } catch (_) {}
  }
}
