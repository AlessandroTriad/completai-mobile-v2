import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default props => {
  return (
    <View style={[styles.container, props.style]}>
      <Icon name={props.icon} size={20} style={styles.icon} />
      <Text
        style={[
          styles.label,
          {
            color: !props.colorLabel ? 'rgba(75,75,75,1.0)' : props.colorLabel,
          },
        ]}
      >
        {props.value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    backgroundColor: '#EEE',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: 'rgba(75,75,75,1.0)',
    marginLeft: 20,
  },
  label: {
    marginLeft: 20,
    width: '70%',
  },
});
