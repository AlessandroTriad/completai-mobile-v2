import { Icon, Slider } from '@rneui/themed';
import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

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

// Componente funcional wrapper só para usar hook de devices
function CameraView({ zoom, onZoomChange, onCapture, innerRef }) {
  const devices = useCameraDevices();
  const device = devices.back;

  if (!device) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff' }}>Carregando câmera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={innerRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}
        zoom={zoom}
      />

      {/* Slider sobreposto */}
      <Slider
        style={{
          position: 'absolute',
          bottom: 120,
          alignSelf: 'center',
          width: windowWidth * 0.7,
          height: 40,
        }}
        minimumValue={0}
        step={stepZoom}
        value={zoom}
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
        onValueChange={onZoomChange}
      />

      {/* Botões sobrepostos */}
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          padding: 17,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center' }}
          onPress={onCapture.cancel}
        >
          <Icon name="times" size={35} type="font-awesome" color="#fff" />
          <Text style={styles.labelButton}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center' }}
          onPress={onCapture.take}
        >
          <Icon name="camera" type="font-awesome" size={60} color="#fff" />
        </TouchableOpacity>
        <View style={{ width: 90, flex: 1, alignItems: 'center' }} />
      </View>
    </View>
  );
}

export default class CapturaPlacarPreco extends PureComponent {
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
      alertIconType: 'check',
      loading: false,
      zoom: 0,
    };
    this.cameraRef = React.createRef();
  }

  async componentDidMount() {
    const permission = await Camera.requestCameraPermission();
    if (permission !== 'authorized') {
      console.warn('⚠️ Permissão da câmera não concedida!');
    }

    this.props.navigation.addListener('focus', async () => {
      clearInterval(timerId);
      await this.obterDadosArmazendados();
      const posto = await AsyncStorage.getItem('postoCaptura');
      this.setState({ postoCaptura: JSON.parse(posto) });
    });

    this.props.navigation.addListener('blur', async () => {
      this.setState({
        pathImage: null,
        zoom: 0,
        latitudeUsuario: 0,
        longitudeUsuario: 0,
      });
      clearInterval(timerId);
    });
  }

  componentWillUnmount() {
    clearInterval(timerId);
  }

  obterDadosArmazendados = async () => {
    try {
      const jsonUserData = await AsyncStorage.getItem('userData');
      this.setState({ userData: JSON.parse(jsonUserData) || {} });
    } catch (error) {
      console.log('error: ', error);
    }
  };

  obterLocalizacao = () => {
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          longitudeUsuario: position.coords.longitude,
          latitudeUsuario: position.coords.latitude,
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
    );
  };

  takePicture = async () => {
    try {
      const photo = await this.cameraRef.current.takePhoto({
        flash: 'off',
      });

      this.setState(
        { pathImage: 'file://' + photo.path },
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

      let mensagem =
        response.status == 200
          ? 'Foto enviada com sucesso!'
          : 'Ocorreu um erro durante o envio da foto!';

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

  distance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == lat2 && lon1 == lon2) return 0;
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) dist = 1;
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344;
    return dist;
  };

  showAlert = () => {
    clearInterval(timerId);
    timerId = setTimeout(() => this.closeAlert(), 3000);
  };

  closeAlert = () => {
    this.setState(
      { slideAnimationDialog: false },
      this.verificaRedirecionamento,
    );
  };

  verificaRedirecionamento = () => {
    if (this.state.alertIconType == 'check') {
      this.goBack();
    }
  };

  renderCamera() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <CameraView
          innerRef={this.cameraRef}
          zoom={this.state.zoom}
          onZoomChange={value => this.setState({ zoom: value })}
          onCapture={{
            cancel: this.goBack,
            take: this.takePicture,
          }}
        />
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
  labelButton: {
    color: '#FFF',
    fontSize: (windowWidth * sizeTextButtonRef) / widthRef,
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
});
