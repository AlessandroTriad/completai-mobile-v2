import { Icon, Slider } from '@rneui/themed';
import { PureComponent } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RNCamera as Camera } from 'react-native-camera';
//import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { SECURITY_TOKEN, serverUpload } from '../constants';

var timerId;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const widthRef = 375;
const sizeTextButtonRef = 14;
const stepZoom = Platform.OS === 'ios' ? 0.0005 : 0.05;
const maxZoom = Platform.OS === 'ios' ? 0.1 : 1;

export default class CapturaPlacarPreco extends PureComponent {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      pathImage: null,
      postoCaptura: {},
      userData: {},
      latitudeUsuario: 0,
      longitudeUsuario: 0,
      slideAnimationDialog: false,
      alertMessage: '',
      alertDetailMessage: '',
      alertIconType: 'check', // exclamation, times, check
      loading: false,
      zoom: 0,
    };
  }

  componentDidMount = async () => {
    _isMounted = true;

    this.props.navigation.addListener('focus', async () => {
      //console.log("Captura Focus")
      clearInterval(timerId);
      await this.obterDadosArmazendados();

      const posto = await AsyncStorage.getItem('postoCaptura');
      const jsonPosto = JSON.parse(posto);

      this.setState({ postoCaptura: jsonPosto });

      //console.log(jsonPosto.codItem)
    });

    this.props.navigation.addListener('blur', async () => {
      //console.log("Detalhes Blur")
      this.setState({
        pathImage: null,
        zoom: 0,
        latitudeUsuario: 0,
        longitudeUsuario: 0,
      });
      clearInterval(timerId);
    });

    if (_isMounted) {
      clearInterval(timerId);
      await this.obterDadosArmazendados();
      const posto = await AsyncStorage.getItem('postoCaptura');
      const jsonPosto = JSON.parse(posto);
      this.setState({ postoCaptura: jsonPosto });
    }
  };

  componentWillUnmount() {
    _isMounted = false;
    clearInterval(timerId);
  }

  obterDadosArmazendados = async () => {
    try {
      const jsonUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(jsonUserData) || {};

      this.setState({
        userData: userData,
      });
    } catch (error) {
      console.log('error: ', error);
    }
  };

  obterLocalizacao = () => {
    //try {
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          longitudeUsuario: position.coords.longitude,
          latitudeUsuario: position.coords.latitude,
        });
      },
      error => {},
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
    );

    //} catch (err) {}
  };

  takePicture = async () => {
    try {
      const response = await this.camera.takePictureAsync({
        width: 800,
        quality: 0.8,
        exif: true,
        orientation: 'portrait',
        fixOrientation: true,
        forceUpOrientation: true,
        //base64: true,
        skipProcessing: true,
        //pauseAfterCapture: true,
      });

      this.setState(
        {
          pathImage: response.uri,
        },
        this.obterLocalizacao,
      );
    } catch (error) {
      console.log('error: ', error);
    }
  };

  goBack = () => {
    this.props.navigation.navigate('DetalhesPosto');
  };

  salvarFoto = async () => {
    this.setState({ loading: true });

    var photo = {
      uri: this.state.pathImage,
      type: 'image/jpeg',
      name: 'foto.jpg',
    };

    const distancia = this.distance(
      this.state.latitudeUsuario,
      this.state.longitudeUsuario,
      this.state.postoCaptura.latitudePosto,
      this.state.postoCaptura.longitudePosto,
    );

    const url = `${serverUpload}/uploadFile`;

    var formData = new FormData();
    formData.append('file', photo);
    formData.append('codItem', this.state.postoCaptura.codItem);
    formData.append('origem', 1);
    formData.append('tipoEnvio', 1);
    formData.append('lat', this.state.latitudeUsuario);
    formData.append('lng', this.state.longitudeUsuario);
    formData.append('dist', distancia);
    formData.append('token', this.state.userData.token);

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authentication: SECURITY_TOKEN,
        },
        body: formData,
      });

      let mensagem = '';

      if (response.status == 200) {
        mensagem = 'Foto enviada com sucesso!';
      } else {
        mensagem = 'Ocorreu um erro durante o envio da foto!';
      }

      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: mensagem,
          alertDetailMessage: '',
          alertIconType: response.status == 200 ? 'check' : 'times',
        },
        this.showAlert,
      );
    } catch (error) {
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Ocorreu um erro durante o envio da foto!',
          alertDetailMessage:
            'Por favor, verifique se a internet está disponível.',
          alertIconType: 'times',
        },
        this.showAlert,
      );
    }
  };

  verificaRedirecionamento = () => {
    if (this.state.alertIconType == 'check') {
      this.goBack();
    }
  };

  distance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      var radlat1 = (Math.PI * lat1) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = lon1 - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344;

      return dist;
    }
  };

  showAlert = () => {
    clearInterval(timerId);
    timerId = setTimeout(() => this.closeAlert(), 3000);
  };

  closeAlert = () => {
    this.setState(
      {
        slideAnimationDialog: false,
      },
      this.verificaRedirecionamento,
    );
  };

  renderCamera() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Camera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={Camera.Constants.Type.back}
          flashMode={Camera.Constants.FlashMode.off}
          captureAudio={false}
          autoFocus={Camera.Constants.AutoFocus.on}
          zoom={this.state.zoom}
          ratio="16:9"
        >
          <Slider
            style={{ top: -20, width: windowWidth * 0.7, height: 40 }}
            minimumValue={0}
            step={stepZoom}
            value={this.state.zoom}
            maximumValue={maxZoom}
            minimumTrackTintColor="rgba(0,185,85,1.0)"
            maximumTrackTintColor="rgba(230,230,230,1.0)"
            thumbProps={{ color: 'rgba(255,255,255, 1.0)' }}
            thumbStyle={{
              height: 35,
              width: 35,
              borderColor: 'rgba(176,180,187,1.0)',
              borderWidth: 5,
            }}
            onValueChange={value => this.setState({ zoom: value })}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 17,
              backgroundColor: 'rgba(0,0,0,0.5)',
              width: '100%',
            }}
          >
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center' }}
              onPress={() => this.goBack()}
            >
              <Icon name="times" size={35} type="font-awesome" color="#fff" />
              <Text style={styles.labelButton}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center' }}
              onPress={this.takePicture.bind(this)}
            >
              <Icon name="camera" type="font-awesome" size={60} color="#fff" />
            </TouchableOpacity>
            <View style={{ width: 90, flex: 1, alignItems: 'center' }} />
          </View>
        </Camera>
      </SafeAreaView>
    );
  }

  renderImage() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Image
          source={{ uri: this.state.pathImage }}
          style={styles.imagePreview}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 17,
            backgroundColor: 'rgba(0,0,0,0.5)',
            width: '100%',
          }}
        >
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => this.goBack()}
          >
            <Icon name="times" size={35} type="font-awesome" color="#fff" />
            <Text style={styles.labelButton}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', marginBottom: 8 }}
            onPress={() => this.salvarFoto()}
          >
            <Icon name="check" size={70} type="font-awesome" color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => this.setState({ pathImage: null, zoom: 0 })}
          >
            <Icon name="undo" size={35} type="font-awesome" color="#fff" />
            <Text style={styles.labelButton}>Refazer</Text>
          </TouchableOpacity>
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
        <View
          style={[
            styles.containerActivity,
            { display: this.state.loading ? 'flex' : 'none' },
          ]}
        >
          <ActivityIndicator
            style={{ display: this.state.loading ? 'flex' : 'none' }}
            size="large"
            color="#rgba(255, 255, 255, 0.8)"
          />
        </View>
      </SafeAreaView>
    );
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#2c4152' }}>
        <View style={styles.container}>
          {this.state.pathImage ? this.renderImage() : this.renderCamera()}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  imagePreview: {
    flex: 1,
    resizeMode: 'contain',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: windowHeight,
    width: windowWidth,
  },
  capture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#FFF',
    marginBottom: 15,
  },
  labelButton: {
    color: '#FFF',
    fontSize: (windowWidth * sizeTextButtonRef) / widthRef,
  },
  cancel: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: 'transparent',
    color: '#FFF',
    fontWeight: '600',
    fontSize: 17,
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
