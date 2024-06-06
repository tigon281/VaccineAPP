import React, {useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Button, Menu} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import COLORS from '../../theme/constants';
import {useMyContextController} from '../../context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import {showMessage} from 'react-native-flash-message';
import auth from '@react-native-firebase/auth';

// import {Button} from 'react-native-elements';

const Newss = ({id, title, imageUrl, description}) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const [controller] = useMyContextController();
  const {userLogin} = controller;

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const isAdmin = userLogin?.role === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('DetailNews', {
              id,
              title,
              imageUrl,
              description,
            });
          }}>
          <View style={styles.rowContainer}>
            <Image source={{uri: imageUrl}} style={styles.image} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>
                <Text style={styles.boldText}>Tin tức - 06/06/2024</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* <Text style={styles.description}>
          <Text style={styles.boldText}>Nội dung: </Text>
          {description}
        </Text> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginTop: -15,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 17,
    marginTop: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    color: COLORS.blue,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonadd: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: COLORS.blue,
    borderWidth: 1,
    borderColor: COLORS.blue,
    marginHorizontal: 5,
  },
  buttonbuy: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.blue,
    marginHorizontal: 5,
  },
  buttonLabel: {
    color: COLORS.white,
  },
  buttonLabelbuy: {
    color: COLORS.blue,
  },
  menuAnchor: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 5,
  },
  boldText: {
    color: COLORS.gray,
    marginTop: 15,
  },
});

export default Newss;
