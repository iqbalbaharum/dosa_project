import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import dotenv from 'dotenv';
import FluenceController from "./src/controller/fluence.controller"

dotenv.config();

const app = express.default();
const port = process.env.PORT;

app.get("/", (_req, res) => {
  res.send({ uptime: process.uptime() });
});

const server = http.createServer(app);
const io = new socketio.Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: false
  }
});

const fluence = new FluenceController()

io.on("connection", (socket: any) => {
  socket.on('get_user_rocket', async (data) => {
    try {
      let x = await fluence.get_rockets(data)
      socket.emit('output', {
        func: 'get_user_rocket',
        data: x
      })
    } catch(e) {
      console.log(e)
    }
    
  })
});

server.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});