import { Icon } from '@rneui/themed';
import { Component } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import logo from '../../assets/images/logo_completai.png';
import commonStyles from '../commonStyles';

const windowWidth = Dimensions.get('window').width;
const widthRef = 375;
const sizeButtonRef = 24;
const sizeButtonFiltroRef = 22;

export default class Header extends Component {
  displayButton = function (isVisibleButton) {
    return {
      display: isVisibleButton ? 'flex' : 'none',
    };
  };

  render() {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: this.props.backgroundColor },
        ]}
      >
        <View style={styles.rowContainer}>
          <View
            style={[
              styles.buttonMenu,
              this.displayButton(
                !this.props.buttonMenu && !this.props.buttonBack,
              ),
            ]}
          ></View>

          <TouchableOpacity
            style={[
              styles.buttonMenu,
              this.displayButton(this.props.buttonMenu),
            ]}
            onPress={this.props.openMenu}
          >
            <Icon
              name="bars"
              type="font-awesome"
              size={(windowWidth * sizeButtonRef) / widthRef}
              color={commonStyles.colors.iconItem}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonBack,
              this.displayButton(this.props.buttonBack),
            ]}
            onPress={this.props.openBack}
          >
            <Icon
              name="chevron-left"
              type="font-awesome"
              size={(windowWidth * sizeButtonRef) / widthRef}
              color={commonStyles.colors.iconItem}
            />
          </TouchableOpacity>

          <Image source={logo} style={styles.image} />

          <View
            style={[
              styles.buttonFiltro,
              this.displayButton(!this.props.buttonFiltro),
            ]}
          ></View>
          <TouchableOpacity
            style={[
              styles.buttonFiltro,
              this.displayButton(this.props.buttonFiltro),
            ]}
            onPress={this.props.openFiltro}
          >
            <Icon
              name="cog"
              type="font-awesome"
              size={(windowWidth * sizeButtonFiltroRef) / widthRef}
              color={
                this.props.buttonFiltroActive
                  ? commonStyles.colors.iconItemSelected
                  : commonStyles.colors.iconItem
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonMenu: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 10,
    width: 30,
    marginTop: 5,
  },
  buttonBack: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 10,
    width: 30,
    marginTop: 5,
  },
  buttonFiltro: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 10,
    width: 30,
    marginTop: 5,
  },
  image: {
    height: 36,
    resizeMode: 'contain',
    marginTop: 5,
    width: 167,
    flex: 2,
    alignItems: 'center',
  },
});
