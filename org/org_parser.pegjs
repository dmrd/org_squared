{
  let Immutable = require('immutable');
  let Org = require('./org');
  let doc = Org.createDoc();

  let TsRange = (active, start, stop) => {
    start = new Org.Timestamp({active: true, ...start})
    stop = new Org.Timestamp({active: true, ...stop})
    return Immutable.List([start, stop]);
  }
}

/*
 * Document structure
 */
document = section:section? headlines:headline* {
  let cursor = doc;
  if (!!section) {
    cursor = Org.addChild(doc, section);
  }

  for (let headline of headlines) {
    cursor = Org.insertHeadline(cursor, headline);
  }
  return Org.getDoc(cursor);
}

headline = stars:'*'+ ' '* keyword:keyword? ' '* priority:priority? ' '* line:line? planning:planning? body:section? {

  // TODO: Make much more robust to weird ordering in metadata (e.g. schedules after logbook)

  let children = !!body ? [body] : []

  // Pull out any tags
  // No backtracking in pegjs, so easier to do this way (also avoiding regex):
  let re = /(.*?)( :([0-9a-zA-Z_@#%:]*):)?$/;
  let result = re.exec(line);
  let headline_content= result[1];
  let tag_string = result[3];
  let tags;
  if (!!tag_string) {
    tags = result[3].split(':')
  }


  return Org.headlineNode(stars.length, headline_content, children,
                          {keyword: keyword,
                           tags: tags,
                           priority: priority,
                           planning: planning});
}

sectionline = !'*' line:line { return line; }
section = content:(sectionline)+ { return Org.sectionNode(content.join('\n')); }

keyword = 'TODO' / 'DONE'
priority = '[#' priority:upperletter ']' { return priority; }

/*********************/
/***** Timestamp *****/
/*********************/

year = [0-9][0-9][0-9][0-9]
month = [0-9][0-9]
day = [0-9][0-9]
dayname = letter*

date = year:$year '-' month:$month '-' day:$day ' ' dayname:$letter* {
  return {year, month, day, dayname}
}

hour = [0-9][0-9] / [0-9]
time = hour:$hour ':' minute:$([0-9][0-9]) {
  return {hour, minute}
}

mark = '+' / '++' / '.+' / '-' / '--'

tsunit = 'h' / 'd' / 'w' / 'm' / 'y'

// Repeater or delay
repeater = mark:$mark value:$number* tsunit:$tsunit {
  return new Org.Repeater({
    mark: mark,
    value: value,
    unit: tsunit
  })
}

planning = entries:padded_planning_entry* EOL { return Immutable.List(entries); }
padded_planning_entry = spaces* entry:planning_entry spaces* { return entry; }
planning_entry = scheduled / deadline / closed
scheduled = 'SCHEDULED: ' timestamp:ts_block { return Immutable.Map({type: 'SCHEDULED', timestamp}) }
deadline = 'DEADLINE: ' timestamp:ts_block { return Immutable.Map({type: 'DEADLINE', timestamp}) }
closed = 'CLOSED: ' timestamp:ts_block { return Immutable.Map({type: 'CLOSED', timestamp}) }

ts = date:date ' '* time:time? ' '* repeater:repeater? {
  if (!!time) {
    Object.assign(date, time)
  }
  return {
    ...date,
    repeater
  }
}

// For now, these will be normalized to <ts1>--<ts2> format
ts_range = date:date ts1:time '-' ts2:time repeater:repeater? {
  let start = Object.assign({repeater: repeater}, date, ts1, repeater)
  let stop = Object.assign({repeater: repeater}, date, ts2)
  return {
    start,
    stop,
  }
}

// Does not implement the (diary) timestamp of <%%(SEXP)>
ts_block =
  '<' start:ts '>' '--' '<' stop:ts '>' { return TsRange(true, start, stop); }
  / '[' start:ts ']' '--' '[' stop:ts ']' { return TsRange(false, start, stop); }
  / '<' range:ts_range '>' { return TsRange(true, range.start, range.stop); }
  / '[' ts_range ']' { return TsRange(false, range.start, range.stop); }
  / '<' ts:ts '>' { return new Org.Timestamp({active: true, ...ts}); }
  / '[' ts:ts ']' { return new Org.Timestamp({active: false, ...ts}); }

// TODO: Allow "two REPEATER-OR-DELAY in the timestamp: one as a repeater and one as a warning delay.""

/*************************/
/***** Basic blocks *****/
/*************************/

number = [0-9]
lowerletter = [a-z]
upperletter = [A-Z]
letter = lowerletter / upperletter
alphanum = number / letter
punctuation = [!"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~]
spaces = [ \t]
newline = '\n' / '\r' '\n'
whitespace = spaces / newline
EOF = !.
notnewline = !newline char:. { return char } 
EOL = newline / EOF
line = chars:$notnewline* newline { return chars; }
/ chars:$.+ EOF { return chars; }
