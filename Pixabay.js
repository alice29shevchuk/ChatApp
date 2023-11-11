import React from 'react';
import { Button, View } from 'react-native';
import {useEffect, useState} from 'react';
import {ActivityIndicator, Image,ScrollView,TouchableOpacity,Text} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const Pixabay = () => {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [text, onChangeText] = React.useState('');
    const [author, setAuthor] = React.useState('');
    const getMovies = async () => {
      try {
        const response = await fetch('https://pixabay.com/api/?key=28501203-6df5b7f7cb4c3311c7478d75b&q=yellow+flowers&image_type=photo');
        const json = await response.json();
        console.log(json.hits);
        if (json.hits.length > 0) {
            setData(json.hits);
          }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      getMovies();
    }, []);
  
    return (
      <View style={{flex: 1, padding: 24}}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <TextInput 
        style={{borderWidth:2,borderColor:'pink',borderRadius:20,padding:15,width:'100%'}}
        placeholder='Search'
        onChangeText={onChangeText}
        />
        <TouchableOpacity style={{position:'absolute',right:10,top:7}}
        onPress={async () => {
        try {
            if(author.length>0){
                const response = await fetch(`https://pixabay.com/api/?key=28501203-6df5b7f7cb4c3311c7478d75b&q=${text}+user:${author}&image_type=photo`);
                const result = await response.json();
                console.log('search = ', result.hits);
                if (result.hits.length > 0) {
                  setData(result.hits);
                }
            }
            else{
                const response = await fetch(`https://pixabay.com/api/?key=28501203-6df5b7f7cb4c3311c7478d75b&q=${text}&image_type=photo`);
                const result = await response.json();
                console.log('search = ', result.hits);
                if (result.hits.length > 0) {
                  setData(result.hits);
                }
            }
        } catch (error) {
          console.error(error);
        }
        }}
        >
            <Text style={{fontSize:24}}>&#128269;</Text>
        </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
            <ScrollView
            horizontal={false}
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
            >
            {data.map((img,indx)=>(
                <View style={{borderWidth:1,borderRadius:20,margin:20}}>
                    <Image 
                    key={indx}
                    style={{ width: 150, height: 150,margin:20}} 
                    source={{ uri: img.previewURL}} 
                    />
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <TouchableOpacity
                    style={{ width: 100, height: 30, backgroundColor: 'pink', alignItems: 'center', justifyContent: 'center',borderRadius:20,marginLeft:10,marginBottom:10 }}
                    onPress={async () => {
                        setAuthor(img.user);
                        try {
                            if(text.length>0){
                                console.log('text.len>0');
                                const response = await fetch(`https://pixabay.com/api/?key=28501203-6df5b7f7cb4c3311c7478d75b&q=${text}+user:${img.user}&image_type=photo`);
                                const result = await response.json();
                                console.log('search = ', result.hits);
                                if (result.hits.length > 0) {
                                  setData(result.hits);
                                }
                            }
                            else{
                                console.log('text.len<0');
                                const response = await fetch(`https://pixabay.com/api/?key=28501203-6df5b7f7cb4c3311c7478d75b&q=user:${img.user}&image_type=photo`);
                                const result = await response.json();
                                console.log('search = ', result.hits);
                                if (result.hits.length > 0) {
                                  setData(result.hits);
                                }
                            }
                        } catch (error) {
                          console.error(error);
                        }
                        }}
                    >
                    <Text style={{ color: 'white' }}>{img.user}</Text>
                    </TouchableOpacity>
                    <Text style={{marginRight:10,marginTop:5}}>&#x2764;&#xfe0f;{img.likes}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
        )}
      </View>
    );
  };
  
  export default Pixabay;