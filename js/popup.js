document.addEventListener("DOMContentLoaded", async function () {
  const domainInput = document.getElementById("domain");
  const copyButton = document.getElementById("copyButton");
  const statusDiv = document.getElementById("status");
  const customHoursInput = document.getElementById("customHours");
  const customUnitSelect = document.getElementById("customUnit");
  const expirationRadios = document.querySelectorAll(
    'input[name="expiration"]',
  );
  const clearFirstCheckbox = document.getElementById("clearFirst");

  // Get current tab's domain and pre-populate the input
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const currentDomain = url.hostname;

      // Remove www. prefix if present
      const cleanDomain = currentDomain.replace(/^www\./, "");

      // Only pre-populate if it's a valid domain (not chrome:// or other special URLs)
      if (
        currentDomain &&
        !currentDomain.startsWith("chrome") &&
        currentDomain.includes(".")
      ) {
        domainInput.value = cleanDomain;
        domainInput.select(); // Select the text so user can easily replace it
      }
    }
  } catch (error) {
    console.log("Could not get current tab domain:", error);
    // Silently fail - user can still enter domain manually
  }

  // Function to show status messages
  function showStatus(message, type = "info") {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }

  // Function to clear status
  function clearStatus() {
    statusDiv.textContent = "";
    statusDiv.className = "status";
  }

  // Function to validate domain input
  function isValidDomain(domain) {
    // Remove protocol if present
    domain = domain.replace(/^https?:\/\//, "");
    // Remove trailing slash
    domain = domain.replace(/\/$/, "");

    // Basic domain validation
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    return domainRegex.test(domain);
  }

  // Function to normalize domain
  function normalizeDomain(domain) {
    // Remove protocol if present
    domain = domain.replace(/^https?:\/\//, "");
    // Remove trailing slash
    domain = domain.replace(/\/$/, "");
    // Remove www. prefix if present
    domain = domain.replace(/^www\./, "");
    return domain;
  }

  // Function to get selected expiration mode
  function getExpirationMode() {
    const selectedRadio = document.querySelector(
      'input[name="expiration"]:checked',
    );
    return selectedRadio ? selectedRadio.value : "original";
  }

  // Function to calculate new expiration date based on mode
  function calculateExpiration(originalExpiration, mode) {
    const now = Date.now() / 1000; // Current time in seconds

    switch (mode) {
      case "original":
        return originalExpiration;

      case "development":
        // 24 hours from now
        return now + 24 * 60 * 60;

      case "testing":
        // 1 hour from now
        return now + 60 * 60;

      case "session":
        // No expiration (session cookie)
        return undefined;

      case "custom":
        const hours = parseInt(customHoursInput.value) || 24;
        const unit = customUnitSelect.value;
        const multiplier = unit === "days" ? 24 : 1;
        return now + hours * multiplier * 60 * 60;

      default:
        return originalExpiration;
    }
  }

  // Function to get expiration mode description for status
  function getExpirationDescription(mode) {
    switch (mode) {
      case "original":
        return "with original expiration";
      case "development":
        return "with 24-hour expiration";
      case "testing":
        return "with 1-hour expiration";
      case "session":
        return "as session cookies";
      case "custom":
        const hours = parseInt(customHoursInput.value) || 24;
        const unit = customUnitSelect.value;
        return `with ${hours} ${unit} expiration`;
      default:
        return "with original expiration";
    }
  }

  // Function to clear all localhost cookies
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

  // Main function to copy cookies
  async function copyCookies() {
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

    // Validate custom expiration input
    if (expirationMode === "custom") {
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

      // Clear localhost cookies first if option is enabled
      if (clearFirstCheckbox.checked) {
        showStatus("Clearing localhost cookies...", "info");
        clearedCount = await clearLocalhostCookies();
      }

      showStatus("Copying cookies...", "info");

      // Get all cookies for the source domain
      const cookies = await chrome.cookies.getAll({
        domain: normalizedDomain,
      });

      if (cookies.length === 0) {
        showStatus(`No cookies found for ${normalizedDomain}`, "error");
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Copy each cookie to localhost
      for (const cookie of cookies) {
        try {
          // Create new cookie for localhost
          const newCookie = {
            url: "http://localhost",
            name: cookie.name,
            value: cookie.value,
            path: cookie.path || "/",
            secure: false, // localhost is not secure
            httpOnly: cookie.httpOnly,
            sameSite:
              cookie.sameSite === "no_restriction" ? "no_restriction" : "lax",
          };

          // Calculate and set expiration based on selected mode
          const newExpiration = calculateExpiration(
            cookie.expirationDate,
            expirationMode,
          );
          if (newExpiration !== undefined) {
            newCookie.expirationDate = newExpiration;
          }
          // If newExpiration is undefined, cookie becomes session-only

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
          clearedCount > 0
            ? `Cleared ${clearedCount} existing cookie(s). `
            : "";
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

  // Event listeners
  copyButton.addEventListener("click", copyCookies);

  domainInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      copyCookies();
    }
  });

  domainInput.addEventListener("input", clearStatus);

  // Handle expiration radio button changes
  expirationRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      const isCustom = this.value === "custom";
      customHoursInput.disabled = !isCustom;
      customUnitSelect.disabled = !isCustom;

      if (isCustom) {
        customHoursInput.focus();
      }

      clearStatus();
    });
  });

  // Handle clear first checkbox change
  clearFirstCheckbox.addEventListener("change", clearStatus);

  // Focus on domain input when popup opens
  domainInput.focus();
});
