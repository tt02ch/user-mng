import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet, SafeAreaView, ScrollView, Modal, Button } from 'react-native';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import UserForm from './components/UserForm';
import UserList from './components/UserList';

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users: ', error);
      Alert.alert('Error', 'Unable to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (user) => {
    try {
      if (selectedUser) {
        const userDoc = doc(db, 'users', selectedUser.id);
        await updateDoc(userDoc, user);
        Alert.alert('Success', 'User updated successfully');
      } else {
        const usersCollection = collection(db, 'users');
        await addDoc(usersCollection, user);
        Alert.alert('Success', 'User added successfully');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error adding/updating user: ', error);
      Alert.alert('Error', 'Unable to add/update user');
    }
    setModalVisible(false); // Đóng modal sau khi submit
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      const userDoc = doc(db, 'users', id);
      await deleteDoc(userDoc);
      Alert.alert('Success', 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user: ', error);
      Alert.alert('Error', 'Unable to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <UserForm onSubmit={handleSubmit} selectedUser={selectedUser} />
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        <UserList
          users={users}
          onSelectUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      </ScrollView>
      
      {/* Modal cho việc sửa thông tin người dùng */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <UserForm onSubmit={handleSubmit} selectedUser={selectedUser} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền tối mờ
  },
  modalContainer: {
    width: '80%', // Chiều rộng modal
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default App;
