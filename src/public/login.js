document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("/api/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { data } = await response.json();
        localStorage.setItem("accountId", data.accountId);
        localStorage.setItem("username", data.username);

        window.location.href = "/";
      } else {
        alert("Login failed: " + (await response.json()).message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Login failed: An error occurred.");
    }
  });
