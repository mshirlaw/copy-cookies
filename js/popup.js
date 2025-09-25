document.addEventListener('DOMContentLoaded', async function() {
  const domainInput = document.getElementById('domain');
  const copyButton = document.getElementById('copyButton');
  const statusDiv = document.getElementById('status');

  // Get current tab's domain and pre-populate the input
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const currentDomain = url.hostname;
      
      // Remove www. prefix if present
      const cleanDomain = currentDomain.replace(/^www\./, '');
      
      // Only pre-populate if it's a valid domain (not chrome:// or other special URLs)
      if (currentDomain && !currentDomain.startsWith('chrome') && currentDomain.includes('.')) {
        domainInput.value = cleanDomain;
        domainInput.select(); // Select the text so user can easily replace it
      }
    }
  } catch (error) {
    console.log('Could not get current tab domain:', error);
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

    try {
      copyButton.disabled = true;
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

          // Set expiration if the original cookie has one
          if (cookie.expirationDate) {
            newCookie.expirationDate = cookie.expirationDate;
          }

          await chrome.cookies.set(newCookie);
          successCount++;
        } catch (error) {
          console.error(`Failed to copy cookie ${cookie.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showStatus(
          `Successfully copied ${successCount} cookie(s) to localhost${errorCount > 0 ? ` (${errorCount} failed)` : ""}`,
          "success",
        );
      } else {
        showStatus("Failed to copy any cookies", "error");
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

  // Focus on domain input when popup opens
  domainInput.focus();
});
