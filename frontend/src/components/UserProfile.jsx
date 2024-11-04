import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const UserProfile = () => {
  const [username, setUsername] = useState('');

  const fetchUsername = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  useEffect(() => {
    fetchUsername();
  }, []);

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      {/* Additional user profile information */}
    </div>
  );
};

export default UserProfile;
