let Org = require('./org/org');
let Parser = require('./org/org_parser');
let Moment = require('moment');
import { Router } from './Router'
import {
  withNavigation,
  NavigationActions
} from '@exponent/ex-navigation';

import { connect } from 'react-redux';

import React, { Component } from 'react';

import {
  ListView,
  Picker,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ScrollView,
  View
} from 'react-native';


/***** Actions *****/

// Toggle node visibility in outline view
const TOGGLE_VISIBILITY = 'TOGGLE_VISIBLE';
// Set a node property. [field, path] + value
const SET_PROPERTY = 'SET_FOCUSED_PROPERTY';

// Focus on a single node
const SET_FOCUS = 'SET_FOCUS';

// Clear single node focus
const CLEAR_FOCUS = 'CLEAR_FOCUS';
// Set search term
const SEARCH = 'SEARCH';
// Push a nav route
const PUSH_ROUTE = 'PUSH_ROUTE';

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

function pushRoute(route) {
  console.log(route)
  return {
    type: PUSH_ROUTE,
    value: route
  };
}

function clearFocus() {
  return {
    type: CLEAR_FOCUS
  }
}

function setSearch(value) {
  return {
    type: SEARCH,
    value
  }
}


/***** Reducers *****/

function createTestDoc() {
  return Parser.parse(
    '* DONE [#A] 1. I did this :project:\nSCHEDULED: <2016-06-05 Sun>\n:LOGBOOK:\nCLOCK: [2016-06-03 Fri 18:00]--[2016-06-03 Fri 19:30] =>  1:30\n- I did MORE of it\nCLOCK: [2016-06-02 Thu 18:00]--[2016-06-02 Thu 19:00] =>  1:00\n- I did part of it!\n:END:\n** 1.1 Look at all\n** 1.2 Of these headlines\n*** 1.2.1 Wow such hierarchy\n**** TODO 1.2.1.1 much test\n* 2. Work                                                              :work:\n** TODO [#A] 2.1 Do this or you lose your job!\nSCHEDULED: <2016-06-04 Sat> DEADLINE: <2016-06-06 Mon>\n*** 2.1.1 You should probably\n** TODO 2.2 so many things to do\n** TODO 2.3 and so little time\nSCHEDULED: <2016-06-06 Mon>\n** TODO 2.4 to do them all\n** DONE 2.5 Except this one. You did this one.\n** DONE 2.6 important tasks\nCLOSED: [2016-06-03 Fri 14:59]\n* 3. Home :home:\n** TODO 3.1 Remember garbage day?\nSCHEDULED: <2016-06-16 Thu +1w>\n:PROPERTIES:\n:LAST_REPEAT: [2016-06-03 Fri 21:32]\n:END:\n:LOGBOOK:\n- State \"DONE\"       from \"TODO\"       [2016-06-03 Fri 21:32]\n:END:\n** TODO 3.2 You should go to that thing\nSCHEDULED: <2016-06-13 Mon 20:00>\n*** DONE 3.2.1 Wow go buy some gifts or something \nCLOSED: [2016-06-11 Sat 21:33] DEADLINE: <2016-06-12 Sun>\n* 4. hobbies\n** 4.1 hobby #1\n*** TODO 4.1.1 Things and stuff hobby #1\n** 4.2 hobby #2\n*** TODO 4.2.1 Things and stuff hobby #2\n** 4.3 hobby #3\n*** TODO 4.3.1 Things and stuff hobby #3\n** 4.4 hobby #4\n*** TODO 4.4.1 Things and stuff hobby #4\n**** TODO this one has lots of nesting\n***** TODO and many children\n***** TODO to make the tree traversal complex\n***** TODO Although not all tasks are TODO here\n***** DONE Like this one.  This one is done'
  );
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

export function focusReducer(state=null, action) {
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

export function searchReducer(state='k.eq.TODO', action) {
  switch (action.type) {
    case SEARCH:
      return action.value
    default:
      return state
  }
}


export function createNavReducer(navReducer) {
  // TODO(ddohan): This feels hacky
  return (state, action) => {
    if (state) {
      let navigatorUID = state.currentNavigatorUID;
      switch (action.type) {
        case SET_FOCUS:
          route = Router.getRoute('edit_node')
          action = NavigationActions.push(navigatorUID, route)
          break
        case CLEAR_FOCUS:
          action = NavigationActions.pop(navigatorUID)
          break
        case PUSH_ROUTE:
          console.log(action)
          action = NavigationActions.push(navigatorUID, Router.getRoute(action.value))
          break
      }
    }
    state = navReducer(state, action)
    return state;
  }
}

/***** Org helpers *****/

function isHidden(node) {
  return !!Org.getMeta(node, 'hidden');
}

function tagsAsText(node) {
  tags = Org.getMeta(node, 'tags')
  return Array.from(tags).join(' ')

}

function tagsFromText(text) {
  let tags = text.split('');
  return tags.filter(x => x.length > 0);
}

function getKeyword(node) {
  return Org.getMeta(node, 'keyword');
}

function dateToRelativeText(then) {
  return Moment([then.year, then.month - 1, then.day]).fromNow();
}

/**********************/
/***** Components *****/
/**********************/

let noop = () => {};

/*** Editable Fields ***/

function EditNodePath({ node, path, onChangeText=noop, onEndEditing=noop, onSubmitEditing=noop, multiline=false, style=[] }) {
  return (
    <TextInput
      multiline={multiline}
      onChangeText={(text) => onChangeText(node, path, text)}
      onEndEditing={() => onEndEditing(node)}
      onSubmitEditing={() => onSubmitEditing(node)}
      value={node.getIn(path)}
      autoFocus={true}
      underlineColorAndroid={'transparent'}
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


/*** Fields ***/
function NodePath({ node, path, onPress, onLongPress }) {
  return (
    <TouchableHighlight
      onPress={() => onPress(node)}
      onLongPress={() => onLongPress(node)}>
      <View>
        <Text
          style={styles.flex}>
          {node.getIn(path)}
        </Text>
      </View>
    </TouchableHighlight>
  );
}

NodePath = connect((state) => ({}),
                   (dispatch) => ({
                     onPress: (node) => dispatch(setProperty(node, ['meta', 'editing'], true)),
                     onLongPress: (node) => dispatch(setFocus(node))
                   }))(NodePath);

function Node({ node }) {
  let isSection = Org.isSection(node);
  let nodeButton = isSection ? null : (<CollapseNodeButton node={node}/>);
  let nodeContent;
  if (!!Org.getMeta(node, 'editing')) {
    nodeContent = <EditNodeContent node={node} path={['content']} multiline={isSection}/>;
  } else {
    nodeContent = <NodePath node={node} path={['content']}/>;
  }
  let keyword = getKeyword(node);

  return (
    <View>
      <View style={{flexDirection: 'row'}}>
        {nodeButton}
        <Keyword keyword={keyword} />
        {nodeContent}
      </View>
      <View style={styles.children}>
        <Children node={node}/>
      </View>
    </View>);
}

function TODO() {
  return (
    <Text style={{color: 'red'}}> TODO </Text>
  );
}

function DONE() {
  return (
    <Text style={{color: 'green'}}> DONE </Text>
  )
}

function Keyword({ keyword }) {
  if (keyword == null) {
    return <View />;
  } else if (keyword === 'TODO') {
    return <TODO/>;
  } else if (keyword === 'DONE') {
    return <DONE/>;
  } else {
    return <Text style={{color: 'blue'}}> {keyword} </Text>;
  }
}

function PropertyDropdown(property, values) {
  let options = [];
  let key = 0
  for (let [label, value] of Object.entries(values)) {
    options.push(<Picker.Item label={label} value={value} key={key}/>);
    key += 1;
  }
  let dropdown = ( {node, onValueChange} ) => {
    return (<Picker
              selectedValue={Org.getMeta(node, property)}
              onValueChange={(value) => onValueChange(node, value)}
              style={styles.flex}>
      {options}
    </Picker>)
  }
  return connect(() => ({}),
                 (dispatch) => ({
                   onValueChange: (node, value) => dispatch(setProperty(node, ['meta', property], value))
                 }))(dropdown);
}

let KeywordDropdown = PropertyDropdown('keyword',
                                       {
                                         '-': '-',
                                         'TODO': 'TODO',
                                         'DONE': 'DONE'
                                       });

let PriorityDropdown = PropertyDropdown('priority',
                                        {
                                          '-': '-',
                                          '#A': 'A',
                                          '#B': 'B',
                                          '#C': 'C'
                                        });


/*** outline view ***/

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

function TodoRender({ root, searchStr }) {
  filtered = Org.search(root, searchStr);
  sorted = Org.sort(filtered, 'pl', (a, b) => {
    let as = a ? a.get('SCHEDULED') : null;
    let ad = a ? a.get('DEADLINE') : null;
    let bs = b ? b.get('SCHEDULED') : null;
    let bd = b ? b.get('DEADLINE') : null;

    cmp = Org.tsComparator;
    // TODO: cleanup
    [amin, amax] = cmp(as, ad) < 0 ? [as, ad] : [ad, as];
    [bmin, bmax] = cmp(bs, bd) < 0 ? [bs, bd] : [bd, bs];

    [amin, amax] = amin != null ? [amin, amax] : [amax, null];
    [bmin, bmax] = bmin != null ? [bmin, bmax] : [bmax, null];

    /*
     * Sort by minimum non-null timestamp, break ties with max
     */

    let ret = cmp(amin, bmin);
    if (ret == 0) {
      ret = cmp(amax, bmax);
    }
    return ret
  }
  );

  let datasource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
  let cloned = datasource.cloneWithRows(sorted);
  let dates = (node) => {
    let planning = node.getIn(['meta', 'planning']);
    if (planning == null) {
      return <Text />
    }
    let dates = []
    for (type of ['SCHEDULED', 'DEADLINE', 'CLOSED']) {
      if (planning.has(type)) {
        dates.push(
         <Text key={type}> {type[0]}: {dateToRelativeText(planning.get(type))} </Text> 
        );
      }
    }
    return (
      <View>
        {dates}
      </View>);
  }

  return (
    <ListView
    dataSource={cloned}
    renderRow={(node) => (
        <View>
          <View style={[styles.row]}>
            <Keyword keyword={getKeyword(node)}/>
            <Text> {Org.getContent(node)} </Text>
          </View>
          {dates(node)}
        </View>)}
    renderSeparator={(sectionID, rowID) => (<View key={`${sectionID}-${rowID}`} style={styles.separator} />)}
    />
  );
}

TodoRender = connect((state) => ({ root: state.doc }))(TodoRender);

/*** Edit node view ***/

function SearchBar({searchStr, onFocus, onTextChange}) {
  return <TextInput
  value={searchStr}
  onChangeText={onTextChange}
  onFocus={onFocus}
  style={[styles.flex]}/>
}

SearchBar = connect((state) => ({searchStr: state.search}),
                    (dispatch) => ({
                      onFocus: () => {console.log('focus'),dispatch(pushRoute('search'))},
                      onTextChange: (value) => dispatch(setSearch(value))
                    }))(SearchBar)

/*** Entry points ***/

@withNavigation
@connect(data => OutlineView.getDataProps)
export class OutlineView extends Component {
  static getDataProps(data) {
    return {
      doc: data.doc,
    };
  };

  static route = {
    navigationBar: {
      title: 'Outline',
      renderRight: () => <SearchBar/>
    },
  }

  render() {
    return (<View style={styles.tree}>
      <Children node={this.props.doc} />
    </View>)
  }

  onPressBack = () => {
    try {
      this.props.navigator.pop()
    } catch (e) {}
  }
}

@withNavigation
@connect(data => EditView.getDataProps)
export class EditView extends Component {
  static getDataProps(data) {
    return {
      doc: data.doc,
      focus: data.focus,
    };
  };

  static route = {
    navigationBar: {
      title: 'Edit Headline',
    },
  }

  render() {
    let node = Org.createCursor(this.props.doc, this.props.focus);
    let child = Org.getChild(node, 0);
    if (!!child && Org.isSection(child)) {
      child = <EditNodePath node={child} path={['content']} multiline={true}/>
    } else {
      child = <View/>
    }
    return (
      <View>
        <EditNodePath node={node} path={['content']} />
        <View style={styles.row}>
          <Text> Priority: </Text>
          <PriorityDropdown node={node} />
        </View>
        <View style={styles.row}>
          <Text> Keyword: </Text>
          <KeywordDropdown node={node} />
        </View>
        <Text> {tagsAsText(node)} </Text>
        {child}
      </View>
    )
  }

  /* onPressBack = () => {
   *   try {
   *     this.props.navigator.pop()
   *   } catch (e) {}
   * }*/
}

@withNavigation
@connect(data => SearchView.getDataProps)
export class SearchView extends Component {
  static getDataProps(data) {
    return {
      doc: data.doc,
      focus: data.focus,
      searchStr: data.search
    };
  };

  static route = {
    navigationBar: {
      title: 'Search',
      renderRight: () => <SearchBar/>
    },
  }

  render() {
    return <TodoRender searchStr={this.props.searchStr} />;
  }

  onPressBack = () => {
    try {
      this.props.navigator.pop();
    } catch (e) {}
  }
}

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
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  children: {
    paddingLeft: 20
  },
  flex: {
    flex: 1
  }
};
