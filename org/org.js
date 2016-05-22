/*
 * Functions for creating and manipulating a parsed Org mode file.
 * Once a node is in the tree, only refer to through a Cursor
 */
import {
  List,
  OrderedMap,
  Map,
  Record
} from 'immutable';
let Cursor = require('immutable/contrib/cursor');

function pprint(object) {
  console.log(JSON.stringify(object, null, 2));
}


/***** Basic node type *****/

export const TYPES = {
  document: 'document',
  headline: 'headline',
  section: 'section'
};

export const Node = Record({
  type: null,
  content: null,
  meta: Map(),
  children: List()
});


/***** Creating nodes *****/

export function createDoc() {
  return createCursor(Node({
    type: TYPES.document
  }));
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

export function numChildren(cursor) {
  return cursor.children.size;
}


/***** Cursor logic *****/

/*
 Return the path corresponding to cursor
 */
export function getPath(cursor) {
  return cursor._keyPath;
}

/*
 Create a cursor into `doc` with `path`
 */
function createCursor(doc, path = []) {
  return Cursor.from(doc, path, () => {});
}


/***** Traversing tree *****/

/*
 Return the root document node for a cursor
 */
export function getDoc(cursor) {
  return createCursor(cursor._rootData);
}

/*
 * Return parent of node
 */
export function getParent(cursor) {
  let path = getPath(cursor);
  // -2 so that ['children', 1] -> []
  let newPath = path.slice(0, path.length - 2);
  return getDoc(cursor).getIn(newPath);
}

export function getChild(cursor, i) {
  return cursor.children.get(i);
}

export function nextSibling(cursor) {
  let path = getPath(cursor);
  if (path.size == 0) {
    // At root node
    return undefined;
  } else {
    let n = path[path.length - 1];
    if (typeof(n) !== 'number') {
      console.log("ERROR: Last element in path is not a number", path);
      return undefined;
    }
    n += +1;
    let newPath = path.slice(0, path.length - 1).concat(n);
    return getDoc(cursor).getIn(newPath);
  }
}

export function next(cursor) {
  let child = getChild(cursor, 0);
  if (child != undefined) {
    return child;
  }

  let sibling = nextSibling(cursor);
  if (sibling != undefined) {
    return sibling;
  }

  let parent = getParent(cursor);
  if (parent != undefined) {
    return nextSibling(parent);
  }
  return undefined;
}


/***** Modifying tree *****/

export function addChild(cursor, newNode) {
  let children = cursor.children.push(newNode);
  return children.get(children.size - 1);
}

export function insertHeadline(cursor, headline) {
  if (!isHeadline(headline)) {
    console.log("Node is not a headline");
    return cursor;
  }
  let headlineLevel = level(headline);

  while (level(cursor) >= headlineLevel) {
    cursor = getParent(cursor);
  }

  return addChild(cursor, headline);
}


/***** Export *****/

/*
 * Export node as text
 */
export function text(cursor, recursive = false) {
  return cursor.content;
}
