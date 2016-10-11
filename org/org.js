/*
 * Functions for creating and manipulating a parsed Org mode file.
 * Once a node is in the tree, only refer to through a Cursor
 */
import {
  List,
  OrderedMap,
  Map,
  Record,
  Set
} from 'immutable';
let Cursor = require('immutable/contrib/cursor');

export function pprint(object, output=true) {
  let str = JSON.stringify(object, null, 2); 
  if (output) { console.warn(str) ;}
  return str;
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


export const Repeater = Record({
  mark: null,
  value: null,
  unit: null
});

export const Timestamp = Record({
  active: false,
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  dayname: null,
  repeater: null
});

function todayTs(ts) {
  return (ts.year !== null && ts.month !== null && ts.day !== null);
}

function tsDateSet(ts) {
  return (ts.year !== null && ts.month !== null && ts.day !== null);
}

function tsTimeSet(ts) {
  return (ts.hour !== null && ts.minute !== null);
}


export function tsFromDate(date) {
  return new Timestamp({year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate(),
                        hour: date.getHours(),
                        minute: date.getMinutes()
  });
}

function nowTs() {
  return tsFromDate(new Date());
}



/***** Creating nodes *****/

export function createDoc() {
  return createCursor(Node({
    type: TYPES.document
  }));
}

export function headlineNode(level, content, children=[], {keyword=null, tags=[], priority=null, ...other}={}) {
  return Node({
    type: TYPES.headline,
    meta: Map({
      level,
      keyword: keyword,
      tags: Set(tags),
      priority,
      ...other
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
  return !!node && node.get('type') === TYPES.document;
}

export function isHeadline(node) {
  return !!node && node.get('type') === TYPES.headline;
}

export function isSection(node) {
  return !!node && node.get('type') === TYPES.section;
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

export function getContent(cursor) {
  return cursor.get('content');
}

export function getMeta(cursor, property) {
  return cursor.getIn(['meta', property]);
}

export function numChildren(cursor) {
  return cursor.get('children').size;
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
export function createCursor(doc, path = []) {
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
  if (path.length == 0) {
    return undefined;
  }
  // -2 so that ['children', 1] -> []
  let newPath = path.slice(0, path.length - 2);
  return getDoc(cursor).getIn(newPath);
}

export function getChild(cursor, i) {
  return cursor.getIn(['children', i]);
}

export function nextSibling(cursor) {
  let path = getPath(cursor);
  if (path.length == 0) {
    // At root node
    return undefined;
  } else {
    let n = path[path.length - 1];
    if (typeof(n) !== 'number') {
      console.warn("ERROR: Last element in path is not a number", path);
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
    let parentSibling;
    while (parent != null && (parentSibling = nextSibling(parent)) == null) {
      parent = getParent(parent);
    }
    return parentSibling;
  }
  return undefined;
}


/***** Modifying tree *****/

export function setMeta(cursor, property, value) {
  return cursor.get('meta').set(property, value)
}

export function setTags(cursor, tags) {
  return setMeta(cursor, 'tags', Set(tags))
}

export function setContent(cursor, content) {
  return cursor.set('content', content)
}

export function addChild(cursor, newNode) {
  let children = cursor.children.push(newNode);
  return children.get(children.size - 1);
}

export function insertHeadline(cursor, headline) {
  if (!isHeadline(headline)) {
    console.warn("Node is not a headline");
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


/***** Search *****/
/* Search TODO:
 * Clocking search
 * Properly handle hours/minutes
 * Handle optional/default operators in property.operator.value
 */

function getPlanning(type) {
  return (cursor) => {
    let planning = cursor.getIn(['meta', 'planning']);
    if (planning == undefined) {
      return undefined;
    }

    return planning.get(type);
  };
}

let getScheduled = getPlanning('SCHEDULED');
let getDeadline = getPlanning('DEADLINE');
let getClosed = getPlanning('CLOSED');

function getTags(cursor) { return getMeta(cursor, 'tags'); }
function getKeyword(cursor) { return getMeta(cursor, 'keyword'); }
function getPriority(cursor) { return getMeta(cursor, 'priority'); }

function getTitle(cursor) {
  if (!isHeadline(cursor)) {
    return null;
  } else {
    return getContent();
  }
}

function getBody(cursor) {
  let child0 = getChild(cursor, 0);
  if (isHeadline(cursor) && isSection(child0)) {
    return getContent(child0);
  } else {
    return null;
  }
}

/* Functions to retrieve property
 * General types:
 * Text (headline/ section body)
 * Timestamps
 * Tags
 */

let properties = {
  title: {type: 'str', get: getTitle},
  body:  {type: 'str', get: getBody},
  s:     {type: 'ts', get: getScheduled},
  d:     {type: 'ts', get: getDeadline},
  c:     {type: 'ts', get: getClosed},
  t:     {type: 'set', get: getTags},
  k:     {type: 'str', get: getKeyword},
  // TODO this should probably be inverted str (A < B, but #A > #B in priority)
  p:     {type: 'str', get: getPriority},
  i:     {type: 'node', get: (x) => x}, // identity
  pl:     {type: 'object', get: (x) => x.getIn(['meta', 'planning'])}
};

function padTs(n) { return (n < 10) ? '0' + n : n; }


let tsOrder = ['year', 'month', 'day'];
let ts0 = new Timestamp({year: 0, month: 0, day: 0});
export function tsComparator(a, b) {
  // treat null as 0 ts
  if (a == null) { a = ts0; }
  if (b == null) { b = ts0; }

  for (part of tsOrder) {
    if (a[part] == b[part]) {
      continue;
    }
    if (a[part] < b[part]) {
      return -1;
    } else {
      return 1;
    }
  }
  return 0;
}

export let tsOps = {
  // Treat null timestamps as 0 timestamps
  eq  : (a, b) => tsComparator(a, b) === 0,
  neq : (a, b) => tsComparator(a, b) !== 0,
  lt  : (a, b) => tsComparator(a, b) < 0,
  lte : (a, b) => tsComparator(a, b) <= 0,
  gt  : (a, b) => tsComparator(a, b) > 0,
  gte : (a, b) => tsComparator(a, b) >= 0
};

let strOps = {
  eq  : (str, term) => { return term === str; },
  neq : (str, term) => { return term !== str; },
  lt  : (str, term) => { return term.indexOf(str) !== -1; },
  lte : (str, term) => { return term.indexOf(str) !== -1; },
  gt  : (str, term) => { return str.indexOf(term) !== -1; },
  gte : (str, term) => { return str.indexOf(term) !== -1; }
};


function tsValue(str) {
  let date = new Date();
  let addDays = (n) => date.setDate(date.getDate() + n);
  let addWeeks = (n) => addDays(7 * n);
  let addMonths = (n) => date.setMonth(date.getMonth() + n);
  let addYears = (n) => date.setFullYear(date.getFullYear() + n);

  // Named days
  switch (str) {
    case 'yesterday':
      addDays(-1);
      return date;
    case 'today':
      return date;
    case 'tomorrow':
      addDays(1);
      return date;
    default:
  }

  // # offsets, e.g. 1y, 2w, -3d
  let offsetre = /^(-?)(\d+)([dwmy])$/;
  let r;
  if ((r = offsetre.exec(str)) !== null) {
    let sign = r[1];
    let amount = r[2];
    let unit = r[3];
    if (sign === '-') {
      amount = -amount;
    }

    let adders = {
      'd': addDays,
      'm': addMonths,
      'y': addYears
    };
    adders[unit]();
    return date;
  }

  let datere = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  if ((r = datere.exec(str)) !== null) {
    return new Date(r[1], r[2] - 1, r[3]);
  }

  console.warn("Invalid timestamp value " + str);
  return date;
}

function createFilter(str) {
  // TODO: Make this a regex so it can handle quotes
  let [propertyStr, operatorStr, valueStr] = str.split('.');


  // Property 
  let propInfo = properties[propertyStr];
  if (propInfo === undefined) {
    console.warn("Invalid property " + propertyStr);
    return (() => true);
  }

  let {type, get} = propInfo;

  // Op
  let op;
  if (type === 'str') {
    op = strOps[operatorStr];
  } else if (type === 'ts') {
    op = tsOps[operatorStr];
  } else if (type === 'object') {
    op = {'eq': (a,b) => a == b,
          'neq': (a,b) => a != b
    }[operatorStr];
  }

  if (op == null) {
    console.warn("Invalid op " + operatorStr);
    return (() => true);
  }

  // Value
  let searchValue;
  if (type === 'str') {
    searchValue = valueStr;
  } else if (type === 'ts') {
    if (valueStr === 'none') {
      searchValue = ts0;
    } else {
      searchValue = tsFromDate(tsValue(valueStr));
    }
  } else if (type === 'object') {
    if (valueStr === 'none') {
      searchValue = null;
    }
  }

  return (node) => {
    let propValue = get(node);
    return op(propValue, searchValue);
  };
}

export function search(root, searchStr) {
  parts = searchStr.split(' ');
  let filters = parts.map(part => createFilter(part));
  let found = [];
  let cur = root;
  while (cur != undefined) {
    let add = true;
    for (filter of filters) {
      if (!filter(cur)) {
        add = false;
        break;
      }
    }
    if (add) {
      found.push(cur);
    }
    cur = next(cur);
  }
  return found;
}

/*
 * Sort a list of nodes based on given property (one of `properties`)
 * Optional comparator for the given property
 */
export function sort(nodes, property, comparator=null) {
  // Property 
  let propInfo = properties[property];
  if (propInfo === undefined) {
    console.warn("Invalid property " + property);
    return nodes;
  }

  let {type, get} = propInfo;

  // Op
  let op = comparator;;
  if (op == null) {
    if (type === 'str') {
      op = strOps['lt'];
    } else if (type === 'ts') {
      op = tsComparator;
    }
  }

  if (op == null) {
    console.warn("No lt operator defined for " + property);
    return nodes;
  }

  let sorted = nodes.sort((a, b) => {
    return op(get(a), get(b));
  });
  return sorted;
}

///////////////
// Exporting //
///////////////
/*
 * Export from immutablejs datastructure back to .org file
 */

export function export_subtree(subtree) {
  /* Constructs a string representing given subtree as an org mode file */
  let cur = subtree;
  let result = [];
  while (!!cur) {
    let exported = '';
    if (isDoc(cur)) {
      exported = printDoc(cur);
    }

    if (isHeadline(cur)) {
      exported = printHeadline(cur);
    }

    if (isSection(cur)) {
      exported = printSection(cur);
    }

    result.push(exported);
    cur = next(cur);
  }
  joined = result.join('');
  return joined.trim();
}

function printDoc(headline) {
  // TODO(ddohan): Print doc level metadata
  return '';
}

function printSection(section) {
  if (!isSection(section)) {
    return '';
  }
  return getContent(section) + '\n'
}


function printHeadline(headline) {
  if (!isHeadline(headline)) {
    return ''
  }
  let result = ['*'.repeat(level(headline))];

  keyword = getKeyword(headline);
  priority = getPriority(headline);
  content = getContent(headline);
  tags = getTags(headline);

  if (!!keyword) {
    result.push(' ');
    result.push(keyword);
  }

  if (!!priority) {
    result.push(' [#' + priority);
    result.push(']');
  }

  if (!!content) {
    result.push(' ');
    result.push(getContent(headline));
  }

  if (!!tags) {
    if (tags.size > 0) {
      result.push(' :');
      for (tag of tags.values()) {
        result.push(tag);
        result.push(':');
      }
    }
  }

  result.push('\n')

  let planning = printPlanning(headline)
  if (planning) {
    result.push(planning)
    result.push('\n')
  }

  result = result.join('');
  return result;
}

function printPlanning(headline) {
  scheduled = getScheduled(headline)
  deadline = getDeadline(headline)
  closed = getClosed(headline)
  let result = []
  if (!!scheduled) {
    result.push(['SCHEDULED: ', printTs(scheduled)].join(''))
  }
  if (!!deadline) {
    result.push(['DEADLINE: ', printTs(deadline)].join(''))
  }
  if (!!closed) {
    result.push(['CLOSED: ', printTs(closed)].join(''))
  }

  return result.join(' ')
}

function printTs(ts) {
  let result = []
  if (ts.active) {
    result.push('<')
  } else {
    result.push('[')
  }

  result.push(ts.year)
  result.push('-')
  result.push(ts.month)
  result.push('-')
  result.push(ts.day)
  result.push(' ')
  result.push(ts.dayname)
  if (!!ts.hour) {
    result.push(' ')
    result.push(ts.hour)
    result.push(':')
    result.push(ts.minute)
  }

  if (ts.repeater) {
    let repeater = ts.repeater
    result.push(' ')
    result.push(repeater.mark)
    result.push(repeater.value)
    result.push(repeater.unit)
  }

  if (ts.active) {
    result.push('>')
  } else {
    result.push(']')
  }
  return result.join('')
}
