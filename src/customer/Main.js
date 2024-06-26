import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Button,
  Image,
  Animated,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {useMyContextController} from '../../src/context';
import COLORS from '../theme/constants';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {FlatList} from 'react-native-gesture-handler';
import Slide from './menumain/Banner/Slide';
import Banner from './menumain/Banner/Banner';

const Main = () => {
  const [loading, setLoading] = useState(true);
  const [controller, dispatch] = useMyContextController();
  const {userLogin} = controller;
  const navigation = useNavigation();
  const ref = firestore().collection('USERS');
  const [userInfoComplete, setUserInfoComplete] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [news, setNews] = useState([]);

  const refnews = firestore().collection('News');
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const SlideRef = useRef(null);

  const viewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;
  useEffect(() => {
    const unsubscribe = refnews.onSnapshot(querySnapshot => {
      const list = [];

      querySnapshot.forEach(doc => {
        const {title, imageUrl, description, date} = doc.data();
        list.push({
          id: doc.id,
          title,
          imageUrl,
          description,
          date: date ? date : null,
        });
      });

      setNews(list);

      if (loading) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loading]);
  const checkUserInfoComplete = user => {
    if (
      user.phoneNumber &&
      user.fullName &&
      user.birthDate &&
      user.gender &&
      user.nationality &&
      user.province &&
      user.district &&
      user.ward &&
      user.address &&
      user.occupation
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (userLogin) {
      const isUserInfoComplete = checkUserInfoComplete(userLogin);
      setUserInfoComplete(isUserInfoComplete);
      if (!isUserInfoComplete) {
        setModalVisible(true);
      }
    }
  }, [userLogin]);

  useEffect(() => {
    const unsubscribe = ref.onSnapshot(querySnapshot => {
      if (loading) {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleUpdateInfo = () => {
    navigation.navigate('UpdateInfo');
  };

  useState(() => {
    return ref.onSnapshot(querySnapshot => {
      if (loading) {
        setLoading(false);
      }
    });
  });

  if (loading) {
    return null;
  }

  const getCurrentTimeMessage = () => {
    const currentTime = new Date().getHours();
    const greeting = getGreeting(currentTime);
    const userName = userLogin ? userLogin.fullName : 'Guest';

    return (
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>
    );
  };

  const getGreeting = currentTime => {
    if (currentTime >= 0 && currentTime < 12) {
      return `Chào buổi sáng,`;
    } else if (currentTime >= 12 && currentTime < 14) {
      return `Chào buổi trưa,`;
    } else if (currentTime >= 14 && currentTime < 17) {
      return `Chào buổi chiều,`;
    } else {
      return `Chào buổi tối,`;
    }
  };

  const splitDescription = description => {
    let words = description.split(' ');
    let result = [];

    for (let i = 0; i < words.length; i += 2) {
      if (i === words.length - 1) {
        if (result.length > 0) {
          result[result.length - 1] += ` ${words[i]}`;
        } else {
          result.push(words[i]);
        }
      } else {
        result.push(`${words[i]} ${words[i + 1]}`);
      }
    }

    return result;
  };

  return (
    <ScrollView style={{flex: 1}}>
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Action
            icon={() => (
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color="white"
              />
            )}
            onPress={() => navigation.navigate('ListNotification')}
          />

          {getCurrentTimeMessage()}
          {/* <View style={styles.greetingContainer}>
          </View> */}
          <View style={styles.spacer} />
        </Appbar.Header>

        <View
          style={{
            position: 'relative',
            height: 200,
            backgroundColor: COLORS.white,
          }}>
          <View style={{height: 100, backgroundColor: COLORS.blue}} />
          <View
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 15,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}>
            <FlatList
              data={Slide}
              renderItem={({item}) => <Banner item={item} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              bounces={false}
              keyExtractor={item => item.id}
              onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {x: scrollX}}}],
                {
                  useNativeDriver: false,
                },
              )}
              scrollEventThrottle={32}
              onViewableItemsChanged={viewableItemsChanged}
              viewabilityConfig={viewConfig}
              ref={SlideRef}
            />
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleModalClose}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Thông tin tài khoản của bạn chưa đầy đủ. Vui lòng cập nhật thông
                tin của bạn để tiếp tục.
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.buttonmodal, styles.button]}
                  onPress={handleUpdateInfo}>
                  <Text style={styles.buttonTextmodal}>Cập nhật thông tin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.squareButton}
                onPress={() => navigation.navigate('Vaccine')}>
                <FontAwesome6 name="syringe" size={24} color="white" />
              </TouchableOpacity>
              {splitDescription('Đặt mua vắc xin').map((part, index) => (
                <Text key={index} style={styles.buttonText}>
                  {part}
                </Text>
              ))}
            </View>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.squareButton}
                onPress={() => navigation.navigate('ListVaccin')}>
                <AntDesign name="appstore-o" size={24} color="white" />
              </TouchableOpacity>
              {splitDescription('Danh mục vắc xin').map((part, index) => (
                <Text key={index} style={styles.buttonText}>
                  {part}
                </Text>
              ))}
            </View>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity style={styles.squareButton}>
                <FontAwesome6 name="book-bookmark" size={24} color="white" />
              </TouchableOpacity>
              {splitDescription('Lịch sử tiêm chủng').map((part, index) => (
                <Text key={index} style={styles.buttonText}>
                  {part}
                </Text>
              ))}
            </View>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.squareButton}
                onPress={() => navigation.navigate('HistoryBuy')}>
                <FontAwesome6 name="book-medical" size={24} color="white" />
              </TouchableOpacity>
              {splitDescription('Lịch sử đặt vắc xin').map((part, index) => (
                <Text key={index} style={styles.buttonText}>
                  {part}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity style={styles.squareButton}>
                <AntDesign name="gift" size={24} color="white" />
              </TouchableOpacity>
              {splitDescription('Ưu đãi của tôi').map((part, index) => (
                <Text key={index} style={styles.buttonText}>
                  {part}
                </Text>
              ))}
            </View>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.squareButton}
                onPress={() => navigation.navigate('ListRecord')}>
                <MaterialCommunityIcons name="clock" size={24} color="white" />
              </TouchableOpacity>
              {splitDescription('Nhật ký tiêm chủng').map((part, index) => (
                <Text key={index} style={styles.buttonText}>
                  {part}
                </Text>
              ))}
            </View>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity style={styles.squareButton}>
                <MaterialCommunityIcons
                  name="test-tube"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              {splitDescription('Vắc xin cho bạn').map((part, index) => (
                <Text key={index} style={styles.buttonText}>
                  {part}
                </Text>
              ))}
            </View>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.squareButton}
                onPress={() => navigation.navigate('News')}>
                <FontAwesome6 name="newspaper" size={24} color="white" />
              </TouchableOpacity>
              {splitDescription('Tin tức vắc xin').map((part, index) => (
                <Text key={index} style={styles.buttonText}>
                  {part}
                </Text>
              ))}
            </View>
          </View>
        </View>
        <View>
          <Text style={styles.news}>Tin tức và Kiến thức</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{width: '347%'}}
            style={styles.buttonScroll}>
            <TouchableOpacity style={styles.whiteButton}>
              <Text style={styles.whiteButtonText}>Vắc xin người lớn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whiteButton}>
              <Text style={styles.whiteButtonText}>Vắc xin trẻ em</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whiteButton}>
              <Text style={styles.whiteButtonText}>Bệnh truyền nhiễm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whiteButton}>
              <Text style={styles.whiteButtonText}>Lịch tiêm chủng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whiteButton}>
              <Text style={styles.whiteButtonText}>Thông tin ưu đãi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whiteButton}>
              <Text style={styles.whiteButtonText}>Cẩm nang tiêm chủng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whiteButton}>
              <Text style={styles.whiteButtonText}>Thông tin khai trương</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whiteButton}>
              <Text style={styles.whiteButtonText}>Tin tức và kiến thức</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        {news.map(item => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('DetailNews', {
                id: item.id,
                title: item.title,
                imageUrl: item.imageUrl,
                description: item.description,
              });
            }}
            style={{paddingHorizontal: 15, marginTop: 10}}
            key={item.id}>
            <View style={styles.rowContainer}>
              <Image source={{uri: item.imageUrl}} style={styles.imagenews} />
              <View style={styles.titleContainerNews}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>
                  <Text style={styles.boldText}>Tin tức - {item.date}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  description: {
    fontSize: 17,
    marginTop: 5,
  },
  boldText: {
    color: COLORS.gray,
    marginTop: 15,
  },
  appbar: {
    backgroundColor: COLORS.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    marginTop: -15,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonmodal: {
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1,
    padding: 6,
    alignItems: 'center',
    width: '33%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagenews: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
  },
  titleContainerNews: {
    flex: 1,
  },
  buttonTextmodal: {
    color: COLORS.blue,
    // width: '100%',
    // paddingLeft: 6,
  },
  greetingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
  },
  spacer: {
    width: 24,
  },
  greeting: {
    color: COLORS.white,
    fontSize: 17,
    textAlign: 'center',
    justifyContent: 'center',
    width: '150%',
  },
  userName: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginRight: 15,
    marginTop: -30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingLeft: 15,
  },
  buttonWrapper: {
    alignItems: 'center',
    width: 90,
  },
  squareButton: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: 'black',
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
  newsContainer: {
    marginTop: 20,
    marginLeft: 10,
  },
  news: {
    fontSize: 20,
    color: COLORS.black,
    paddingLeft: 10,
    marginTop: 15,
  },
  buttonScroll: {
    marginTop: 10,
  },
  whiteButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    paddingHorizontal: '1%',
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },

  whiteButtonText: {
    color: COLORS.black,
    fontSize: 14,
  },
});

export default Main;
