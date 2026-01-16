/**
 * Displays a status message to the user with specified styling
 * @param {string} message - The message to display
 * @param {string} [type="info"] - The type of message (info, success, error)
 * @param {string} [elementId="status"] - The ID of the status element to update
 */
function showStatus(message, type = "info", elementId = "status") {
  const statusDiv = document.getElementById(elementId);
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

/**
 * Clears the current status message
 * @param {string} [elementId="status"] - The ID of the status element to clear
 */
function clearStatus(elementId = "status") {
  const statusDiv = document.getElementById(elementId);
  statusDiv.textContent = "";
  statusDiv.className = "status";
}

/**
 * Validates if a domain string is properly formatted
 * @param {string} domain - The domain to validate
 * @returns {boolean} True if domain is valid, false otherwise
 */
function isValidDomain(domain) {
  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.replace(/\/$/, "");
  const domainRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain);
}

/**
 * Normalizes a domain by removing protocol, trailing slash, and www prefix
 * @param {string} domain - The domain to normalize
 * @returns {string} The normalized domain
 */
function normalizeDomain(domain) {
  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.replace(/\/$/, "");
  domain = domain.replace(/^www\./, "");
  return domain;
}

/**
 * Gets the currently selected expiration mode from radio buttons
 * @returns {string} The selected expiration mode (original, development, testing, session, custom)
 */
function getExpirationMode() {
  const selectedRadio = document.querySelector(
    'input[name="expiration"]:checked'
  );
  return selectedRadio ? selectedRadio.value : "original";
}

/**
 * Calculates the new expiration date based on the selected mode
 * @param {number|undefined} originalExpiration - Original cookie expiration timestamp
 * @param {string} mode - The expiration mode to apply
 * @returns {number|undefined} New expiration timestamp or undefined for session cookies
 */
function calculateExpiration(originalExpiration, mode) {
  const now = Date.now() / 1000; // Current time in seconds

  switch (mode) {
    case "original": {
      return originalExpiration;
    }

    case "development": {
      // 24 hours from now
      return now + 24 * 60 * 60;
    }

    case "testing": {
      // 1 hour from now
      return now + 60 * 60;
    }

    case "session": {
      // No expiration (session cookie)
      return undefined;
    }

    case "custom": {
      const customHoursInput = document.getElementById("customHours");
      const customUnitSelect = document.getElementById("customUnit");
      const hours = parseInt(customHoursInput.value) || 24;
      const unit = customUnitSelect.value;
      const multiplier = unit === "days" ? 24 : 1;
      return now + hours * multiplier * 60 * 60;
    }

    default: {
      return originalExpiration;
    }
  }
}

/**
 * Gets a human-readable description of the expiration mode for status messages
 * @param {string} mode - The expiration mode
 * @returns {string} Human-readable description of the expiration setting
 */
function getExpirationDescription(mode) {
  switch (mode) {
    case "original": {
      return "with original expiration";
    }

    case "development": {
      return "with 24-hour expiration";
    }

    case "testing": {
      return "with 1-hour expiration";
    }

    case "session": {
      return "as session cookies";
    }

    case "custom": {
      const customHoursInput = document.getElementById("customHours");
      const customUnitSelect = document.getElementById("customUnit");
      const hours = parseInt(customHoursInput.value) || 24;
      const unit = customUnitSelect.value;
      return `with ${hours} ${unit} expiration`;
    }

    default: {
      return "with original expiration";
    }
  }
}

/**
 * Clears all existing cookies from localhost
 * @returns {Promise<number>} The number of cookies successfully cleared
 * @throws {Error} If there's an error accessing cookies
 */
async function clearLocalhostCookies() {
  try {
    const localhostCookies = await chrome.cookies.getAll({
      url: "http://localhost",
    });

    let clearedCount = 0;
    for (const cookie of localhostCookies) {
      try {
        await chrome.cookies.remove({
          url: "http://localhost",
          name: cookie.name,
          path: cookie.path,
        });
        clearedCount++;
      } catch (error) {
        console.error(`Failed to remove cookie ${cookie.name}:`, error);
      }
    }

    return clearedCount;
  } catch (error) {
    console.error("Error clearing localhost cookies:", error);
    throw error;
  }
}

