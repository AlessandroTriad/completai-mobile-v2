import { Dimensions, StyleSheet, Text, View } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const widthRef = 375;
const sizeLabel = 10;

export default props => {
  return (
    <View style={styles.containerPainelTopBar}>
      <View style={styles.containerShadowTopBar}>
        <View style={styles.containerPanelTopBar}>
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={[
                styles.resumoRaio,
                { display: props.raio ? 'flex' : 'none' },
              ]}
            >
              Raio:
              {props.raio ? ' ' + props.raio + 'km' : ''}
              {` | `}
              {props.postos} posto{props.postos === 1 ? `` : `s`}
            </Text>
          </View>
          <View>
            <Text style={styles.labelCombustivel}>{props.combustivel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerPainelTopBar: {
    backgroundColor: '#edede4',
    width: '100%',
  },
  containerInnerPanel: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: 10,
  },
  containerPanelTopBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 5,
    paddingRight: 10,
    color: '#cecece',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerShadowTopBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    paddingTop: 2,
    paddingBottom: 4,
  },
  resumoRaio: {
    //fontSize: 10,
    fontSize: (windowWidth * sizeLabel) / widthRef,
    color: '#898888',
    fontWeight: 'bold',
    paddingLeft: 5,
  },
  resumoPostos: {
    //fontSize: 10,
    fontSize: (windowWidth * sizeLabel) / widthRef,
    fontWeight: 'bold',
    color: '#898888',
    paddingLeft: 5,
  },
  labelCombustivel: {
    fontWeight: 'bold',
    //fontSize: 10,
    fontSize: (windowWidth * sizeLabel) / widthRef,
    color: '#898888',
    textAlign: 'right',
  },
});
