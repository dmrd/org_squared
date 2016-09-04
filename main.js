/** In order for logging to stream to XDE or the exp CLI you must import the
  * exponent module at some point in your app */
import Exponent from 'exponent';

import React from 'react';
import {
  AppRegistry,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  createRouter,
  NavigationProvider,
  StackNavigation,
} from '@exponent/ex-navigation';
import {
  FontAwesome,
} from '@exponent/vector-icons';

// import Router from './navigation/Router';
// import cacheAssetsAsync from './utilities/cacheAssetsAsync';

import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
let OrgView = require('./OrgView');


const Router = createRouter(() => ({
  home: () => OrgView.EntryView,
}));

class AppContainer extends React.Component {
  state = {
    appIsReady: true,
    // appIsReady: false,
  }

  // componentWillMount() {
  //   this._loadAssetsAsync();
  // }

  // async _loadAssetsAsync() {
  //   await cacheAssetsAsync({
  //     images: [
  //       require('./assets/images/exponent-wordmark.png'),
  //     ],
  //     fonts: [
  //       FontAwesome.font,
  //       {'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf')},
  //     ],
  //   });

  //   this.setState({appIsReady: true});
  // }

  render() {
    if (this.state.appIsReady) {
      let { notification } = this.props.exp;
      const store = createStore(combineReducers({
        doc: OrgView.orgAction,
        focus: OrgView.focus
      }));

      return (
        <View style={styles.container}>
          <Provider store={store}>
          <NavigationProvider router={Router}>
            <StackNavigation
              id="root"
              initialRoute={Router.getRoute('home')}
            />
          </NavigationProvider>

          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          </Provider>
        </View>
      );

    } else {
      return <Exponent.Components.AppLoading />;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

AppRegistry.registerComponent('main', () => AppContainer);
