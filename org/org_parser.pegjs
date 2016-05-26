{
  var org = require('./org');
  var doc = org.createDoc();
  function pprint(object) {
    console.log(JSON.stringify(object, null, 2))
  }
}

/*
 * Document structure
 */
document = section:section? headlines:headline* {
  let cursor = doc;
  if (!!section) {
    cursor = org.addChild(doc, section);
  }

  for (let headline of headlines) {
    cursor = org.insertHeadline(cursor, headline);
  }
  return org.getDoc(cursor);
}

headline = stars:'*'+ ' '* keyword:keyword? ' '* priority:priority? ' '* line:line? body:section? {
  let children = !!body ? [body] : []

  // No backtracking in pegjs, so easier to do this way (also avoiding regex):
  let re = /(.*?)( :([0-9a-zA-Z_@#%:]*):)?$/;
  let result = re.exec(line);
  let headline_content= result[1];
  let tag_string = result[3];
  let tags;
  if (!!tag_string) {
    tags = result[3].split(':')
  }
  return org.headlineNode(stars.length, headline_content, children,
                          {keyword: keyword,
                           tags: tags,
                           priority: priority});
}

sectionline = !'*' line:line { return line; }
section = content:(sectionline)+ { return org.sectionNode(content.join('\n')); }

keyword = 'TODO' / 'DONE'
priority = '[#' priority:upperletter ']' { return priority; }

// Basic parts

number = [0-9]
lowerletter = [a-z]
upperletter = [A-Z]
letter = lowerletter / upperletter
alphanum = number / letter
punctuation = [!"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~]
spaces = [ \t]
newline = '\n' / '\r' '\n'
whitespace = spaces / newline
lineparts = alphanum / spaces / punctuation
EOF = !.
notnewline = !newline char:. { return char } 

line = chars:$notnewline* newline { return chars; }
/ chars:$.+ EOF { return chars; }
