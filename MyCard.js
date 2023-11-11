import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default class MyCard extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <View style={styles.productCard}>
              <Image
                style={styles.weightImage}
                source={{
                  uri: 'https://yellow.ua/skin/frontend/base/default/images/catalog/product/compare.svg',
                }}
              />
              <Image
                style={styles.productImage}
                source={{
                  uri: 'https://img.jabko.ua/image/cache/catalog/products/2023/09/122300/1-1397x1397.jpg.webp',
                }}
              />
              <Text style={styles.productName}>Apple iPhone 15 Pro 256GB (Natural Titanium)</Text>
              <Text style={styles.price}>Цена: 56 999 грн.</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buttonText}>Купить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartButton}>
                  <Text style={styles.buttonText}>В корзину</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actionText}>
                <Text style={styles.availability}>В наличии</Text>
                <Text style={styles.productCode}>код: 123456789</Text>
              </View>
            </View>
          )
    }
}
const styles = StyleSheet.create({
    productCard: {
      margin:20,
      borderColor: '#ccc',
      borderWidth: 1,
      padding: 20,
      width: 400,
      height:520,
      borderRadius:20,
      alignItems: 'center',
    },
    weightImage:{
      width: '8%', 
      height: '6%',
      marginRight:300,
    },
    productImage: {
      width: '50%', 
      height: '50%',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius:20,
    },
    productName: {
      fontSize: 24,
      marginVertical: 10,
    },
    price: {
      fontSize: 18,
      marginRight:200,
      fontWeight:'bold'
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 20,
    },
    buyButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginRight:180,
      backgroundColor: '#FFCE00',
      borderRadius: 20,
    },
    cartButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderColor: '#FFCE00',
      borderWidth: 1,
      color:'black',
      borderRadius: 20,
    },
    actionText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    buttonText: {
      color: '#fff',
      textAlign: 'center',
      color:'#000',
    },
    availability: {
      color: 'green',
      fontWeight: 'bold',
      marginRight:180
    },
    productCode: {
      fontSize: 14,
      color:'gray'
    },
  });
  

