import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  // Button,
  Image,
  Platform,
  StyleSheet,
} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import {launchImageLibrary} from 'react-native-image-picker';
import {Picker} from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import COLORS from '../../../theme/constants';
import {ScrollView} from 'react-native-gesture-handler';

const AddNewVaccine = () => {
  const [vaccine, setVaccine] = useState('');
  const [vaccineError, setVaccineError] = useState('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [usage, setUsage] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const ref = firestore().collection('vaccines');
  const [vaccines, setVaccines] = useState([]);
  const origins = ['USA', 'China', 'India', 'Russia', 'UK', 'Bỉ'];
  const usages = [
    'Miệng',
    'Tiêm',
    'Nhỏ giọt',
    'Hít vào',
    'Đường uống',
    'Tiêm bắp',
    'Tiêm trong da',
  ];

  async function addVaccine() {
    if (vaccine.trim() === '') {
      setVaccineError('Chưa nhập vắc xin');
      return;
    } else {
      setVaccineError('');
    }

    if (isNaN(parseFloat(price))) {
      setPriceError('Chưa nhập giá tiền.');
      return;
    } else {
      setPriceError('');
    }

    let imageUrl = '';
    if (imageUri) {
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const uploadUri =
        Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
      const task = storage().ref(filename).putFile(uploadUri);

      try {
        await task;
        imageUrl = await storage().ref(filename).getDownloadURL();
      } catch (e) {
        console.error(e);
      }
    }

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    const newVaccine = {
      title: vaccine,
      price: parseFloat(price),
      imageUrl,
      description,
      origin,
      usage,
      date: formattedDate,
    };

    ref.add(newVaccine);

    setVaccine('');
    setPrice('');
    setImageUri(null);
    setDescription('');
    setOrigin('');
    setUsage('');
  }

  const selectImage = () => {
    launchImageLibrary({}, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = ref.onSnapshot(querySnapshot => {
      const list = [];
      querySnapshot.forEach(doc => {
        const {title, price, imageUrl, description, origin, usage} = doc.data();
        list.push({
          id: doc.id,
          title,
          price,
          imageUrl,
          description,
          origin,
          usage,
        });
      });
      setVaccines(list);

      if (loading) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Tên Vắc xin</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            // placeholder="Tên vắc xin"
            value={vaccine}
            onChangeText={setVaccine}
          />
          {vaccineError ? (
            <Text style={styles.errorText}>{vaccineError}</Text>
          ) : null}
        </View>
        <Text style={styles.title}>Giá tiền</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            // placeholder="Giá tiền"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          {priceError ? (
            <Text style={styles.errorText}>{priceError}</Text>
          ) : null}
        </View>
        <Text style={styles.title}>Mô tả</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            // placeholder="Mô tả"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={origin}
              onValueChange={(itemValue, itemIndex) => setOrigin(itemValue)}>
              <Picker.Item label="Chọn nguồn gốc" value="" />
              {origins.map((item, index) => {
                return <Picker.Item label={item} value={item} key={index} />;
              })}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={usage}
              onValueChange={(itemValue, itemIndex) => setUsage(itemValue)}>
              <Picker.Item label="Chọn cách sử dụng" value="" />
              {usages.map((item, index) => {
                return <Picker.Item label={item} value={item} key={index} />;
              })}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Button
            buttonStyle={styles.btn}
            title="Chọn ảnh"
            onPress={selectImage}
            icon={
              <Icon
                name="image"
                type="font-awesome"
                size={20}
                color="white"
                style={{marginRight: 10}}
              />
            }
            iconLeft
          />
          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.image} />
          ) : null}
        </View>
        <View style={styles.inputContainer}>
          <Button title="Thêm vắc xin" onPress={addVaccine} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: COLORS.orange,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 10,
    borderColor: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    padding: 10,
    height: 50,
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
    marginBottom: 20,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});

export default AddNewVaccine;
