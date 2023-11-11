import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Image, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base-64';

export default function App() {
  const [text, setText] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [receivedImages, setReceivedImages] = useState([]);
  const [socket, setSocket] = useState(null);
  const serverUrl = 'ws://192.168.0.102:8080';
  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });
  
    if (!result.cancelled) {
      const selectedImage = result.uri;
      console.log(result.uri);
      sendImageToServer(selectedImage); 
      setReceivedImages([...receivedImages, { imageUrl: selectedImage, fromClient: true }]);
    }
  }

  //
  //first
  //

  // const sendImageToServer = async (imageUri) => {
  //   const message = {
  //     type: 'image',
  //     imageUri: imageUri
  //   };
  //   socket.send(JSON.stringify(message));
  // }


  //
  //second
  //

  // const sendImageToServer = async (imageUri) => {
  //   try {
  //     const response = await FileSystem.readAsStringAsync(imageUri, {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });
  
  //     const arrayBuffer = base64ToUint8Array(response);
  
  //     const message = {
  //       type: 'image',
  //       imageData: arrayBuffer,
  //     };
  //     socket.send(JSON.stringify(message));
  //   } catch (error) {
  //     console.error('Error reading image:', error);
  //   }
  // };
  // const base64ToUint8Array = (base64) => {
  //   const binaryString = decode(base64);
  //   const length = binaryString.length;
  //   const uint8Array = new Uint8Array(length);
  
  //   for (let i = 0; i < length; i++) {
  //     uint8Array[i] = binaryString.charCodeAt(i);
  //   }
  
  //   return uint8Array;
  // };
  


  //
  //finish
  //

  // const sendImageToServer = async (imageUri) => {
  //   try {
  //     const response = await FileSystem.readAsStringAsync(imageUri, {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });
  
  //     const arrayBuffer = base64ToUint8Array(response);
  
  //     const message = {
  //       type: 'image',
  //       imageData: Array.from(new Uint8Array(arrayBuffer)),
  //     };
  
  //     socket.send(JSON.stringify(message));
  //   } catch (error) {
  //     console.error('Error reading image:', error);
  //   }
  // };
  // const base64ToUint8Array = (base64) => {
  //   const binaryString = decode(base64);
  //   const length = binaryString.length;
  //   const uint8Array = new Uint8Array(length);
  
  //   for (let i = 0; i < length; i++) {
  //     uint8Array[i] = binaryString.charCodeAt(i);
  //   }
  
  //   return uint8Array;
  // };
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
      setReceivedMessages([...receivedMessages, { text, fromClient: true }]);
      setText('');
    }
  };
  const handleImageMessage = (imageUrl) => {
    console.log(imageUrl);
    setReceivedImages([...receivedImages, { imageUrl, fromClient: false }]);
  };
  const scrollViewRef = useRef(); 

  useEffect(() => {
    const newSocket = new WebSocket(serverUrl);
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log('Connected to the server.');
    };

    // newSocket.onmessage = async (event) => {
    //   if (typeof event.data === 'string') {
    //     console.log('In string');
    //     console.log(event.data);
    //     // Remove quotes from the message text
    //     const messageText = event.data.replace(/^"(.*)"$/, '$1');
    //     setReceivedMessages([...receivedMessages, { text: messageText, fromClient: false }]);
    //     console.log(receivedMessages);
    //   } else if (event.data instanceof ArrayBuffer) {
    //     console.log('ArrayBuffer!!!');
    //     // try {
    //     //   const arrayBuffer = event.data;
    //     //   const uint8Array = new Uint8Array(arrayBuffer);
    //     //   const blob = new Blob([uint8Array], { type: 'image/png' });

    //     //   // Преобразование blob в data URL
    //     //   const reader = new FileReader();
    //     //   reader.onloadend = () => {
    //     //     const imageUrl = reader.result;
    //     //     setReceivedImages([...receivedImages, { imageUrl, fromClient: false }]);
    //     //   };
    //     //   reader.readAsDataURL(blob);
    //     // } catch (error) {
    //     //   console.error('Error creating image:', error);
    //     // }

    //     // // Manually convert ArrayBuffer to a string
    //     // const message = String.fromCharCode.apply(null, new Uint8Array(event.data));
    //     // setReceivedMessages([...receivedMessages, { text: message, fromClient: false }]);
    //   }else if (typeof event.data === 'object' && event.data.type === 'image' && event.data.imageUrl) {
    //     console.log('In image!!!');
    //     handleImageMessage(event.data.imageUrl);
    //   }
    //   // Используем реф для прокрутки ScrollView
    //   if (scrollViewRef.current) {
    //     scrollViewRef.current.scrollToEnd({ animated: true });
    //   }
    // };
    newSocket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
    
        if (data.type === 'image' && data.imageUrl) {
          console.log('In image!!!');
          handleImageMessage(data.imageUrl);
        } else {
          console.log('In string');
          const messageText = data.replace(/^"(.*)"$/, '$1');
          setReceivedMessages([...receivedMessages, { text: messageText, fromClient: false }]);
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
    };
  }, [receivedMessages]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messageContainer} ref={scrollViewRef}>
        {receivedMessages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.message,
              message.fromClient ? styles.clientMessage : styles.responseMessage
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {receivedImages.map((image, index) => (
          <View key={index} style={[
            styles.image,
            image.fromClient ? styles.clientMessage : styles.responseMessage
          ]}>
            {/* <Image source={require('./public/image_1699633972982.png')} style={{height:200,width:200}} /> */}
            <Image source={{uri:image.imageUrl}} style={{height:200,width:200}} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Введите текст"
          value={text}
          onChangeText={handleTextChange}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleButtonPress}>
          <Text style={styles.sendButtonText}>&#9654;</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.galleryButton} onPress={openImageLibrary}>
          <Text style={styles.galleryButtonText}>Галерея</Text>
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
    marginTop: 35,
  },
  message: {
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
    color: 'white',
  },
  messageText: {
    fontSize: 24,
  },
});
