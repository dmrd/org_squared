let Org = require('../org/org');
let parser = require('../org/org_parser');
import {
  expect
} from 'chai';
let Immutable = require('immutable');
let {
  List,
  Set
} = Immutable;

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
    let l1 = Org.headlineNode(1, "1");
    expect(Org.level(Org.headlineNode(1, "1"))).to.equal(1);
    expect(Org.level(Org.headlineNode(100, "100"))).to.equal(100);

    expect(Org.level(Org.createDoc())).to.equal(0);
    expect(Org.level(Org.sectionNode("it has stuff"))).to.equal(Infinity);
  });

  it('iterates in order', () => {
    let doc = parser.parse("* 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1");
    let order = [null, '1', '1.1', '1.2', '1.2.1', '1.2.2', '1.3', '2', '2.1'];
    let traversed = [];
    while (doc != undefined) {
      traversed.push(doc.content);
      doc = Org.next(doc);
    }
    expect(traversed).to.deep.equal(order);
  });
});

describe('inserting', () => {
  describe('header', () => {
    it('at root', () => {
      let h1 = Org.headlineNode(1, 1);
      let h2 = Org.headlineNode(2, 2);
      let h3 = Org.headlineNode(1, 3);
      let h1_c = Org.insertHeadline(Org.createDoc(), h1);
      let h2_c = Org.insertHeadline(h1_c, h2);
      let h3_c = Org.insertHeadline(h2_c, h3);
      let h = Org.TYPES.headline;
      checkStructure(
        [node(h, 1, [
          node(h, 2)
        ]),
         node(h, 3)
        ],
        Org.getDoc(h3_c).children
      );
    });
  });
});

describe('parser', () => {
  it('can parse just headlines', () => {
    let h = Org.TYPES.headline;
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
  it('headline tags, priority, and keywords parse', () => {
    let doc = parser.parse("* TODO [#A] 1 :tag:tag2:");
    let headline = doc.children.get(0);
    expect(Org.getMeta(headline, 'priority')).to.equal('A');
    expect(Org.getMeta(headline, 'keyword')).to.equal('TODO');
    expect(Org.getMeta(headline, 'tags').deref()).to.equal(Set(['tag', 'tag2']));
  });

  describe('timestamps', () => {
    // TODO: Generate parser that can start from ts and test timestamps individually
    it('parses scheduled and deadline', () => {
      let doc = parser.parse("* test\nSCHEDULED: <2016-06-01 Wed +1w> DEADLINE: <2016-06-02 Thu 8:00>\n");
      expect(doc.getIn(['children', 0, 'meta', 'planning']).deref()).to.equal(Immutable.fromJS(
        {
          "SCHEDULED":
          {
            "active": true,
            "year": "2016",
            "month": "06",
            "day": "01",
            "hour": null,
            "minute": null,
            "dayname": "Wed",
            "repeater": {
              "mark": "+",
              "value": "1",
              "unit": "w"
            }
          },
          "DEADLINE":
          {
            "active": true,
            "year": "2016",
            "month": "06",
            "day": "02",
            "hour": "8",
            "minute": "00",
            "dayname": "Thu",
            "repeater": null
          }
        }
      ));
    });
  });
});

describe('search and sort', () => {
  let doc = parser.parse("* TODO 1\n** DONE 1.1\nSCHEDULED: <2016-09-01 Wed +1w> DEADLINE: <2016-06-02 Thu 8:00>\n*** TODO 1.1.1\n* 2\nDEADLINE: <2016-07-10 Fri> SCHEDULED: <2016-06-05 Fri>\n* TODO 3\n* DONE 4");
  let getContents = (nodes) => nodes.map((node) => { return Org.getContent(node); });
  describe('search', () => {
    // TODO: Test all operators
    describe('timestamps', () => {
      it('can search by schedule gte', () => {
        let found = Org.search(doc, 's.gte.2016-07-03');
        expect(getContents(found)).to.eql(['1.1'])
      });

      it('can search by schedule lte', () => {
        let found = Org.search(doc, 's.lte.2016-06-10 s.neq.none');
        expect(getContents(found)).to.eql(['2'])
      });
    });

    describe('keywords', () => {
      it('DONE', () => {
        let found = Org.search(doc, 'k.eq.DONE');
        expect(getContents(found)).to.eql(['1.1', '4']);
      });
      it('TODO', () => {
        let found = Org.search(doc, 'k.eq.TODO');
        expect(getContents(found)).to.eql(['1', '1.1.1', '3']);
      });
    });
  });

  describe('sort', () => {
    it('can sort by scheduled', () => {
      let found = Org.search(doc, 's.neq.none');
      let sorted = Org.sort(found, 's');
      expect(getContents(sorted)).to.eql(['2', '1.1']);
    });
  });
});
