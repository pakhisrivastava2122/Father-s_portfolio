// ===================================================================
// YEAR IN FOOTER
// ===================================================================
document.getElementById("year").textContent = new Date().getFullYear();

// ===================================================================
// MOBILE NAV TOGGLE
// ===================================================================
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
const headerActions = document.querySelector(".header-actions");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  headerActions.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    headerActions.classList.remove("open");
  });
});

// ===================================================================
// DARK MODE TOGGLE (persisted)
// ===================================================================
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("dks-theme", theme);
}

const savedTheme = localStorage.getItem("dks-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// ===================================================================
// SCROLL REVEAL ANIMATIONS
// ===================================================================
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => revealObserver.observe(el));

// ===================================================================
// ANIMATED COUNTERS
// ===================================================================
const counters = document.querySelectorAll("[data-counter]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = `${prefix}${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((el) => counterObserver.observe(el));

// ===================================================================
// TESTIMONIAL SLIDER
// ===================================================================
const track = document.getElementById("testimonial-track");
const slides = track ? Array.from(track.children) : [];
const dotsWrap = document.getElementById("testimonial-dots");
let activeSlide = 0;
let autoTimer;

function renderDots() {
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    if (i === activeSlide) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
}

function goToSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${activeSlide * 100}%)`;
  Array.from(dotsWrap.children).forEach((dot, i) =>
    dot.classList.toggle("active", i === activeSlide)
  );
}

function startAutoplay() {
  stopAutoplay();
  autoTimer = setInterval(() => goToSlide(activeSlide + 1), 6000);
}
function stopAutoplay() {
  if (autoTimer) clearInterval(autoTimer);
}

if (track && slides.length) {
  renderDots();
  document.getElementById("t-prev").addEventListener("click", () => {
    goToSlide(activeSlide - 1);
    startAutoplay();
  });
  document.getElementById("t-next").addEventListener("click", () => {
    goToSlide(activeSlide + 1);
    startAutoplay();
  });
  const sliderWrap = document.querySelector(".testimonial-slider");
  sliderWrap.addEventListener("mouseenter", stopAutoplay);
  sliderWrap.addEventListener("mouseleave", startAutoplay);
  startAutoplay();
}

// ===================================================================
// FAQ ACCORDION
// ===================================================================
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = btn.nextElementSibling;
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    // close others
    document.querySelectorAll(".faq-q").forEach((other) => {
      if (other !== btn) {
        other.setAttribute("aria-expanded", "false");
        other.nextElementSibling.style.maxHeight = null;
      }
    });

    btn.setAttribute("aria-expanded", String(!isOpen));
    panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
  });
});

// ===================================================================
// BLOG "READ MORE" TOGGLES
// ===================================================================
document.querySelectorAll(".blog-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    const isHidden = target.hasAttribute("hidden");
    if (isHidden) {
      target.removeAttribute("hidden");
      btn.textContent = "Read Less";
    } else {
      target.setAttribute("hidden", "");
      btn.textContent = "Read More";
    }
  });
});

// ===================================================================
// CONTACT FORM SUBMISSION
// ===================================================================
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const submitBtn = document.getElementById("form-submit");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("f-name").value,
      mobile: document.getElementById("f-mobile").value,
      email: document.getElementById("f-email").value,
      financialGoal: document.getElementById("f-goal").value,
      message: document.getElementById("f-message").value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        formStatus.textContent = data.message || "Thank you! We will be in touch shortly.";
        formStatus.className = "form-status success";
        contactForm.reset();
      } else {
        formStatus.textContent = (data.errors && data.errors.join(" ")) || "Something went wrong. Please call or WhatsApp us directly.";
        formStatus.className = "form-status error";
      }
    } catch (err) {
      formStatus.textContent = "Could not reach the server. Please call or WhatsApp us directly.";
      formStatus.className = "form-status error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Schedule Consultation";
    }
  });
}
