import { Component } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import backRefresh from '../../assets/images/backRefresh.png';
import refresh from '../../assets/images/button_refresh.png';
import imgReferencia from '../../assets/images/imgResumo.png';
import imgReferenciaOn from '../../assets/images/imgResumo_on.png';
import commonStyles from '../commonStyles';

Icon.loadFont();

const windowWidth = Dimensions.get('window').width;
const sizeButtonRef = 24;
const sizeButtonStarRef = 27;
const widthRef = 375;
const sizeTextButtonRef = 10;
const sizeWidthBackRefreshRef = 100;
const sizeHeightBackRefreshRef = 80;
const topBackRefreshRef = -15;
const topIconRefreshRef = 75;

export default class MenuBar extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.rowContainer,
            { backgroundColor: this.props.backgroundColor },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.itemBar,
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: this.props.backgroundColor,
              },
            ]}
            onPress={this.props.onInicio}
          >
            <Image
              source={
                this.props.activeButton === 'Inicio'
                  ? imgReferenciaOn
                  : imgReferencia
              }
              style={styles.imageReferencia}
            />
            <Text
              style={[
                styles.textBar,
                {
                  color:
                    this.props.activeButton === 'Inicio'
                      ? commonStyles.colors.iconItemSelected
                      : commonStyles.colors.iconItem,
                },
              ]}
            >
              Referência
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.itemBar,
              { flex: 1, backgroundColor: this.props.backgroundColor },
            ]}
            onPress={this.props.onListagem}
          >
            <Icon
              name="list-ul"
              size={(windowWidth * sizeButtonRef) / widthRef}
              color={
                this.props.activeButton === 'Listagem'
                  ? commonStyles.colors.iconItemSelected
                  : commonStyles.colors.iconItem
              }
            />
            <Text
              style={[
                styles.textBar,
                {
                  color:
                    this.props.activeButton === 'Listagem'
                      ? commonStyles.colors.iconItemSelected
                      : commonStyles.colors.iconItem,
                },
              ]}
            >
              Listagem
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.itemBar,
              {
                flex: 2,
                width: 80,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: this.props.backgroundColor,
              },
            ]}
          ></View>

          <TouchableOpacity
            style={[
              styles.itemBar,
              { flex: 1, backgroundColor: this.props.backgroundColor },
            ]}
            onPress={this.props.onMapa}
          >
            <Icon
              name="map-o"
              size={(windowWidth * sizeButtonRef) / widthRef}
              color={
                this.props.activeButton === 'Mapa'
                  ? commonStyles.colors.iconItemSelected
                  : commonStyles.colors.iconItem
              }
            />
            <Text
              style={[
                styles.textBar,
                {
                  color:
                    this.props.activeButton === 'Mapa'
                      ? commonStyles.colors.iconItemSelected
                      : commonStyles.colors.iconItem,
                },
              ]}
            >
              Mapa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.itemBar,
              { flex: 1, backgroundColor: this.props.backgroundColor },
            ]}
            onPress={this.props.onFavoritos}
          >
            <Icon
              name="star"
              size={(windowWidth * sizeButtonStarRef) / widthRef}
              color={
                this.props.activeButton === 'Favoritos'
                  ? commonStyles.colors.iconItemSelected
                  : commonStyles.colors.iconItem
              }
            />
            <Text
              style={[
                styles.textBar,
                {
                  color:
                    this.props.activeButton === 'Favoritos'
                      ? commonStyles.colors.iconItemSelected
                      : commonStyles.colors.iconItem,
                },
              ]}
            >
              Favoritos
            </Text>
          </TouchableOpacity>
        </View>

        {this.props.buttonRefresh != false ? (
          <ImageBackground source={backRefresh} style={styles.itemBarRefresh}>
            <TouchableOpacity
              style={styles.backRefresh}
              onPress={this.props.onRefresh}
            >
              <Image source={refresh} style={styles.iconRefresh} />
            </TouchableOpacity>
          </ImageBackground>
        ) : (
          <View></View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  backRefresh: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    alignItems: 'center',
  },
  iconRefresh: {
    paddingTop: (windowWidth * topIconRefreshRef) / widthRef,
    width: '37%',
    resizeMode: 'contain',
  },
  imageReferencia: {
    resizeMode: 'contain',
  },
  itemBar: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  itemBarRefresh: {
    height: (windowWidth * sizeHeightBackRefreshRef) / widthRef,
    width: (windowWidth * sizeWidthBackRefreshRef) / widthRef,
    position: 'absolute',
    left:
      windowWidth / 2 - (windowWidth * sizeWidthBackRefreshRef) / widthRef / 2,
    top: (windowWidth * topBackRefreshRef) / widthRef,
  },
  textBar: {
    fontSize: (windowWidth * sizeTextButtonRef) / widthRef,
    color: commonStyles.colors.iconItem,
  },
});
