// app.js

// 1. Firebase Config (REPLACE with your own from Firebase console)
const firebaseConfig = {
    apiKey: "AIzaSyBO7ZdxRhMrDCDeziA8zUA_pxO9MwcjZI0",
  authDomain: "blinkhub-mall.firebaseapp.com",
  projectId: "blinkhub-mall",
  storageBucket: "blinkhub-mall.firebasestorage.app",
  messagingSenderId: "407192415924",
  appId: "1:407192415924:web:2712d03a1c9610e764b1e1",
  // you can keep only what Firebase gives you; these are examples
};

// 2. Init
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM helpers
const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page; // "mall" or "devices"
  const yearEl = $("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setupAuthUI(page);

  // Auth state listener
  auth.onAuthStateChanged((user) => {
    updateAuthStateUI(user, page);
  });
});

function setupAuthUI(page) {
  const loginBtn = $("loginBtn");
  const logoutBtn = $("logoutBtn");
  const ctaCreateAccount = $("ctaCreateAccount");
  const authModal = $("authModal");
  const closeAuthModal = $("closeAuthModal");
  const authForm = $("authForm");
  const toggleAuthMode = $("toggleAuthMode");
  const authTitle = $("authTitle");
  const authSubmitBtn = $("authSubmitBtn");
  const authError = $("authError");

  let mode = "login"; // "login" or "signup"

  const openModal = () => {
    authError.textContent = "";
    authModal.classList.remove("hidden");
  };

  const closeModal = () => {
    authModal.classList.add("hidden");
  };

  if (loginBtn) loginBtn.addEventListener("click", openModal);
  if (ctaCreateAccount) {
    ctaCreateAccount.addEventListener("click", () => {
      mode = "signup";
      updateModeUI();
      openModal();
    });
  }
  if (closeAuthModal) closeAuthModal.addEventListener("click", closeModal);

  if (toggleAuthMode) {
    toggleAuthMode.addEventListener("click", () => {
      mode = mode === "login" ? "signup" : "login";
      updateModeUI();
    });
  }

  function updateModeUI() {
    if (!authTitle || !authSubmitBtn) return;
    if (mode === "login") {
      authTitle.textContent = "Login to BlinkHub";
      authSubmitBtn.textContent = "Login";
      toggleAuthMode.innerHTML =
        'Need an account? <button type="button" class="linklike">Sign up</button>';
    } else {
      authTitle.textContent = "Create your BlinkHub account";
      authSubmitBtn.textContent = "Sign Up";
      toggleAuthMode.innerHTML =
        'Already have an account? <button type="button" class="linklike">Login</button>';
    }
  }

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      authError.textContent = "";

      const email = $("authEmail").value.trim();
      const password = $("authPassword").value;

      authSubmitBtn.disabled = true;

      try {
        if (mode === "login") {
          await auth.signInWithEmailAndPassword(email, password);
        } else {
          await auth.createUserWithEmailAndPassword(email, password);
        }
        closeModal();
      } catch (err) {
        authError.textContent = err.message;
      } finally {
        authSubmitBtn.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut();
    });
  }
}

// Update UI based on whether user is logged in
function updateAuthStateUI(user, page) {
  const userStatus = $("userStatus");
  const loginBtn = $("loginBtn");
  const logoutBtn = $("logoutBtn");

  if (userStatus) {
    if (user) {
      userStatus.textContent = `Hi, ${user.email}`;
    } else {
      userStatus.textContent = "Not logged in";
    }
  }

  if (loginBtn && logoutBtn) {
    if (user) {
      loginBtn.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
    } else {
      loginBtn.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
    }
  }

  // Page-specific auth behaviour
  if (page === "mall") {
    handleMallAuth(user);
  } else if (page === "devices") {
    handleDevicesAuth(user);
  }
}

function handleMallAuth(user) {
  // Any card with data-requires-auth="true" should still show content,
  // but action button is locked without login
  document.querySelectorAll('[data-requires-auth="true"]').forEach((card) => {
    const btn = card.querySelector(".service-action");
    const hint = card.querySelector(".auth-hint");

    if (!btn) return;

    if (user) {
      btn.disabled = false;
      btn.textContent = "Open (Demo)";
      if (hint) hint.textContent = "Demo: imagine this opens your real dashboard.";
      btn.onclick = () => {
        alert("In a real app, this would open your dashboard/service page.");
      };
    } else {
      btn.disabled = true;
      btn.textContent = "Login required";
      if (hint) hint.textContent = "Please login or create an account in the top-right.";
      btn.onclick = null;
    }
  });
}

function handleDevicesAuth(user) {
  // Products are visible always; Add to Cart only works when logged in
  document.querySelectorAll(".require-auth").forEach((btn) => {
    const card = btn.closest(".product-card");
    const hint = card ? card.querySelector(".auth-hint") : null;

    if (user) {
      btn.disabled = false;
      btn.textContent = "Add to Cart";
      if (hint) hint.textContent = "Demo: cart is not real yet, but button is active.";
      btn.onclick = () => {
        alert("Demo only: this would add the item to the user's cart.");
      };
    } else {
      btn.disabled = true;
      btn.textContent = "Login to buy";
      if (hint) hint.textContent = "You can see all products, but must login to buy.";
      btn.onclick = null;
    }
  });
}
