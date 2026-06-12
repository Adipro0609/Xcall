let socket = io();
let token = null;
let room = "general";

/* ---------------- AUTH ---------------- */

async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  });

  const data = await res.json();
  token = data.token;

  socket.emit("auth", token);

  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";

  socket.emit("join", room);
  socket.emit("get-friends");
}

async function register() {
  await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  });

  alert("Registered!");
}

/* ---------------- FRIEND SYSTEM ---------------- */

function addFriend() {
  socket.emit("friend-request", friendName.value);
  friendName.value = "";
}

function acceptFriend(name) {
  socket.emit("friend-accept", name);
}

function rejectFriend(name) {
  socket.emit("friend-reject", name);
}

function removeFriend(name) {
  socket.emit("friend-remove", name);
}

/* receive full friend data */
socket.on("friends-data", (data) => {
  renderFriends(data.friends || [], data.requests || []);
});

/* auto refresh when server updates anything */
socket.on("friend-update", () => {
  socket.emit("get-friends");
});

/* render UI */
function renderFriends(friends, requests) {
  const f = document.getElementById("friends");
  const r = document.getElementById("requests");

  f.innerHTML = "";
  r.innerHTML = "";

  // FRIEND LIST
  friends.forEach(fr => {
    const div = document.createElement("div");
    div.innerHTML = `
      🧑 ${fr}
      <button onclick="removeFriend('${fr}')">Remove</button>
    `;
    f.appendChild(div);
  });

  // REQUEST LIST
  requests.forEach(req => {
    const div = document.createElement("div");
    div.innerHTML = `
      📩 ${req}
      <button onclick="acceptFriend('${req}')">Accept</button>
      <button onclick="rejectFriend('${req}')">Reject</button>
    `;
    r.appendChild(div);
  });
}

/* ---------------- CHAT ---------------- */

socket.on("message", (data) => {
  const div = document.createElement("div");
  div.innerText = `${data.user}: ${data.msg}`;
  chat.appendChild(div);
});

function send() {
  socket.emit("message", {
    room,
    msg: msg.value
  });

  msg.value = "";
}