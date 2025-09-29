import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from '@rneui/themed';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import imgReferencia from '../../assets/images/imgResumo_menu.png';
//import logo from '../../assets/images/logo_completai.png';
//import commonStyles from '../commonStyles';
import Abertura from '../screens/Abertura';
import CapturaPlacarPreco from '../screens/CapturaPlacarPreco';
import DetalhesPosto from '../screens/DetalhesPosto';
import Inicio from '../screens/Inicio';
import ListaFavoritos from '../screens/ListaFavoritos';
import ListaPostos from '../screens/ListaPostos';
import MapaPostos from '../screens/MapaPostos';
import Preferencias from '../screens/Preferencias';
import Referencia from '../screens/Referencia';
import Termos from '../screens/Termos';

const height = Dimensions.get('window').height;
/*
function ReferenciaScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Referencia</Text>
    </View>
  );
}
*/

/*
function HeaderLogo() {

  return (
    <View style={styles.container}>
        <Image source={logo} style={styles.image} />
    </View>
  );
}
*/
/*
function ButtonPreferencias(navigation) {

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonFiltro} onPress={() => {
            navigation.navigate("Preferencias");
          }}>
        <Icon name="cog" type="font-awesome" size={22} color="#c9c9c9" style={{paddingLeft: 5}}/>
      </TouchableOpacity>
    </View>
  );
}
*/
/*
function ButtonMenu(navigation) {

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonMenu} onPress={() => {
            navigation.openDrawer();
          }}>
        <Icon name="bars" type="font-awesome" size={22} color="#c9c9c9" style={{paddingLeft: 10}}/>
      </TouchableOpacity>
    </View>
  );
}
*/
/*
function ButtonBack(navigation) {

  const lastScreen = AsyncStorage.getItem('lastScreen')
  
  console.log("lastScreen: " + AsyncStorage.getItem('lastScreen'))

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonBack} onPress={() => { navigation.navigate(lastScreen); }}>
        <Icon name="chevron-left" type="font-awesome" size={22} color="#c9c9c9" style={{paddingLeft: 10}}/>
      </TouchableOpacity>
    </View>
  );
}
*/
/*
function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        onPress={() => navigation.getParent('LeftDrawer').openDrawer()}
        title="Open left drawer"
      />
      <Button
        onPress={() => navigation.getParent('RightDrawer').openDrawer()}
        title="Open right drawer"
      />
    </View>
  );
}
*/

/*
function DetalhesPostoScreen({ navigation }) {

  return (
    <DetalhesPosto {...navigation} />
  );
}
*/

const pkg = require('../../package.json');

function CustomDrawerContent(props) {
  const { navigation } = props;
  let state = navigation.getState();
  const width = useWindowDimensions().width * 0.3;

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        name="Referencia"
        icon={({ focused, color, size }) => (
          <Image
            source={imgReferencia}
            style={{ width: 30, height: 30, resizeMode: 'contain' }}
          />
        )}
        style={{ width: 300 }}
        label={({ focused, color }) => (
          <Text
            style={{
              fontWeight: 'normal',
              fontSize: 15,
              left: -15,
              color: focused ? '#e4c952' : 'white',
              fontWeight: focused ? 'bold' : 'normal',
            }}
          >
            Referência
          </Text>
        )}
        activeTintColor="white"
        focused={state.routes[state.index].name === 'Referencia'}
        onPress={() => {
          props.navigation.navigate('Referencia');
        }}
      />

      <DrawerItem
        name="ListaPostos"
        icon={({ focused, color, size }) => (
          <Icon
            name="list"
            type="font-awesome"
            size={23}
            color="#c9c9c9"
            style={{ paddingLeft: 5 }}
          />
        )}
        label={({ focused, color }) => (
          <Text
            style={{
              fontWeight: 'normal',
              fontSize: 15,
              left: -15,
              color: focused ? '#e4c952' : 'white',
              fontWeight: focused ? 'bold' : 'normal',
            }}
          >
            Listagem de Postos
          </Text>
        )}
        activeTintColor="white"
        focused={state.routes[state.index].name === 'ListaPostos'}
        onPress={() => {
          props.navigation.navigate('ListaPostos');
        }}
      />

      <DrawerItem
        name="MapaPostos"
        icon={({ focused, color, size }) => (
          <Icon
            name="map-o"
            type="font-awesome"
            size={22}
            color="#c9c9c9"
            style={{ paddingLeft: 5 }}
          />
        )}
        label={({ focused, color }) => (
          <Text
            style={{
              fontWeight: 'normal',
              fontSize: 15,
              left: -15,
              color: focused ? '#e4c952' : 'white',
              fontWeight: focused ? 'bold' : 'normal',
            }}
          >
            Mapa da Região
          </Text>
        )}
        activeTintColor="white"
        focused={state.routes[state.index].name === 'MapaPostos'}
        onPress={() => {
          props.navigation.navigate('MapaPostos');
        }}
      />

      <DrawerItem
        name="ListaFavoritos"
        icon={({ focused, color, size }) => (
          <Icon
            name="star"
            type="font-awesome"
            size={22}
            color="#c9c9c9"
            style={{ paddingLeft: 5 }}
          />
        )}
        label={({ focused, color }) => (
          <Text
            style={{
              fontWeight: 'normal',
              fontSize: 15,
              left: -15,
              color: focused ? '#e4c952' : 'white',
              fontWeight: focused ? 'bold' : 'normal',
            }}
          >
            Meus Favoritos
          </Text>
        )}
        activeTintColor="white"
        focused={state.routes[state.index].name === 'ListaFavoritos'}
        onPress={() => {
          props.navigation.navigate('ListaFavoritos');
        }}
      />

      <DrawerItem
        name="Preferencias"
        icon={({ focused, color, size }) => (
          <Icon
            name="cog"
            type="font-awesome"
            size={22}
            color="#c9c9c9"
            style={{ paddingLeft: 5 }}
          />
        )}
        label={({ focused, color }) => (
          <Text
            style={{
              fontWeight: 'normal',
              fontSize: 15,
              left: -15,
              color: focused ? '#e4c952' : 'white',
              fontWeight: focused ? 'bold' : 'normal',
            }}
          >
            Preferências
          </Text>
        )}
        activeTintColor="white"
        focused={state.routes[state.index].name === 'Preferencias'}
        onPress={() => {
          props.navigation.navigate('Preferencias');
        }}
      />

      <DrawerItem
        name="TermosUso"
        icon={({ focused, color, size }) => (
          <Icon
            name="file-o"
            type="font-awesome"
            size={22}
            color="#c9c9c9"
            style={{ paddingLeft: 5 }}
          />
        )}
        label={({ focused, color }) => (
          <Text
            style={{
              fontWeight: 'normal',
              fontSize: 15,
              left: -15,
              color: focused ? '#e4c952' : 'white',
              fontWeight: focused ? 'bold' : 'normal',
            }}
          >
            Termos de Uso
          </Text>
        )}
        activeTintColor="white"
        focused={state.routes[state.index].name === 'TermosUso'}
        onPress={() => {
          props.navigation.navigate('TermosUso');
        }}
      />

      <View style={styles.version}>
        <Text
          style={{
            fontSize: 10,
            color: '#fff',
            paddingLeft: 25,
            paddingVertical: height - 380,
          }}
        >
          v{pkg.version}
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

const MenuDrawer = createDrawerNavigator();
const Stack = createStackNavigator();

function StackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Abertura"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Abertura" component={Abertura} />
      <Stack.Screen name="Inicio" component={Inicio} />
      <Stack.Screen name="Menu" component={MenuDrawerScreen} />
    </Stack.Navigator>
  );
}

