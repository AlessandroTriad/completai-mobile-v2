import { Component } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import Header from '../componentes/Header';
import { termosUso_semlogo } from '../constants';

const { width, height } = Dimensions.get('window');

export default class Termos extends Component {
  state = {
    visible: true,
    layoutReferencia: {
      color_background: '#2c4152',
      gradient_color: '#495c72;#b7bcc2',
      color_header: '#2c4152',
      color_menu_bar: '#2c4152',
    },
  };

  componentDidMount = async () => {};

  openMenu = () => {
    this.props.navigation.openDrawer();
  };

  hideSpinner() {
    this.setState({ visible: false });
  }

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
            buttonFiltro={false}
            buttonMenu={true}
            openMenu={this.openMenu}
          />
          <WebView
            source={{ uri: termosUso_semlogo }}
            onLoad={() => this.hideSpinner()}
            style={{
              backgroundColor: '#rgba(21,47,63,1.0)',
            }}
          />
          {this.state.visible && (
            <View style={[styles.containerActivity]}>
              <ActivityIndicator size="large" color="#rgba(0, 0, 0, 0.9)" />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
