import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, Dimensions, Pressable, FlatList, VirtualizedList, Animated } from "react-native";
import { responsiveScreenWidth as wp } from "react-native-responsive-dimensions";
import { responsiveScreenHeight as hp } from "react-native-responsive-dimensions";
import { responsiveScreenFontSize as fp } from "react-native-responsive-dimensions";

import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

const CITY = ["Seoul", "Tokyo", "Sydney", "Singapore", "New York"];
const APIKEY = "fa635e54b00c4fce47965d8b4253bb3e";

export default function Index() {
  const [isReady, setReady] = useState(false);
  const [data, setData] = useState([]);
  const [coord, setCoord] = useState([37.532600, 127.024612]);
  const coord_data = require('../assets/coordinate.json');

  //Get Weather Information From The Website
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${coord[0]}&lon=${coord[1]}&exclude=minutely,hourly,daily,alerts&appid=${APIKEY}`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        console. log(err);
      }
    }, 0);
    return () => {
      clearTimeout(timer);
    }
  }, [coord])

  //Render Region Selection List
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({item, index}) => {
    const opacity = scrollX.interpolate({
      inputRange: [(index - 1) * wp(36), index * wp(36), (index + 1) * wp(36)],
      outputRange: [0, 1, 0],
      extrapolate: "clamp"
    });
    
    return ( 
      <Animated.View style={{ 
        marginHorizontal: wp(3), 
        width: wp(30), 
        height: hp(5), 
        alignItems: "center", 
        justifyContent: "center",
        opacity
      }}>
        <Text style={{ fontSize: fp(3), fontWeight: "bold", color: "#fff" }}>{item}</Text>
      </Animated.View>
    )
  }

  const images = {
    Feel_Like: [require("../assets/Feel_Like.png"), "`C"],
    Humidity: [require("../assets/Humidity.png"), "%"],
    Wind_Speed: [require("../assets/Wind_Speed.png"), "km/h"]
  }

  //Render Further Weather Information
  const renderItem2 = ({item}) => {
    return (
      <View style={{ marginTop: hp(2), width: wp(30), height: hp(20), alignItems: "center", justifyContent: "center"}}>
        <Image style={{ 
              width: wp(13), 
              height: undefined, 
              aspectRatio: 1/1, 
              alignSelf: "center" }}
              source={images[item.key.toString()][0]}
              />
        <Text style={{ fontSize: fp(2), marginTop: hp(0.7) }}>{item.key == "Feel_Like" ? Math.round(item.value - 273) : item.value}{images[item.key.toString()][1]}</Text>
        <Text style={{ fontSize: fp(1.8), marginTop: hp(0.4) }}>{item.key}</Text>
      </View>
    )
  }

  function calcTemp(temp) {
   return Math.round(temp - 273);
  }

  const main_images = {
    Sunny: require("../assets/weathers/Sunny.png"),
    Clouds: require("../assets/weathers/Clouds.png"),
    Rain: require("../assets/weathers/Rain.png"),
    Clear: require("../assets/weathers/Sunny.png"),
  }

  const getWeather = () => {
    if (data.current.weather[0].main.toString() in main_images)
      return main_images[data.current.weather[0].main.toString()];
    else {
      console.log("Such Weather Tag (" + data.current.weather[0].main.toString() + ") Does not Exist");
      return require("../assets/weathers/Sunny.png");
    }
  }

  //Main Page
  if (isReady) {
    return (
      <View style={styles.container2}>
        <View style={{ flexDirection: "row" }}>
          <Pressable style={{        //Back Button
            flexDirection: "row",
            alignSelf: "center", 
            alignItems: "center", 
            justifyContent: "center",
            paddingHorizontal: wp(2.5)
          }}
          onPress={ () => setReady(!isReady) }>
            <AntDesign name="left" size={20} color="white" />
            <Text style={{
              fontSize: fp(2),
              fontWeight: "bold",
              color: "#fff"
            }}>Back</Text>
          </Pressable>
         <Animated.FlatList     //Region Selection List
          horizontal 
          showsHorizontalScrollIndicator = {false}
          data={CITY} 
          renderItem={renderItem} 
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingLeft:wp(10), paddingRight: wp(32) }}
          snapToInterval={wp(36)}
          decelerationRate={"fast"}
          onMomentumScrollEnd={(ev) => {
             const { width: screenWidth } = Dimensions.get('window');
             const offsetX = ev.nativeEvent.contentOffset.x;
             const centerPosition = offsetX + screenWidth / 2;
             const index = Math.round(centerPosition / wp(36)) - 1;
             if (index >= 0 && coord !== coord_data[CITY[index]]){
               setCoord(coord_data[CITY[index]])
             }
          }}
          onScroll={Animated.event(
            [{nativeEvent: {
                  contentOffset: {
                    x: scrollX
                  }
                }
              }],
              { useNativeDriver: true }
          )}/>
          {/* <Entypo name="dots-three-vertical" size={22} color="white" /> */}
        </View>
        <View style={{         //Main Information Page
          width: wp(100),
          height: hp(100),
          alignSelf: "center"
          }}>
          <View>
            <Image style={{ 
              width: wp(80), 
              height: undefined, 
              aspectRatio: 1/1, 
              alignSelf: "center" }}
              source={getWeather()}
              />
            <Text style={{
              color: "#fff",
              textAlign: "center", 
              fontSize: fp(13.5), 
              fontWeight: "500" }}>
              {calcTemp(data.current.temp)}<Text style={{fontWeight: "200"}}>&deg;</Text>
            </Text>
            <Text style={{
              color: "#fff",
              textAlign: "center", 
              fontSize: fp(4) 
              }}>
              {data.current.weather[0].main}
            </Text>
          </View>
          <View style={{
            height: hp(30),
            borderRadius: 40,
            backgroundColor: "#fff",
             marginTop: hp(6), 
             alignItems: "center", 
             overflow: 'visible' 
             }}>
            <FlatList       //Further Weather Information
              numColumns={3}
              data={[
                { key: "Feel_Like", value: data.current.feels_like },
                { key: "Humidity", value: data.current.humidity },
                { key: "Wind_Speed", value: data.current.wind_speed },
              ]}
              renderItem={renderItem2} 
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        </View>
      </View>
    )
  }

  //Intro Page
  return (
    <View style={styles.container}>
      <View style={{
        marginTop: hp(15), 
        width: wp(70), 
        aspectRatio: 1, 
        height: undefined, 
        alignSelf: "center",
      }}>
        <Image style={{
           width: wp(70), 
           aspectRatio: 1, 
           height: undefined, 
        }}
          resizeMode="contain"
          source={require("../assets/Sunny.png")} />
      </View>
      <Text style={{ 
        marginTop: hp(7), 
        width: wp(70), 
        textAlign: "center", 
        alignSelf: "center", 
        fontSize: fp(3)}}>
        <Text style={{ 
          fontWeight: "bold" }}>
          Check</Text> the latest weather info for your place!</Text>
      <Text style={{ 
        marginTop: hp(2), 
        width: wp(65), 
        textAlign: "center", 
        alignSelf: "center", 
        fontSize: fp(2.5), 
        color: "#808080" }}>
        Simple steps to make your day better and energetic</Text>
      <Pressable style={{ 
        width: wp(45), 
        height: hp(7), 
        marginTop: hp(7), 
        backgroundColor: "#8AAAE5", 
        alignSelf: "center", 
        alignItems: "center", 
        justifyContent: "center", 
        borderRadius: 10,}}
        onPress={() => setReady(!isReady)}>
        <Text style={{ 
          fontSize: fp(2.3), 
          color: "#fff", 
          fontWeight: "bold"}}>
          Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6fbff",
  },
  container2: {
    flex: 1,
    backgroundColor: "#766bdb",
    paddingTop: hp(7),
  }
})