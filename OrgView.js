let Org = require('./org/org')
let React = require('react-native');

let {
  Text,
  View,
} = React;

class OrgView extends React.Component {
  constructor(props) {
    let {doc} = props;
    super(props)
    this.state = doc;
  }

  renderChildren(cursor) {
    const nodes = [];
    let node = Org.getChild(cursor, 0);
    let i = 0;
    while (node !== undefined) {
      if (node.meta['hidden'] == undefined) {
        nodes.push(this.renderNode(node, i));
      }
      node = Org.nextSibling(node);
      i += 1;
    }
    return nodes;
  }

  renderNode(cursor, i) {
    return (
        <View key={i}>
        <Text>
        {cursor.content}
      </Text>
        <View style={styles.children}>
        {this.renderChildren(cursor)}
        </View>
        </View>
    );
  }

  render() {
    return (
        <View style={styles.tree}>
        {this.renderChildren(this.state)}
      </View>
    );
  }

}

const styles = {
  tree: {
    padding: 10
  },
  rootnode: {
    paddingBottom: 10,
  },
  node: {
    paddingTop: 10
  },
  item: {
    flexDirection: 'row',
  },
  children: {
    paddingLeft: 20
  },
  icon: {
    paddingRight: 10,
    color: '#333',
    alignSelf: 'center'
  },
  roottext: {
    fontSize: 18
  }
}

module.exports = OrgView;
