import React, { useState, useEffect, useRef} from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Button } from 'react-native';
import CustomTextInput from '../shared/CustomTextInput';
import CustomDropdown from '../shared/CustomDropdown';

const FormDisplay = (props) => {
    const { formFields, formData, onEventChange } = props;
    const inputRef = useRef(null);
    const otherRef = useRef(null);

    useEffect(() => {
        inputRef?.current?.focus();
    }, []);

    const onEventChanges = (key, value, parentKey) => {
        onEventChange(key, value, parentKey)
    }

    const renderFormFileds = (field, index) => {
        return (
            <View key={field.key} style={styles.inputContainer}>
                <Text style={styles.label}>{field.label}</Text>
                {field.component === CustomTextInput ? (
                    <CustomTextInput
                        ref={index == 0 ? inputRef : otherRef} 
                        value={field.parentKey ? field.parentKey[field.key] : formData[field.key]}
                        onChange={(text) => onEventChanges(field.key, text, field.parentKey)}
                        type={field.type || 'default'}
                        placeholder={field?.label}
                    />
                ) : field.component === CustomDropdown ? (
                    <CustomDropdown
                        label={field.label}
                        options={field.options}
                        value={formData[field.key]}
                        onChange={(value) => onEventChanges(field.key, value, null)}
                        isMulti={false} >
                    </CustomDropdown>
                ) : typeof field.component === 'function' ? (
                    field.component({
                        label: field.label,
                        value: formData[field.key],
                        onChange: (value) => onEventChange(field.key, value, null),
                        options: field.options,
                    })
                ) : null}
            </View>
        )
    }

    const titleCaseString = (text) => {
        let updatedText = text[0].toUpperCase();
        text?.split('').forEach((el, i) => {

            if (i >= 1) {
                if (el === el.toUpperCase()) {
                    updatedText = updatedText + ' ' + el.toUpperCase();
                } else {
                    updatedText = updatedText + el;
                }
            }
        });
        return updatedText;
    }

    return (
        <View style={styles.form}>
            {formFields.map((field, i) => (
                (field?.parentKey && field?.parentKey !== formFields[i - 1]?.parentKey) ?
                    <View><Text style={styles.label}>{titleCaseString(field.parentKey)}</Text><View style={styles.nestedContainer}>{renderFormFileds(field,i)}</View></View>
                    : <View style={field?.parentKey && field?.parentKey === formFields[i - 1]?.parentKey && styles.nestedContainer}>{renderFormFileds(field,i)}</View>
            ))}
        </View>
    )

}

const styles = StyleSheet.create({
    form: {
        marginBottom: 4,
    },

    nestedContainer: {
        marginHorizontal: '10px'
    },

    label: {
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 5,
    },

    inputContainer: {
        marginBottom: 15,

    },
});

export default FormDisplay;
