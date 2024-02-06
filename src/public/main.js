document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const navbarUsername = document.getElementById("navbarUsername");
  const username = localStorage.getItem("username");

  if (username && navbarUsername) {
    navbarUsername.textContent = username;
    navbarUsername.href = "/edit";
  }

  const accountId = localStorage.getItem("accountId");

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
      const response = await fetch("/api/room-and-accounts");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();

      chatSelection.innerHTML = result.options
        .map(
          (option) =>
            `<option value="${option.type}-${option.value}">${option.text}</option>`
        )
        .join("");
    } catch (error) {
      console.error("There was a problem with your fetch operation:", error);
    }
  }

  (async () => {
    await populateChatSelection();

    chatSelection.addEventListener("change", () => {
      const value = chatSelection.value;
      const [type, id] = value.split("-");
      const roomId = type === "room" ? id : undefined;
      const userId = localStorage.getItem("username");

      console.log(value, type, id, userId);
      console.log(`Attempting to join: ${roomId || id} as user: ${userId}`);

      socket.emit("join", { type, roomId: roomId || id, userId });
    });

    const form = document.getElementById("messageForm");
    const input = document.getElementById("messageInput");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const messageContent = input.value;
      const selected = chatSelection.value.split("-");
      const type = selected[0];
      const id = selected[1];

      if (messageContent) {
        socket.emit("new message", {
          message: messageContent,
          username: localStorage.getItem("username"),
          type,
          roomId: type === "room" ? id : undefined,
          recipientId: type === "direct" ? id : undefined,
        });
        input.value = "";
      }
    });

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

    socket.on("init messages", function (messages) {
      messagesContainer.innerHTML = "";
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
