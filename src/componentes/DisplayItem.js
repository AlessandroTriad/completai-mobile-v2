import { Badge, Icon } from '@rneui/themed';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Rating } from 'react-native-ratings';

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

export default props => {
  const displayShadow = function (isItemLista) {
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

  const displayPadding = function (isItemLista) {
    if (isItemLista) {
      return {
        paddingTop: 5,
        paddingBottom: 5,
      };
    }
  };

  return (
    <View style={[styles.container]}>
      <View
        style={[
          displayShadow(!props.isItemMapa),
          displayPadding(!props.isItemMapa),
        ]}
      >
        <View style={styles.containerItem}>
          {/* Coluna esquerda - Logo, bandeira, coração + rating */}
          <View style={styles.containerLogo}>
            <Image
              source={
                props.bandeira === 'BR'
                  ? logoBr
                  : props.bandeira === 'SHELL'
                  ? logoShell
                  : props.bandeira === 'ALE'
                  ? logoAle
                  : props.bandeira === 'IPIRANGA'
                  ? logoIpiranga
                  : props.bandeira === 'RODOIL'
                  ? logoRodoil
                  : logoOutras
              }
              style={[
                styles.image,
                { display: props.displayLogo ? 'flex' : 'none' },
              ]}
            />

            <Text style={styles.labelBandeira}>{props.bandeira}</Text>

            {/* Coração + Estrelas lado a lado */}
            <View style={styles.favoritoRatingRow}>
              <TouchableOpacity onPress={() => props.onFavorito()}>
                <Icon
                  type="font-awesome"
                  name={props.isFavorito ? 'heart' : 'heart-o'}
                  size={18}
                  color="rgba(250,206,0,1.0)"
                />
              </TouchableOpacity>

              <Rating
                readonly
                startingValue={parseFloat(props.rating) || 0}
                imageSize={12}
                style={{ marginLeft: 6 }}
              />

              <Text style={styles.reviewsText}>({props.reviews || 0})</Text>
            </View>
          </View>

          {/* Coluna central - Detalhes */}
          <View style={styles.containerDetail}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: '70%' }}>
                <Text numberOfLines={3} style={styles.nomePosto}>
                  {props.nomePosto}
                </Text>
              </View>
              <View style={{ paddingLeft: 15, alignItems: 'flex-end' }}>
                <Badge
                  textStyle={{
                    fontSize: (windowWidth * fontSizeDistancia) / widthRef,
                  }}
                  value={props.distancia}
                />
              </View>
            </View>
            <Text numberOfLines={3} style={styles.endereco}>
              {props.endereco}
            </Text>
          </View>

          {/* Coluna direita - Preço */}
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
                  {props.preco}
                </Text>
              </View>
              <Text
                style={[
                  styles.atualizacao,
                  {
                    color: props.colorData === '' ? '#d8a500' : props.colorData,
                  },
                ]}
              >
                {props.atualizacao}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.favoritoForaRaio,
            { display: props.isForaDoRaio ? 'flex' : 'none' },
          ]}
        >
          <Text style={styles.lblFavoritoForaRaio}>
            Posto favorito fora do raio
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#edede4',
  },
  containerItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
  },
  containerLogo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingLeft: 3,
    width: '25%', // dá mais espaço, mas sem espremê-lo
  },
  favoritoRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  reviewsText: {
    fontSize: 11,
    marginLeft: 3,
    color: '#bbb',
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
    width: '49%', // ligeiramente maior que antes
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
});
