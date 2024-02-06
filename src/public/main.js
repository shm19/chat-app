document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Fetch and display the username in the navbar
  const navbarUsername = document.getElementById("navbarUsername");
  const username = localStorage.getItem("username"); // Assuming this is stored in localStorage

  if (username && navbarUsername) {
    navbarUsername.textContent = username; // Set the username text
    navbarUsername.href = "/edit"; // Set the href to navigate to the edit page
  }

  // Assuming you store the accountId in localStorage after successful login
  const accountId = localStorage.getItem("accountId");

  // Verify if accountId exists
  if (!accountId) {
    window.location.href = "/login.html";
    return;
  }

  const userGreeting = document.getElementById("userGreeting");
  userGreeting.innerHTML = `<a href="/edit" class="font-bold">${username}</a>`;

  const chatSelection = document.getElementById("chatSelection");
  const messagesContainer = document.getElementById("messages");

  async function populateChatSelection() {
    try {
      // Update the URL to your actual endpoint that returns the chat options
      const response = await fetch("/api/room-and-accounts");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json(); // Assuming the server returns JSON

      // Populate the dropdown with options from the server
      chatSelection.innerHTML = result.options
        .map(
          (option) =>
            `<option value="${option.type}-${option.value}">${option.text}</option>`
        )
        .join("");
    } catch (error) {
      console.error("There was a problem with your fetch operation:", error);
      // Handle errors or show a fallback UI
    }
  }

  (async () => {
    await populateChatSelection();

    chatSelection.addEventListener("change", () => {
      const value = chatSelection.value;
      const [type, id] = value.split("-");
      const roomId = type === "room" ? id : undefined; // Example logic
      const userId = localStorage.getItem("username"); // Ensure this is correctly retrieved

      console.log(value, type, id, userId); // Debugging
      console.log(`Attempting to join: ${roomId || id} as user: ${userId}`); // Debugging

      socket.emit("join", { type, roomId: roomId || id, userId });
    });
    // Handle form submission for sending messages
    const form = document.getElementById("messageForm");
    const input = document.getElementById("messageInput");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const messageContent = input.value;
      const selected = chatSelection.value.split("-");
      const type = selected[0]; // 'room' or 'direct'
      const id = selected[1]; // room id or user id for direct message

      if (messageContent) {
        socket.emit("new message", {
          message: messageContent,
          username: localStorage.getItem("username"), // Use actual logic to fetch username
          type,
          roomId: type === "room" ? id : undefined,
          recipientId: type === "direct" ? id : undefined,
        });
        input.value = "";
      }
    });

    // Handling incoming chat messages
    socket.on("chat message", function (msg) {
      console.log("new message is received", msg.message);
      const messageItem = document.createElement("div");
      messageItem.classList.add("p-4", "mb-2", "bg-gray-100", "rounded-lg");

      const usernameSpan = document.createElement("span");
      usernameSpan.classList.add("font-bold", "mr-2");
      usernameSpan.textContent = msg.username;

      const messageText = document.createElement("span");
      messageText.textContent = msg.message;

      messageItem.appendChild(usernameSpan);
      messageItem.appendChild(messageText);
      messagesContainer.appendChild(messageItem);

      window.scrollTo(0, document.body.scrollHeight);
    });

    // Handling initial messages when joining a room or direct chat
    socket.on("init messages", function (messages) {
      messagesContainer.innerHTML = ""; // Clear existing messages
      messages.forEach((msg) => {
        const messageItem = document.createElement("div");
        messageItem.classList.add("p-4", "mb-2", "bg-gray-100", "rounded-lg");

        const usernameSpan = document.createElement("span");
        usernameSpan.classList.add("font-bold", "mr-2");
        usernameSpan.textContent = msg.username;

        const messageText = document.createElement("span");
        messageText.textContent = msg.message;

        messageItem.appendChild(usernameSpan);
        messageItem.appendChild(messageText);
        messagesContainer.appendChild(messageItem);
      });
      window.scrollTo(0, document.body.scrollHeight);
    });
  })();
});
