import AsyncStorage from '@react-native-async-storage/async-storage';
import { AirbnbRating, Button, Icon } from '@rneui/themed';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Popup } from 'react-native-map-link';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import DisplayItem from '../componentes/DisplayItem';
import Header from '../componentes/Header';
import StatusBar from '../componentes/StatusBar';
import { secret_key_encrypt_data, server } from '../constants';

//var timerId
const reviews = ['Muito Ruim', 'Ruim', 'Regular', 'Bom', 'Muito bom'];

const windowWidth = Dimensions.get('window').width;
const widthRef = 375;
const sizeButtonIcon = 40;
const fontSizeLabelButton = 14;
const widthLabelButton = 100;

//class DetalhesPosto extends Component {
export default class DetalhesPosto extends Component {
  _isMounted = false;

  state = {
    loading: false,
    latitude: 0,
    longitude: 0,
    slideAnimationDialog: false,
    alertMessage: '',
    alertDetailMessage: '',
    alertIconType: 'check', // exclamation, times, check
    locationPermission: '',
    layoutAjustePreco: {
      color_header: '#2c4152',
      color_background: '#2c4152',
      color_menu_bar: '#2c4152',
    },
    userData: {},
    filterData: {},
    preferenceData: {},
    postoItem: {},
    rating: 0,
    customRating: [],
    isVisiblePopupRotas: false,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    _isMounted = true;

    this.props.navigation.addListener('focus', async () => {
      //console.log("Detalhes Focus")

      await this.obterDadosArmazendados();
      this.obterDadosLocalizacao();
      let postoItem = await AsyncStorage.getItem('postoItem');

      this.state.customRating.pop();
      this.state.customRating.push(
        <AirbnbRating
          key={1}
          count={5}
          reviews={reviews}
          defaultRating={this.state.rating}
          size={35}
          reviewSize={20}
          showRating={true}
          onFinishRating={rating => this.processarRating(rating)}
        />,
      );

      this.setState({ postoItem: JSON.parse(postoItem) || {}, rating: 0 });
    });

    this.props.navigation.addListener('blur', async () => {
      //console.log("Detalhes Blur")

      this.state.customRating.pop();

      //clearInterval(timerId);
      this.setState({ rating: 0 });
    });

    if (_isMounted) {
      //console.log("Detalhes Normal")

      //clearInterval(timerId);
      await this.obterDadosArmazendados();
      //this.verificarPermissoes()

      const posto = await AsyncStorage.getItem('postoItem');
      const jsonPosto = JSON.parse(posto);

      this.setState({ postoItem: jsonPosto });
    }
  };

  componentWillUnmount() {
    _isMounted = false;
    //clearInterval(timerId);
  }

