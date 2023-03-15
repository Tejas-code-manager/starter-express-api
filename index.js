const express = require("express");
const app = express();

const cors = require("cors");
app.use(express.json());
app.use(cors());

app.use(express.static(__dirname + "/public"));
require("dotenv").config();
require("./config/db").connect();
const server = require("http").createServer(app);
// const { getIo, initIo } = require("./socket");
const io = require("socket.io")(server);

const client = require("redis");

const userRouterjs = require("./routes/userRouter");
const adminRouterjs = require("./routes/adminRouter");

app.all("/", async (req, res, next) => {
  return res.status(200).json({
    status: 1,
    message: "Dater App",
    data: "success",
  });
});

app.use("/", userRouterjs);
app.use("/", adminRouterjs);

let clients = {};

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(`id of user connected is : ${socket.id}`);

  socket.on("/testevent", (iddata) => {
    if (clients[iddata] !== iddata) {
      clients[iddata] = socket;
    } else {
      console("ID already registered");
    }
    console.log(clients);
  });

  socket.on("/messagesend", (messagedata) => {
    console.log("message obj ===========> " + messagedata.message);
    let targetedid = messagedata.senderid;
    console.log("Target id ======> " + targetedid);
    if (clients[targetedid]) {
      console.log(`getting this client =======> ${clients[targetedid]}`);
      clients[targetedid].emit("/messagesendreceive", messagedata);
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on ${process.env.PORT}`);
});
