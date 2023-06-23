import QRCode from "qrcode";
import WhatsappWebJS from "whatsapp-web.js";
const { Client, LocalAuth } = WhatsappWebJS;

class WhatsappClient {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
    });
    this.qrGenerated = false;
    this.ready = false;
  }

  initialize() {
    this.client.on('qr', (QRText) => {
      QRCode.toFile('./whatsapp-qr.png', QRText, {
        errorCorrectionLevel: 'H'
      }, (err) => {
        if (err) throw err;
        console.log('QR Code generated!');
        this.qrGenerated = true;
      });
    });

    this.client.on('ready', () => {
      console.log('Client is ready!');
      this.ready = true;
    });

    this.client.on('disconnected', (reason) => {
      console.log('Client was logged out', reason);
      this.ready = false;
      this.qrGenerated = false;
      this.client.initialize();
    })

    this.client.initialize();
  }

  isReady() {
    return this.ready;
  }

  isQRGenerated() {
    return this.qrGenerated;
  }

  sendMessage(number, message) {
    return new Promise((resolve, reject) => {
      if (!number.startsWith('598')) {
        reject("Invalid number");
      } else {
        const fixedNumber = number + '@c.us';
        this.client.isRegisteredUser(fixedNumber)
          .then((isRegistered) => {
            if (isRegistered) {
              this.client.sendMessage(fixedNumber, message)
                .then((response) => {
                  resolve(response);
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              reject("User is not registered");
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  sendVerificationCode(number, code) {
    const message = `Bienvenido a Cuidemos el Agua.\n\nTu código de verificación es: *${code}*\n\nSi no solicitaste este código, ignora este mensaje.`
    return this.sendMessage(number, message)
  }
}

export default WhatsappClient;
