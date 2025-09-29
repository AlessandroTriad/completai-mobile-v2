import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '@rneui/themed';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Callout, Marker } from 'react-native-maps';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import buttonLocation from '../../assets/images/button_location.png';
import pinALE from '../../assets/images/pinALE.png';
import pinBR from '../../assets/images/pinBR.png';
import pinBRANCA from '../../assets/images/pinBRANCA.png';
import pinIPIRANGA from '../../assets/images/pinIPIRANGA.png';
import pinOUTRAS from '../../assets/images/pinOUTRAS.png';
import pinRODOIL from '../../assets/images/pinRODOIL.png';
import pinSHELL from '../../assets/images/pinSHELL.png';
import Header from '../componentes/Header';
import ItemMapa from '../componentes/ItemMapa';
import MenuBar from '../componentes/MenuBar';
import OrderLista from '../componentes/OrderLista';
import StatusBar from '../componentes/StatusBar';
import { secret_key_encrypt_data, server } from '../constants';
import MapStyle from '../mapStyles/mapStylePadrao.json';

const { width, height } = Dimensions.get('window');
//const topBtnLocationRef = 200
//const heightRef = 812
//const XSMAX_HEIGHT = 896
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

var timerId;
var isMounting;
/*
LogBox.ignoreLogs([
    "exported from 'deprecated-react-native-prop-types'.",
    'Require cycle:',
    'Failed prop type:'
])
*/

export default class MapaPostos extends Component {
  state = {
    longitude: 0,
    latitude: 0,
    postos: [],
    txtMaiorPreco: '-',
    txtMenorPreco: '-',
    txtDiferencaPreco: '-',
    raio: '',
    order: 'p',
    region: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    loading: false,
    slideAnimationDialog: false,
    alertMessage: '',
    alertDetailMessage: '',
    alertIconType: 'check', // exclamation, times, check
    locationPermission: '',
    layoutMapa: {
      color_background: '#2c4152',
      color_header: '#2c4152',
      color_status_bar: '#FFF',
      color_menu_bar: '#2c4152',
      color_order_list: '#FFF',
    },
    preferenceData: {},
    filterData: {},
    userData: {},
    orderData: {},
  };

  componentDidMount = async () => {
    isMounting = true;

    this.props.navigation.addListener('focus', async () => {
      if (isMounting == false) {
        await this.obterDadosArmazendados();
        this.verificaAtualizacaoAutomatica();
      }
      isMounting = false;
    });

    this.props.navigation.addListener('blur', async () => {
      clearInterval(timerId);
    });

    if (isMounting == true) {
      clearInterval(timerId);
      await this.obterDadosArmazendados();
      this.verificaAtualizacaoAutomatica();
    }
  };

  componentWillUnmount() {
    clearInterval(timerId);
  }

