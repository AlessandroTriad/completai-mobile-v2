import { Icon } from '@rneui/themed';
import { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import logo from '../../assets/images/logo_completai.png';
import slide1 from '../../assets/images/slides/slide1.png';
import slide2 from '../../assets/images/slides/slide2.png';
import slide3 from '../../assets/images/slides/slide3.png';
import slide4 from '../../assets/images/slides/slide4.png';
import slide5 from '../../assets/images/slides/slide5.png';
//import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import { server, termosUso } from '../constants';

const { width, height } = Dimensions.get('window');
const BannerWidth = Dimensions.get('window').width;
const BannerHeight = (523 * BannerWidth) / 745;

class Inicio extends Component {
  state = {
    loading: false,
    slideAnimationDialog: false,
    alertMessage: '',
    alertDetailMessage: '',
    alertIconType: 'check', // exclamation, times, check
    userData: {},
    preferenceData: {},
    locationPermission: '',
    longitude: 0,
    latitude: 0,
    //imagesCarousel: [],
    imagesCarousel: [slide1, slide2, slide3, slide4, slide5],
    activeSlide: 0,
  };

  componentDidMount = async () => {
    //await this.obterBannerSlides()
    await this.obterDadosArmazendados();
  };

  /*
    obterBannerSlides = async () => {
        const url = `${server}/listarBannerSlides`
        let response = await fetch(url,
            {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                }
            });

        let responseJson = await response.json();
        this.setState( { imagesCarousel: responseJson.listaSlides} )
    }
    */

  obterDadosArmazendados = async () => {
    try {
      const jsonUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(jsonUserData) || {};

      const jsonPreference = await AsyncStorage.getItem('preferenceData');
      const preferenceData = JSON.parse(jsonPreference) || {};

      this.setState({
        userData: userData,
        preferenceData: preferenceData,
      });
    } catch (error) {
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível obter os dados armazenados.',
          alertDetailMessage: '',
          alertIconType: 'times', // exclamation, times, check
        },
        () => showAlert(),
      );
    }
  };

  renderItem({ item, index }) {
    return (
      <View style={styles.slide}>
        {/*<Image style={{ width: BannerWidth, height: BannerHeight }} source={{ uri: item }} />*/}
        <Image
          style={{ width: BannerWidth, height: BannerHeight }}
          source={item}
        />
      </View>
    );
  }

  render() {
    const { navigation } = this.props;

    goToTelaInicial = async () => {
      try {
        //console.log(`[` + this.state.userData.token + `]`)
        if (this.state.userData.token && this.state.userData.token != '') {
          if (this.state.preferenceData.telaInicial === 0) {
            this.setState({ loading: false }, () => openReferencia());
          } else if (this.state.preferenceData.telaInicial === 1) {
            this.setState({ loading: false }, () => openListaPostos());
          } else if (this.state.preferenceData.telaInicial === 2) {
            this.setState({ loading: false }, () => openMapa());
          } else {
            //Default
            this.setState({ loading: false }, () => openListaPostos());
          }
        } else {
          const url = `${server}/registrarUsuario?dev=${Platform.OS}&lat=${this.state.latitude}&lng=${this.state.longitude}`;

          //console.log(url)

          let response = await fetch(url, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });

          let responseJson = await response.json();

          AsyncStorage.setItem('userData', JSON.stringify(responseJson));
          AsyncStorage.setItem('lastScreen', 'ListaPostos');

          this.setState({ loading: false }, () => openPreferencias());
        }
      } catch (err) {
        this.setState(
          {
            loading: false,
            slideAnimationDialog: true,
            alertMessage: 'Não foi possível acessar os dados.',
            alertDetailMessage:
              'Por favor, verifique se a internet está disponível.',
            alertIconType: 'times', // exclamation, times, check
          },
          () => showAlert(),
        );
      }
    };

    obterLocalizacao = async () => {
      //try {
      Geolocation.getCurrentPosition(
        position => {
          this.setState(
            {
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
            },
            () => goToTelaInicial(),
          );
        },
        error => {
          this.setState(
            {
              loading: false,
              slideAnimationDialog: true,
              alertMessage: 'Não foi possível obter a localização',
              alertDetailMessage: error.message, //"Por favor, verifique se o serviço de localização está habilitado.",
              alertIconType: 'exclamation', // exclamation, times, check
            },
            () => showAlert(),
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
                    alertIconType: 'exclamation', // exclamation, times, check
                }, () => showAlert())
            }
            */
    };

    // Request permission to access location
    requestPermission = () => {
      if (Platform.OS === 'ios') {
        request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(response => {
          this.setState({ locationPermission: response, loading: true }, () =>
            obterLocalizacao(),
          );
        });
      } else if (Platform.OS === 'android') {
        request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(response => {
          this.setState({ locationPermission: response, loading: true }, () =>
            obterLocalizacao(),
          );
        });
      }
    };

    verificarPermissoes = () => {
      //console.log("********** Teste A *************")
      if (Platform.OS === 'ios') {
        check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
          .then(result => {
            console.log(result);
            switch (result) {
              case RESULTS.UNAVAILABLE:
                //console.log('This feature is not available (on this device / in this context)',);
                this.setState(
                  { locationPermission: result, loading: true },
                  () => alertForLocationPermission(),
                );
                break;
              case RESULTS.DENIED:
                //console.log('The permission has not been requested / is denied but requestable',);
                this.setState(
                  { locationPermission: result, loading: true },
                  () => alertForLocationPermission(),
                );
                break;
              case RESULTS.GRANTED:
                //console.log('The permission is granted');
                this.setState(
                  { locationPermission: result, loading: true },
                  () => obterLocalizacao(),
                );
                break;
              case RESULTS.BLOCKED:
                //console.log('The permission is denied and not requestable anymore');
                this.setState(
                  { locationPermission: result, loading: true },
                  () => alertForLocationPermission(),
                );
                break;
            }
          })
          .catch(error => {
            alert(error);
          });
      } else if (Platform.OS === 'android') {
        check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
          .then(result => {
            switch (result) {
              case RESULTS.UNAVAILABLE:
                //console.log('This feature is not available (on this device / in this context)',);
                this.setState(
                  { locationPermission: result, loading: true },
                  () => alertForLocationPermission(),
                );
                break;
              case RESULTS.DENIED:
                //console.log('The permission has not been requested / is denied but requestable',);
                this.setState(
                  { locationPermission: result, loading: true },
                  () => alertForLocationPermission(),
                );
                break;
              case RESULTS.GRANTED:
                //console.log('The permission is granted');
                this.setState(
                  { locationPermission: result, loading: true },
                  () => obterLocalizacao(),
                );
                break;
              case RESULTS.BLOCKED:
                //console.log('The permission is denied and not requestable anymore');
                this.setState(
                  { locationPermission: result, loading: true },
                  () => alertForLocationPermission(),
                );
                break;
            }
          })
          .catch(error => {});
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
            ? { text: 'OK', onPress: () => requestPermission() }
            : { text: 'Abrir Configurações', onPress: () => openSettings() },
        ],
      );
    };

    openListaPostos = () => {
      navigation.navigate('Menu');
    };
    openReferencia = () => {
      navigation.navigate('Menu');
    };
    openPreferencias = () => {
      navigation.navigate('Menu');
    };
    openMapa = () => {
      navigation.navigate('Menu');
    };
    openTermos = () => {
      Linking.openURL(termosUso);
    };
    showAlert = () => {
      setTimeout(() => closeAlert(), 3000);
    };
    closeAlert = () => {
      this.setState({ slideAnimationDialog: false });
    };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,48,66,1)' }}>
        <View style={styles.background}>
          <View style={styles.containerLogo}>
            <Image style={styles.logo} source={logo} />
          </View>

          <LinearGradient
            colors={['rgba(0,48,66,1)', 'rgba(0,48,66,1)', '#fff', '#fff']}
            style={{ flex: 1 }} // ocupa toda a tela
          >
            <View style={{ flex: 1 }}>
              <Carousel
                width={width}
                height={BannerHeight}
                data={this.state.imagesCarousel}
                autoPlay
                loop
                autoPlayInterval={2000}
                onSnapToItem={index => this.setState({ activeSlide: index })}
                renderItem={({ item }) => this.renderItem({ item })}
              />

              {/* Paginação customizada */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 10,
                }}
              >
                {this.state.imagesCarousel.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      marginHorizontal: 6,
                      backgroundColor:
                        index === this.state.activeSlide
                          ? 'rgba(0, 0, 0, 0.8)'
                          : 'rgba(0, 0, 0, 0.3)',
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Parte branca inferior com botão e termos */}
            <View
              style={{
                backgroundColor: '#fff',
                paddingBottom: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                onPress={() => verificarPermissoes()}
                style={{ flexDirection: 'row', justifyContent: 'center' }}
              >
                <View
                  style={[
                    styles.button,
                    { backgroundColor: 'rgba(94,111,130,1.0)' },
                  ]}
                >
                  <Text style={styles.buttonText}>COMEÇAR</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openTermos()}
                style={{
                  paddingTop: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                <Text style={styles.labelTermosLink}>
                  Continuar significa que você leu e aceitou nossos termos de
                  uso e política de privacidade.
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

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
            color="#rgba(0, 0, 0, 0.9)"
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  containerLogo: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: '85%',
    resizeMode: 'contain',
  },

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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  background: {
    flex: 1,
    //width: '100%',
    //alignItems: 'center',
    //justifyContent: 'space-between',
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
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

  title: {
    color: '#FFF',
    fontSize: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#505b69',
    padding: 15,
    alignItems: 'center',
    borderRadius: 30,
    width: '90%',
    height: 55,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  containerTermos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
  },
  labelTermosLink: {
    textDecorationLine: 'underline',
    alignItems: 'flex-start',
    color: '#777',
    textAlign: 'center',
    fontSize: 12,
  },
});

// Wrap and export
export default function (props) {
  const navigation = useNavigation();

  return <Inicio {...props} navigation={navigation} />;
}
