document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Gather form data
    const formData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      theme: document.getElementById("theme").value,
      password: document.getElementById("password").value,
    };

    // Submit form data to the signup API
    try {
      const response = await fetch("/api/accounts/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.status === 201) {
        alert("Signup successful. Please log in.");
        window.location.href = "/login.html"; // Redirect to login page on success
      } else {
        alert(`Signup failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Signup failed: An error occurred.");
    }
  });
