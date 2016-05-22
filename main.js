/**
 * Entry point for org_squared app
 */
'use strict';

let Org = require('./org/org');
let Parser = require('./org/org_parser');
let React = require('react-native');
let {
  Animated,
  AppRegistry,
  Easing,
  Image,
  ScrollView,
  StatusBarIOS,
  StyleSheet,
  Text,
  View,
} = React;

let ExScreen = require('./ExScreen');

let HORIZ_SPACE = 12;

class OrgSquared extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      headerColor: '#007aff',
      doc: Parser.parse("** 1\n section 1\n*** 2\n* 3\n section 3\n has \n several \n lines")
    };
  }

  render() {
    return (
      <ExScreen
        title="org_squared"
        headerColor={this.state.headerColor}
        scrollEnabled={!this.state.isBoxPressed}
        style={styles.container}>

        {/* Try editing this text and reloading your project in Exponent */}
        <Text style={styles.paragraph}>
        Look!  I can make an app!
        </Text>
      </ExScreen>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    color: '#777',
    fontSize: 22,
    fontWeight: '300',
    marginTop: 16,
    marginHorizontal: HORIZ_SPACE,
  },
  paragraph: {
    color: '#000',
    fontSize: 16,
    marginTop: 8,
    marginHorizontal: HORIZ_SPACE,
  },
  note: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: HORIZ_SPACE,
  },
  code: {
    fontFamily: 'Menlo',
    fontSize: 15,
  },
  gallery: {
    flex: 0,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  boxes: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  attribution: {
    color: '#999',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 18,
    marginHorizontal: HORIZ_SPACE,
  },
  exponent: {
    color: '#777',
    fontWeight: '200',
    letterSpacing: 3,
  },
});

AppRegistry.registerComponent('main', () => OrgSquared);