  // Request permission to access location
  requestPermission = () => {
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(response => {
        this.setState(
          { locationPermission: response, loading: true },
          this.obterDadosLocalizacao,
        );
      });
    } else if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(response => {
        this.setState(
          { locationPermission: response, loading: true },
          this.obterDadosLocalizacao,
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
                this.obterDadosLocalizacao,
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
                this.obterDadosLocalizacao,
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
      const jsonUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(jsonUserData) || {};

      const jsonFilterData = await AsyncStorage.getItem('filterData');
      const filterData = JSON.parse(jsonFilterData) || {};

      const jsonPrefer = await AsyncStorage.getItem('preferenceData');
      const preferenceData = JSON.parse(jsonPrefer) || {};

      this.setState({
        userData: userData,
        filterData: filterData,
        preferenceData: preferenceData,
      });
    } catch (error) {
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível obter os dados armazenados.',
          alertDetailMessage: '',
          alertIconType: 'exclamation',
        },
        this.showAlert,
      );
    }
  };

  obterDadosLocalizacao = async () => {
    //try {
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          loading: false,
        });
      },
      error => {
        this.setState(
          {
            loading: false,
            slideAnimationDialog: true,
            alertMessage: 'Não foi possível obter a localização.',
            alertDetailMessage:
              'Por favor, verifique se o serviço de localização está habilitado.',
            alertIconType: 'times',
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
                slideAnimationDialog: true,
                alertMessage: "Não foi possível obter a localização",
                alertDetailMessage: "Por favor, verifique se o serviço de localização está habilitado.",
                alertIconType: 'times',
            }, this.showAlert)
        }
        */
  };

  openCameraFotoPlacar = async () => {
    //clearInterval(timerId);

    const postoCaptura = {
      codItem: this.state.postoItem.ex1,
      latitudePosto: this.decrypt(this.state.postoItem.ex9),
      longitudePosto: this.decrypt(this.state.postoItem.ex10),
    };

    await AsyncStorage.setItem('postoCaptura', JSON.stringify(postoCaptura));
    this.props.navigation.navigate('CapturaPlacarPreco');
  };

  /*
    openCameraQRCode = () => {
        Alert.alert("QR Code")
    }
    */

  back = async () => {
    //clearInterval(timerId);
    const lastScreen = await AsyncStorage.getItem('lastScreen');
    this.props.navigation.navigate(lastScreen);
  };

  showAlert = () => {
    //clearInterval(timerId);
    //timerId = setTimeout(() => this.closeAlert(), 3000);

    setTimeout(() => this.closeAlert(), 3000);
  };

  closeAlert = () => {
    this.setState({
      slideAnimationDialog: false,
    });
  };

  processarPostoFavorito = async item => {
    try {
      let url = '';

      if (item.ex7) {
        url = `${server}/excluirPostoFavorito?codItem=${item.ex1}`;
      } else {
        url = `${server}/incluirPostoFavorito?codItem=${item.ex1}`;
      }

      //console.log(url)
      //console.log(this.state.userData.token)

      let response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authentication: this.state.userData.token,
        },
      });

      let responseJson = await response.json();

      //console.log(responseJson)

      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: responseJson.titulo,
          alertDetailMessage: responseJson.mensagem,
          alertIconType: 'check',
        },
        this.onProcessarPostoFavorito,
      );
    } catch (err) {
      if (item.ex7) {
        this.setState(
          {
            loading: false,
            slideAnimationDialog: true,
            alertMessage:
              'Não foi possível excluir o posto da lista de favoritos.',
            alertDetailMessage:
              'Por favor, verifique se a internet está disponível.',
            alertIconType: 'times',
          },
          this.showAlert,
        );
      } else {
        this.setState(
          {
            loading: false,
            slideAnimationDialog: true,
            alertMessage:
              'Não foi possível incluir o posto na lista de favoritos.',
            alertDetailMessage:
              'Por favor, verifique se a internet está disponível.',
            alertIconType: 'times',
          },
          this.showAlert,
        );
      }
    }
  };

  processarRating = async rating => {
    //console.log("processarRating")
    //console.log(rating)
    //console.log(this.state.postoItem.ex1)

    try {
      let url = `${server}/classificarPosto?codItem=${this.state.postoItem.ex1}&rating=${rating}`;

      await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authentication: this.state.userData.token,
        },
      });
    } catch (err) {
      //...
    }
  };

  /*
    tracarRota = async (item) => {

        let url = ''
        let navegador = ''

        const latitude = this.decrypt(item.ex9);
        const longitude = this.decrypt(item.ex10);
        const nomePosto = this.decrypt(item.ex2);

        if (this.state.preferenceData.navegadorPadrao === 0) {
            if (Platform.OS === "ios") {
                url = 'waze://?ll=' + latitude + ',' + longitude + '&navigate=yes'
            } else {
                url = 'https://waze.com/ll=' + latitude + ',' + longitude + '&navigate=yes'
            }  
            navegador = 'Waze'

        } else if (this.state.preferenceData.navegadorPadrao === 1) {
            if (Platform.OS === "ios") {
                url = 'comgooglemaps://?saddr=&daddr=' + latitude + ',' + longitude + '&directionsmode=driving'
            } else {
                url = 'geo:0,0?q=' + latitude + ',' + longitude + '(' + nomePosto + ')'
            }
            navegador = 'Google Maps'
            
        } else if (this.state.preferenceData.navegadorPadrao === 2) {
            url = 'maps://app?daddr=' + latitude + ', ' + longitude
            navegador = 'Apple Maps'
        }

        Linking.canOpenURL(url).then((supported) => {
            if (!supported) {
                Alert.alert("O " + navegador + " não está instalado!", "Selecione outro navegador de rotas na opção preferências.")
            } else {
                return Linking.openURL(url)
            }
        })
        .catch((err) => Alert.alert('Não foi possível abrir o navegador de rotas.'))
    }
    */

  onFavorito = async () => {
    this.processarPostoFavorito(this.state.postoItem);

    let newPostoItem = this.state.postoItem;
    newPostoItem.ex7 = !newPostoItem.ex7;

    this.setState({
      postoItem: newPostoItem,
    });
  };

  onProcessarPostoFavorito = () => {
    this.showAlert();
  };

  decrypt = function (textToDecipher) {
    var dec = '';

    if (textToDecipher != null) {
      var iv = Buffer(8);
      iv.fill(0);

      var decipher = crypto.createDecipheriv(
        'des-cbc',
        secret_key_encrypt_data,
        iv,
      );

      var dec = decipher.update(textToDecipher, 'base64', 'utf8');
      dec += decipher.final('utf8');
    }

    return dec;
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#2c4152' }}>
        <View style={styles.container}>
          <Header
            backgroundColor={this.state.layoutAjustePreco.color_header}
            buttonInicio={false}
            buttonMenu={false}
            buttonBack={true}
            openMenu={this.openMenu}
            openBack={this.back}
          />
          <StatusBar
            postos={null}
            combustivel={this.state.filterData.combustivel}
            raio={null}
          />
          <View style={styles.viewContainer}>
            <DisplayItem
              {...this.state.postoItem}
              displayLogo={true}
              nomePosto={this.decrypt(this.state.postoItem.ex2)}
              reviews={this.decrypt(this.state.postoItem.ex17)}
              rating={this.decrypt(this.state.postoItem.ex18)}
              endereco={
                this.decrypt(this.state.postoItem.ex3) +
                ` - ` +
                this.decrypt(this.state.postoItem.ex4) +
                ` - ` +
                this.decrypt(this.state.postoItem.ex5)
              }
              bandeira={this.decrypt(this.state.postoItem.ex6)}
              distancia={this.decrypt(this.state.postoItem.ex11)}
              onFavorito={this.onFavorito}
              isFavorito={this.state.postoItem.ex7}
              isForaDoRaio={this.state.postoItem.ex12}
              colorData={this.decrypt(this.state.postoItem.ex16)}
              preco={this.decrypt(this.state.postoItem.ex13)}
              atualizacao={this.decrypt(this.state.postoItem.ex15)}
              isItemMapa={false}
              combustivel={this.state.filterData.combustivel}
            />

            <ScrollView>
              <View style={styles.containerPainel}>
                <View style={styles.containerShadow}>
                  <View style={styles.containerInnerPanel}>
                    <Button
                      icon={{
                        name: 'map-o',
                        type: 'font-awesome',
                        size: 18,
                        color: 'white',
                      }}
                      title=" Traçar rota"
                      //onPress={() => this.tracarRota(this.state.postoItem)}
                      onPress={() =>
                        this.setState({ isVisiblePopupRotas: true })
                      }
                    />
                  </View>
                </View>
              </View>

              <View style={styles.containerPainel}>
                <View style={styles.containerShadow}>
                  <View style={styles.containerInnerPanel}>
                    <Text style={styles.labelAtualizacao}>
                      Atualização de Preço:
                    </Text>
                    <Text style={styles.textAtualizacao}>
                      Colabore com a nossa comunidade enviando a foto do placar
                      de preços.
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingTop: 10,
                        paddingLeft: 25,
                        paddingRight: 25,
                        paddingBottom: 15,
                        justifyContent: 'space-around',
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => this.openCameraFotoPlacar()}
                      >
                        <View
                          style={{
                            width: (windowWidth * widthLabelButton) / widthRef,
                            alignItems: 'center',
                          }}
                        >
                          <Icon
                            reverse={true}
                            name="camera"
                            type="font-awesome"
                            color="#31af91"
                            size={(windowWidth * sizeButtonIcon) / widthRef}
                          />

                          <Text style={styles.labelButton}>
                            {/*Foto placar de preços*/}
                            Enviar foto
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.containerPainel}>
                <View style={styles.containerShadow}>
                  <View style={styles.containerInnerPanel}>
                    <Text style={styles.labelAtualizacao}>
                      Classifique o posto:
                    </Text>
                    <Text style={styles.textAtualizacao}>
                      Dê a sua avaliação para os serviços oferecidos pelo posto,
                      considerando o atendimento e a qualidade do combustível.
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingBottom: 10,
                        justifyContent: 'space-around',
                      }}
                    >
                      <AirbnbRating
                        key={1}
                        count={5}
                        reviews={reviews}
                        defaultRating={this.state.rating}
                        size={35}
                        reviewSize={20}
                        showRating={true}
                        onFinishRating={rating => this.processarRating(rating)}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

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

          <Popup
            isVisible={this.state.isVisiblePopupRotas}
            onCancelPressed={() =>
              this.setState({ isVisiblePopupRotas: false })
            }
            onAppPressed={() => this.setState({ isVisiblePopupRotas: false })}
            onBackButtonPressed={() =>
              this.setState({ isVisiblePopupRotas: false })
            }
            modalProps={{
              animationIn: 'slideInUp',
            }}
            appsWhiteList={['waze', 'google-maps', 'apple-maps']}
            options={{
              latitude: this.decrypt(this.state.postoItem.ex9),
              longitude: this.decrypt(this.state.postoItem.ex10),
              title: this.decrypt(this.state.postoItem.ex2),
              dialogTitle: 'Traçar rota',
              dialogMessage: 'Selecione o navegador para traçar a sua rota',
              cancelText: 'Cancelar',
            }}
            style={{}}
          />
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
            color="#rgba(0, 0, 0, 0.9)"
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
  container: {
    flex: 1,
    backgroundColor: 'rgba(239,239,244,1.0)',
    //flexDirection: "column",
    justifyContent: 'flex-start',
  },
  viewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#edede4',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
  },
  containerPainel: {
    flex: 1,
    backgroundColor: '#edede4',
    width: '100%',
    //height: '100%',
  },
  containerPainelCombustivel: {
    backgroundColor: '#edede4',
    width: '100%',
    paddingLeft: 4,
    paddingRight: 4,
  },
  containerInnerPanel: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: 10,
  },
  containerPanelCombustivel: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: 4,
    color: '#cecece',
  },
  containerShadowCombustivel: {
    //paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    paddingTop: 5,
  },
  labelCombustivel: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#bbb',
    textAlign: 'right',
  },
  containerShadow: {
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    paddingTop: 5,
    paddingBottom: 5,
  },
  labelAtualizacao: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
  },
  textAtualizacao: {
    fontSize: 15,
    color: '#626262',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 15,
  },
  textAvaliacao: {
    fontSize: 17,
    color: '#626262',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textServicos: {
    fontSize: 12,
    color: '#626262',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  labelButton: {
    color: '#138b6e',
    fontWeight: 'bold',
    fontSize: (windowWidth * fontSizeLabelButton) / widthRef,
    textAlign: 'center',
  },
  obs: {
    color: '#000',
    fontSize: 12,
    fontStyle: 'italic',
  },
  containerRaio: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF',
    marginTop: 20,
  },
  containerSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  containerPreferencias: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
    backgroundColor: '#FFF',
    width: '80%',
  },
  subTitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  containerCombustivel: {
    padding: 8,
    backgroundColor: '#FFF',
    marginTop: 20,
  },
  containerBandeira: {
    padding: 8,
    backgroundColor: '#FFF',
    marginTop: 20,
  },
  segmentedControlTab: {
    width: '100%',
    flex: 4,
  },
  tabStyle: {
    borderColor: '#314150',
  },
  tabTextStyle: {
    color: '#314150',
  },
  activeTabStyle: {
    backgroundColor: '#314150',
    borderColor: '#314150',
  },
  offset: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#505b69',
  },
  button: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  containerHeader: {
    marginTop: 30,
  },
  header: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  item: {
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 5,
  },
  itemText: {
    fontSize: 13,
    fontWeight: 'normal',
  },
  selectToggleText: {
    fontSize: 14,
  },
  selectedItemText: {
    fontWeight: 'bold',
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

// Wrap and export
/*
export default function(props) {
    const navigation = useNavigation();
  
    return <DetalhesPosto {...props} navigation={navigation} />;
}
*/
