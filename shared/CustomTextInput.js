import React, {forwardRef} from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';

const CustomTextInput = forwardRef(({
  label,
  value,
  onChange, 
  placeholder = '',
  style,
  type='default'
}, ref) => {

  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        keyboardType={type}
        onChangeText={onChange}
        placeholder={placeholder}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    color: 'grey'
  },
});

export default CustomTextInput;































// import React from 'react';
// import { StyleSheet, View, Text, TextInput, InputModeOptions } from 'react-native';

// interface Props {
//   label: string;
//   value: string;
//   onChangeText?: ({nativeEvent: {}}) => void;
//   placeholder?: string;
//   // data-name: string;
//   // inputType: InputModeOptions | undefined;
//   keyboardType?: any;
//   style?: any; // Use 'any' for flexibility, but consider more specific typing
//   props?: any
// }

// const CustomTextInput: React.FC<Props> = ({
//   label,
//   value,
//   onChangeText,
//   placeholder = '',
//   // name,
//   style,
//   // inputType
//   ...props
// }) => {
//   return (
//     <View style={[styles.inputContainer, style]}>
//       <Text style={styles.label}>{label}</Text>
//       <TextInput
//         style={styles.input}
//         data-name="password"
//         value={value}
//         onChange={onChangeText}
//         placeholder={placeholder}
//         // inputMode={inputType}
//         {...props}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   inputContainer: {
//     marginBottom: 15,
//     fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: 500,
//     marginBottom: 5,
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: '#ccc',
//     padding: 8,
//     borderRadius: 6,
//   },
// });

// export default CustomTextInput;