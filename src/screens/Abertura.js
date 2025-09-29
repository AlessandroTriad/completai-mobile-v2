import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Component } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import logo from '../../assets/images/logo_completai.png';

const timer = 3000;
var timerId;

class Abertura extends Component {
  _isMounted = false;

  state = {
    userData: {},
    preferenceData: {},
    filterData: {},
    orderData: {},
  };

  componentDidMount = async () => {
    _isMounted = true;

    this.props.navigation.addListener('focus', async () => {
      await this.obterDadosArmazenados();
      await this.goToTelaInicio();
    });

    this.props.navigation.addListener('blur', async () => {
      clearInterval(timerId);
    });

    if (_isMounted) {
      await this.obterDadosArmazenados();
      await this.goToTelaInicio();
    }
  };

  componentWillUnmount = async () => {
    _isMounted = false;
    clearInterval(timerId);
  };

  obterDadosArmazenados = async () => {
    let pref = {
      telaInicial: 1,
      navegadorPadrao: 0,
      tempoAtualizacao: 0,
    };

    let filter = {
      raio: '10.0',
      combustivel: 'GASOLINA COMUM',
      bandeira: '',
    };

    let order = {
      ordenacao: 'p',
    };

    let userData = {
      token: '',
    };

    //---------------------------------------------------------------------
    try {
      const jsonPrefer = await AsyncStorage.getItem('preferenceData');

      if (jsonPrefer !== null) {
        pref = JSON.parse(jsonPrefer) || {};
      } else {
        await AsyncStorage.setItem('preferenceData', JSON.stringify(pref));
      }

      const jsonFiltro = await AsyncStorage.getItem('filterData');
      if (jsonFiltro !== null && jsonFiltro != undefined) {
        filter = JSON.parse(jsonFiltro) || {};
      } else {
        await AsyncStorage.setItem('filterData', JSON.stringify(filter));
      }

      const jsonOrderData = await AsyncStorage.getItem('orderData');
      if (jsonOrderData !== null && jsonOrderData != undefined) {
        order = JSON.parse(jsonOrderData) || {};
      } else {
        await AsyncStorage.setItem('orderData', JSON.stringify(order));
      }

      const jsonUserData = await AsyncStorage.getItem('userData');
      if (jsonUserData !== null) {
        userData = JSON.parse(jsonUserData) || {};
      }
    } catch (e) {
      // error
    }
    //---------------------------------------------------------------------

    this.setState({
      userData: userData,
      preferenceData: pref,
      filterData: filter,
      orderData: order,
    });
  };

  goToTelaInicio = async () => {
    if (Platform.OS != 'ios') {
      timerId = setTimeout(() => this.openInicio(), timer);
    } else {
      this.openInicio();
    }
  };

  openInicio = async () => {
    if (this.state.userData.token && this.state.userData.token != '') {
      if (this.state.preferenceData.telaInicial === 0) {
        this.props.navigation.navigate('Menu', { telaInicial: 'Referencia' });
        this.setState({ loading: false }, this.openReferencia);
      } else if (this.state.preferenceData.telaInicial === 1) {
        this.props.navigation.navigate('Menu', { telaInicial: 'ListaPostos' });
      } else if (this.state.preferenceData.telaInicial === 2) {
        this.props.navigation.navigate('Menu', { telaInicial: 'MapaPostos' });
      } else {
        //Default
        this.props.navigation.navigate('Menu', { telaInicial: 'ListaPostos' });
      }
    } else {
      this.props.navigation.navigate('Inicio');
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Image
          source={logo}
          style={[
            styles.logo,
            { display: Platform.OS === 'ios' ? 'none' : 'flex' },
          ]}
        />
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c4152',
  },
  logo: {
    width: '80%',
    resizeMode: 'contain',
  },
});

// Wrap and export
export default function (props) {
  const navigation = useNavigation();

  return <Abertura {...props} navigation={navigation} />;
}
