/**
 * Entwinity Community Website JavaScript Logic
 * - Mobile Navigation Toggle
 * - Theme Switcher (Light/Dark Mode) with LocalStorage persistence
 * - Fade-in-on-scroll animations via Intersection Observer
 * - Pure JavaScript CSV Parser
 * - Dynamic Club Cards loader
 * - Client-side Contact Form Validation
 * - Brevo SMTP Integration
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // 1. Mobile Menu Toggling
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll(".nav-link");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", !expanded);
      mainNav.classList.toggle("active");
    });

    // Close menu when clicking links on mobile
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (mainNav.classList.contains("active")) {
          mainNav.classList.remove("active");
          navToggle.setAttribute("aria-expanded", "false");
        }

        // Active page navigation styling
        navLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }

  // Active link highlighting on scroll
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add("active");
      } else {
        document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove("active");
      }
    });
  });

  // 2. Light/Dark Theme Switcher
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  // Retrieve theme preference from localStorage or fallback to system preference
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    enableDarkMode();
  } else {
    enableLightMode();
  }

  themeToggleBtn.addEventListener("click", () => {
    if (body.classList.contains("light-theme")) {
      enableDarkMode();
    } else {
      enableLightMode();
    }
  });

  function enableDarkMode() {
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
    themeToggleBtn.setAttribute("aria-label", "Switch to light theme");
    localStorage.setItem("theme", "dark");
  }

  function enableLightMode() {
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
    themeToggleBtn.setAttribute("aria-label", "Switch to dark theme");
    localStorage.setItem("theme", "light");
  }

  // 3. Scroll Fade-in Animations (Intersection Observer)
  const fadeElements = document.querySelectorAll(".fade-in-on-scroll");

  if ("IntersectionObserver" in window) {
    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Trigger once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    // Fallback: make everything visible immediately if observer isn't supported
    fadeElements.forEach(el => el.classList.add("visible"));
  }

  // 4. Pure JS CSV Parser & Dynamic Clubs Loader
  const clubsGrid = document.getElementById("clubs-grid");

  if (clubsGrid) {
    fetchClubs();
  }

  async function fetchClubs() {
    try {
      const response = await fetch("clubs.csv");
      if (!response.ok) {
        throw new Error(`Failed to load clubs list (Status ${response.status})`);
      }
      const csvData = await response.text();
      const parsedClubs = parseCSV(csvData);
      renderClubs(parsedClubs);
    } catch (error) {
      console.error("Clubs loading error:", error);
      renderClubsError(error.message);
    }
  }

  // Robust RFC 4180-compliant CSV Parser
  function parseCSV(text) {
    const rows = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes; // Toggle quote state
        }
      } else if (char === ',' && !inQuotes) {
        row.push("");
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n in \r\n
        }
        rows.push(row);
        row = [""];
      } else {
        row[row.length - 1] += char;
      }
    }
    // Push the last row if it exists
    if (row.length > 1 || row[0] !== "") {
      rows.push(row);
    }

    // Process headers and return array of objects
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim());
    const data = [];

    for (let r = 1; r < rows.length; r++) {
      const currentRow = rows[r];
      if (currentRow.length !== headers.length) continue; // Skip malformed rows

      const clubObj = {};
      let hasData = false;

      for (let c = 0; c < headers.length; c++) {
        const val = currentRow[c].trim();
        clubObj[headers[c]] = val;
        if (val) hasData = true;
      }

      if (hasData) {
        data.push(clubObj);
      }
    }

    //console.log(data);
    return data;
  }

  // Select a fitting icon based on the club's name
  function getClubIcon(clubName) {
    const name = clubName.toLowerCase();
    if (name.includes("robot")) return "bot";
    if (name.includes("program") || name.includes("code") || name.includes("developer")) return "code";
    if (name.includes("entrepreneur") || name.includes("start") || name.includes("business")) return "briefcase";
    if (name.includes("research") || name.includes("academic") || name.includes("science")) return "graduation-cap";
    if (name.includes("speak") || name.includes("debate") || name.includes("speech")) return "mic";
    if (name.includes("design") || name.includes("art") || name.includes("creative") || name.includes("ui")) return "palette";
    return "users"; // Fallback general icon
  }

  function renderClubs(clubs) {
    if (!clubsGrid) return;
    clubsGrid.innerHTML = ""; // Clear loader
    //console.log(clubs);
    if (clubs.length === 0) {
      clubsGrid.innerHTML = `
        <div class="clubs-error">
          <i data-lucide="info"></i>
          <p>No active clubs found in the list. Please check back later!</p>
        </div>
      `;
      //lucide.createIcons();
      return;
    }

    clubs.forEach(club => {
      const clubName = club["Club Name"] || club["club_name"] || "Student Club";
      const description = club["Description"] || club["description"] || "No description provided.";
      const link = club["WhatsApp Link"] || club["whatsapp_link"] || "https://chat.whatsapp.com/MAIN_COMMUNITY_LINK";
      //const iconName = getClubIcon(clubName);
      //console.log(clubName, description, link);
      const card = document.createElement("article");
      card.className = "club-card";
      card.innerHTML = `
        <h3>${escapeHTML(clubName)}</h3>
        <p>${escapeHTML(description)}</p>
        <a href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-block">
          <span>Join Club</span>
          <i data-lucide="message-circle" class="btn-icon"></i>
        </a>
      `;
      clubsGrid.appendChild(card);
      //              <!--<div class="club-card-icon">
      //          <i data-lucide=""></i> 
      //        </div>-->
    });

    // Re-trigger Lucide to render the icons in injected cards
    //lucide.createIcons();
  }

  function renderClubsError(msg) {
    if (!clubsGrid) return;
    clubsGrid.innerHTML = `
      <div class="clubs-error">
        <i data-lucide="alert-triangle"></i>
        <h3>Unable to load Clubs</h3>
        <p>${escapeHTML(msg)}</p>
      </div>
    `;
    lucide.createIcons();
  }

  // Simple HTML sanitizer to avoid XSS issues
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  // 5. Contact Form Client-side Validation & Submission via Brevo
  const contactForm = document.getElementById("contact-form");
  const formStatusBox = document.getElementById("form-status-box");
  const formSubmitBtn = document.getElementById("form-submit-btn");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Clear previous status
      clearStatusMessage();

      // Perform validation
      const isValid = validateForm();
      if (!isValid) return;

      // Extract form data
      const formData = new FormData(contactForm);
      const data = {
        name: formData.get("name").trim(),
        email: formData.get("email").trim(),
        country: formData.get("country").trim(),
        school: formData.get("school").trim(),
        subject: formData.get("subject").trim(),
        message: formData.get("message").trim(),
      };

      // Put form into submitting state
      setSubmittingState(true);

      // Prepare Brevo request body
      const emailBody = {
        subject: `[Entwinity Contact] ${data.subject}`,
        htmlContent: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; }
                .container { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
                .header { background-color: #0284c7; color: #ffffff; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #64748b; font-size: 0.85em; text-transform: uppercase; }
                .value { background-color: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; margin-top: 4px; }
                .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 0.8em; color: #64748b; border-top: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>New Contact Submission</h2>
                  <p>Entwinity International Student Community</p>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Full Name</div>
                    <div class="value">${escapeHTML(data.name)}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email Address</div>
                    <div class="value">${escapeHTML(data.email)}</div>
                  </div>
                  <div class="field">
                    <div class="label">Country</div>
                    <div class="value">${escapeHTML(data.country)}</div>
                  </div>
                  <div class="field">
                    <div class="label">Institution / School</div>
                    <div class="value">${escapeHTML(data.school)}</div>
                  </div>
                  <div class="field">
                    <div class="label">Subject</div>
                    <div class="value">${escapeHTML(data.subject)}</div>
                  </div>
                  <div class="field">
                    <div class="label">Message</div>
                    <div class="value" style="white-space: pre-wrap;">${escapeHTML(data.message)}</div>
                  </div>
                </div>
                <div class="footer">
                  This email was generated automatically by the Entwinity static site contact form.
                </div>
              </div>
            </body>
          </html>
        `
      };

      try {
        const response = await fetch("/api", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(emailBody)
        });
        console.log(response);
        if (response.ok) {
          showStatusMessage("success", "Your message has been sent successfully! We will get back to you shortly.");
          contactForm.reset(); // Reset form fields
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.message || `SMTP server returned status ${response.status}`;
          throw new Error(errMsg);
        }
      } catch (err) {
        console.error("submit error:", err);
        showStatusMessage("error", `Failed to send email: ${err.message}`);
      } finally {
        setSubmittingState(false);
      }
    });
  }

  // Validate form entries
  function validateForm() {
    let isValid = true;

    const fields = [
      { id: "form-name", errorId: "error-name", name: "Name" },
      { id: "form-email", errorId: "error-email", name: "Email", isEmail: true },
      { id: "form-country", errorId: "error-country", name: "Country" },
      { id: "form-school", errorId: "error-school", name: "Institution" },
      { id: "form-subject", errorId: "error-subject", name: "Subject" },
      { id: "form-message", errorId: "error-message", name: "Message" }
    ];

    fields.forEach(field => {
      const el = document.getElementById(field.id);
      const errEl = document.getElementById(field.errorId);
      const parent = el.parentElement;

      // Reset states
      parent.classList.remove("invalid");
      errEl.textContent = "";

      const val = el.value.trim();

      if (!val) {
        parent.classList.add("invalid");
        errEl.textContent = `${field.name} is required.`;
        isValid = false;
      } else if (field.isEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          parent.classList.add("invalid");
          errEl.textContent = "Please enter a valid email address.";
          isValid = false;
        }
      }
    });

    return isValid;
  }

  // Update Form state visual indicators
  function setSubmittingState(isSubmitting) {
    if (isSubmitting) {
      formSubmitBtn.disabled = true;
      formSubmitBtn.classList.add("loading");
      showStatusMessage("sending", "Sending message...");
    } else {
      formSubmitBtn.disabled = false;
      formSubmitBtn.classList.remove("loading");
    }
  }

  // Display status message in the status container
  function showStatusMessage(type, message) {
    if (!formStatusBox) return;

    let alertClass = "";
    let iconName = "";
    let isLoader = false;

    switch (type) {
      case "sending":
        alertClass = "form-alert-sending";
        isLoader = true;
        break;
      case "success":
        alertClass = "form-alert-success";
        iconName = "check-circle";
        break;
      case "error":
        alertClass = "form-alert-error";
        iconName = "alert-circle";
        break;
    }

    let iconHTML = isLoader
      ? '<div class="spinner"></div>'
      : `<i data-lucide="${iconName}"></i>`;

    formStatusBox.innerHTML = `
      <div class="form-alert ${alertClass}">
        ${iconHTML}
        <span>${escapeHTML(message)}</span>
      </div>
    `;

    lucide.createIcons();
  }

  function clearStatusMessage() {
    if (formStatusBox) {
      formStatusBox.innerHTML = "";
    }
  }
});
