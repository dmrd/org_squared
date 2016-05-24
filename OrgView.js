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

function Node({ node }) {
  return (<View>
    <NodeContent node={node}/>
          <View style={styles.children}>
           <Children node={node}/>
           </View>
          </View>);
  }

function NodeContent({ node }) {
  return (
    <TouchableHighlight >
    <Text>
    {node.content}
    </Text>
  </TouchableHighlight>)
}

function Children({ node }) {
  const nodes = [];
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

//RenderNode = connect(mapStateToProps)(RenderNode);


function rnDispatch(dispatch) {
  return { onPress: (node) => dispatch(toggleVisibility(node)) };
}

function rnState(state, ownprops) {
  return ownprops;
}

function DocNodeRender({ doc }) {
  return (
    <View style={styles.tree}>
      <Text>Test</Text>
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
