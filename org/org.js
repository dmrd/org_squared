import {List, OrderedMap, Map, Record} from 'immutable';
import {Structure} from 'immstruct';

function pprint(object) {
  console.log(JSON.stringify(object, null, 2))
}

/*
 * Headline: STARS KEYWORD PRIORITY TITLE TAGS
 */

const TYPES = {
  document: Symbol("document"),
  headline: Symbol("headline"),
  section: Symbol("section")
};

export function isDoc(node) {
  return node.type === TYPES.document;
}

export function isHeadline(node) {
  return node.type === TYPES.headline;
}

export class Document {
  constructor() {
    this.document = Structure({
      data: Node({type: TYPES.document})
    });
  }

  getRoot() {
    return this.document.cursor();
  }

  getPath(path) {
    var cursor = this.document.cursor(path);
    return cursor;
  }
}

export const Node = Record({
  type: null,
  content: null,
  meta: Map(),
  children: List(),
});

/* TODO
 * - Iterator
 */

export function level(node) {
  if (isDoc(node)) {
    return 0;
  }

  if (!isHeadline(node)) {
    return Infinity;
  }

  return node.meta.get('level');
}

export function docNode() {
  return Node({type: TYPES.document});
}

export function headlineNode(level, content) {
  return Node({type: TYPES.headline,
               meta: Map({level: level}),
               content: content});
}

export function sectionNode(content) {
  return Node({type: TYPES.section,
               content: content});
}

export function addChild(doc, cursor, newNode) {
  var children = cursor.children.push(newNode);
  return children.get(children.size - 1);
}

export function getParent(doc, cursor) {
  var path = cursor._keyPath;
  var newPath = path.slice(0, path.length - 1);
  var cursor = doc.getPath(newPath);
  return cursor;
}

export function insertHeadline(doc, cursor, headline) {
  if (!isHeadline(headline)) {
    console.log("Node is not a headline");
    return cursor;
  }
  var headlineLevel = level(headline);

  while (level(cursor) >= headlineLevel) {
    cursor = getParent(doc, cursor);
  }

  return addChild(doc, cursor, headline);
}
