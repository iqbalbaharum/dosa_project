const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const { Server } = require('socket.io')
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
})

// on connection
io.on('connection', socket => {
  socket.on('join-room', data => {
    socket.join(data.roomId)
    socket.broadcast.emit('user-join', data.userId)
  })

  socket.on('leave-room', data => {
    socket.leave(data.roomId)
    socket.broadcast.emit('user-leave', data.userId)
  })

  socket.on('disconnect', data => {
    socket.leave(data.roomId)
    socket.broadcast.emit('user-leave', data.userId)
  })
})

httpServer.listen(3010, () => {
  console.log(`room socket.io starting at port ${3010}`)
})
