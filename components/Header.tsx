import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/images/instagram_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    backgroundColor:'#FAFAFA'
  },
  logo: {
    width: 105,
    height: 30,
  },
});
