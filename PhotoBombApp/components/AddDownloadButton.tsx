import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

type AddDownloadButtonProps = {
  style?: ViewStyle; // Allow external style overrides
  onDownloadPress?: () => void; // Optional onPress prop for external handler
};

const AddDownloadButton: React.FC<AddDownloadButtonProps> = ({ style, onDownloadPress }) => {
  return (
    <TouchableOpacity style={[styles.bottomRoundButton, style]} onPress={onDownloadPress}>
      <AntDesign name="download" size={50} color="white" />
    </TouchableOpacity>
  );
};

export default AddDownloadButton;

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