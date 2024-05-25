import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import { useMyContextController } from '../../context';
import COLORS from '../../../constants';

const UpdateInfo = () => {
  const [controller] = useMyContextController();
  const user = controller.userLogin;
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchAreaData = async () => {
      try {
        const areaSnapshot = await firestore().collection('area').get();
        const areaData = areaSnapshot.docs.map(doc => doc.id); 
        console.log('Area Data:', areaData); 
        setProvinces(areaData);
      } catch (error) {
        console.error('Error fetching area data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAreaData();
  }, []);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullName: '',
    birthDate: '',
    gender: '',
    nationality: '',
    ethnicity: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    email: '',
    occupation: '',
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        phoneNumber: user.phone || '',
        fullName: user.fullName || '',
        birthDate: user.dateOfBirth || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        ethnicity: user.ethnicity || '',
        province: user.province || '',
        district: user.district || '',
        ward: user.ward || '',
        address: user.address || '',
        email: user.email || '',
        occupation: user.occupation || '',
      });
    }
    fetchProvinces();
  }, [user]);

  const fetchProvinces = async () => {
    try {
      const areaSnapshot = await firestore().collection('area').get();
      const provincesData = areaSnapshot.docs.map(doc => doc.id);
      console.log('Provinces:', provincesData); 
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchDistricts = async (province) => {
    try {
      const citySnapshot = await firestore().collection('area').doc(province).collection('cities').get();
      if (!citySnapshot.empty) {
        const districtData = citySnapshot.docs.map(doc => doc.data());
        if (districtData && districtData.length > 0) {
          const districtNames = districtData[0].districts;
          console.log('Districts:', districtNames); 
          setDistricts(districtNames);
        } else {
          console.log('No district data found');
        }
      } else {
        console.log('No cities data found for the province:', province);
      }
      setWards([]);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };
  
  

  const fetchWards = async (district) => {
    try {
      const areaSnapshot = await firestore().collection('area').doc(formData.province).collection('cities').doc(district).get();
      if (areaSnapshot.exists) {
        const wardsData = areaSnapshot.data().wards;
        console.log('Wards:', wardsData); 
        setWards(wardsData);
      } else {
        console.log('No wards data found');
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };
  

  const handleInputChange = (key, value) => {
    setFormData(prevFormData => {
      const updatedFormData = { ...prevFormData, [key]: value };
      if (key === 'province' && prevFormData.province !== value) { 
        fetchDistricts(value);
        updatedFormData.district = '';
        updatedFormData.ward = '';
        fetchWards(''); 
      } else if (key === 'district') {
        fetchWards(value);
        updatedFormData.ward = '';
      }
      return updatedFormData;
    });
  };
  
  

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setFormData({ ...formData, birthDate: format(date, 'dd/MM/yyyy') });
    hideDatePicker();
  };

  const handleUpdateImage = () => {
    console.log('Update image clicked');
  };

  const handleSave = async () => {
    try {
      await firestore().collection('users').doc(user.uid).update(formData);
      console.log('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.userImageContainer}>
          <View style={styles.userImageWrapper}>
            <Image
              source={{ uri: 'https://example.com/user-avatar.png' }}
              style={styles.userImage}
            />
            <TouchableOpacity style={styles.editIconContainer} onPress={handleUpdateImage}>
              <Icon name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={formData.phoneNumber}
          onChangeText={(value) => handleInputChange('phoneNumber', value)}
        />

        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={(value) => handleInputChange('fullName', value)}
        />

        <Text style={styles.label}>Ngày sinh</Text>
        <View style={styles.dateContainer}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={formData.birthDate}
            onChangeText={(value) => handleInputChange('birthDate', value)}
            editable={false}
          />
          <TouchableOpacity onPress={showDatePicker}>
            <Icon name="calendar" size={24} color="#007bff" style={styles.iconbutton}/>
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <Text style={styles.label}>Giới tính</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.gender}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('gender', value)}
          >
            <Picker.Item label="Nam" value="male" />
            <Picker.Item label="Nữ" value="female" />
          </Picker>
        </View>

        <Text style={styles.label}>Quốc tịch</Text>
        <TextInput
          style={styles.input}
          value={formData.nationality}
          onChangeText={(value) => handleInputChange('nationality', value)}
        />

        <Text style={styles.label}>Dân tộc</Text>
        <TextInput
          style={styles.input}
          value={formData.ethnicity}
          onChangeText={(value) => handleInputChange('ethnicity', value)}
        />

        <Text style={styles.label}>Tỉnh / Thành phố</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.province}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('province', value)}
          >
            {provinces.length > 0 ? (
              provinces.map((province) => (
                <Picker.Item key={province} label={province} value={province} />
              ))
            ) : (
              <Picker.Item label="Không có dữ liệu" value="" />
            )}
          </Picker>
        </View>

        <Text style={styles.label}>Quận / Huyện</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.district}
              style={styles.picker}
              onValueChange={(value) => handleInputChange('district', value)}
            >
              {districts && districts.length > 0 ? (
                districts.map((district) => (
                  <Picker.Item key={district} label={district} value={district} />
                ))
              ) : (
                <Picker.Item label="Không có dữ liệu" value="" />
              )}
            </Picker>
          </View>


        <Text style={styles.label}>Phường / Xã</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.ward}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('ward', value)}
          >
            {wards.length > 0 ? (
              wards.map((ward) => (
                <Picker.Item key={ward} label={ward} value={ward} />
              ))
            ) : (
              <Picker.Item label="Không có dữ liệu" value="" />
            )}
          </Picker>
        </View>

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
        />

        <Text style={styles.label}>Nghề nghiệp</Text>
        <TextInput
          style={styles.input}
          value={formData.occupation}
          onChangeText={(value) => handleInputChange('occupation', value)}
        />

        <Button title="Lưu" onPress={handleSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  userImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userImageWrapper: {
    position: 'relative',
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007bff',
    borderRadius: 15,
    padding: 5,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
 
  },
  dateInput: {
    flex: 1,
  },
  iconbutton: {
    padding: 10,
  },
});

export default UpdateInfo;

