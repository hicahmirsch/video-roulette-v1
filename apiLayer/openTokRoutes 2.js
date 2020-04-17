const express = require("express");
const openTokRouter = express.Router();

// var apiKey = process.env.TOKBOX_API_KEY;
// var secret = process.env.TOKBOX_SECRET;
const apiKey = 46648222;
const secret = "633543163127909d7a0d4e2c3007a4ac486ef81a";

var OpenTok = require("opentok");
var opentok = new OpenTok(apiKey, secret);

// This is not persisted. Redis?
var roomToSessionIdDictionary = {};

const findAvailableRoom = (participants, visitedRooms) => {
  console.log("visitedRooms in the findAvaliableRoom is ", visitedRooms)
  const candidateRooms = Object.keys(roomToSessionIdDictionary);
  for (let i = 0; i < candidateRooms.length; i++) {
    if (roomToSessionIdDictionary[candidateRooms[i]].connectionCount < participants &&
        visitedRooms.includes(roomToSessionIdDictionary[candidateRooms[i]].sessionId) !== true) {
      return candidateRooms[i];
    }
  }
  return null;
}


openTokRouter.get("/allsessions", (req, res, next) => {
  res.send(roomToSessionIdDictionary);
});


openTokRouter.post("/deletesession/:roomname", (req, res, next) => {
  const { roomname } = req.params;
  delete roomToSessionIdDictionary[roomname];
  res.status(200).send();
});


openTokRouter.post("/decrimentsession/:roomname", (req, res, next) => {
  const { roomname } = req.params;
  roomToSessionIdDictionary[roomname].connectionCount--;
  console.log("room decrimented to ", roomToSessionIdDictionary[roomname].connectionCount)
  if (roomToSessionIdDictionary[roomname].connectionCount <= 0) {
    delete roomToSessionIdDictionary[roomname];
    console.log("room deleted")
  }
  res.status(201).send();
});


openTokRouter.post("/chat/:memberscount", function (req, res, next) {
  let sessionId;
  let token;
  const { memberscount } = req.params;
  const { visitedRooms } = req.body;
  let roomName = findAvailableRoom(memberscount, visitedRooms);

  // we should now have an available room, if not drop down to create a room
  if (roomName) {
    roomToSessionIdDictionary[roomName].connectionCount++;
    sessionId = roomToSessionIdDictionary[roomName].sessionId;

    // generate token
    token = opentok.generateToken(sessionId);
    res.setHeader("Content-Type", "application/json");
    res.send({
      apiKey: apiKey,
      sessionId: sessionId,
      token: token,
      dictionary: roomToSessionIdDictionary,
    });
    // this is the first time the room is being accessed, create a new session ID
  } else if (!roomName) {
    opentok.createSession({ mediaMode: "routed" }, function (err, session) {
      if (err) {
        console.log(err);
        res.status(500).send({ error: "createSession error:" + err });
        return;
      }
      roomName = Object.keys(roomToSessionIdDictionary).length++;
      roomToSessionIdDictionary[roomName] = {
        sessionId: session.sessionId,
        connectionCount: 1,
      };

      // generate token
      token = opentok.generateToken(session.sessionId);
      res.setHeader("Content-Type", "application/json");
      res.send({
        apiKey: apiKey,
        sessionId: session.sessionId,
        token: token,
        dictionary: roomToSessionIdDictionary,
      });
    });
  }
});

module.exports = { openTokRouter };