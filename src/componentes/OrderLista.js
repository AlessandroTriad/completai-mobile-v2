import { ButtonGroup } from '@rneui/themed';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import arrowLeft from '../../assets/images/arrow-left.png';
import arrowRight from '../../assets/images/arrow-right.png';

const windowWidth = Dimensions.get('window').width;
const widthRef = 375;
const sizeArrowRef = 28;

//export default class OrderLista extends Component {
export default props => {
  handleIndexChange = index => {
    props.onChange(index);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.containerPreco,
          {
            width: props.showOrder ? '70%' : '100%',
            display: props.showDiffPrecos ? 'flex' : 'none',
          },
        ]}
      >
        <View style={styles.containerRow}>
          <View style={styles.containerColumn}>
            <Text style={styles.gridHeader}>Menor</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.menorPreco}>{props.menorPreco}</Text>
            </View>
          </View>
          <View style={[styles.containerColumn]}>
            <Image source={arrowLeft} opacity={0.7} style={styles.arrowStyle} />
          </View>
          <View style={[styles.containerColumn]}>
            <Text style={styles.gridHeader}>Diferença</Text>
            <Text style={styles.diferenca}>{props.diferencaPreco}</Text>
          </View>
          <View style={[styles.containerColumn]}>
            <Image
              source={arrowRight}
              opacity={0.7}
              style={styles.arrowStyle}
            />
          </View>
          <View style={styles.containerColumn}>
            <Text style={styles.gridHeader}>Maior</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.maiorPreco}>{props.maiorPreco}</Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.containerOrder,
          {
            display: props.showOrder ? 'flex' : 'none',
            width: props.showDiffPrecos ? '30%' : '100%',
          },
        ]}
      >
        <View style={styles.containerRow}>
          <ButtonGroup
            buttons={['Preço', 'Distância']}
            selectedIndex={props.order === 'd' ? 1 : 0}
            onPress={value => {
              this.handleIndexChange(value);
            }}
            selectedButtonStyle={styles.activeTabStyle}
            containerStyle={styles.segmentedControlTab}
            textStyle={styles.tabTextStyle}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
    width: '100%',
    backgroundColor: '#fff',
  },
  arrowStyle: {
    width: (windowWidth * sizeArrowRef) / widthRef,
    resizeMode: 'contain',
  },
  segmentedControlTab: {
    height: 25,
    width: 110,
    textAlign: 'center',
    borderRadius: 6,
    //marginRight: 17,
  },
  tabStyle: {
    borderColor: '#314150',
  },
  tabTextStyle: {
    color: '#314150',
    fontSize: 9,
    textAlign: 'center',
  },
  activeTabStyle: {
    backgroundColor: '#314150',
    borderColor: '#314150',
    borderWidth: 2,
    //borderBottomColor: '#e2e2e2',
  },
  containerPreco: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
    paddingBottom: 3,
  },
  containerOrder: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 3,
    paddingBottom: 3,
    //flexDirection: 'row',
  },
  gridHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  containerRow: {
    flexDirection: 'row',
    paddingTop: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: 3,
    paddingRight: 3,
  },
  menorPreco: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2f7447',
    textAlign: 'center',
  },
  maiorPreco: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ad615f',
    textAlign: 'center',
  },
  diferenca: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#305fa5',
    textAlign: 'center',
  },
});
