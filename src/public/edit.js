document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("editForm");

  // Fetch the current user's data from your API
  try {
    const accountId = localStorage.getItem("accountId"); // Use an appropriate identifier
    const response = await fetch(`/api/accounts/${accountId}`);
    if (!response.ok) throw new Error("Failed to fetch user data");
    const { data: userData } = await response.json();

    console.log(userData);
    // Populate the form fields
    document.getElementById("firstName").value = userData.firstName;
    document.getElementById("lastName").value = userData.lastName;
    document.getElementById("username").value = userData.username;
    document.getElementById("email").value = userData.email;
    document.getElementById("phoneNumber").value = userData.phoneNumber || "";
    document.getElementById("theme").value = userData.theme;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  // Handle form submission to update user data
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Collect form data
    const formData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      theme: document.getElementById("theme").value,
      // Include password if changed, with appropriate checks
    };

    // Send a PUT request to update the user's data
    try {
      const accountId = localStorage.getItem("accountId");
      console.log(accountId);
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update user data");
      alert("Profile updated successfully!");
      // Redirect or refresh page as needed
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update profile.");
    }
  });
});
