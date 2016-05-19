var org = require('../org/org');
var parser = require('../org/org_parser');
import {expect} from 'chai';
import {List} from 'immutable';

// Helper function for debugging
function pprint(object) {
  console.log(JSON.stringify(object, null, 2))
}

function node(type, content, children=List()) {
  return {type: type, content: content, children: List(children)};
}

// Do a recursive comparison
function checkStructure(expected, actual) {
  if (expected.type !== undefined && expected.content !== undefined) {
    expect(actual.type).to.equal(expected.type);
    expect(actual.content).to.equal(expected.content);
    checkStructure(expected.children, actual.children);
  } else {
    var i = 0;
    for (let part of expected) {
      checkStructure(part, actual.get(i));
      i++;
    }
  }
}

describe('utils', () => {

  it('node level', () => {
    var l1 = org.headlineNode(1, "1");
    expect(org.level(org.headlineNode(1, "1"))).to.equal(1)
    expect(org.level(org.headlineNode(100, "100"))).to.equal(100)

    expect(org.level(org.docNode())).to.equal(0)
    expect(org.level(org.sectionNode("it has stuff"))).to.equal(Infinity)
  });
});

describe('inserting', () => {
  describe('header', () => {
    it('at root', () => {
      var doc = new
      org.Document;
      var root = doc.getRoot();
      var h1 = org.headlineNode(1, 1);
      var h2 = org.headlineNode(2, 2);
      var h3 = org.headlineNode(1, 3);
      var h1_c = org.insertHeadline(doc, root, h1);
      var h2_c = org.insertHeadline(doc, h1_c, h2);
      var h3_c = org.insertHeadline(doc, h2_c, h3);
      root = doc.getRoot();
      var h = org.TYPES.headline;
      checkStructure(
        [node(h, 1, [
          node(h, 2)
        ]),
         node(h, 3)
        ],
        root.children
      );
    });
  });
});

describe('parser', () => {
  describe('simple', () => {
    it('can parse just headlines', () => {
      var h = org.TYPES.headline;
      var doc = parser.parse("** 1\n***2\n*3\n");
      checkStructure(
        [node(h, '1', [
          node(h, '2')
        ]),
         node(h, '3')
        ],
        doc.getRoot().children
      )
    });
  });
});
