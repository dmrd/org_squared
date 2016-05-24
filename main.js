/**
 * Entry point for org_squared app
 */
'use strict';

import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
let React = require('react-native');
let {
  AppRegistry,
  StyleSheet,
} = React;

let ExScreen = require('./ExScreen');
let OrgView = require('./OrgView');

function OrgSquared() {
  const store = createStore(combineReducers({
    doc: OrgView.orgAction
  }));
  return (
    <Provider store={store}>
      <ExScreen
        title="org_squared"
        scrollEnabled={true}
        style={styles.container}>
        <OrgView.DocNode />
      </ExScreen>
    </Provider>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

AppRegistry.registerComponent('main', () => OrgSquared);
