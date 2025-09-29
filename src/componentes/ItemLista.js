import { AirbnbRating, Badge, Icon } from '@rneui/themed';
import { PureComponent } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import logoAle from '../../assets/images/ALE.png';
import logoBr from '../../assets/images/BR.png';
import logoIpiranga from '../../assets/images/IPIRANGA.png';
import logoOutras from '../../assets/images/OUTRAS.png';
import logoRodoil from '../../assets/images/RODOIL.png';
import logoShell from '../../assets/images/SHELL.png';

const windowWidth = Dimensions.get('window').width;
const widthRef = 375;
const widthLogoBandeira = 35;
const fontSizePreco = 22;
const fontSizeRS = 11;
const fontSizeAtualizacao = 12;
const fontSizeDistancia = 11;
const fontSizeNomePosto = 12;
const fontSizeEndereco = 10;

export default class ItemLista extends PureComponent {
  //export default this.props => {

  constructor(props) {
    super(props);
  }

  displayShadow = function (isItemLista) {
    if (isItemLista) {
      return {
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      };
    }
  };

  displayPadding = function (isItemLista) {
    if (isItemLista) {
      return {
        paddingTop: 5,
        paddingBottom: 5,
      };
    }
  };

  render() {
    return (
      <TouchableOpacity onPress={() => this.props.onSelect(this.props)}>
        <View style={[styles.container]}>
          <View
            style={[
              this.displayShadow(!this.props.isItemMapa),
              this.displayPadding(!this.props.isItemMapa),
            ]}
          >
            <View style={styles.containerItem}>
              <View style={styles.containerLogo}>
                <Image
                  source={
                    this.props.bandeira === 'BR'
                      ? logoBr
                      : this.props.bandeira === 'SHELL'
                      ? logoShell
                      : this.props.bandeira === 'ALE'
                      ? logoAle
                      : this.props.bandeira === 'IPIRANGA'
                      ? logoIpiranga
                      : this.props.bandeira === 'RODOIL'
                      ? logoRodoil
                      : logoOutras
                  }
                  style={[
                    styles.image,
                    { display: this.props.displayLogo ? 'flex' : 'none' },
                  ]}
                />
                <Text style={styles.labelBandeira}>{this.props.bandeira}</Text>
                <Icon
                  style={{
                    marginTop: 8,
                    marginBottom: 7,
                    opacity: this.props.isFavorito ? 1.0 : 0.0,
                  }}
                  type="font-awesome"
                  name={'heart'}
                  size={22}
                  color="rgba(250,206,0,1.0)"
                />
              </View>
              <View style={styles.containerDetail}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: '70%' }}>
                    <Text numberOfLines={1} style={styles.nomePosto}>
                      {this.props.nomePosto}
                    </Text>
                  </View>
                  <View style={{ paddingLeft: 15, alignItems: 'flex-end' }}>
                    <Badge
                      textStyle={{
                        fontSize: (windowWidth * fontSizeDistancia) / widthRef,
                      }}
                      value={this.props.distancia}
                    />
                  </View>
                </View>
                <Text numberOfLines={2} style={styles.endereco}>
                  {this.props.endereco}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 5,
                    marginBottom: 15,
                  }}
                >
                  <AirbnbRating
                    size={11}
                    isDisabled={true}
                    showRating={false}
                    defaultRating={this.props.rating}
                    starStyle={{ margin: 1 }}
                  />
                  <Text style={{ fontSize: 11, marginLeft: 3, color: '#bbb' }}>
                    {`(` + this.props.reviews + `)`}
                  </Text>
                </View>
              </View>

              <View style={styles.containerRight}>
                <View style={styles.containerInnerRight}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        paddingTop: 3,
                        fontSize: (windowWidth * fontSizeRS) / widthRef,
                      }}
                    >
                      R$
                    </Text>
                    <Text style={[styles.preco, { color: '#305fa5' }]}>
                      {this.props.preco}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.atualizacao,
                      { color: this.props.colorData },
                    ]}
                  >
                    {this.props.atualizacao}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.favoritoForaRaio,
                { display: this.props.isForaDoRaio ? 'flex' : 'none' },
              ]}
            >
              <Text style={styles.lblFavoritoForaRaio}>
                Posto favorito fora do raio
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#edede4',
  },
  containerItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    //height: 110,
  },
  containerLogo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingLeft: 3,
    width: '15%',
  },
  favoritoForaRaio: {
    flexDirection: 'row',
    backgroundColor: 'rgba(247,247,247,1.0)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
    paddingBottom: 3,
  },
  lblFavoritoForaRaio: {
    textAlign: 'center',
    fontSize: 10,
  },
  labelBandeira: {
    fontSize: 8,
    backgroundColor: '#d9d9d8',
    paddingTop: 3,
    paddingBottom: 3,
    marginTop: 3,
    marginLeft: 2,
    marginRight: 2,
    width: 45,
    textAlign: 'center',
  },
  image: {
    width: (windowWidth * widthLogoBandeira) / widthRef,
    height: (windowWidth * widthLogoBandeira) / widthRef,
  },
  nomePosto: {
    fontSize: (windowWidth * fontSizeNomePosto) / widthRef,
    color: '#000',
    fontWeight: 'bold',
    //height: 38,
  },
  endereco: {
    fontSize: (windowWidth * fontSizeEndereco) / widthRef,
    color: '#898888',
    paddingVertical: 2,
  },
  atualizacao: {
    fontSize: (windowWidth * fontSizeAtualizacao) / widthRef,
    paddingVertical: 2,
    textAlign: 'center',
  },
  containerDetail: {
    width: '56%',
    paddingTop: 8,
    paddingRight: 6,
    paddingLeft: 3,
  },
  containerRight: {
    width: '26%',
    paddingVertical: 7,
  },
  containerInnerRight: {
    paddingLeft: 7,
    flex: 1,
    justifyContent: 'center',
    borderLeftColor: '#cecece',
    borderLeftWidth: 1,
    alignItems: 'center',
  },
  preco: {
    fontSize: (windowWidth * fontSizePreco) / widthRef,
    fontWeight: 'bold',
    paddingHorizontal: 2,
    textAlign: 'right',
  },
  favorito: {
    flex: 1,
    backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
