import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

interface PhotoItemProps {
  source: { uri: string };
  onPress?: () => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ source, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image source={source} style={styles.photo} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  photo: {
    height: 120,
    width: 120,
    margin: 5,
    borderRadius: 8,
  },
});

export default PhotoItem;
