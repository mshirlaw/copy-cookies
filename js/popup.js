/**
 * Displays a status message to the user with specified styling
 * @param {string} message - The message to display
 * @param {string} [type="info"] - The type of message (info, success, error)
 */
function showStatus(message, type = "info") {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

/**
 * Clears the current status message
 */
function clearStatus() {
  const statusDiv = document.getElementById("status");
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
    'input[name="expiration"]:checked',
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
        "error",
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
          expirationMode,
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
        `${clearedMsg}Successfully copied ${successCount} cookie(s) to localhost ${expirationDesc}${errorCount > 0 ? ` (${errorCount} failed)` : ""}`,
        "success",
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
 * Initializes the popup by setting up DOM references, event listeners, and auto-populating the domain
 * Called when the DOM content is loaded
 * @returns {Promise<void>}
 */
async function initializePopup() {
  const domainInput = document.getElementById("domain");
  const copyButton = document.getElementById("copyButton");
  const clearFirstCheckbox = document.getElementById("clearFirst");
  const expirationRadios = document.querySelectorAll(
    'input[name="expiration"]',
  );

  const currentDomain = await getCurrentTabDomain();
  if (currentDomain) {
    domainInput.value = currentDomain;
    domainInput.select();
  }

  copyButton.addEventListener("click", copyCookies);
  domainInput.addEventListener("keypress", handleDomainKeypress);
  domainInput.addEventListener("input", clearStatus);
  clearFirstCheckbox.addEventListener("change", clearStatus);

  expirationRadios.forEach((radio) => {
    radio.addEventListener("change", handleExpirationChange);
  });

  domainInput.focus();
}

document.addEventListener("DOMContentLoaded", initializePopup);
