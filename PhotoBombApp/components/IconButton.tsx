// components/IconButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface IconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
  onPress: () => void;
  style?: ViewStyle;
  wide?: boolean; // Prop to enable wide mode
  widthAmount?: number; // Additional width when wide mode is enabled
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 36,
  color = '#000',
  onPress,
  style,
  wide = false,
  widthAmount = 0, // Default to 0 if not specified
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        wide && { width: styles.button.width + widthAmount }, // Adjust width if wide mode is enabled
        style,
      ]}
    >
      <Feather name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#2c2c2c', // Default background color (customize as needed)
    width: 60, // Base width for the button (adjust as needed)
  },
});

export default IconButton;
