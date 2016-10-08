/** In order for logging to stream to XDE or the exp CLI you must import the
  * exponent module at some point in your app */
import React from 'react';
import Exponent from 'exponent';

import {
  AppRegistry,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  withNavigation,
  NavigationProvider,
  StackNavigation,
  NavigationContext,
  createNavigationEnabledStore, NavigationReducer,
  DrawerNavigation,
  DrawerNavigationItem,
} from '@exponent/ex-navigation';
import {
  FontAwesome,
} from '@exponent/vector-icons';
import { MenuContext } from 'react-native-menu';

import { connect, Provider as ReduxProvider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import makeFlagReducer from 'redux-flag-reducer';

import { Router } from './Router';
let OrgView = require('./OrgView');

const createStoreWithNavigation = createNavigationEnabledStore({
  createStore,
  navigationStateKey: 'navigation',
});

const OrgStore = createStoreWithNavigation(
  combineReducers({
    navigation: OrgView.createNavReducer(NavigationReducer),
    doc: OrgView.orgAction,
    focus: OrgView.focusReducer,
    search: OrgView.searchReducer,
    side_menu_flag: OrgView.toggleSideMenuReducer
    //side_menu_flag: makeFlagReducer(true, false, ['SIDE_MENU_ON'], ['SIDE_MENU_OFF'], 'false')
  }));

const navigationContext = new NavigationContext({
  router: Router,
  store: OrgStore
});

class AppContainer extends React.Component {
  render() {
    return (
      <ReduxProvider store={OrgStore}>
        <NavigationProvider context={navigationContext}>
          <App />
        </NavigationProvider>
      </ReduxProvider>
    );
  }
}
 

@withNavigation
class App extends React.Component {
  state = {
    appIsReady: true
  }

  render() {

    return (
      <MenuContext style={{ flex: 1 }}>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}

          <StackNavigation
            id="root"
            initialRoute={Router.getRoute('drawer_menu')}
          />
        </View>
      </MenuContext>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

Exponent.registerRootComponent(AppContainer)
