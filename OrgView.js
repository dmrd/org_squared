import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

let Org = require('./org/org');
let Parser = require('./org/org_parser');
let React = require('react-native');

let {
  Text,
  TouchableHighlight,
  View
} = React;

/***** Actions *****/

const TOGGLE_VISIBILITY = 'TOGGLE_VISIBLE'; // type + node

function toggleVisibility (node) {
  return {
    type: TOGGLE_VISIBILITY,
    node
  };
}

const defaultState = {
  doc: Parser.parse(
    "* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1"
  )
};

/***** Reducers *****/

export function orgAction(state=defaultState, action) {
  switch (action.type) {
    case TOGGLE_VISIBILITY:
      let current = Org.getMeta(node, 'hidden');
      let updated = Org.setMeta(node, 'hidden', !current);
      return Org.getDoc(updated);
    default:
      return state;
  }
}


/***** Components *****/

function Node({node}) {
  
}

function renderChildren(node) {
  const nodes = [];
  node = Org.getChild(node, 0);
  let i = 0;
  while (node !== undefined) {
    nodes.push(renderNode(node, i));
    node = Org.nextSibling(node);
    i += 1;
  }
  return nodes;
}

function renderNode(node, i, onPress) {
  let children = null;
  if (Org.numChildren(node) > 0) {
    if (Org.getMeta(node, 'hidden') !== true) {
      children =
      (<View style={styles.children}>
         {renderChildren(node)}
      </View>);
    } else {
      children = (<Text>...</Text>);
    }
  }
  return (
    <View key={i}>
      <TouchableHighlight >
        <Text>
          {node.content}
        </Text>
      </TouchableHighlight>
      {children}
    </View>
  );
}

function mapDispatchToProps(dispatch) {
  return { onPress: (node) => dispatch(toggleVisibility(node)) };
}

//renderNode = connect(() => {}, mapDispatchToProps)(renderNode);

export function renderDoc(doc) {
  return (
      <View style={styles.tree}>
      <Text>Test</Text>
      {renderChildren(doc.doc)}
    </View>
  );
}

function mapStateToProps(state) {
  return {
    doc: state.doc
  };
}

renderDoc = connect(mapStateToProps)(renderDoc);

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
