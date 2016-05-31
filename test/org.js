let org = require('../org/org');
let parser = require('../org/org_parser');
import {
  expect
} from 'chai';
import {
  List,
  Set
} from 'immutable';

// Helper function for debugging
function pprint(object) {
  console.log(JSON.stringify(object, null, 2));
}

function node(type, content, children = List()) {
  return {
    type: type,
    content: content,
    children: List(children)
  };
}

// Do a recursive comparison
function checkStructure(expected, actual) {
  if (expected.type !== undefined && expected.content !== undefined) {
    expect(actual.type).to.equal(expected.type);
    expect(actual.content).to.equal(expected.content);
    checkStructure(expected.children, actual.children);
  } else {
    let i = 0;
    for (let part of expected) {
      checkStructure(part, actual.get(i));
      i++;
    }
  }
}

describe('utils', () => {

  it('node level', () => {
    let l1 = org.headlineNode(1, "1");
    expect(org.level(org.headlineNode(1, "1"))).to.equal(1);
    expect(org.level(org.headlineNode(100, "100"))).to.equal(100);

    expect(org.level(org.createDoc())).to.equal(0);
    expect(org.level(org.sectionNode("it has stuff"))).to.equal(Infinity);
  });

  it('iterates in order', () => {
    let doc = parser.parse("* 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1");
    let order = [null, '1', '1.1', '1.2', '1.2.1', '1.2.2', '1.3', '2', '2.1'];
    let traversed = [];
    while (doc != undefined) {
      traversed.push(doc.content);
      doc = org.next(doc);
    }
    expect(traversed).to.deep.equal(order);
  });
});

describe('inserting', () => {
  describe('header', () => {
    it('at root', () => {
      let h1 = org.headlineNode(1, 1);
      let h2 = org.headlineNode(2, 2);
      let h3 = org.headlineNode(1, 3);
      let h1_c = org.insertHeadline(org.createDoc(), h1);
      let h2_c = org.insertHeadline(h1_c, h2);
      let h3_c = org.insertHeadline(h2_c, h3);
      let h = org.TYPES.headline;
      checkStructure(
        [node(h, 1, [
            node(h, 2)
          ]),
          node(h, 3)
        ],
        org.getDoc(h3_c).children
      );
    });
  });
});

describe('parser', () => {
  describe('simple', () => {
    it('can parse just headlines', () => {
      let h = org.TYPES.headline;
      let doc = parser.parse("** 1\n***2\n*3\n");
      checkStructure(
        [node(h, '1', [
            node(h, '2')
          ]),
          node(h, '3')
        ],
        doc.children
      );
    });
  });
  it('headline tags, priority, and keywords parse', () => {
    let doc = parser.parse("* TODO [#A] 1 :tag:tag2:");
    let headline = doc.children.get(0);
    org.pprint(headline);
    expect(org.getMeta(headline, 'priority')).to.equal('A');
    expect(org.getMeta(headline, 'keyword')).to.equal('TODO');
    expect(org.getMeta(headline, 'tags').deref()).to.equal(Set(['tag', 'tag2']));
  });
});
