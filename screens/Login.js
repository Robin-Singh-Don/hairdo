
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function Login({ navigation }) {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleSignUp = () => {
    navigation.navigate("ProfileScreen");
  }

  const handleLogin = (isOwnerLogin) => {
    console.log('Logging in with:', phoneOrEmail, password);
    history.push('./UserProfile')
    axios
      .post('http://localhost:8080/api/signin', { contact: phoneOrEmail, password, isOwnerLogin })   // Example API
      .then((response) => {
        console.log('Successfully submit', response, response.data);
        
      })
      .catch((error) => {
        console.log('Error', error);
      });

    //   navigation.goBack(); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CutTrack</Text>

      <Text style={styles.loginText}>Log in</Text>
      <Text style={styles.subtitle}>Access to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone / email"
        value={phoneOrEmail}
        onChangeText={setPhoneOrEmail}
      />
      <View style={styles.inputPassword}>
        <TextInput
          style={styles.inputPasswordText}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={togglePasswordVisibility}
        activeOpacity={0.8}
      >
        {/* <Text style={styles.forgotPasswordText}>Forgot your password?</Text> */}
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={ () => handleLogin(false)}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Or</Text>

      <TouchableOpacity
        style={styles.ownerBarberButton}

      >
        <Text style={styles.buttonText} onPress={ () => handleLogin(true)}>Owner/Barber Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={toggleSignUp}
        activeOpacity={0.8}
      >
        <Text style={styles.joinText}>New here? Join now</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    backgroundColor: '#F1ECEC'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,

  },
  loginText: {
    fontSize: 18,
    // fontWeight: 'bold',
    marginBottom: 2,
    marginTop: 30,
  },
  subtitle: {
    marginBottom: 20,
    color: '#00000080',
    fontSize: 13,
    fontWeight: 500,

  },
  input: {
    borderWidth: 1.5,
    borderColor: '#00000061',
    padding: 10,
    marginBottom: 20,
    width: '85%',
    boxShadow: '0px 2px 4px 2px rgba(0, 0, 0, .1)',
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    fontSize: 13,
  },

  forgotPasswordButton: {
    marginBottom: 20,
    margin: 0,
    width: '85%',
    padding: 0,

  },
  forgotPasswordText: {
    cursor: 'hover',
    textAlign: 'right',
    color: 'rgba(0, 0, 0, 0.5)',
    textDecorationLine: 'none',
    fontSize: 13,
    fontWeight: 500,

  },
  loginButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 6,
    width: '85%',
    marginBottom: 0,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 15,
    color: 'rgba(0, 0, 0, 0.5)'
  },
  ownerBarberButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 6,
    width: '85%',
  },
  joinText: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'center'
  },
  eyeIcon: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: 'translateY(-50%)',
  },
  inputPassword: {
    position: 'relative',
    // width: '100%',
    borderWidth: 1.5,
    borderColor: '#00000061',
    // padding: 10,
    marginBottom: 4,
    width: '85%',
    boxShadow: '0px 2px 4px 2px rgba(0, 0, 0, .1)',
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    fontSize: 13,

  },
  inputPasswordText: {
    padding: 10,
  }

});
