import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMyContextController} from '../../context';
import COLORS from '../../theme/constants';
import {format} from 'date-fns';

const Notification = ({id, title, imageUrl, description, date}) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const [controller] = useMyContextController();
  const {userLogin} = controller;

  const formattedDate = format(new Date(date), 'dd/MM/yyyy');

  const handleNavigateToDetail = () => {
    navigation.navigate('DetailNoti', {id, title, imageUrl, description});
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleNavigateToDetail}>
        <View style={styles.cardContainer}>
          <View style={styles.rowContainer}>
            <Image source={{uri: imageUrl}} style={styles.image} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    marginTop: -15,
    color: COLORS.black,
    fontWeight: 'bold',
    padding: 10,
  },
  date: {
    fontSize: 16,
    marginTop: -15,
    color: COLORS.black,
    fontWeight: 'bold',
    padding: 10,
  },
});

export default Notification;
