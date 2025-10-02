import { Badge } from '@rneui/themed';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';

const windowWidth = Dimensions.get('window').width;
const widthRef = 375;
const fontSizePreco = 22;
const fontSizeRS = 11;
const fontSizeAtualizacao = 12;
const fontSizeDistancia = 11;
const fontSizeNomePosto = 12;
const fontSizeEndereco = 10;
const fontSizeLabelBandeira = 11;

export default props => {
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

  return (
    <View style={[styles.container, this.displayPadding(!props.isItemMapa)]}>
      <View
        style={[styles.containerItem, this.displayShadow(!props.isItemMapa)]}
      >
        <View style={styles.containerDetail}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '70%' }}>
              <Text numberOfLines={1} style={styles.nomePosto}>
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
          <Text numberOfLines={2} style={styles.endereco}>
            {props.logradouro} - {props.bairro} - {props.cidade}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.labelBandeira}>Bandeira:</Text>
            <Text style={styles.labelDescBandeira}>{props.bandeira}</Text>
          </View>
          {Platform.OS == 'ios' && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginTop: 5,
                marginBottom: 3,
              }}
            >
              <AirbnbRating
                size={11}
                isDisabled={true}
                showRating={false}
                defaultRating={props.rating}
                starStyle={{ margin: 1 }}
              />

              <Text style={{ fontSize: 11, marginLeft: 3, color: '#bbb' }}>
                {`(` + props.reviews + `)`}
              </Text>
            </View>
          )}
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
              <Text
                style={[
                  styles.preco,
                  { color: !props.isTopLista ? '#305fa5' : '#d04042' },
                ]}
              >
                {props.preco != undefined ? props.preco : ''}
              </Text>
            </View>
            <Text style={[styles.atualizacao, { color: props.colorData }]}>
              {props.data}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.favoritoForaRaio,
          { display: props.foraDoRaio ? 'flex' : 'none' },
        ]}
      >
        <Text style={styles.lblFavoritoForaRaio}>
          Posto favorito fora do raio
        </Text>
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
    //height: 95,
  },
  labelBandeira: {
    fontSize: (windowWidth * fontSizeLabelBandeira) / widthRef,
    paddingTop: 3,
  },
  labelDescBandeira: {
    fontSize: (windowWidth * fontSizeLabelBandeira) / widthRef,
    paddingTop: 3,
    fontWeight: 'bold',
    paddingLeft: 3,
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
    width: '68%',
    paddingTop: 3,
    paddingRight: 3,
    paddingLeft: 3,
  },
  containerRight: {
    width: '32%',
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
