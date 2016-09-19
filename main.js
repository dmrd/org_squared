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
  createRouter,
  NavigationProvider,
  StackNavigation,
} from '@exponent/ex-navigation';
import {
  FontAwesome,
} from '@exponent/vector-icons';

import { connect, Provider as ReduxProvider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

let OrgView = require('./OrgView.js');

const Router = createRouter(() => ({
  outline: () => OrgView.OutlineView,
}));

const OrgStore = createStore(combineReducers({
  doc: OrgView.orgAction,
  focus: OrgView.focus
}));

class AppContainer extends React.Component {
  render() {
    return (
      <ReduxProvider store={OrgStore}>
        <NavigationProvider router={Router}>
          <App />
        </NavigationProvider>
      </ReduxProvider>
    );
  }
}

@withNavigation
class App extends React.Component {
  state = {
    appIsReady: true,
  }

  render() {

    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}

        <StackNavigation
          id="root"
          initialRoute={Router.getRoute('outline')}
        />
      </View>
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
