let Org = require('./org/org');
let Parser = require('./org/org_parser');
let Moment = require('moment');
import { Router } from './Router'
import {
  withNavigation,
  NavigationActions,
  StackNavigation,
  DrawerNavigation,
  DrawerNavigationItem,
} from '@exponent/ex-navigation';

import {
  StyleSheet,
} from 'react-native';

import { Entypo, MaterialIcons } from '@exponent/vector-icons';
import { connect } from 'react-redux';
import { Icon, SearchBar } from 'react-native-elements'
import { SideMenu, List, ListItem } from 'react-native-elements'

import React, { Component } from 'react';

import Menu, { MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import Swipeout from 'react-native-swipeout';


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

function side_menu(field, state) {
  let type = 'SIDE_MENU_OFF'
  if (state == true) {
    type = 'SIDE_MENU_ON'
  }
  return {
    type
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

export function toggleSideMenuReducer(state=false, action) {
  switch (action.type) {
    case 'SIDE_MENU_ON':
      return true
    case 'SIDE_MENU_OFF':
      return false
  }
  return state
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
    return <Entypo name="dot-single" size={16} color="black" />
  }

  let text = ' -  ';
  if (isHidden(node)) {
    icon = <MaterialIcons name="play-circle-filled" size={20} color="black" />
  } else {
    icon = <MaterialIcons name="arrow-drop-down-circle" size={20} color="black" />
  }
  return (
    <TouchableHighlight onPress={() => onPress(node)}>
      {icon}
    </TouchableHighlight>);
}

let CollapseNodeButton = connect(() => ({}),
                                 (dispatch) => ({ onPress: (node) => dispatch(toggleVisibility(node)) }))(NodeButton);

function Children({ node }) {
  if (isHidden(node)) {
    return <View/>
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

function TodoRender({ root, searchStr, setState }) {
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

  if (sorted.length == 0) {
    sorted = [null]
  }

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

  // TODO(mgyucht): use a real state machine defined by #+TODO_HEADINGS if provided
  let getSwipeConfiguration = (node) => {
    if (getKeyword(node) === 'TODO') {
      return {
        buttonTitle: 'Done',
        nextState: 'DONE',
      };
    } else {
      return {
        buttonTitle: 'Todo',
        nextState: 'TODO',
      }
    }
  };

  return (
    <ListView
    dataSource={cloned}
    renderRow={(node) => {
        const swipeConfig = getSwipeConfiguration(node);
        const swipeoutButtons = [
          {
            text: swipeConfig.buttonTitle,
            backgroundColor: 'green',
            underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
            onPress: () => {setState(node, swipeConfig.nextState)},
          },
        ];
        if (node == null) {
          return <Text>No search result</Text>
        }
      return <View>
        <Swipeout right={swipeoutButtons} autoClose={true}>
          <View style={[styles.row]}>
            <Keyword keyword={getKeyword(node)}/>
            <Text> {Org.getContent(node)} </Text>
          </View>
          {dates(node)}
        </Swipeout>
      </View>}}
    renderSeparator={(sectionID, rowID) => (<View key={`${sectionID}-${rowID}`} style={styles.separator} />)}
    />
  );
}

TodoRender = connect((state) => ({ root: state.doc }),
                     (dispatch) => ({setState: (node, newState) => dispatch(setProperty(node, ['meta', 'keyword'], newState))}))(TodoRender);

/*** Edit node view ***/

function OrgSearchBar({searchStr, onFocus, onTextChange}) {
  return <SearchBar
           round={true}
           value={searchStr}
           onChangeText={onTextChange}
           onFocus={onFocus}
           lightTheme={true}
           inputStyle={{width: 250}}
  />
}

OrgSearchBarFocus = connect((state) => ({searchStr: state.search}),
                    (dispatch) => ({
                      onFocus: () => dispatch(pushRoute('search')),
                      onTextChange: (value) => dispatch(setSearch(value))
                    }))(OrgSearchBar)

// TODO(ddohan): How to dedup with above?
OrgSearchBarNoFocus = connect((state) => ({searchStr: state.search}),
                    (dispatch) => ({
                      onTextChange: (value) => dispatch(setSearch(value))
                    }))(OrgSearchBar)

function MenuDropdown() {
  return (
    <View style={{ padding: 15, flexDirection: 'row', backgroundColor: 'white' }}>
    <Menu onSelect={(value) => alert(`User selected the number ${value}`)}>
      <MenuTrigger>
        <Text style={{ fontSize: 20 }}>&#8942;</Text>
      </MenuTrigger>
      <MenuOptions>
        <MenuOption value={1}>
          <Text>One</Text>
        </MenuOption>
        <MenuOption value={2}>
          <Text>Two</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  </View>)
}

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
      renderRight: () => <MenuDropdown/>
    },
  }

       // <TodoSideMenu/>
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
      renderRight: () => <OrgSearchBarNoFocus/>
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


// Treat the DrawerNavigationLayout route like any other route -- you may want to set
// it as the intiial route for a top-level StackNavigation

onTextChange: (value) => dispatch(setSearch(value))

@connect(data => DrawerNavigationLayout.getDataProps, dispatch => DrawerNavigationLayout.getDispatch)
export class DrawerNavigationLayout extends React.Component {
  static getDataProps(data) {
    return {
      doc: data.search,
    };
  };

  static getDispatch(dispatch) {
    return {
      dispatch: dispatch
    };
  };

  static route = {
    navigationBar: {
      visible: false,
    }
  };

  render() {
    return (
      <DrawerNavigation
        id='main'
        initialItem='outline'
        drawerWidth={300}
        renderHeader={this._renderHeader}
      >
        <DrawerNavigationItem
          renderTitle={() => <OrgSearchBarNoFocus/>}
        >
        </DrawerNavigationItem>

        <DrawerNavigationItem
          id='outline'
          selectedStyle={styles.selectedItemStyle}
          onPress={() => this.props.dispatch(pushRoute('outline'))}
          renderTitle={isSelected => this._renderTitle('Outline', isSelected)}
        >
          <StackNavigation
            id='outline'
            initialRoute={Router.getRoute('outline')}
          />
        </DrawerNavigationItem>

        <DrawerNavigationItem
          id='todo'
          selectedStyle={styles.selectedItemStyle}
          onPress={() => {this.props.dispatch(setSearch('k.eq.TODO')); this.props.dispatch(pushRoute('search'))}}
          renderTitle={isSelected => this._renderTitle('Todo', isSelected)}
        >
          <StackNavigation
            id='search'
            initialRoute={Router.getRoute('search')}
          />
        </DrawerNavigationItem>

        <DrawerNavigationItem
          id='done'
          selectedStyle={styles.selectedItemStyle}
          onPress={() => {this.props.dispatch(setSearch('k.eq.DONE')); this.props.dispatch(pushRoute('search'))}}
          renderTitle={isSelected => this._renderTitle('Done', isSelected)}
        >
          <StackNavigation
            id='search'
            initialRoute={Router.getRoute('search')}
          />
        </DrawerNavigationItem>

      </DrawerNavigation>
    );
  }

  _renderHeader = () => {
    return (
      <View style={styles.header}>
      </View>
    );
  };

  _renderTitle(text: string, isSelected: boolean) {
    return (
      <Text style={[styles.titleText, isSelected ? styles.selectedTitleText : {}]}>
        {text}
      </Text>
    );
  };
}

// TODO(dmrd): Cleanup styles
const styles = StyleSheet.create({
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
  },
  // From other styles.
  header: {
    height: 20
  },

  selectedItemStyle: {
    backgroundColor: 'blue'
  },

  titleText: {
    fontWeight: 'bold'
  },

  selectedTitleText: {
    color: 'white'
  }
});
