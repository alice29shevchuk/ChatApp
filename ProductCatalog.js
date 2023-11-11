import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';

const ProductCatalog = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef(null);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      listRef.current.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const handleNext = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
      listRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const products = [
    {
      name: "Товар 1",
    },
    {
      name: "Товар 2",
    },
    {
        name: "Товар 3",
      },
      {
        name: "Товар 4",
      },
      {
        name: "Товар 5",
      },
      {
        name: "Товар 6",
      },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={handlePrev}>
          <Text style={styles.buttonText}>{'\u25C0'}</Text> {/* Стрелка влево */}
        </TouchableOpacity>
        <FlatList
          ref={listRef}
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Text style={styles.productName}>{item.name}</Text>
            </View>
          )}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.floor(event.nativeEvent.contentOffset.x / 365);
            setCurrentIndex(newIndex);
          }}
        />
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.buttonText}>{'\u25B6'}</Text> {/* Стрелка вправо */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: -285,
  },
  buttonText: {
    fontSize: 24,
  },
  productCard: {
    width: 365,
    height: 50,
    padding: 10,
    borderColor: '#F6F6F6',
    borderRightColor: '#ccc',
    borderWidth: 1,
    borderRadius: 0,
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
});

export default ProductCatalog;
