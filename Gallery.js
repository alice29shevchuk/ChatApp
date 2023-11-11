import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const Gallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: images[currentIndex] }} style={styles.image} />
      <View style={styles.navigation}>
        <TouchableOpacity onPress={handlePrev}>
          <Text style={styles.buttonText}>&#10094;</Text>
        </TouchableOpacity>
        {/* <Text>{currentIndex + 1}/{images.length}</Text> */}
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.buttonText}>&#10095;</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonText: {
    borderWidth: 1,
    borderColor: 'black',
    paddingTop: 10,
    paddingBottom:10,
    paddingLeft:20,
    paddingRight:20,
    borderRadius: 5,
    backgroundColor:'#FFFFFF',
    opacity:0.7,
    borderRadius:10,
    fontSize:24,
  },
  image: {
    width: '100%',
    height: '70%',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    position: 'absolute', 
    bottom: 475, 
    width: '100%',
  },
});

export default Gallery;
