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

headline = stars:'*'+ ' '* line:line? body:(section)? {
  let children = !!body ? [body] : []
  return org.headlineNode(stars.length, line, children);
}

sectionline = !'*' line:line { return line; }
section = content:(sectionline)+ { return org.sectionNode(content.join('\n')); }


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
