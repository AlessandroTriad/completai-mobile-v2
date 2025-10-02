import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '@rneui/themed';
import { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Geolocation from 'react-native-geolocation-service';
import LinearGradient from 'react-native-linear-gradient';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import imageArcos from '../../assets/images/arcos.png';
import Header from '../componentes/Header';
import MenuBar from '../componentes/MenuBar';
import { server } from '../constants';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const heightRef = 812;
const widthRef = 375;
const topPrecoIdealRef = 220;
const topEconomiaRef = 310;
const sizeValPrecoIdealRef = 45;
const sizeLblPrecoIdealRef = 17;
const sizeLblEconomiaRef = 13;
const sizeValEconomiaRef = 24;
const sizeLblCombustivelRef = 14;
const sizeLblGridRef = 13;
const topSubtitleRef = 30;
const topGridRef = 20;

var timerId;
var isMounting;

export default class Referencia extends Component {
  state = {
    longitude: 0,
    latitude: 0,
    dashboard: {},
    loading: false,
    slideAnimationDialog: false,
    alertMessage: '',
    alertDetailMessage: '',
    alertIconType: 'check', // exclamation, times, check
    locationPermission: '',
    preferenceData: {},
    filterData: {},
    layoutReferencia: {
      color_background: '#2c4152',
      gradient_color: '#495c72;#b7bcc2',
      color_header: '#2c4152',
      color_menu_bar: '#2c4152',
    },
    userData: {},
  };

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    isMounting = true;

    this.props.navigation.addListener('beforeRemove', e => {
      e.preventDefault();
      return;
    });

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

  // Request permission to access location
  requestPermission = () => {
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(response => {
        this.setState(
          { locationPermission: response, loading: true },
          this.obterReferencia,
        );
      });
    } else if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(response => {
        this.setState(
          { locationPermission: response, loading: true },
          this.obterReferencia,
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
                this.obterReferencia,
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
                this.obterReferencia,
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

  obterDadosArmazendados = async () => {
    try {
      await AsyncStorage.setItem('lastScreen', 'Referencia');

      const jsonPrefer = await AsyncStorage.getItem('preferenceData');
      const preferenceData = JSON.parse(jsonPrefer) || {};

      const json = await AsyncStorage.getItem('filterData');
      const filterData = JSON.parse(json) || {};

      const jsonUser = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(jsonUser) || {};

      this.setState(
        {
          preferenceData: preferenceData,
          filterData: filterData,
          userData: userData,
        },
        this.verificarPermissoes,
      );
    } catch (error) {
      this.setState(
        {
          loading: false,
          dashboard: {},
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

    if (this.state.preferenceData.tempoAtualizacao === 0) {
      timer = 60 * 1 * 1000;
    } else if (this.state.preferenceData.tempoAtualizacao === 1) {
      timer = 60 * 3 * 1000;
    } else if (this.state.preferenceData.tempoAtualizacao === 2) {
      timer = 60 * 5 * 1000;
    }

    if (timer > 0) {
      timerId = setInterval(() => this.onRefresh(), timer);
    }
  };

  obterReferencia = () => {
    //try {
    Geolocation.getCurrentPosition(
      position => {
        this.setState(
          {
            loading: true,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          },
          this.processarReferencia,
        );
      },
      error => {
        this.setState(
          {
            loading: false,
            dashboard: {},
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
    /*
        } catch (err) {
            this.setState({
                loading: false,
                dashboard: {},
                slideAnimationDialog: true,
                alertMessage: "Não foi possível obter a localização",
                alertDetailMessage: "Por favor, verifique se o serviço de localização está habilitado.",
                alertIconType: 'exclamation', // exclamation, times, check
            }, this.showAlert)
        }
        */
  };

  processarReferencia = async () => {
    const filterData = this.state.filterData;

    const selBandeira =
      filterData.bandeira === 'TODAS' ? '' : filterData.bandeira;

    try {
      let url = `${server}/obterReferencia?dist=${filterData.raio}&lat=${this.state.latitude}&lng=${this.state.longitude}&bnd=${selBandeira}&cmb=${filterData.combustivel}`;

      let response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authentication: this.state.userData.token,
        },
      });

      let responseJson = await response.json();

      this.setState({
        dashboard: responseJson || {},
        loading: false,
      });
    } catch (err) {
      this.setState(
        {
          loading: false,
          dashboard: {},
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível carregar a referência de preço.',
          alertDetailMessage:
            'Por favor, verifique se a internet está disponível.',
          alertIconType: 'exclamation', // exclamation, times, check
        },
        this.showAlert,
      );
    }
  };

  openListagem = () => {
    //clearInterval(timerId);
    this.props.navigation.navigate('ListaPostos');
  };
  openMenu = () => {
    this.props.navigation.openDrawer();
  };
  openFavoritos = () => {
    //clearInterval(timerId);
    this.props.navigation.navigate('ListaFavoritos');
  };
  openMapa = () => {
    //clearInterval(timerId);
    this.props.navigation.navigate('MapaPostos');
  };
  openFiltro = () => {
    //clearInterval(timerId);
    this.props.navigation.navigate('Preferencias');
  };
  onRefresh = () => {
    this.setState({ loading: true }, this.verificarPermissoes);
  };

  showAlert = () => {
    //clearInterval(timerId);
    setTimeout(() => this.closeAlert(), 3000);
  };

  closeAlert = () => {
    this.setState({ slideAnimationDialog: false });
  };

  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: this.state.layoutReferencia.color_background,
        }}
      >
        <View style={styles.container}>
          <Header
            backgroundColor={this.state.layoutReferencia.color_header}
            buttonFiltro={true}
            buttonMenu={true}
            openFiltro={this.openFiltro}
            openMenu={this.openMenu}
          />
          <LinearGradient
            colors={[
              this.state.layoutReferencia.gradient_color.split(';')[0],
              this.state.layoutReferencia.gradient_color.split(';')[1],
            ]}
            style={styles.background}
          >
            <View style={styles.viewContainer}>
              <Text style={styles.subTitle}>REFERÊNCIA DE PREÇO NA REGIÃO</Text>
              <Image source={imageArcos} style={styles.arcos} />
              <View style={styles.containerPrecoIdeal}>
                <Text style={styles.labelPrecoIdeal}>
                  {!this.state.dashboard.precoIdeal ||
                  this.state.dashboard.precoIdeal === '0'
                    ? ``
                    : `R$ `}
                </Text>
                <Text style={styles.labelValorPrecoIdeal}>
                  {!this.state.dashboard.precoIdeal ||
                  this.state.dashboard.precoIdeal === '0'
                    ? ``
                    : `${this.state.dashboard.precoIdeal}`}
                </Text>
              </View>
              <View style={styles.containerEconomia}>
                <Text style={styles.labelEconomia}>
                  {this.state.dashboard.qtdPostos === '0'
                    ? `Nenhum posto encontrado`
                    : this.state.dashboard.qtdPostos === '1'
                    ? ``
                    : `Economia de:`}
                </Text>
                <Text style={styles.labelValorEconomia}>
                  {!this.state.dashboard.economiaDe ||
                  this.state.dashboard.economiaDe === '0'
                    ? ``
                    : `R$ ${this.state.dashboard.economiaDe}`}
                </Text>
                <Text style={styles.labelCombutivel}>
                  {this.state.filterData.combustivel}
                </Text>
              </View>

              <View
                style={[
                  styles.containerGrid,
                  {
                    display: !this.state.dashboard.precoExclusivoParceiro
                      ? 'flex'
                      : 'none',
                  },
                ]}
              >
                <View style={{ marginTop: 20 }}></View>
                <View style={styles.gridHeader}>
                  <View style={styles.gridRaio}>
                    <Text style={styles.labelRaio}>Raio: </Text>
                    <Text style={styles.labelValorRaio}>
                      {this.state.filterData.raio
                        ? this.state.filterData.raio + ' km'
                        : ''}
                    </Text>
                  </View>
                  <Text style={styles.labelHeaderMiddle}>Postos</Text>
                  <Text style={styles.labelHeaderRight}>Média</Text>
                </View>
                <View style={styles.gridLine}>
                  <Text style={styles.labelCellLeft}>
                    Média de preço na região:
                  </Text>
                  <Text style={styles.labelCellMiddle}>
                    {!this.state.dashboard.qtdPostos
                      ? `-`
                      : this.state.dashboard.qtdPostos}
                  </Text>
                  <Text style={styles.labelCellRight}>
                    {!this.state.dashboard.qtdPostos ||
                    this.state.dashboard.qtdPostos === '0'
                      ? `-`
                      : `R$ ${this.state.dashboard.mediaRegiao}`}
                  </Text>
                </View>
                <View style={styles.gridLine}>
                  <Text style={styles.labelCellLeft}>
                    Mais baratos que a média:
                  </Text>
                  <Text style={styles.labelCellMiddle}>
                    {!this.state.dashboard.qtdMaisBaratos
                      ? `-`
                      : this.state.dashboard.qtdMaisBaratos}
                  </Text>
                  <Text style={styles.labelCellRight}>
                    {!this.state.dashboard.qtdMaisBaratos ||
                    this.state.dashboard.qtdMaisBaratos === '0'
                      ? `-`
                      : `R$ ${this.state.dashboard.mediaMaisBaratos}`}
                  </Text>
                </View>
                <View style={styles.gridLine}>
                  <Text style={styles.labelCellLeft}>
                    Mais caros que a média:
                  </Text>
                  <Text style={styles.labelCellMiddle}>
                    {!this.state.dashboard.qtdMaisCaros
                      ? `-`
                      : this.state.dashboard.qtdMaisCaros}
                  </Text>
                  <Text style={styles.labelCellRight}>
                    {!this.state.dashboard.qtdMaisCaros ||
                    this.state.dashboard.qtdMaisCaros === '0'
                      ? `-`
                      : `R$ ${this.state.dashboard.mediaMaisCaros}`}
                  </Text>
                </View>
                <View style={{ height: 20 }}></View>
              </View>
            </View>

            <MenuBar
              backgroundColor={this.state.layoutReferencia.color_menu_bar}
              activeButton="Inicio"
              onMapa={this.openMapa}
              onFavoritos={this.openFavoritos}
              onListagem={this.openListagem}
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
                    style={{
                      paddingTop: 10,
                      textAlign: 'center',
                      fontSize: 14,
                    }}
                  >
                    {this.state.alertDetailMessage}
                  </Text>
                </View>
              </View>
            </Modal>
          </LinearGradient>
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
            color="#rgba(255, 255, 255, 0.9)"
          />
        </View>
      </SafeAreaView>
    );
  }
}

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
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  containerPrecoIdeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    top: (windowHeight * topPrecoIdealRef) / heightRef,
    position: 'absolute',
  },
  labelPrecoIdeal: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: (windowWidth * sizeLblPrecoIdealRef) / widthRef,
  },
  labelValorPrecoIdeal: {
    color: '#FFF',
    fontSize: (windowWidth * sizeValPrecoIdealRef) / widthRef,
    fontWeight: 'bold',
  },
  containerEconomia: {
    alignItems: 'center',
    justifyContent: 'center',
    top: (windowHeight * topEconomiaRef) / heightRef,
    position: 'absolute',
  },
  labelEconomia: {
    color: '#FFF',
    fontSize: (windowWidth * sizeLblEconomiaRef) / widthRef,
  },
  labelValorEconomia: {
    color: '#e4c952',
    fontSize: (windowWidth * sizeValEconomiaRef) / widthRef,
    fontWeight: 'bold',
  },
  containerGrid: {
    width: '85%',
    borderRadius: 20,
    backgroundColor: '#5c6774',
    marginTop: (windowHeight * topGridRef) / heightRef,
    alignItems: 'flex-end',
  },
  arcos: {
    marginTop: 10,
    width: '90%',
    height: '55%',
    resizeMode: 'contain',
  },
  subTitle: {
    color: '#FFF',
    paddingTop: (windowHeight * topSubtitleRef) / heightRef,
  },
  labelCombutivel: {
    color: '#FFF',
    fontSize: (windowWidth * sizeLblCombustivelRef) / widthRef,
    paddingTop: 10,
  },
  title: {
    color: '#000',
    fontSize: 70,
    marginLeft: 20,
    marginBottom: 10,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#515d6a',
  },
  labelRaio: {
    color: '#FFF',
    fontSize: (windowWidth * sizeLblGridRef) / widthRef,
    fontWeight: 'bold',
    padding: 3,
  },
  labelValorRaio: {
    color: '#e4c952',
    fontSize: (windowWidth * sizeLblGridRef) / widthRef,
    fontWeight: 'bold',
    padding: 3,
  },
  gridRaio: {
    flexDirection: 'row',
    width: '57%',
  },
  labelHeaderMiddle: {
    color: '#FFF',
    fontSize: (windowWidth * sizeLblGridRef) / widthRef,
    fontWeight: 'bold',
    padding: 3,
    width: '20%',
    textAlign: 'center',
  },
  labelHeaderRight: {
    color: '#FFF',
    fontSize: (windowWidth * sizeLblGridRef) / widthRef,
    fontWeight: 'bold',
    padding: 3,
    width: '23%',
    textAlign: 'center',
  },
  gridLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#515d6a',
    margin: 1,
  },
  labelCellLeft: {
    color: '#FFF',
    fontSize: (windowWidth * sizeLblGridRef) / widthRef,
    padding: 3,
    width: '57%',
  },
  labelCellMiddle: {
    color: '#FFF',
    fontSize: (windowWidth * sizeLblGridRef) / widthRef,
    padding: 3,
    width: '20%',
    textAlign: 'center',
  },
  labelCellRight: {
    color: '#FFF',
    fontSize: (windowWidth * sizeLblGridRef) / widthRef,
    padding: 3,
    width: '23%',
    textAlign: 'center',
  },
  containerGridParceiro: {
    width: '85%',
    borderRadius: 20,
    backgroundColor: '#5c6774',
    marginTop: (windowHeight * topGridRef) / heightRef,
    alignItems: 'center',
  },
  titleBoxParceiro: {
    fontSize: 20,
    color: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