/*
function StackNavigationLista() {

  const lastScreen = AsyncStorage.getItem('lastScreen')

  return (
    <Stack.Navigator
      initialRouteName={lastScreen}
      screenOptions={{
        headerShown: false,
      }}      
    >
      <Stack.Screen name="ListaPostosScreen" component={ListaPostos} />
      <Stack.Screen name="DetalhesPosto" component={DetalhesPosto} />
      <Stack.Screen name="CapturaPlacarPreco" component={CapturaPlacarPreco} />
    </Stack.Navigator>
  );
}
*/

/*
function StackNavigationFavoritos() {

  //const lastScreen = AsyncStorage.getItem('lastScreen')

  return (
    <Stack.Navigator
      //initialRouteName={lastScreen}
      screenOptions={{
        headerShown: false,
      }}      
    >
      <Stack.Screen name="ListaFavoritosScreen" component={ListaFavoritos} />
      <Stack.Screen name="DetalhesPosto" component={DetalhesPosto} />
      <Stack.Screen name="CapturaPlacarPreco" component={CapturaPlacarPreco} />
    </Stack.Navigator>
  );
}
*/

/*
function StackNavigationMapa() {

  const lastScreen = AsyncStorage.getItem('lastScreen')

  return (
    <Stack.Navigator
      initialRouteName={lastScreen}
      screenOptions={{
        headerShown: false,
      }}      
    >
      <Stack.Screen name="MapaScreen" component={MapaPostos} />
      <Stack.Screen name="DetalhesPosto" component={DetalhesPosto} />
      <Stack.Screen name="CapturaPlacarPreco" component={CapturaPlacarPreco} />
    </Stack.Navigator>
  );
}
*/

function MenuDrawerScreen() {
  return (
    <MenuDrawer.Navigator
      initialRouteName="ListaPostos"
      drawerContent={props => <CustomDrawerContent {...props} />}
      id="MenuDrawer"
      screenOptions={({ navigation, route }) => ({
        headerShown: false,
        headerStyle: {
          backgroundColor: '#2c4152',
        },
        drawerPosition: 'left',
        drawerStyle: { backgroundColor: '#505b69' },
      })}
    >
      <MenuDrawer.Screen name="Referencia" component={Referencia} />
      <MenuDrawer.Screen name="ListaPostos" component={ListaPostos} />
      <MenuDrawer.Screen name="MapaPostos" component={MapaPostos} />
      <MenuDrawer.Screen name="ListaFavoritos" component={ListaFavoritos} />
      <MenuDrawer.Screen name="Preferencias" component={Preferencias} />
      <MenuDrawer.Screen name="TermosUso" component={Termos} />
      <MenuDrawer.Screen name="DetalhesPosto" component={DetalhesPosto} />
      <MenuDrawer.Screen
        name="CapturaPlacarPreco"
        component={CapturaPlacarPreco}
      />
    </MenuDrawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c4152',
  },
  menuItemsCard: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  circleContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    padding: 10,
  },
  buttonMenu: {
    alignItems: 'center',
    marginLeft: 5,
    width: 30,
  },
  buttonBack: {
    alignItems: 'center',
    marginLeft: 5,
    width: 30,
  },
  buttonFiltro: {
    alignItems: 'center',
    marginRight: 10,
    width: 30,
  },
  image: {
    height: 36,
    resizeMode: 'contain',
    width: 167,
    flex: 2,
    alignItems: 'center',
  },
  version: {
    flex: 1,
    alignItems: 'flex-start',
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigation />
    </NavigationContainer>
  );
}
