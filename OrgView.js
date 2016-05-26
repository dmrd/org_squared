import { connect } from 'react-redux';

let React = require('react-native');
let Org = require('./org/org');
let Parser = require('./org/org_parser');

let {
  Text,
  TextInput,
  TouchableHighlight,
  View
} = React;


/***** Actions *****/

const TOGGLE_VISIBILITY = 'TOGGLE_VISIBLE'; // type + node
const SET_PROPERTY = 'SET_FOCUSED_PROPERTY'; // [field, path] + value

const SET_FOCUS = 'SET_FOCUS';

function toggleVisibility(node) {
  return {
    type: TOGGLE_VISIBILITY,
    node
  };
}

function setProperty(node, path, value) {
  return {
    type: SET_PROPERTY,
    node,
    path,
    value
  };
}

function setFocus(node) {
  return {
    type: SET_FOCUS,
    node
  };
}


/***** Reducers *****/

function createTestDoc() {
  return Parser.parse(
    "* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* A\nsection A\n** A.A\n** A.B\n*** A.B.A\n*** A.B.B\n** A.C\n* B\n** B.A\n* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* A\nsection A\n** A.A\n** A.B\n*** A.B.A\n*** A.B.B\n** A.C\n* B\n** B.A");
}

export function orgAction(state=createTestDoc(), action) {
  let updated;
  switch (action.type) {
    case TOGGLE_VISIBILITY:
      let current = isHidden(action.node)
      updated = Org.setMeta(action.node, 'hidden', !current);
      return Org.getDoc(updated);
    case SET_PROPERTY:
      updated = action.node.setIn(action.path, action.value);
      return Org.getDoc(updated);
    default:
      return state;
  }
}

export function focus(state=null, action) {
  switch (action.type) {
    case SET_FOCUS:
      return action.node;
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
  let nodeContent;
  if (!!Org.getMeta(node, 'focused')) {
    nodeContent = <EditNodeContent node={node}/>
  } else {
    nodeContent = <NodeContent node={node}/>
  }

  let nodeButton;
  if (Org.isSection(node)) {
    nodeButton = null;
  } else {
    nodeButton = <CollapseNodeButton node={node}/>;
  }

  return (
    <View>
      <View style={{flexDirection: 'row'}}>
        {nodeButton}
        {nodeContent}
      </View>
      <View style={styles.children}>
        <Children node={node}/>
      </View>
    </View>);
}

function NodeButton({ node, onPress }) {
  if (Org.numChildren(node) == 0) {
    return <Text> *  </Text>
  }

  let text = ' -  ';
  if (isHidden(node)) {
    text = ' +  ';
  }
  return (
    <TouchableHighlight onPress={() => onPress(node)}>
      <Text>{text} </Text>
    </TouchableHighlight>);
}


let CollapseNodeButton = connect(() => ({}),
                                 (dispatch) => ({ onPress: (node) => dispatch(toggleVisibility(node)) }))(NodeButton);

function NodeContent({ node, onPress }) {
  return (<Text onPress={() => onPress(node)}> {node.content} </Text>);
}

NodeContent = connect(() => ({}),
                      (dispatch) => ({ onPress: (node) =>
                      dispatch(setProperty(node, ['meta', 'focused'], true))}))(NodeContent);

function EditNodeContent({ node, onChangeText, onEndEditing }) {
  return <TextInput
           multiline={false}
           onChangeText={(text) => onChangeText(node, text)} value={node.content} onEndEditing={() => onEndEditing(node)}
           autoFocus={true}
           style={[styles.flex]}/>;
}



EditNodeContent = connect(() => ({}),
                          (dispatch) => ({
                            onChangeText: (node, text) =>
                              dispatch(setProperty(node, ['content'], text)),
                            onEndEditing: (node) => dispatch(setProperty(node, ['meta', 'focused'], false)),
                            onSubmitEditing: (node) => dispatch(setProperty(node, ['meta', 'focused'], false))
                          }))(EditNodeContent);

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

function RootNodeRender({ node }) {
  return (
    <View style={styles.tree}>
      <Children node={node} />
    </View>
  );
}

export let RootNode = connect((state) => ({ node: state.doc }))(RootNodeRender);

const styles = {
  tree: {
    padding: 10
  },
  row: {
    flexDirection: 'row'
  },
  col: {
    flexDirection: 'column'
  },
  children: {
    paddingLeft: 20
  },
  flex: {
    flex: 1
  }
};
