import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

type AddPlusButtonProps = {
  style?: ViewStyle; // Allow external style overrides
};

const AddPlusButton: React.FC<AddPlusButtonProps> = ({ style }) => {
  return (
    <TouchableOpacity style={[styles.bottomRoundButton, style]}>
      <AntDesign name="plus" size={50} color="black" />
    </TouchableOpacity>
  );
};

export default AddPlusButton;

const styles = StyleSheet.create({
  bottomRoundButton: {
    backgroundColor: '#FF7E70',
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});