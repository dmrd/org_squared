/**
 * Entry point for org_squared app
 */
'use strict';

let Org = require('./org/org');
let Parser = require('./org/org_parser');
let React = require('react-native');
let {
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  View
} = React;

let OrgView = require('./OrgView');

let ExScreen = require('./ExScreen');

let HORIZ_SPACE = 12;

class OrgSquared extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      headerColor: '#007aff',
      doc: Parser.parse(
        "* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1"
      )
    };
  }

  render() {
    return (
      <ExScreen
          title="org_squared"
          headerColor={this.state.headerColor}
          scrollEnabled={!this.state.isBoxPressed}
      style={styles.container}>
        <OrgView doc={this.state.doc} />
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
