import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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
    "* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* A\nsection A\n** A.A\n** A.B\n*** A.B.A\n*** A.B.B\n** A.C\n* B\n** B.A"
  )
};

/***** Reducers *****/

export function orgAction(state=defaultState, action) {
  switch (action.type) {
    case TOGGLE_VISIBILITY:
      let current = isHidden(action.node)
      let updated = Org.setMeta(action.node, 'hidden', !current);
      return { doc: Org.getDoc(updated) };
    default:
      return state;
  }
}

/***** Org helpers *****/

function isHidden(node) {
  return !!Org.getMeta(node, 'hidden');
}

/***** Components *****/

function Node({ node }) {
  return (<View>
    <View style={styles.item}>
      <CollapseNodeButton node={node}/>
      <NodeContent node={node}/>
    </View>
    <View style={styles.children}>
    <Children node={node}/>
    </View>
  </View>);
}

function NodeButton({ node, onPress }) {
  let text = '-';
  if (isHidden(node)) {
    text = '+';
  }
  return (
    <TouchableHighlight onPress={() => onPress(node)}>
      <Text>{text} </Text>
    </TouchableHighlight>);
}


let CollapseNodeButton = connect(() => ({}),
                                 (dispatch) => ({ onPress: (node) => dispatch(toggleVisibility(node)) }))(NodeButton);

function NodeContent({ node }) {
  return (
    <Text>
      {node.content}
    </Text>);
}

function HiddenContent() {
  return <View/>;
}

function Children({ node }) {
  if (isHidden(node)) {
    return <HiddenContent/>
  }

  let nodes = [];
  node = Org.getChild(node, 0);
  let i = 0;
  while (node !== undefined) {
    nodes.push({node: node, key: i});
    node = Org.nextSibling(node);
    i += 1;
  }
  return (<View>
      {
        nodes.map(({node, key}) => (<Node node={node} key={key} />))
      }
  </View>);
}

function DocNodeRender({ doc }) {
  return (
    <View style={styles.tree}>
      <Node node={doc} />
    </View>
  );
}

function mapStateToProps(state) {
  return {
    doc: state.doc
  };
}

export let DocNode = connect(mapStateToProps)(DocNodeRender);

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
