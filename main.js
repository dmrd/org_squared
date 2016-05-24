/**
 * Entry point for org_squared app
 */
'use strict';

let React = require('react-native');
import { Provider } from 'react-redux';
import { createStore } from 'redux';
let {
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  View
} = React;

let Org = require('./org/org');
let ExScreen = require('./ExScreen');
let OrgView = require('./OrgView');

let HORIZ_SPACE = 12;

function OrgSquared() {
  const store = createStore(OrgView.orgAction);
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
  },
  sectionTitle: {
    color: '#777',
    fontSize: 22,
    fontWeight: '300',
    marginTop: 16,
    marginHorizontal: HORIZ_SPACE
  },
  paragraph: {
    color: '#000',
    fontSize: 16,
    marginTop: 8,
    marginHorizontal: HORIZ_SPACE
  },
  note: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: HORIZ_SPACE
  },
  code: {
    fontFamily: 'Menlo',
    fontSize: 15
  },
  gallery: {
    flex: 0,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12
  },
  boxes: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12
  },
  attribution: {
    color: '#999',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 18,
    marginHorizontal: HORIZ_SPACE
  },
  exponent: {
    color: '#777',
    fontWeight: '200',
    letterSpacing: 3
  },
});

AppRegistry.registerComponent('main', () => OrgSquared);
