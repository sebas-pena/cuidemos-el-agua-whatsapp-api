import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import WhatsappClient from "./client.js";

// fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const whatsappClient = new WhatsappClient();
whatsappClient.initialize();


const app = express();
const port = process.env.PORT || 3001;
let server = null;

app.use(cors());

app.get("/qr", (req, res) => {

  if (whatsappClient.isReady()) {
    res.status(200).send("Client is ready")
    return
  }

  if (whatsappClient.isQRGenerated()) {
    if (req.query.secret === process.env.REQUEST_QR_SECRET) {
      res.sendFile("/whatsapp-qr.png", { root: __dirname });
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(503);
  }

})


app.post("/send-verification-code", (req, res) => {
  if (whatsappClient.isReady()) {
    if (req.query.secret === process.env.SEND_MESSAGE_SECRET) {
      console.log(req.query)
      whatsappClient.sendVerificationCode(req.query.number, req.query.code)
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((error) => {
          console.log(error);
          res.sendStatus(500);
        });
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(503);
  }
})

server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})