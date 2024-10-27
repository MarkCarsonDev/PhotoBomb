import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

type AddShareButtonProps = {
  style?: ViewStyle; // Allow external style overrides
  onSharePress?: () => void; // Optional onPress prop for external handler
};

const AddShareButton: React.FC<AddShareButtonProps> = ({ style, onSharePress }) => {
  return (
    <TouchableOpacity style={[styles.bottomRoundButton, style]} onPress={onSharePress}>
      <AntDesign name="sharealt" size={30} color="white" />
    </TouchableOpacity>
  );
};

export default AddShareButton;

const styles = StyleSheet.create({
  bottomRoundButton: {
    backgroundColor: '#5A5A5A',
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});