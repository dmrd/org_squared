/*
 * Functions for creating and manipulating a parsed Org mode file.
 */
import {
  List,
  OrderedMap,
  Map,
  Record
} from 'immutable';
var Cursor = require('immutable/contrib/cursor');

function pprint(object) {
  console.log(JSON.stringify(object, null, 2))
}

/* TODO
 * - Iterator
 */


/***** Basic node type *****/

export const TYPES = {
  document: Symbol("document"),
  headline: Symbol("headline"),
  section: Symbol("section")
};

export const Node = Record({
  type: null,
  content: null,
  meta: Map(),
  children: List()
});


/***** Creating nodes *****/

export function createDoc() {
  return Node({
    type: TYPES.document
  });
}

export function headlineNode(level, content, children = []) {
  return Node({
    type: TYPES.headline,
    meta: Map({
      level: level
    }),
    children: List(children),
    content: content
  });
}

export function sectionNode(content) {
  return Node({
    type: TYPES.section,
    content: content
  });
}


/***** Node info *****/

export function isDoc(node) {
  return node.type === TYPES.document;
}

export function isHeadline(node) {
  return node.type === TYPES.headline;
}

export function level(node) {
  if (isDoc(node)) {
    return 0;
  }

  if (!isHeadline(node)) {
    return Infinity;
  }

  return node.meta.get('level');
}


/***** Cursor logic *****/

/*
 Return the path corresponding to cursor
 */
export function cursorPath(cursor) {
  return cursor._keyPath;
}

/*
 Create a cursor into `doc` with `path`
 */
export function getCursor(doc, path = []) {
  return Cursor.from(doc, path, () => {});
}


/***** Traversing tree *****/

/*
 Return the root document node for a cursor
 */
export function getDoc(cursor) {
  return cursor._rootData;
}

/*
 * Return parent of node
 */
export function getParent(cursor) {
  var path = cursorPath(cursor);
  var newPath = path.slice(0, path.length - 1);
  return getCursor(getDoc(cursor), newPath);
}


/***** Modifying tree *****/

export function addChild(cursor, newNode) {
  var children = cursor.children.push(newNode);
  return children.get(children.size - 1);
}

export function insertHeadline(cursor, headline) {
  if (!isHeadline(headline)) {
    console.log("Node is not a headline");
    return cursor;
  }
  var headlineLevel = level(headline);

  while (level(cursor) >= headlineLevel) {
    cursor = getParent(cursor);
  }

  return addChild(cursor, headline);
}
