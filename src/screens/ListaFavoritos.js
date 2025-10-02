import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '@rneui/themed';
import { Buffer } from 'buffer';
import { Component } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Geolocation from 'react-native-geolocation-service';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import Header from '../componentes/Header';
import ItemLista from '../componentes/ItemLista';
import MenuBar from '../componentes/MenuBar';
import OrderLista from '../componentes/OrderLista';
import StatusBar from '../componentes/StatusBar';
import { server } from '../constants'; // agora só o server
import { decrypt } from '../utils/crypto'; // 🔑 importando helper centralizado

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
var timerId;
var isMounting;

export default class ListaFavoritos extends Component {
  state = {
    longitude: 0,
    latitude: 0,
    bandeira: '',
    postos: [],
    preferenceData: {},
    filterData: {},
    userData: {},
    orderData: {},
    loading: false,
    slideAnimationDialog: false,
    alertMessage: '',
    alertDetailMessage: '',
    alertIconType: 'check', // exclamation, times, check
    headerMessage: '',
    locationPermission: '',
    layoutListaPostos: {
      color_background: '#2c4152',
      color_order_list: '#FFF',
      color_header: '#2c4152',
      color_menu_bar: '#2c4152',
    },
  };

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    isMounting = true;

    this.props.navigation.addListener('focus', async () => {
      if (isMounting == false) {
        await this.obterDadosArmazendados();
        this.verificarPermissoes();
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
      this.verificarPermissoes();
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
            case RESULTS.DENIED:
            case RESULTS.BLOCKED:
              this.setState(
                { locationPermission: result, loading: true },
                this.alertForLocationPermission,
              );
              break;
            case RESULTS.GRANTED:
              this.setState(
                { locationPermission: result, loading: true },
                this.obterListaPostos,
              );
              break;
          }
        })
        .catch(() => {});
    } else if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
            case RESULTS.DENIED:
            case RESULTS.BLOCKED:
              this.setState(
                { locationPermission: result, loading: true },
                this.alertForLocationPermission,
              );
              break;
            case RESULTS.GRANTED:
              this.setState(
                { locationPermission: result, loading: true },
                this.obterListaPostos,
              );
              break;
          }
        })
        .catch(() => {});
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
    this.setState({
      loading: true,
      headerMessage: 'Processando...',
    });

    await AsyncStorage.setItem('lastScreen', 'ListaFavoritos');

    const jsonPrefer = await AsyncStorage.getItem('preferenceData');
    const preferenceData = JSON.parse(jsonPrefer) || {};

    const json = await AsyncStorage.getItem('filterData');
    const filterData = JSON.parse(json) || {};

    const jsonOrder = await AsyncStorage.getItem('orderData');
    const orderData = JSON.parse(jsonOrder) || {};

    const jsonUserData = await AsyncStorage.getItem('userData');
    const userData = JSON.parse(jsonUserData) || {};

    this.setState({
      preferenceData: preferenceData,
      filterData: filterData,
      userData: userData,
      orderData: orderData,
    });
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

  obterListaPostos = () => {
    Geolocation.getCurrentPosition(
      position => {
        this.setState(
          {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          },
          this.listarPostos,
        );
      },
      () => {
        this.setState(
          {
            loading: false,
            slideAnimationDialog: true,
            alertMessage: 'Não foi possível obter a localização.',
            alertDetailMessage:
              'Por favor, verifique se o serviço de localização está habilitado.',
            headerMessage: '',
            alertIconType: 'exclamation',
          },
          this.showAlert,
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
    );
  };

  listarPostos = async () => {
    try {
      const selBandeira =
        this.state.filterData.bandeira === 'TODAS'
          ? ''
          : this.state.filterData.bandeira;
      const url = `${server}/listarPostosFavoritos?dist=${this.state.filterData.raio}&lat=${this.state.latitude}&lng=${this.state.longitude}&bnd=${this.state.filterData.bandeira}&cmb=${this.state.filterData.combustivel}&ord=${this.state.orderData.ordenacao}`;

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
        loading: false,
        postos: responseJson.data || [],
        bandeira: selBandeira,
        headerMessage:
          responseJson.data.length === 0 ? 'Nenhum posto foi encontrado.' : '',
      });
    } catch (err) {
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível listar os postos favoritos.',
          alertDetailMessage:
            'Por favor, verifique se a internet está disponível.',
          alertIconType: 'exclamation',
          headerMessage: '',
        },
        this.showAlert,
      );
    }
  };

  openReferencia = () => {
    this.props.navigation.navigate('Referencia');
  };
  openListagem = () => {
    this.props.navigation.navigate('ListaPostos');
  };
  openMenu = () => {
    this.props.navigation.openDrawer();
  };
  openMapa = () => {
    this.props.navigation.navigate('MapaPostos');
  };
  openFiltro = () => {
    this.props.navigation.navigate('Preferencias');
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
  onPullToRefresh = () => {
    this.setState({ loading: true }, this.verificarPermissoes());
  };
  onRefresh = () => {
    this.setState({ loading: true }, () => {
      this.verificarPermissoes();
      this.flatListRef.scrollToOffset({ animated: true, offset: 0 });
    });
  };
  openDetalhesPosto = async item => {
    await AsyncStorage.setItem('lastScreen', 'ListaFavoritos');
    await AsyncStorage.setItem('postoItem', JSON.stringify(item));
    this.props.navigation.navigate('DetalhesPosto');
  };
  showAlert = () => {
    setTimeout(() => this.closeAlert(), 3000);
  };
  closeAlert = () => {
    this.setState({
      slideAnimationDialog: false,
    });
  };

  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: this.state.layoutListaPostos.color_background,
        }}
      >
        <View style={styles.container}>
          <Header
            backgroundColor={this.state.layoutListaPostos.color_header}
            buttonFiltro={true}
            buttonMenu={true}
            openFiltro={this.openFiltro}
            openMenu={this.openMenu}
          />
          <OrderLista
            backgroundColor={this.state.layoutListaPostos.color_order_list}
            order={this.state.orderData.ordenacao}
            onChange={index => this.onChange(index)}
            analisePrecos={this.state.analisePrecos}
            menorPreco={this.state.txtMenorPreco}
            maiorPreco={this.state.txtMaiorPreco}
            diferencaPreco={this.state.txtDiferencaPreco}
            showOrder={true}
            showDiffPrecos={false}
          />
          <StatusBar
            postos={this.state.postos.length}
            combustivel={this.state.filterData.combustivel}
            raio={this.state.filterData.raio}
          />
          <View style={styles.viewContainer}>
            <FlatList
              ref={ref => {
                this.flatListRef = ref;
              }}
              data={this.state.postos}
              keyExtractor={item => `${item.ex1}`}
              renderItem={({ item }) => (
                <ItemLista
                  {...item}
                  displayLogo={true}
                  isFavorito={item.ex7}
                  onSelect={() => this.openDetalhesPosto(item)}
                  nomePosto={decrypt(item.ex2)}
                  reviews={decrypt(item.ex17)}
                  rating={decrypt(item.ex18)}
                  endereco={
                    decrypt(item.ex3) +
                    ` - ` +
                    decrypt(item.ex4) +
                    ` - ` +
                    decrypt(item.ex5)
                  }
                  bandeira={decrypt(item.ex6)}
                  distancia={decrypt(item.ex11)}
                  isItemMapa={false}
                  isForaDoRaio={item.ex12}
                  preco={decrypt(item.ex13)}
                  atualizacao={decrypt(item.ex15)}
                  colorData={decrypt(item.ex16)}
                />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.loading}
                  onRefresh={this.onPullToRefresh}
                />
              }
              ListEmptyComponent={() =>
                this.state.headerMessage ? (
                  <Text style={{ padding: 20, fontSize: 13 }}>
                    {this.state.headerMessage}
                  </Text>
                ) : null
              }
            />
            <MenuBar
              backgroundColor={this.state.layoutListaPostos.color_menu_bar}
              buttonMapa={false}
              activeButton="Favoritos"
              onListagem={this.openListagem}
              onMapa={this.openMapa}
              onInicio={this.openReferencia}
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
          </View>
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
  container: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#edede4',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