  obterDadosArmazendados = async () => {
    try {
      await AsyncStorage.setItem('lastScreen', 'MapaPostos');

      const jsonPrefer = await AsyncStorage.getItem('preferenceData');
      const preferenceData = JSON.parse(jsonPrefer) || {};

      const json = await AsyncStorage.getItem('filterData');
      const filterData = JSON.parse(json) || {};

      const jsonUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(jsonUserData) || {};

      this.setState(
        {
          preferenceData: preferenceData,
          filterData: filterData,
          userData: userData,
        },
        this.verificarPermissoes,
      );
    } catch (error) {
      //...
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível obter os dados armazenados.',
          alertDetailMessage: '',
          alertIconType: 'exclamation', // exclamation, times, check
        },
        this.showAlert,
      );
    }
  };

  verificaAtualizacaoAutomatica = async () => {
    let timer = 0;
    const tempoAtualizacao = this.state.preferenceData.tempoAtualizacao;

    if (tempoAtualizacao === 0) {
      timer = 60 * 1 * 1000;
    } else if (tempoAtualizacao === 1) {
      timer = 60 * 3 * 1000;
    } else if (tempoAtualizacao === 2) {
      timer = 60 * 5 * 1000;
    }

    if (timer > 0) {
      timerId = setInterval(() => this.obterListaPostos(), timer);
    }
  };

  // Request permission to access location
  requestPermission = () => {
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(response => {
        this.setState(
          { locationPermission: response, loading: true },
          this.obterListaPostos,
        );
      });
    } else if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(response => {
        this.setState(
          { locationPermission: response, loading: true },
          this.obterListaPostos,
        );
      });
    }
  };

  verificarPermissoes = () => {
    if (Platform.OS === 'ios') {
      check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              //console.log('This feature is not available (on this device / in this context)',);
              this.setState(
                { locationPermission: result, loading: true },
                this.alertForLocationPermission,
              );
              break;
            case RESULTS.DENIED:
              //console.log('The permission has not been requested / is denied but requestable',);
              this.setState(
                { locationPermission: result, loading: true },
                this.alertForLocationPermission,
              );
              break;
            case RESULTS.GRANTED:
              //console.log('The permission is granted');
              this.setState(
                { locationPermission: result, loading: true },
                this.obterListaPostos,
              );
              break;
            case RESULTS.BLOCKED:
              //console.log('The permission is denied and not requestable anymore');
              this.setState(
                { locationPermission: result, loading: true },
                this.alertForLocationPermission,
              );
              break;
          }
        })
        .catch(error => {
          // …
        });
    } else if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              //console.log('This feature is not available (on this device / in this context)',);
              this.setState(
                { locationPermission: result, loading: true },
                this.alertForLocationPermission,
              );
              break;
            case RESULTS.DENIED:
              //console.log('The permission has not been requested / is denied but requestable',);
              this.setState(
                { locationPermission: result, loading: true },
                this.alertForLocationPermission,
              );
              break;
            case RESULTS.GRANTED:
              //console.log('The permission is granted');
              this.setState(
                { locationPermission: result, loading: true },
                this.obterListaPostos,
              );
              break;
            case RESULTS.BLOCKED:
              //console.log('The permission is denied and not requestable anymore');
              this.setState(
                { locationPermission: result, loading: true },
                this.alertForLocationPermission,
              );
              break;
          }
        })
        .catch(error => {
          // …
        });
    }
  };

  decrypt = textToDecipher => {
    try {
      var iv = Buffer(8);
      iv.fill(0);

      var decipher = crypto.createDecipheriv(
        'des-cbc',
        secret_key_encrypt_data,
        iv,
      );

      var dec = decipher.update(textToDecipher, 'base64', 'utf8');
      dec += decipher.final('utf8');

      //console.log('deciphered: ' + dec);

      return dec;
    } catch (err) {
      console.log(err);
    }
  };

  alertForLocationPermission = async () => {
    this.setState({ loading: false });

    Alert.alert(
      'Serviço de localização',
      'O Completaí precisa acessar a sua localização para exibir os postos da região.',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Permission denied'),
          style: 'cancel',
        },
        this.state.locationPermission == RESULTS.DENIED
          ? { text: 'OK', onPress: this.requestPermission }
          : { text: 'Abrir Configurações', onPress: openSettings },
      ],
    );
  };

  openReferencia = () => {
    //clearInterval(timerId);
    this.props.navigation.navigate('Referencia');
  };
  openListagem = () => {
    //clearInterval(timerId);
    this.props.navigation.navigate('ListaPostos');
  };
  openFavoritos = () => {
    //clearInterval(timerId);
    this.props.navigation.navigate('ListaFavoritos');
  };
  openMenu = () => {
    this.props.navigation.openDrawer();
  };
  openFiltro = () => {
    //clearInterval(timerId);
    this.props.navigation.navigate('Preferencias');
  };

  handleCenter = () => {
    try {
      Geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
          });
        },
        error => {
          this.setState(
            {
              loading: false,
              postos: [],
              txtMaiorPreco: '-',
              txtMenorPreco: '-',
              txtDiferencaPreco: '-',
              slideAnimationDialog: true,
              alertMessage: 'Não foi possível obter a localização',
              alertDetailMessage:
                'Por favor, verifique se o serviço de localização está habilitado.',
              alertIconType: 'exclamation', // exclamation, times, check
            },
            this.showAlert,
          );
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
      );
    } catch (err) {
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível obter a localização',
          alertDetailMessage:
            'Por favor, verifique se o serviço de localização está habilitado.',
          alertIconType: 'exclamation', // exclamation, times, check
        },
        this.showAlert,
      );
    }
  };

  getPinImagePath = bandeira => {
    const path = '../../assets/images/';

    if (
      bandeira == 'BR' ||
      bandeira == 'ALE' ||
      bandeira == 'BRANCA' ||
      bandeira == 'IPIRANGA' ||
      bandeira == 'RODOIL' ||
      bandeira == 'SHELL'
    ) {
      return path + 'pin' + bandeira + '.png';
    } else {
      return path + 'pinOUTRAS.png';
    }
  };

  obterListaPostos = () => {
    //try {
    Geolocation.getCurrentPosition(
      position => {
        this.setState(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
          },
          this.listarPostos,
        );
      },
      error => {
        this.setState(
          {
            loading: false,
            postos: [],
            txtMaiorPreco: '-',
            txtMenorPreco: '-',
            slideAnimationDialog: true,
            alertMessage: 'Não foi possível obter a localização',
            alertIconType: 'exclamation', // exclamation, times, check
            alertDetailMessage:
              'Por favor, verifique se o serviço de localização está habilitado.',
          },
          this.showAlert,
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
    /*
        } catch (err) {
            this.setState({
                loading: false,
                slideAnimationDialog: true,
                alertMessage: "Não foi possível obter a localização",
                alertDetailMessage: "Por favor, verifique se o serviço de localização está habilitado.",
                alertIconType: 'exclamation', // exclamation, times, check
            }, this.showAlert)
        }
        */
  };

  listarPostos = async () => {
    try {
      const selBandeira =
        this.state.filterData.bandeira === 'TODAS'
          ? ''
          : this.state.filterData.bandeira;
      const url = `${server}/listarPostosPorProximidade?dist=${this.state.filterData.raio}&lat=${this.state.latitude}&lng=${this.state.longitude}&bnd=${selBandeira}&cmb=${this.state.filterData.combustivel}&ord=${this.state.order}&src=MAPA`;

      let response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authentication: this.state.userData.token,
        },
      });

      let responseJson = await response.json();

      let txtMaiorPreco = responseJson.data2.maiorPreco;
      let txtMenorPreco = responseJson.data2.menorPreco;
      let txtDiferencaPreco = responseJson.data2.difPreco;

      //var arrPostos = [...responseJson.listaPostos]

      this.setState({
        postos: responseJson.data,
        txtMaiorPreco: txtMaiorPreco,
        txtMenorPreco: txtMenorPreco,
        txtDiferencaPreco: txtDiferencaPreco,
        loading: false,
      });
    } catch (err) {
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível listar os postos!',
          alertDetailMessage:
            'Por favor, verifique se a internet está disponível.',
          alertIconType: 'exclamation', // exclamation, times, check
        },
        this.showAlert,
      );
    }
  };

  showAlert = () => {
    setTimeout(() => this.closeAlert(), 3000);
  };

  closeAlert = () => {
    this.setState({
      slideAnimationDialog: false,
    });
  };

  onRefresh = () => {
    this.verificarPermissoes();
  };

  onChange = index => {
    const order = {
      ordenacao: index === 1 ? 'd' : 'p',
    };
    AsyncStorage.setItem('orderData', JSON.stringify(order));
    this.setState({ loading: true, orderData: order }, () =>
      this.obterListaPostos(),
    );
  };

  openDetalhesPosto = async item => {
    //clearInterval(timerId);
    await AsyncStorage.setItem('lastScreen', 'MapaPostos');
    await AsyncStorage.setItem('postoItem', JSON.stringify(item));
    this.props.navigation.navigate('DetalhesPosto');
  };

  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: this.state.layoutMapa.color_background,
        }}
      >
        <View style={styles.container}>
          <Header
            backgroundColor={this.state.layoutMapa.color_header}
            buttonMenu={true}
            buttonFiltro={true}
            openFiltro={this.openFiltro}
            openMenu={this.openMenu}
          />
          <OrderLista
            backgroundColor={this.state.layoutMapa.color_order_list}
            onChange={index => this.onChange(index)}
            analisePrecos={this.state.analisePrecos}
            menorPreco={this.state.txtMenorPreco}
            maiorPreco={this.state.txtMaiorPreco}
            diferencaPreco={this.state.txtDiferencaPreco}
            showOrder={false}
            showDiffPrecos={true}
          />
          <StatusBar
            postos={this.state.postos.length}
            combustivel={this.state.filterData.combustivel}
            raio={this.state.filterData.raio}
          />

          <MapView
            ref={map => {
              this.map = map;
            }}
            provider={this.props.provider}
            style={styles.map}
            customMapStyle={MapStyle}
            loadingEnabled
            loadingIndicatorColor="#666666"
            loadingBackgroundColor="#eeeeee"
            showsUserLocation={true}
            scrollEnabled={true}
            zoomEnabled={true}
            zoomControlEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
            showsMyLocationButton={true}
            userLocationAnnotationTitle="Minha localização"
            initialRegion={this.state.region}
            region={this.state.region}
          >
            {this.state.postos.map(marker => (
              <Marker
                key={marker.ex1}
                tracksViewChanges={false}
                coordinate={{
                  latitude: parseFloat(this.decrypt(marker.ex9)),
                  longitude: parseFloat(this.decrypt(marker.ex10)),
                }}
                centerOffset={{ x: styles.iconFavorito ? 42 : 35, y: -8 }}
                anchor={{ x: 0, y: 0.5 }}
                title={this.decrypt(marker.ex2)}
                description={this.decrypt(marker.ex3)}
                calloutOffset={{
                  x: 0,
                  y: -5,
                }}
              >
                <Image
                  source={
                    this.decrypt(marker.ex6) === 'BR'
                      ? pinBR
                      : this.decrypt(marker.ex6) === 'SHELL'
                      ? pinSHELL
                      : this.decrypt(marker.ex6) === 'ALE'
                      ? pinALE
                      : this.decrypt(marker.ex6) === 'IPIRANGA'
                      ? pinIPIRANGA
                      : this.decrypt(marker.ex6) === 'BRANCA'
                      ? pinBRANCA
                      : this.decrypt(marker.ex6) === 'RODOIL'
                      ? pinRODOIL
                      : pinOUTRAS
                  }
                  style={styles.image}
                />

                <View
                  style={[
                    styles.containerLabelPreco,
                    {
                      backgroundColor:
                        this.decrypt(marker.ex13) === this.state.menorPreco
                          ? 'rgba(62,199,85,1.0)'
                          : '#FFF',
                    },
                  ]}
                >
                  <Text>
                    <Text
                      style={{
                        textDecorationLine: 'none',
                        textDecorationStyle: 'solid',
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    >
                      {this.decrypt(marker.ex13)}
                    </Text>
                  </Text>

                  <Icon
                    name="heart"
                    type="font-awesome"
                    size={15}
                    style={[
                      styles.iconFavorito,
                      { display: marker.ex7 ? 'flex' : 'none' },
                    ]}
                    color="rgba(250,206,0,1.0)"
                  />
                </View>

                <Callout onPress={() => this.openDetalhesPosto(marker)}>
                  <View style={styles.containerItem}>
                    <ItemMapa
                      displayLogo={false}
                      nomePosto={this.decrypt(marker.ex2)}
                      rating={this.decrypt(marker.ex18)}
                      reviews={this.decrypt(marker.ex17)}
                      preco={this.decrypt(marker.ex13)}
                      data={this.decrypt(marker.ex15)}
                      distancia={this.decrypt(marker.ex11)}
                      logradouro={this.decrypt(marker.ex3)}
                      bairro={this.decrypt(marker.ex4)}
                      cidade={this.decrypt(marker.ex5)}
                      bandeira={this.decrypt(marker.ex6)}
                      isTopLista={marker.ex8}
                      colorData={this.decrypt(marker.ex16)}
                      isItemMapa={true}
                      isFavorito={marker.ex7}
                      foraDoRaio={marker.ex12}
                      onTracarRota={null}
                      combustivel={this.state.filterData.combustivel}
                    />
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <View
            style={[
              styles.buttonLocation,
              { display: Platform.OS === 'ios' ? 'flex' : 'none' },
            ]}
          >
            <TouchableOpacity onPress={this.handleCenter}>
              <Image source={buttonLocation} />
            </TouchableOpacity>
          </View>

          <MenuBar
            backgroundColor={this.state.layoutMapa.color_menu_bar}
            activeButton="Mapa"
            onListagem={this.openListagem}
            onInicio={this.openReferencia}
            onFavoritos={this.openFavoritos}
            onRefresh={this.onRefresh}
          />
          <Modal
            animationType={'slide'}
            transparent={true}
            visible={this.state.slideAnimationDialog}
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View
                style={{
                  padding: 20,
                  alignItems: 'center',
                  width: '70%',
                  backgroundColor: 'white',
                  borderRadius: 20,
                }}
              >
                <Icon
                  reverse
                  name={this.state.alertIconType}
                  type="font-awesome"
                  color={
                    this.state.alertIconType == 'check'
                      ? 'green'
                      : this.state.alertIconType == 'times'
                      ? 'red'
                      : 'rgba(216,165,0,1.0)'
                  }
                  size={40}
                />
                <Text
                  style={{
                    paddingTop: 10,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  {this.state.alertMessage}
                </Text>
                <Text
                  style={{ paddingTop: 10, textAlign: 'center', fontSize: 14 }}
                >
                  {this.state.alertDetailMessage}
                </Text>
              </View>
            </View>
          </Modal>
        </View>
        <View
          style={[
            styles.containerActivity,
            { display: this.state.loading ? 'flex' : 'none' },
          ]}
        >
          <ActivityIndicator
            style={{ display: this.state.loading ? 'flex' : 'none' }}
            size="large"
            color="rgba(0, 0, 0, 0.9)"
          />
        </View>
      </SafeAreaView>
    );
  }
}

//MapaPostos.propTypes = {
//  provider: ProviderPropType,
//}

const styles = StyleSheet.create({
  containerActivity: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#2c4152',
  },
  buttonLocation: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
    right: 10,
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  marker: {
    width: 25,
    height: 40,
  },
  containerLabelPreco: {
    borderRadius: 12,
    borderTopRightRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 1,
    marginLeft: 27,
    top: -40,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  labelPreco: {
    fontWeight: 'bold',
    fontSize: 12,
    flexDirection: 'row',
  },
  labelPrecoDesconto: {
    fontWeight: 'bold',
    fontSize: 12,
    flexDirection: 'row',
  },
  iconFavorito: {
    flexDirection: 'row',
    paddingLeft: 3,
  },
  containerItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    width: 280,
  },
  preco: {
    fontSize: 16,
    color: '#305fa5',
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
});
