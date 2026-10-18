'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const loginForm = $("#login-form");
  const createForm = $("#create-form");
  const accountsBox = $("#saved-accounts");
  const loginError = $("#login-error");
  const createError = $("#create-error");
  const setError = (element, message) => {
    element.textContent = message || "";
    element.hidden = !message;
  };
  let accounts = [];
  let selectedAccount = null;

  function setMode(next) {
    const creating = next === "create";
    document.body.classList.toggle("is-creating", creating);
    loginForm.hidden = creating;
    createForm.hidden = !creating;
    setError(loginError, "");
    setError(createError, "");
    if (creating) $("#create-display-name").focus();
    else $("#login-password").focus();
  }
  function selectAccount(account, button) {
    selectedAccount = account;
    $("#login-username").value = account.username;
    $("#login-profile-name").textContent = account.displayName || account.username;
    $("#login-profile-subtitle").textContent = "Air-OS Benutzerkonto";
    $("#login-password").value = "";
    accountsBox.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
    if (accountsBox.children.length > 1) accountsBox.hidden = false;
  }
  function renderAccounts() {
    accountsBox.replaceChildren();
    accountsBox.hidden = accounts.length < 2;
    accounts.forEach(account => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "saved-account";
      button.innerHTML = '<span class="saved-account-avatar"></span><span></span>';
      button.querySelector(".saved-account-avatar").textContent = (account.displayName || account.username).trim().charAt(0).toLocaleUpperCase("de-DE");
      button.querySelector("span:last-child").textContent = account.displayName || account.username;
      button.title = "Als " + account.username + " anmelden";
      button.addEventListener("click", () => selectAccount(account, button));
      accountsBox.appendChild(button);
    });
    if (accounts.length) selectAccount(accounts[0], accountsBox.querySelector("button"));
  }
  async function loadAccounts() {
    try {
      accounts = await window.airOS.accounts();
      renderAccounts();
      if (!accounts.length) setMode("create");
      else setMode("login");
    } catch {
      setError(loginError, "Konten konnten nicht gelesen werden. Bitte starte Air-OS neu.");
    }
  }

  $("#switch-create").addEventListener("click", () => setMode("create"));
  $("#switch-login").addEventListener("click", () => setMode(accounts.length ? "login" : "create"));

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    setError(loginError, "");
    const button = $("#login-submit");
    button.disabled = true;
    try {
      const result = await window.airOS.login({
        username: $("#login-username").value.trim(),
        password: $("#login-password").value
      });
      if (!result || !result.ok) setError(loginError, result && result.error || "Anmeldung fehlgeschlagen.");
    } catch {
      setError(loginError, "Anmeldung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      button.disabled = false;
      $("#login-password").value = "";
      $("#login-password").focus();
    }
  });

  createForm.addEventListener("submit", async event => {
    event.preventDefault();
    setError(createError, "");
    const password = $("#create-password").value;
    if (password !== $("#create-confirm").value) {
      setError(createError, "Die Passwörter stimmen nicht überein.");
      $("#create-confirm").focus();
      return;
    }
    const button = $("#create-submit");
    button.disabled = true;
    button.querySelector("span").textContent = "Konto wird erstellt …";
    try {
      const result = await window.airOS.createAccount({
        displayName: $("#create-display-name").value.trim(),
        username: $("#create-username").value.trim(),
        password
      });
      if (!result || !result.ok) setError(createError, result && result.error || "Das Konto konnte nicht erstellt werden.");
    } catch {
      setError(createError, "Konto konnte nicht erstellt werden. Bitte versuche es erneut.");
    } finally {
      button.disabled = false;
      button.querySelector("span").textContent = "Konto erstellen";
      $("#create-password").value = "";
      $("#create-confirm").value = "";
    }
  });

  function updateClock() {
    const now = new Date();
    $("#login-clock").textContent = now.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12:true });
  }
  updateClock();
  setInterval(updateClock, 15000);

  const sleepOverlay = $("#sleep-overlay");
  const wake = () => { sleepOverlay.hidden = true; document.body.focus(); };
  $("#sleep-button").addEventListener("click", () => { sleepOverlay.hidden = false; sleepOverlay.focus(); });
  sleepOverlay.addEventListener("click", wake);
  sleepOverlay.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") wake(); });
  window.addEventListener("keydown", event => { if (!sleepOverlay.hidden && event.key !== "Tab") wake(); });
  $("#restart-button").addEventListener("click", async () => {
    const button = $("#restart-button"); button.disabled = true;
    try { await window.airOS.restart(); } catch { window.location.reload(); }
  });
  $("#shutdown-button").addEventListener("click", async () => {
    const button = $("#shutdown-button"); button.disabled = true;
    try { await window.airOS.quit(); } catch { button.disabled = false; setError(loginError, "Ausschalten ist nur in der installierten Air-OS-App verfügbar."); }
  });

  loadAccounts();
})();
