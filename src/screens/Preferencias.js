import {
  ButtonGroup,
  CheckBox,
  Icon,
  ListItem,
  Overlay,
  Slider,
  Text,
} from '@rneui/themed';
import { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
//import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Header from '../componentes/Header';
import { server } from '../constants';

var timerId;

export default class Preferencias extends Component {
  _isMounted = false;

  state = {
    raio: 0,
    loading: false,
    latitude: 0,
    longitude: 0,
    telaInicial: 0,
    navegadorPadrao: 0,
    tempoAtualizacao: 0,
    ordenacao: '',
    listaCombustiveis: [],
    listaBandeiras: [],
    slideAnimationDialog: false,
    alertMessage: '',
    alertDetailMessage: '',
    alertIconType: 'check', // exclamation, times, check
    locationPermission: '',
    layoutFiltro: {
      color_header: '#2c4152',
      color_background: '#2c4152',
    },
    layoutPref: {
      color_header: '#2c4152',
    },
    userData: {},
    modalCombustivelVisible: false,
    modalBandeiraVisible: false,
    chkCombustiveis: [],
    chkBandeiras: [],
    combustivelSelecionado: '',
    bandeirasSelecionadas: '',
  };

  componentDidMount = async () => {
    _isMounted = true;

    this.props.navigation.addListener('focus', async () => {
      //console.log("Preferencias Focus")

      await this.obterDadosArmazendados();
      this.verificarPermissoes();
    });

    /*
        this.props.navigation.addListener(
            'blur',
            async () => {

                //console.log("Preferencias Blur")

                clearInterval(timerId);
            }
        );
        */

    if (_isMounted) {
      //clearInterval(timerId);
      await this.obterDadosArmazendados();
      this.verificarPermissoes();
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
        this.setState({ locationPermission: response, loading: true }, () =>
          this.obterDadosLocalizacao(),
        );
      });
    } else if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(response => {
        this.setState({ locationPermission: response, loading: true }, () =>
          this.obterDadosLocalizacao(),
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
              this.setState({ locationPermission: result, loading: true }, () =>
                this.alertForLocationPermission(),
              );
              break;
            case RESULTS.DENIED:
              //console.log('The permission has not been requested / is denied but requestable',);
              this.setState({ locationPermission: result, loading: true }, () =>
                this.alertForLocationPermission(),
              );
              break;
            case RESULTS.GRANTED:
              //console.log('The permission is granted');
              this.setState({ locationPermission: result, loading: true }, () =>
                this.obterDadosLocalizacao(),
              );
              break;
            case RESULTS.BLOCKED:
              //console.log('The permission is denied and not requestable anymore');
              this.setState({ locationPermission: result, loading: true }, () =>
                this.obterDadosLocalizacao(),
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
              this.setState({ locationPermission: result, loading: true }, () =>
                this.alertForLocationPermission(),
              );
              break;
            case RESULTS.DENIED:
              //console.log('The permission has not been requested / is denied but requestable',);
              this.setState({ locationPermission: result, loading: true }, () =>
                this.alertForLocationPermission(),
              );
              break;
            case RESULTS.GRANTED:
              //console.log('The permission is granted');
              this.setState({ locationPermission: result, loading: true }, () =>
                this.obterDadosLocalizacao(),
              );
              break;
            case RESULTS.BLOCKED:
              //console.log('The permission is denied and not requestable anymore');
              this.setState({ locationPermission: result, loading: true }, () =>
                this.alertForLocationPermission(),
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
          ? { text: 'OK', onPress: () => requestPermission() }
          : { text: 'Abrir Configurações', onPress: () => this.openSettings() },
      ],
    );
  };

  obterDadosArmazendados = async () => {
    try {
      const jsonPrefer = await AsyncStorage.getItem('preferenceData');
      const preferenceData = JSON.parse(jsonPrefer) || {};

      const json = await AsyncStorage.getItem('filterData');
      const filterData = JSON.parse(json) || {};

      const jsonUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(jsonUserData) || {};

      this.setState({
        raio: parseInt(filterData.raio),
        combustivelSelecionado: filterData.combustivel,
        bandeirasSelecionadas: filterData.bandeira,
        telaInicial: preferenceData.telaInicial,
        navegadorPadrao: preferenceData.navegadorPadrao,
        tempoAtualizacao: preferenceData.tempoAtualizacao,
        ordenacao: preferenceData.ordenacao,
        userData: userData,
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
        () => this.showAlert(),
      );
    }
  };

  obterDadosLocalizacao = async () => {
    // try {
    Geolocation.getCurrentPosition(
      position => {
        this.setState(
          {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          },
          () => this.obterDadosDropbox(),
        );
      },
      error => {
        this.setState(
          {
            loading: false,
            slideAnimationDialog: true,
            alertMessage: 'Não foi possível obter a localização.',
            alertDetailMessage:
              'Por favor, verifique se o serviço de localização está habilitado.',
            alertIconType: 'exclamation',
          },
          () => this.showAlert(),
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
                alertIconType: 'exclamation',
            }, () => this.showAlert())
        }
        */
  };

  obterDadosDropbox = async () => {
    try {
      const urlComb = `${server}/listarCombustiveis`;
      let resComb = await fetch(urlComb, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authentication: this.state.userData.token,
        },
      });

      let responseJsonComb = await resComb.json();

      let arrayComb = [];
      await responseJsonComb.map((item, i) =>
        arrayComb.push({
          id: i,
          title: item.name,
          checked: this.state.combustivelSelecionado == item.name,
        }),
      );

      const urlBand = `${server}/listarBandeirasPorProximidade?lat=${this.state.latitude}&lng=${this.state.longitude}`;
      let resBand = await fetch(urlBand, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authentication: this.state.userData.token,
        },
      });

      let responseJsonBand = await resBand.json();

      let arrayBand = [];
      let arrayBandSelecionadas =
        this.state.bandeirasSelecionadas.split(',') || [];

      await responseJsonBand.map((item, i) => {
        let blnCheck = false;
        for (j = 0; j < arrayBandSelecionadas.length; j++) {
          if (item.name == arrayBandSelecionadas[j]) {
            blnCheck = true;
          }
        }
        arrayBand.push({ id: i, title: item.name, checked: blnCheck });
      });

      this.setState({
        loading: false,
        listaCombustiveis: responseJsonComb,
        listaBandeiras: responseJsonBand,
        chkCombustiveis: arrayComb,
        chkBandeiras: arrayBand,
      });
    } catch (err) {
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível listar os dados!',
          alertDetailMessage:
            'Por favor, verifique se a internet está disponível.',
          alertIconType: 'exclamation',
        },
        () => this.onBack(),
      );
    }
  };

  handleIndexChangeTelaInicial = index => {
    this.setState({ telaInicial: index });
  };

  handleIndexChangeNavegador = index => {
    this.setState({ navegadorPadrao: index });
  };

  handleIndexChangeAtualizacao = index => {
    this.setState({ tempoAtualizacao: index });
  };

  openMenu = () => {
    this.props.navigation.openDrawer();
  };

  openModalCombustiveis = () => {
    this.setState({
      modalCombustivelVisible: true,
    });
  };
  openModalBandeiras = () => {
    this.setState({
      modalBandeiraVisible: true,
    });
  };

  closeModalCombustiveis = () => {
    this.setState({
      modalCombustivelVisible: false,
    });
  };
  closeModalBandeiras = () => {
    this.setState({
      modalBandeiraVisible: false,
    });
  };

  back = async () => {
    //clearInterval(timerId);
    const lastScreen = await AsyncStorage.getItem('lastScreen');
    this.props.navigation.navigate(lastScreen);
  };

  onBack = async () => {
    //clearInterval(timerId);
    setTimeout(
      () =>
        this.setState(
          {
            slideAnimationDialog: false,
          },
          () => this.back(),
        ),
      2000,
    );
  };

  showAlert = () => {
    //clearInterval(timerId);
    setTimeout(() => this.closeAlert(), 3000);
  };

  closeAlert = () => {
    this.setState({ slideAnimationDialog: false });
  };

  save = async () => {
    //clearInterval(timerId);

    try {
      const data = {
        raio: this.state.raio,
        combustivel: this.state.combustivelSelecionado,
        bandeira: this.state.bandeirasSelecionadas,
      };

      const dataPrefer = {
        telaInicial: this.state.telaInicial,
        navegadorPadrao: this.state.navegadorPadrao,
        tempoAtualizacao: this.state.tempoAtualizacao,
      };

      AsyncStorage.setItem('filterData', JSON.stringify(data));
      AsyncStorage.setItem('preferenceData', JSON.stringify(dataPrefer));

      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Preferências salvas!',
          alertIconType: 'check',
        },
        () => this.onBack(),
      );
    } catch (err) {
      this.setState(
        {
          loading: false,
          slideAnimationDialog: true,
          alertMessage: 'Não foi possível atualizar as preferências.',
          alertDetailMessage: 'Por favor, tente mais tarde.',
          alertIconType: 'times',
        },
        () => this.showAlert(),
      );
    }
  };

  toggleCheckboxCombustivel = title => {
    const changedCheckbox = this.state.chkCombustiveis.find(
      item => item.title === title,
    );

    changedCheckbox.checked =
      changedCheckbox.checked != undefined ? !changedCheckbox.checked : false;
    let chkboxes = this.state.chkCombustiveis;
    for (let i = 0; i < chkboxes.length; i++) {
      if (chkboxes[i].title === title) {
        chkboxes[i].checked = true;
      } else {
        chkboxes[i].checked = false;
      }
    }

    this.setState({ combustivelSelecionado: title });
  };

  toggleCheckboxBandeira = title => {
    const changedCheckbox = this.state.chkBandeiras.find(
      item => item.title === title,
    );

    changedCheckbox.checked =
      changedCheckbox.checked != undefined ? !changedCheckbox.checked : false;
    let chkboxes = this.state.chkBandeiras;
    for (let i = 0; i < chkboxes.length; i++) {
      if (chkboxes[i].title === title) {
        if (chkboxes[i].checked) {
          chkboxes[i].checked = true;
        } else {
          chkboxes[i].checked = false;
        }
      }
    }

    let relBandeiras = '';
    for (let i = 0; i < chkboxes.length; i++) {
      if (chkboxes[i].checked) {
        if (relBandeiras != '') relBandeiras += ',';
        relBandeiras += chkboxes[i].title;
      }
    }

    this.setState({ bandeirasSelecionadas: relBandeiras });
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#2c4152' }}>
        <View style={styles.container}>
          <Header
            backgroundColor={this.state.layoutFiltro.color_header}
            buttonInicio={false}
            buttonMenu={false}
            buttonBack={true}
            openMenu={this.openMenu}
            openBack={this.back}
          />
          <ScrollView>
            <View style={styles.containerHeader}>
              <Text style={styles.header}>Filtros:</Text>
            </View>

            <View style={styles.containerRaio}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Raio: ({this.state.raio} km)</Text>
              </View>
              <View style={styles.containerSlider}>
                <Text>1 </Text>
                <Slider
                  style={{ width: 200, height: 40 }}
                  minimumValue={1}
                  step={1}
                  value={this.state.raio}
                  maximumValue={50}
                  minimumTrackTintColor="rgba(0,185,85,1.0)"
                  maximumTrackTintColor="rgba(230,230,230,1.0)"
                  thumbProps={{ color: 'rgba(255,255,255, 1.0)' }}
                  thumbStyle={{
                    height: 35,
                    width: 35,
                    borderColor: 'rgba(176,180,187,1.0)',
                    borderWidth: 5,
                  }}
                  onValueChange={value =>
                    this.setState({
                      raio: value,
                    })
                  }
                />
                <Text> 50</Text>
              </View>

              <View style={{ flex: 1 }}></View>
            </View>

            <ListItem
              key={1}
              topDivider
              bottomDivider
              onPress={this.openModalCombustiveis}
            >
              <Icon
                name="local-gas-station"
                color="rgba(94,111,130,1.0)"
                size={18}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.labelItemFiltro}>
                  {this.state.combustivelSelecionado == ''
                    ? 'Combustível'
                    : this.state.combustivelSelecionado}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <Overlay isVisible={this.state.modalCombustivelVisible}>
              <View style={{ height: '90%' }}>
                <Text style={styles.labelTitleModal}>
                  Selecione o combustível
                </Text>

                <View style={{ width: 300, height: '94%', fontSize: 14 }}>
                  <ScrollView>
                    {this.state.chkCombustiveis.map((item, i) => (
                      <CheckBox
                        key={item.id}
                        /*  left={true}  */
                        title={item.title}
                        checkedColor="green"
                        iconType="font-awesome"
                        checkedIcon="check-circle"
                        uncheckedIcon="circle-o"
                        checked={item.checked}
                        onPress={() =>
                          this.toggleCheckboxCombustivel(item.title)
                        }
                      />
                    ))}
                  </ScrollView>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    /*marginTop: 30,*/ marginBottom: 40,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1, paddingLeft: 20, paddingRight: 20 }}
                    onPress={this.closeModalCombustiveis}
                  >
                    <View
                      style={[styles.button, { backgroundColor: '#505b69' }]}
                    >
                      <Text style={styles.buttonText}>OK</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </Overlay>

            <ListItem key={2} bottomDivider onPress={this.openModalBandeiras}>
              <Icon name="flag" color="rgba(94,111,130,1.0)" size={18} />
              <ListItem.Content>
                <ListItem.Title style={styles.labelItemFiltro}>
                  {this.state.bandeirasSelecionadas == ''
                    ? 'Bandeira (Todas)'
                    : this.state.bandeirasSelecionadas}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <Overlay
              isVisible={this.state.modalBandeiraVisible}
              overlayBackgroundColor="white"
            >
              <View style={{ height: '90%' }}>
                <Text style={styles.labelTitleModal}>Selecione a bandeira</Text>

                <View style={{ width: 300, height: '94%', fontSize: 14 }}>
                  <ScrollView>
                    {this.state.chkBandeiras.map((item, i) => (
                      <CheckBox
                        key={item.id}
                        /*   left={true} */
                        title={item.title}
                        checkedColor="green"
                        iconType="font-awesome"
                        checkedIcon="check-circle"
                        uncheckedIcon="circle-o"
                        checked={item.checked}
                        onPress={() => this.toggleCheckboxBandeira(item.title)}
                      />
                    ))}
                  </ScrollView>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginBottom: 40,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1, paddingLeft: 20, paddingRight: 20 }}
                    onPress={this.closeModalBandeiras}
                  >
                    <View
                      style={[styles.button, { backgroundColor: '#505b69' }]}
                    >
                      <Text style={styles.buttonText}>OK</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </Overlay>

            <View style={styles.containerHeader}>
              <Text style={styles.header}>Preferências:</Text>
            </View>

            <View
              style={{ marginTop: 10, padding: 8, backgroundColor: '#FFF' }}
            >
              <Text style={styles.label}>Tela inicial:</Text>
            </View>

            <View
              style={{
                widh: '100%',
                backgroundColor: '#FFF',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={styles.containerPreferencias}>
                <ButtonGroup
                  buttons={['Referência', 'Listagem', 'Mapa']}
                  selectedIndex={this.state.telaInicial}
                  selectedButtonStyle={styles.activeTabStyle}
                  onPress={value => {
                    this.handleIndexChangeTelaInicial(value);
                  }}
                  containerStyle={styles.segmentedControlTab}
                />
              </View>
            </View>

            {/*
                        <View style={{marginTop: 10, padding: 8, backgroundColor: '#FFF'}}>
                            <Text style={styles.label}>Navegador padrão:</Text>
                        </View>

                        <View style={{widh: '100%', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center'}}>
                            <View style={styles.containerPreferencias}>

                                <ButtonGroup
                                    buttons={
                                        (Platform.OS === "ios")
                                        ? ['Waze', 'Google Maps', 'Apple Maps']
                                        : ['Waze', 'Google Maps']
                                    }
                                    selectedIndex={this.state.navegadorPadrao}
                                    selectedButtonStyle={styles.activeTabStyle}
                                    onPress={(value) => { this.handleIndexChangeNavegador(value) }}
                                    containerStyle={styles.segmentedControlTab}
                                />
                            </View>
                        </View>
                        */}
            <View
              style={{ marginTop: 10, padding: 8, backgroundColor: '#FFF' }}
            >
              <Text style={styles.label}>Atualizar localização a cada:</Text>
            </View>

            <View
              style={{
                widh: '100%',
                backgroundColor: '#FFF',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={styles.containerPreferencias}>
                <ButtonGroup
                  buttons={['1 min', '3 min', '5 min', 'Nunca']}
                  selectedIndex={this.state.tempoAtualizacao}
                  onPress={value => {
                    this.handleIndexChangeAtualizacao(value);
                  }}
                  containerStyle={styles.segmentedControlTab}
                  selectedButtonStyle={styles.activeTabStyle}
                />
                {/*
                                <SegmentedControlTab
                                    tabsContainerStyle={styles.segmentedControlTab}
                                    tabStyle={styles.tabStyle}
                                    activeTabStyle={styles.activeTabStyle}
                                    tabTextStyle={styles.tabTextStyle}
                                    values={['1 min', '3 min', '5 min', 'Nunca']}
                                    selectedIndex={this.state.tempoAtualizacao}
                                    onTabPress={this.handleIndexChangeAtualizacao}
                                />
                                */}
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 30,
                marginBottom: 40,
              }}
            >
              <TouchableOpacity
                style={{ flex: 1, paddingLeft: 20 }}
                onPress={this.back}
              >
                <View style={[styles.button, { backgroundColor: '#505b69' }]}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingRight: 20 }}
                onPress={this.save}
              >
                <View
                  style={[
                    styles.button,
                    { backgroundColor: 'rgba(94,111,130,1.0)' },
                  ]}
                >
                  <Text style={styles.buttonText}>Salvar</Text>
                </View>
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
                    reverse={true}
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
          </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: 'rgba(239,239,244,1.0)',
  },
  containerHeader: {
    marginTop: 20,
  },
  containerRaio: {
    //flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF',
    marginTop: 10,
  },
  containerSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    //backgroundColor: '#FFF',
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
    marginTop: 10,
  },
  containerBandeira: {
    padding: 8,
    backgroundColor: '#FFF',
    marginTop: 10,
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
    fontSize: 12,
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
  labelItemFiltro: {
    fontSize: 14,
    color: '#000',
  },
  labelItemModal: {
    fontSize: 14,
    color: '#000',
  },
  labelTitleModal: {
    fontSize: 15,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 10,
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
