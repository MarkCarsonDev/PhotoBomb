import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

type AddTrashButtonProps = {
  style?: ViewStyle; // Allow external style overrides
  onTrashPress?: () => void; // Optional onPress prop for external handler
};

const AddTrashButton: React.FC<AddTrashButtonProps> = ({ style, onTrashPress }) => {
  return (
    <TouchableOpacity style={[styles.bottomRoundButton, style]} onPress={onTrashPress}>
      <AntDesign name="delete" size={30} color="white" />
    </TouchableOpacity>
  );
};

export default AddTrashButton;

const styles = StyleSheet.create({
  bottomRoundButton: {
    backgroundColor: 'red',
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});