/**
 * Gets the domain of the currently active tab for auto-population
 * @returns {Promise<string|null>} The domain of the current tab, or null if unavailable
 */
async function getCurrentTabDomain() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab && tab.url) {
      const url = new URL(tab.url);
      const currentDomain = url.hostname;

      const cleanDomain = currentDomain.replace(/^www\./, "");

      if (
        currentDomain &&
        !currentDomain.startsWith("chrome") &&
        currentDomain.includes(".")
      ) {
        return cleanDomain;
      }
    }
  } catch (error) {
    console.log("Could not get current tab domain:", error);
  }

  return null;
}

/**
 * Main function to copy cookies from source domain to localhost with expiration management
 * Handles validation, clearing existing cookies (if enabled), and copying with new expiration settings
 * @returns {Promise<void>}
 */
async function copyCookies() {
  const domainInput = document.getElementById("domain");
  const copyButton = document.getElementById("copyButton");
  const clearFirstCheckbox = document.getElementById("clearFirst");

  const domain = domainInput.value.trim();

  if (!domain) {
    showStatus("Please enter a domain", "error");
    return;
  }

  if (!isValidDomain(domain)) {
    showStatus("Please enter a valid domain", "error");
    return;
  }

  const normalizedDomain = normalizeDomain(domain);
  const expirationMode = getExpirationMode();

  if (expirationMode === "custom") {
    const customHoursInput = document.getElementById("customHours");
    const customHours = parseInt(customHoursInput.value);
    if (!customHours || customHours < 1 || customHours > 8760) {
      showStatus(
        "Please enter a valid custom expiration (1-8760 hours)",
        "error"
      );
      return;
    }
  }

  try {
    copyButton.disabled = true;

    let clearedCount = 0;

    if (clearFirstCheckbox.checked) {
      showStatus("Clearing localhost cookies...", "info");
      clearedCount = await clearLocalhostCookies();
    }

    showStatus("Copying cookies...", "info");

    const cookies = await chrome.cookies.getAll({
      domain: normalizedDomain,
    });

    if (cookies.length === 0) {
      showStatus(`No cookies found for ${normalizedDomain}`, "error");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const cookie of cookies) {
      try {
        const newCookie = {
          url: "http://localhost",
          name: cookie.name,
          value: cookie.value,
          path: cookie.path || "/",
          secure: false,
          httpOnly: cookie.httpOnly,
          sameSite:
            cookie.sameSite === "no_restriction" ? "no_restriction" : "lax",
        };

        const newExpiration = calculateExpiration(
          cookie.expirationDate,
          expirationMode
        );
        if (newExpiration !== undefined) {
          newCookie.expirationDate = newExpiration;
        }

        await chrome.cookies.set(newCookie);
        successCount++;
      } catch (error) {
        console.error(`Failed to copy cookie ${cookie.name}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      const expirationDesc = getExpirationDescription(expirationMode);
      const clearedMsg =
        clearedCount > 0 ? `Cleared ${clearedCount} existing cookie(s). ` : "";
      showStatus(
        `${clearedMsg}Successfully copied ${successCount} cookie(s) to localhost ${expirationDesc}${
          errorCount > 0 ? ` (${errorCount} failed)` : ""
        }`,
        "success"
      );
    } else {
      const clearedMsg =
        clearedCount > 0
          ? `Cleared ${clearedCount} existing cookie(s), but `
          : "";
      showStatus(`${clearedMsg}Failed to copy any cookies`, "error");
    }
  } catch (error) {
    console.error("Error copying cookies:", error);
    showStatus("Error: " + error.message, "error");
  } finally {
    copyButton.disabled = false;
  }
}

/**
 * Handles keypress events in the domain input field
 * Triggers cookie copying when Enter key is pressed
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleDomainKeypress(e) {
  if (e.key === "Enter") {
    copyCookies();
  }
}

/**
 * Handles changes to expiration mode radio buttons
 * Enables/disables custom expiration inputs and clears status
 * @this {HTMLInputElement} The radio button that was changed
 */
function handleExpirationChange() {
  const customHoursInput = document.getElementById("customHours");
  const customUnitSelect = document.getElementById("customUnit");

  const isCustom = this.value === "custom";
  customHoursInput.disabled = !isCustom;
  customUnitSelect.disabled = !isCustom;

  if (isCustom) {
    customHoursInput.focus();
  }

  clearStatus();
}

/**
 * Generates an HMAC-SHA256 hash of the email using the provided key
 * Uses the Web Crypto API for browser compatibility
 * @param {string} email - The email address to hash
 * @param {string} hmacKey - The HMAC key to use for hashing
 * @returns {Promise<string>} The hex-encoded HMAC digest
 */
async function generateAuthPasscodeHmac(email, hmacKey) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(hmacKey);
  const messageData = encoder.encode(email);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

/**
 * Validates if an email address is properly formatted
 * @param {string} email - The email to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Main function to generate HMAC cookie and set it on the current domain
 * @returns {Promise<void>}
 */
async function generateHmacCookie() {
  const emailInput = document.getElementById("email");
  const hmacKeyInput = document.getElementById("hmacKey");
  const generateButton = document.getElementById("generateHmacButton");

  const email = emailInput.value.trim();
  const hmacKey = hmacKeyInput.value.trim();

  if (!email) {
    showStatus("Please enter an email address", "error", "hmacStatus");
    return;
  }

  if (!isValidEmail(email)) {
    showStatus("Please enter a valid email address", "error", "hmacStatus");
    return;
  }

  if (!hmacKey) {
    showStatus("Please enter an HMAC key", "error", "hmacStatus");
    return;
  }

  try {
    generateButton.disabled = true;
    showStatus("Generating HMAC...", "info", "hmacStatus");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.url) {
      showStatus("Could not determine current tab URL", "error", "hmacStatus");
      return;
    }

    const url = new URL(tab.url);
    const currentDomain = url.hostname;

    if (currentDomain.startsWith("chrome")) {
      showStatus(
        "Cannot set cookies on Chrome internal pages",
        "error",
        "hmacStatus"
      );
      return;
    }

    const hmacPasscode = await generateAuthPasscodeHmac(email, hmacKey);

    const cookieUrl = `${url.protocol}//${currentDomain}`;

    await chrome.cookies.set({
      url: cookieUrl,
      domain: currentDomain,
      httpOnly: true,
      name: "_auth_passcode_hmac",
      path: "/",
      sameSite: "lax",
      secure: url.protocol === "https:",
      value: hmacPasscode,
    });

    await saveLastEmail(email);
    await saveHmacKeyForDomain(currentDomain, hmacKey);

    showStatus(
      `HMAC cookie set successfully on ${currentDomain}`,
      "success",
      "hmacStatus"
    );
  } catch (error) {
    console.error("Error generating HMAC cookie:", error);
    showStatus("Error: " + error.message, "error", "hmacStatus");
  } finally {
    generateButton.disabled = false;
  }
}

/**
 * Handles keypress events in the HMAC input fields
 * Triggers HMAC generation when Enter key is pressed
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleHmacKeypress(e) {
  if (e.key === "Enter") {
    generateHmacCookie();
  }
}

/**
 * Saves the HMAC key for a specific domain to Chrome local storage
 * @param {string} domain - The domain to associate the key with
 * @param {string} hmacKey - The HMAC key to store
 * @returns {Promise<void>}
 */
async function saveHmacKeyForDomain(domain, hmacKey) {
  try {
    const result = await chrome.storage.local.get("hmacKeys");
    const hmacKeys = result.hmacKeys || {};
    hmacKeys[domain] = hmacKey;
    await chrome.storage.local.set({ hmacKeys });
  } catch (error) {
    console.error("Error saving HMAC key:", error);
  }
}

/**
 * Retrieves the stored HMAC key for a specific domain
 * @param {string} domain - The domain to get the key for
 * @returns {Promise<string|null>} The stored HMAC key or null if not found
 */
async function getHmacKeyForDomain(domain) {
  try {
    const result = await chrome.storage.local.get("hmacKeys");
    const hmacKeys = result.hmacKeys || {};
    return hmacKeys[domain] || null;
  } catch (error) {
    console.error("Error retrieving HMAC key:", error);
    return null;
  }
}

/**
 * Saves the last used email to Chrome local storage
 * @param {string} email - The email to store
 * @returns {Promise<void>}
 */
async function saveLastEmail(email) {
  try {
    await chrome.storage.local.set({ lastEmail: email });
  } catch (error) {
    console.error("Error saving last email:", error);
  }
}

/**
 * Retrieves the last used email from Chrome local storage
 * @returns {Promise<string|null>} The stored email or null if not found
 */
async function getLastEmail() {
  try {
    const result = await chrome.storage.local.get("lastEmail");
    return result.lastEmail || null;
  } catch (error) {
    console.error("Error retrieving last email:", error);
    return null;
  }
}

/**
 * Populates the HMAC form fields with stored values
 * @returns {Promise<void>}
 */
async function populateHmacFields() {
  const emailInput = document.getElementById("email");
  const hmacKeyInput = document.getElementById("hmacKey");

  const lastEmail = await getLastEmail();
  if (lastEmail) {
    emailInput.value = lastEmail;
  }

  const currentDomain = await getCurrentTabDomain();
  if (currentDomain) {
    const storedHmacKey = await getHmacKeyForDomain(currentDomain);
    if (storedHmacKey) {
      hmacKeyInput.value = storedHmacKey;
    }
  }
}

/**
 * Switches to the specified tab and updates the UI accordingly
 * @param {string} tabId - The ID of the tab to switch to (without '-tab' suffix)
 */
function switchTab(tabId) {
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    if (button.dataset.tab === tabId) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => {
    if (content.id === `${tabId}-tab`) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });

  if (tabId === "hmac") {
    const emailInput = document.getElementById("email");
    if (!emailInput.value) {
      emailInput.focus();
    }
  } else if (tabId === "copy") {
    const domainInput = document.getElementById("domain");
    domainInput.focus();
    domainInput.select();
  }
}

/**
 * Handles click events on tab buttons
 * @param {Event} e - The click event
 */
function handleTabClick(e) {
  const tabId = e.target.dataset.tab;
  if (tabId) {
    switchTab(tabId);
  }
}

/**
 * Initializes the popup by setting up DOM references, event listeners, and auto-populating the domain
 * Called when the DOM content is loaded
 * @returns {Promise<void>}
 */
async function initializePopup() {
  const domainInput = document.getElementById("domain");
  const copyButton = document.getElementById("copyButton");
  const clearFirstCheckbox = document.getElementById("clearFirst");
  const expirationRadios = document.querySelectorAll(
    'input[name="expiration"]'
  );

  const emailInput = document.getElementById("email");
  const hmacKeyInput = document.getElementById("hmacKey");
  const generateHmacButton = document.getElementById("generateHmacButton");

  const tabButtons = document.querySelectorAll(".tab-button");

  const currentDomain = await getCurrentTabDomain();
  if (currentDomain) {
    domainInput.value = currentDomain;
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", handleTabClick);
  });

  copyButton.addEventListener("click", copyCookies);
  domainInput.addEventListener("keypress", handleDomainKeypress);
  domainInput.addEventListener("input", clearStatus);
  clearFirstCheckbox.addEventListener("change", clearStatus);

  expirationRadios.forEach((radio) => {
    radio.addEventListener("change", handleExpirationChange);
  });

  generateHmacButton.addEventListener("click", generateHmacCookie);
  emailInput.addEventListener("keypress", handleHmacKeypress);
  hmacKeyInput.addEventListener("keypress", handleHmacKeypress);
  emailInput.addEventListener("input", () => clearStatus("hmacStatus"));
  hmacKeyInput.addEventListener("input", () => clearStatus("hmacStatus"));

  await populateHmacFields();

  if (!emailInput.value) {
    emailInput.focus();
  }
}

document.addEventListener("DOMContentLoaded", initializePopup);
