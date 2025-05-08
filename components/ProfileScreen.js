import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Button } from 'react-native';
import CustomTextInput from '../shared/CustomTextInput';
import CustomDropdown from '../shared/CustomDropdown';
import countryList from '../assets/Json/country.json';
import PopupComponent from '../shared/PopupComponent';
import FormDisplay from './FormDisplay';
import BusinessDetails from './BusinessDetails';
import axios from 'axios';

const days = Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }));

const years = Array.from({ length: 100 }, (_, i) => ({
    label: (new Date().getFullYear() - i).toString(),
    value: (new Date().getFullYear() - i).toString()
}));

const genders = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
];

const months = [
    { label: '1', value: 'January' },
    { label: '2', value: 'February' },
    { label: '3', value: 'March' },
    { label: '4', value: 'April' },
    { label: '5', value: 'May' },
    { label: '6', value: 'June' },
    { label: '7', value: 'July' },
    { label: '8', value: 'August' },
    { label: '9', value: 'September' },
    { label: '10', value: 'October' },
    { label: '11', value: 'November' },
    { label: '12', value: 'December' }
];

const ProfileSCreen = () => {

    const [countries, setCountries] = useState([...countryList]);
    const [isPopupVisible, setPopupStatus] = useState(false);
    const [displayBusinessInfo, setBusinessInformationStatus] = useState(false);

    const formFields = [
        { label: 'First Name', key: 'firstName', component: CustomTextInput, parentKey: null },
        { label: 'Last Name', key: 'lastName', component: CustomTextInput, parentKey: null },
        {
            label: 'Mobile Number', key: 'mobileNumber', component: ({ ...prop }) => {
                return (
                    <View style={styles.contactContainer}>
                        <CustomDropdown
                            style={{ width: '98px' }}
                            label={'Country '}
                            options={countries}
                            value={formData?.countryCode}
                            onChange={(option) => {
                                handleChange('countryCode', option)
                            }}
                            isMulti={false}
                        >
                        </CustomDropdown>
                        <CustomTextInput
                            style={{ width: '60%' }} //{styles.textWidth}
                            value={prop.value}
                            type='numeric'
                            onChange={(text) => handleChange('mobileNumber', text)}
                            placeholder={prop?.label}
                        />
                    </View>
                )
            }
        },
        { label: 'Email', key: 'email', component: CustomTextInput, parentKey: null },
        { label: 'Gender', key: 'gender', component: CustomDropdown, options: genders, parentKey: null, placeholder: 'Select Gender' },
        {
            label: 'Date of Birth', key: 'dob', component: () => (
                <View style={styles.contactContainer}>
                    <CustomDropdown
                        style={{ width: '22%' }}
                        label='Day'
                        value={formData.dob?.day}
                        onChange={(day) => handleChange('dob', { ...formData.dob, day })}
                        options={days}
                    />
                    <CustomDropdown
                        style={styles.dropdownWidth}
                        label='Month'
                        value={formData.dob?.month}
                        onChange={(month) => handleChange('dob', { ...formData.dob, month })}
                        options={months}
                    />
                    <CustomDropdown
                        style={{ width: '30%' }}
                        label='Year'
                        value={formData.dob?.year}
                        onChange={(year) => handleChange('dob', { ...formData.dob, year })}
                        options={years}
                    />
                </View>
            )
        },
        { label: 'Street', key: 'street', component: CustomTextInput, parentKey: 'address' },
        { label: 'City', key: 'city', component: CustomTextInput, parentKey: 'address' },
        { label: 'State', key: 'state', component: CustomTextInput, parentKey: 'address' },
        { label: 'Country', key: 'country', component: CustomTextInput, parentKey: 'address' },
        { label: 'Pincode', key: 'pincode', component: CustomTextInput, parentKey: 'address', type: 'numeric' },
        { label: 'Password', key: 'password', component: CustomTextInput, parentKey: 'passwordSetup', type: 'password' },
        { label: 'Confirm Password', key: 'confirmPassword', component: CustomTextInput, parentKey: 'passwordSetup', type: 'password' }
    ];

    const businessFormField = [
        { label: 'Business email address', key: 'state', component: CustomTextInput, parentKey: 'businessInformation' },
        { label: 'Store Name', key: 'country', component: CustomTextInput, parentKey: 'businessInformation' },
        { label: 'Street/house number', key: 'street', component: CustomTextInput, parentKey: 'businessAddressInformation' },
        { label: 'City/Town', key: 'city', component: CustomTextInput, parentKey: 'businessAddressInformation' },
        { label: 'Postal/ZIP Code', key: 'pincode', component: CustomTextInput, parentKey: 'businessAddressInformation', type: 'numeric' },
        { label: 'Province/states', key: 'state', component: CustomTextInput, parentKey: 'businessAddressInformation' },
        { label: 'Country', key: 'country', component: CustomTextInput, parentKey: 'businessAddressInformation' },
    ];

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNumber: '',
        countryCode: '',
        email: '',
        dob: {
            day: '',
            month: '',
            year: '',
        },
        gender: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
        },
        password: '',
        confirmPassword: '',
        businessInformation: {
            email: '',
            storeName: ''
        },
        businessAddressInformation: {
            street: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
        }
    });

    const togglePopupButton = (selectedOption) => {
        setPopupStatus(false);
        if (selectedOption.toLowerCase() === 'customer') {
            submitFormData(false);
        } else {
            setBusinessInformationStatus(true);
        }
    }

    const handleChange = (key, value, parentKey = null) => {
        let data;
        if (parentKey !== null) {
            data = { ...formData[parentKey], [key]: value };
        }
        parentKey ?
            setFormData({ ...formData, [parentKey]: data })
            : setFormData({ ...formData, [key]: value });
    };

    const handleSave = () => {
        console.log('handleSave', formData);
        !displayBusinessInfo ?
            setPopupStatus(true) :
            submitFormData(true);
    }

    const displayPopup = (title, firstButton, secondButton, togglePopupButton) => {
        return (
            <View>
                <PopupComponent
                isVisible={isPopupVisible}
                onClose={() => setPopupStatus(false)}
                title={title}
                option1Text={firstButton}
                option2Text={secondButton}
                toggleButton={togglePopupButton}
            />
            </View>

        )
    }

    const submitFormData = (flag) => {
        console.log('handleSave', formData);
        const updatedFormData = {...formData, isBusinessUser: flag  };
        axios
        .post('http://localhost:8080/api/signup', updatedFormData)   // Example API
        .then((response) => {
            console.log('Successfullt submit', response, response.data);
        })
        .catch((error) => {
            console.log('Error', error);
        });
    }


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile Details</Text>
            </View>
            { isPopupVisible && displayPopup("Continue as", "Business owner", "Customer", togglePopupButton) }
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {!displayBusinessInfo ?
                    <FormDisplay
                        formFields={formFields}
                        formData={formData}
                        onEventChange={(key, value, parentKey = null) => handleChange(key, value, parentKey)}
                    />
                    : <BusinessDetails 
                        onEventChange={(key, value, parentKey = null) => handleChange(key, value, parentKey)}
                    />
                }
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.saveButton]} onPress={handleSave} >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 40,
        paddingTop: 40,
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 10,
        zIndex: 1,
    },

    scrollViewContent: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 10
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,

    },

    buttonContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        columnGap: 20
    },

    saveButton: {
        width: '40%',
        backgroundColor: '#F1ECEC',
        padding: 7,
        borderRadius: 5,
        alignItems: 'center',
        boxShadow: 'grey 0px 1px 15px 0px',

    },

    saveButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 500,
    },

    contactContainer: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: '13px'
    },

    dropdownWidth: {
        width: '38%',
    },

    textWidth: {
        width: '50%'
    }
});

export default ProfileSCreen;

