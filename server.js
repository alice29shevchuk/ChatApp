const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const directory = 'public';
const clients = new Set();

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'image' && data.imageData) {
      console.log('Изображение');
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }
      const imageBuffer = Buffer.from(Object.values(data.imageData));

      const filePath = `${directory}/image_${Date.now()}.png`;
      fs.writeFileSync(filePath, imageBuffer);

      const fileUrl = `/public/${path.basename(filePath)}`;
      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          try {
            const imageBuffer = fs.readFileSync(filePath);
            const base64Image = imageBuffer.toString('base64');
            const dataUrl = `data:image/png;base64,${base64Image}`;
            client.send(JSON.stringify({ type: 'image', imageUrl: dataUrl }));
          } catch (error) {
            console.error('Error sending message:', error);
          }
        }
      });
    } 
    else if(data.type === 'voice' && data.audioData && data.urlSender){
      console.log('Voice Message Received');
      handleVoiceMessage(ws, data.audioData,data.urlSender); 
    }
    else {
      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });
});
const handleVoiceMessage = (ws, audioData,urlSender) => {
  try {
    const filePath = path.join(directory, `voice_${Date.now()}.wav`);
    console.log(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    fs.writeFileSync(filePath, Buffer.from(Object.values(audioData)));
    clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
        try {
            const voiceMessageBuffer = fs.readFileSync(filePath);
            const base64VoiceMessage = voiceMessageBuffer.toString('base64');
            const formattedMessage = base64VoiceMessage;
            console.log(urlSender);
            client.send(JSON.stringify({ type: 'voice', audioUrl: formattedMessage, senderAudioPath: urlSender }));
        } catch (error) {
            console.error('Error sending voice message:', error);
        }
      }
    });
  } catch (error) {
    console.error('Error handling voice message:', error);
  }
};
