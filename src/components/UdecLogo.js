import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const logoUdecFile = require('../../assets/logo_udec.png');

export default function UdecLogo({ width = 120, height = 80, style }) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoUdecFile}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});