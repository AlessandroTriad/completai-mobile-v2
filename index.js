/**
 * @format
 */
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import Navigator from './src/navigation/Navigator';

AppRegistry.registerComponent(appName, () => Navigator);
