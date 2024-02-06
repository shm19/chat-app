document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("editForm");

  try {
    const accountId = localStorage.getItem("accountId");
    const response = await fetch(`/api/accounts/${accountId}`);
    if (!response.ok) throw new Error("Failed to fetch user data");
    const { data: userData } = await response.json();

    console.log(userData);

    document.getElementById("firstName").value = userData.firstName;
    document.getElementById("lastName").value = userData.lastName;
    document.getElementById("username").value = userData.username;
    document.getElementById("email").value = userData.email;
    document.getElementById("phoneNumber").value = userData.phoneNumber || "";
    document.getElementById("theme").value = userData.theme;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      theme: document.getElementById("theme").value,
    };

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
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update profile.");
    }
  });
});
