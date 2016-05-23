let Org = require('./org/org');
let React = require('react-native');

let {
  Text,
  TouchableHighlight,
  View
} = React;

class OrgView extends React.Component {
  constructor(props) {
    let {
      doc
    } = props;
    super(props);
    this.state = {'doc': doc};
  }

  renderChildren(cursor) {
    const nodes = [];
    let node = Org.getChild(cursor, 0);
    let i = 0;
    while (node !== undefined) {
      nodes.push(this.renderNode(node, i));
      node = Org.nextSibling(node);
      i += 1;
    }
    return nodes;
  }

  _toggleNode(cursor) {
    let current = Org.getMeta(cursor, 'hidden');
    let updated = Org.setMeta(cursor, 'hidden', !current);
    this.setState({'doc': Org.getDoc(updated)});
  }

  renderNode(cursor, i) {
    let children = null;
    if (Org.numChildren(cursor) > 0) {
      if (Org.getMeta(cursor, 'hidden') !== true) {
        children =
          (<View style={styles.children}>
           {this.renderChildren(cursor)}
           </View>);
      } else {
        children = (<Text>...</Text>);
      }
    }
    return (
        <View key={i}>
        <TouchableHighlight onPress={() => this._toggleNode.bind(this)(cursor)}>
        <Text>
        {cursor.content}
      </Text>
        </TouchableHighlight>
        {children}
      </View>
    );
  }

  render() {
    return (
        <View style={styles.tree}>
        {this.renderChildren(this.state.doc)}
      </View>
    );
  }

}

const styles = {
  tree: {
    padding: 10
  },
  rootnode: {
    paddingBottom: 10
  },
  node: {
    paddingTop: 10
  },
  item: {
    flexDirection: 'row'
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
};

module.exports = OrgView;
