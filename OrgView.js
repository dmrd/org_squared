import { connect } from 'react-redux';

let React = require('react-native');
let Org = require('./org/org');
let Parser = require('./org/org_parser');

let {
  Text,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View
} = React;


/***** Actions *****/

const TOGGLE_VISIBILITY = 'TOGGLE_VISIBLE'; // type + node
const SET_PROPERTY = 'SET_FOCUSED_PROPERTY'; // [field, path] + value

const SET_FOCUS = 'SET_FOCUS';
const CLEAR_FOCUS = 'CLEAR_FOCUS';

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

function clearFocus() {
  return {
    type: CLEAR_FOCUS
  }
}


/***** Reducers *****/

function createTestDoc() {
  return Parser.parse(
    "* DONE [#A] 1 has node content, keywords, priority, and tags :TAG1:TAG2:\nsection 1\n** TODO 1.1\n** DONE [#C] 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* A\nsection A\n** A.A\n** A.B\n*** A.B.A\n*** A.B.B\n** A.C\n* B\n** B.A\n* 1\nsection 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1\n* A\nsection A\n** A.A\n** A.B\n*** A.B.A\n*** A.B.B\n** A.C\n* B\n** B.A");
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
    case CLEAR_FOCUS:
      return null;
    case SET_FOCUS:
      let node = action.node;
      if (Org.isSection(node)) {
        node = Org.getParent(node);
      }
      return Org.getPath(node);
    default:
      return state;
  }
}

/***** Org helpers *****/

function isHidden(node) {
  return !!Org.getMeta(node, 'hidden');
}

function tagsAsText(node) {
  return Org.getMeta(node, 'tags')
}

/**********************/
/***** Components *****/
/**********************/

let noop = () => {}

/*** Editable Fields ***/

function EditNodePath({ node, path,
                        onChangeText=noop,
                        onEndEditing=noop,
                        onSubmitEditing=noop,
                        multiline=false, style=[] }) {
  return (
    <TextInput
      multiline={multiline}
      onChangeText={(text) => onChangeText(node, path, text)}
      onEndEditing={() => onEndEditing(node)}
      onSubmitEditing={() => onSubmitEditing(node)}
      value={node.getIn(path)}
      autoFocus={true}
      style={[styles.flex, ...style]}/>
  );
}

EditNodePath = connect(() => ({}),
                          (dispatch) => ({
                            onChangeText: (node, path, text) =>
                              dispatch(setProperty(node, path, text)),
                          }))(EditNodePath);

let EditNodeContent = connect(() => ({}),
                          (dispatch) => ({
                            onChangeText: (node, path, text) =>
                              dispatch(setProperty(node, path, text)),
                            onEndEditing: (node) => dispatch(setProperty(node, ['meta', 'editing'], false)),
                            onSubmitEditing: (node) => dispatch(setProperty(node, ['meta', 'editing'], false))
                          }))(EditNodePath);

function NodePath({ node, path, onPress, onLongPress }) {
  return (
    <TouchableWithoutFeedback 
      onLongPress={() => onLongPress(node)}>
    <Text
      onPress={() => onPress(node)}
    style={styles.flex}>
      {node.getIn(path)}
    </Text>
    </TouchableWithoutFeedback>

  );
}

NodePath = connect(() => ({}),
                      (dispatch) => ({
                        onPress: (node) => dispatch(setProperty(node, ['meta', 'editing'], true)),
                        onLongPress: (node) => dispatch(setFocus(node))
                      }))(NodePath);

function Node({ node }) {
  let multiline = Org.isSection(node);
  let nodeButton = Org.isSection(node) ? null : (<CollapseNodeButton node={node}/>);
  let nodeContent;
  if (!!Org.getMeta(node, 'editing')) {
    nodeContent = <EditNodeContent node={node} path={['content']} multiline={multiline}/>
  } else {
    nodeContent = <NodePath node={node} path={['content']}/>
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

function BackButton({ onPress }) {
  return (
    <TouchableHighlight onPress={onPress}>
      <Text>{'<<<<'}</Text>
    </TouchableHighlight>);
}

let UnfocusButton = connect(() => ({}),
                            (dispatch) => ({
                              onPress: () => dispatch(clearFocus())
                            }))(BackButton);

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

function EditNode({ node }) {
  let child = Org.getChild(node, 0);
  if (!!child && Org.isSection(child)) {
    child = <EditNodePath node={child} path={['content']}/>
  } else {
    child = <View/>
  }
  return (
    <View>
      <UnfocusButton/>
      <EditNodePath node={node} path={['content']} />
      <Text> Priority: {Org.getMeta(node, 'priority')} </Text>
      <Text> Keyword: {Org.getMeta(node, 'keyword')} </Text>
      <Text> {Array.from(Org.getMeta(node, 'tags')).join(' ')} </Text>
      {child}
    </View>
  )
}

let RootNode = connect((state) => ({ node: state.doc }))(RootNodeRender);

function EntryViewRender({ state }) {
  if (state.focus === null) {
    return <RootNode />
  } else {
    return <EditNode node={Org.createCursor(state.doc, state.focus)} />
  }
}

export let EntryView = connect((state) => ({ state: state }))(EntryViewRender)

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
