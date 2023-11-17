import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Image, StyleSheet, Text, ScrollView, TouchableOpacity, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base-64';
import { Audio } from 'expo-av';

export default function App() {
  const [text, setText] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [receivedImages, setReceivedImages] = useState([]);
  const [socket, setSocket] = useState(null);
  const serverUrl = 'ws://192.168.0.108:8080';
  const [receivedAudios, setReceivedAudios] = useState([]);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isRecordingFinished, setIsRecordingFinished] = useState(false);
  const [isAudioReceived, setIsAudioReceived] = useState(false);
  const [audioSender,setAudioSender] = useState(null);

  const allMessages = [
    ...receivedMessages.map(message => ({ ...message, type: 'text' })),
    ...receivedImages.map(image => ({ ...image, type: 'image' })),
    ...receivedAudios.map(audio => ({ ...audio, type: 'audio' })),
  ];
  const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
  const playRecording = async (_index) => {
    console.log("Now: " + _index['audiourl']);
    const { sound: newSound } = await Audio.Sound.createAsync({
      uri: _index['audiourl'],
      shouldPlay: true,
    });
    setSound(newSound);
    console.log('My audio: ', receivedAudios, '\n');
    await newSound.playAsync();



    // try {
    //   if (sound) {
    //     await sound.unloadAsync(); 
    //   }
    //   const fileName = `recording-${Date.now()}.caf`;
    //   const filePath = `${FileSystem.cacheDirectory}AV/${fileName}`;
    //   await FileSystem.makeDirectoryAsync(`${FileSystem.cacheDirectory}AV`, {
    //     intermediates: true,
    //   });
    //   if(audioSender !== null){
    //     const { sound: newSound } = await Audio.Sound.createAsync({
    //       uri: audioSender,
    //       shouldPlay: true,
    //     });
    //     setSound(newSound);
    //     console.log('My audio: ',receivedAudios,'\n');
    //     await newSound.playAsync();
    //   }
    //   else{
    //     await FileSystem.writeAsStringAsync(filePath, currentAudioUrl, {
    //       encoding: FileSystem.EncodingType.Base64,
    //     });
    //     const { sound: newSoundGet } = await Audio.Sound.createAsync({
    //       uri: filePath,
    //       shouldPlay: true,
    //     });
    //     setSound(newSoundGet);
    //     console.log('Antother device audio: ',receivedAudios,'\n');
    //     await newSoundGet.playAsync();
    //   }
    // } catch (error) {
    //   console.error('Error loading sound:', error);
    // }
  };
  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });
  
    if (!result.cancelled) {
      const selectedImage = result.uri;
      
      const newImage = { imageUrl: selectedImage, fromClient: true, timestamp: Date.now() };////////////
      setReceivedImages(prevImages => [...prevImages, newImage]);
      sendImageToServer(selectedImage); 
    }
  }
  const sendImageToServer = async (imageUri) => {
    try {
      const response = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const binaryString = decode(response); 
  
      const arrayBuffer = new Uint8Array(binaryString.length);
  
      for (let i = 0; i < binaryString.length; i++) {
        arrayBuffer[i] = binaryString.charCodeAt(i);
      }

      const message = {
        type: 'image',
        imageData: arrayBuffer,
      };
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error reading image:', error);
    }
  };
  const handleTextChange = (newText) => {
    setText(newText);
  };

  const handleButtonPress = () => {
    if (socket) {
      socket.send(JSON.stringify(text));
      setReceivedMessages([...receivedMessages, { text, fromClient: true, timestamp: Date.now() }]);////////
      setText('');
    }
  };
  const scrollViewRef = useRef(); 

  useEffect(() => {
    const newSocket = new WebSocket(serverUrl);
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log('Connected to the server.');
    };
    newSocket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
    
        if (data.type === 'image' && data.imageUrl) {
          setReceivedImages(prevImages => [...prevImages, { imageUrl: data.imageUrl, fromClient: false,timestamp: Date.now() }]);/////////////
        } 
        else if(data.type === 'voice' && data.audioUrl){
          console.log('Voice Message Received');
            setIsAudioReceived(true);
            setCurrentAudioUrl(data.audioUrl);
            //
            //
            //
            const fileName = `recording-${Date.now()}.caf`;
            const filePath = `${FileSystem.cacheDirectory}AV/${fileName}`;

          if (audioSender !== null) {
            setReceivedAudios(prevAudios => [...prevAudios, { audiourl: audioSender, fromClient: false, timestamp: Date.now() }]);////////////////
            console.log(receivedAudios,'\n');
          }
          else {
            await FileSystem.writeAsStringAsync(filePath, data.audioUrl, {
              encoding: FileSystem.EncodingType.Base64,
            });
            console.log('Get audio from server: ');
            setReceivedAudios(prevAudios => [...prevAudios, { audiourl: filePath, fromClient: false, timestamp: Date.now() }]);////////////////
            console.log(receivedAudios,'\n');
          }    
        }
        else {
          const messageText = data.replace(/^"(.*)"$/, '$1');
          setReceivedMessages([...receivedMessages, { text: messageText, fromClient: false, timestamp: Date.now() }]);///////////////
        }
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    newSocket.onclose = (event) => {
      console.log(`Connection closed: ${event.code}, ${event.reason}`);
    };

    return () => {
      if (newSocket) {
        newSocket.close();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [receivedMessages]);
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (error) {
          console.error('Error stopping existing recording:', error);
        }
        setRecording(null);
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const status = await recording.getStatusAsync();

        if (status.isDoneRecording) {
          const audioURI = await recording.getURI();
          setAudioSender(audioURI);
          sendVoiceMessageToServer(audioURI);
        }
        setRecording(null);
        setIsRecording(false);
      } else {
        console.warn('Recording is not currently active.');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const sendVoiceMessageToServer = async (audioURI) => {
    try {
      const response = await fetch(audioURI);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file. Status: ${response.status}`);
      }
  
      const audioData = await response.arrayBuffer();
  
      const message = {
        type: 'voice',
        audioData: Array.from(new Uint8Array(audioData)),
        urlSender: audioURI
      };
      setIsRecordingFinished(true);
      console.log('Send audio to server on own phone: ');
      setReceivedAudios(prevAudios => [...prevAudios, { audiourl: audioURI, fromClient: true, timestamp: Date.now()}]);////////////
      console.log(receivedAudios,'\n');
      socket.send(JSON.stringify(message));

    } catch (error) {
      console.error('Error reading or sending audio file:', error);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView style={styles.messageContainer} ref={scrollViewRef}>
        {sortedMessages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.message,
              message.fromClient ? styles.clientMessage : styles.responseMessage
            ]}
          >
            {message.type === 'text' && (
              <Text style={styles.messageText}>{message.text}</Text>
            )}
            {message.type === 'image' && (
              <Image source={{ uri: message.imageUrl }} style={{ height: 200, width: 200 }} />
            )}
            {message.type === 'audio' && (
              <Button title="Прослушать аудио" onPress={() => {playRecording(message)}} />
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.sendButton} onPress={openImageLibrary}>
          <Text style={styles.sendButtonText}>&#128450;</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={isRecording ? stopRecording : startRecording}>
          <Text style={styles.sendButtonText}>{isRecording ? <Text style={styles.sendButtonText}>&#128721;</Text> : <Text style={styles.sendButtonText}>&#127897;</Text>}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Введите текст"
          value={text}
          onChangeText={handleTextChange}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleButtonPress}>
          <Text style={styles.sendButtonText}>&#9654;</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
  },
  messageContainer: {
    flex: 1,
    marginTop: 45,
    width:350,
  },
  message: {
    padding: 10,
    margin: 8,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  image:{
    padding: 10,
    margin: 8,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  clientMessage: {
    backgroundColor: '#D8BFD8',
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 20,
    alignSelf: 'flex-end',
  },
  responseMessage: {
    backgroundColor: '#DDA0DD',
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    alignSelf: 'flex-start',
  },
  responseImage: {
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    marginLeft: 10,
    padding: 10,
  },
  sendButton: {
    backgroundColor: 'blue',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    fontSize: 24,
    marginLeft:2,
    color: 'white',
  },
  messageText: {
    fontSize: 24,
  },
});
